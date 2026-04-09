import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAdminApi } from '../../hooks/useAdminApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DashboardMetrics {
  unique_visitors: number;
  total_events: number;
  chat_messages: number;
  ppm_requests: number;
  interest_indications: number;
  document_downloads: number;
  schedule_call_clicks: number;
}

interface DashboardResponse {
  deal_slug: string;
  metrics: DashboardMetrics;
  section_heatmap: Record<string, number>;
  top_questions: string[];
}

interface ActivityEvent {
  event_type: string;
  section?: string;
  investor_id: string;
  event_data: { investor_name?: string; [key: string]: unknown };
  created_at: string;
}

interface EventsResponse {
  events: ActivityEvent[];
  total: number;
}

interface Deal {
  id: string;
  slug: string;
  name: string;
  status: string;
}

interface DealsResponse {
  deals: Deal[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const SECTION_LABELS: Record<string, string> = {
  property: 'Property',
  market: 'Market',
  financials: 'Financials',
  'business-plan': 'Business Plan',
  team: 'Team',
  documents: 'Documents',
};

const EVENT_DESCRIPTIONS: Record<string, (e: ActivityEvent) => string> = {
  section_view: (e) =>
    `viewed ${SECTION_LABELS[e.section || ''] || e.section || 'a section'}`,
  chat_message_sent: () => 'sent a chat message',
  ppm_requested: () => 'requested the PPM',
  interest_indicated: () => 'indicated interest',
  document_download: () => 'downloaded a document',
  financial_explorer_used: () => 'used Financial Explorer',
};

function describeEvent(event: ActivityEvent): string {
  const fn = EVENT_DESCRIPTIONS[event.event_type];
  if (fn) return fn(event);
  return event.event_type.replace(/_/g, ' ');
}

function formatEventTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (sameDay) {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  );
}

/* ------------------------------------------------------------------ */
/*  Recharts custom tooltip                                            */
/* ------------------------------------------------------------------ */

interface HeatmapTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { name: string } }>;
}

function HeatmapTooltip({ active, payload }: HeatmapTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="bg-gc-surface-elevated border border-gc-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-gc-text font-medium">{item.payload.name}</p>
      <p className="text-gc-text-secondary">{item.value} views</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

interface MetricCardProps {
  value: string;
  label: string;
}

function MetricCard({ value, label }: MetricCardProps) {
  return (
    <div className="bg-gc-surface rounded-xl border border-gc-border p-5">
      <p className="text-2xl font-bold text-gc-text font-mono-numbers">
        {value}
      </p>
      <p className="text-sm text-gc-text-secondary mt-1">{label}</p>
    </div>
  );
}

function MetricCardSkeleton() {
  return (
    <div className="animate-pulse bg-gc-surface-elevated h-24 rounded-xl" />
  );
}

function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gc-surface-elevated rounded-xl ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const api = useAdminApi();

  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('fairmont-apartments');
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dealsLoading, setDealsLoading] = useState(true);

  /* ---- fetch deals list ---- */
  useEffect(() => {
    let cancelled = false;
    setDealsLoading(true);
    api
      .get('/api/admin/deals')
      .then((data: DealsResponse) => {
        if (cancelled) return;
        const list = data.deals ?? [];
        setDeals(list);
        if (
          list.length > 0 &&
          !list.some((d) => d.slug === selectedSlug)
        ) {
          setSelectedSlug(list[0].slug);
        }
      })
      .catch(() => {
        /* graceful degradation -- keep default slug */
      })
      .finally(() => {
        if (!cancelled) setDealsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- fetch dashboard + events when slug changes ---- */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      api.get(`/api/analytics/admin/dashboard/${selectedSlug}`),
      api.get(`/api/analytics/admin/events?dealSlug=${selectedSlug}&limit=20`),
    ])
      .then(([dashRes, eventsRes]) => {
        if (cancelled) return;
        setDashboard(dashRes as DashboardResponse);
        setEvents((eventsRes as EventsResponse).events ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setDashboard(null);
        setEvents([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlug]);

  /* ---- derived data ---- */
  const metrics = dashboard?.metrics;

  const chatRate = useMemo(() => {
    if (!metrics || metrics.unique_visitors === 0) return '0%';
    return `${Math.round((metrics.chat_messages / metrics.unique_visitors) * 100)}%`;
  }, [metrics]);

  const heatmapData = useMemo(() => {
    if (!dashboard?.section_heatmap) return [];
    return Object.entries(dashboard.section_heatmap)
      .map(([key, views]) => ({
        key,
        name: SECTION_LABELS[key] || key,
        views,
      }))
      .sort((a, b) => b.views - a.views);
  }, [dashboard]);

  const selectedDealName =
    deals.find((d) => d.slug === selectedSlug)?.name ?? selectedSlug;

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gc-text">Dashboard</h1>

        {dealsLoading ? (
          <div className="animate-pulse bg-gc-surface-elevated h-9 w-48 rounded-lg" />
        ) : deals.length > 0 ? (
          <div className="flex items-center gap-2">
            <label
              htmlFor="deal-select"
              className="text-sm text-gc-text-secondary whitespace-nowrap"
            >
              Deal:
            </label>
            <select
              id="deal-select"
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="bg-gc-surface border border-gc-border rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-gc-text focus:outline-none focus:ring-2 focus:ring-gc-accent appearance-none cursor-pointer touch-manipulation"
            >
              {deals.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="text-sm text-gc-text-secondary">
            Deal: {selectedDealName}
          </span>
        )}
      </div>

      {/* ---- Metric Cards ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))
        ) : (
          <>
            <MetricCard
              value={String(metrics?.unique_visitors ?? 0)}
              label="Total Visitors"
            />
            <MetricCard value={chatRate} label="Chat Rate" />
            <MetricCard
              value={String(metrics?.ppm_requests ?? 0)}
              label="PPM Requests"
            />
            <MetricCard
              value={String(metrics?.interest_indications ?? 0)}
              label="Interest Indications"
            />
          </>
        )}
      </div>

      {/* ---- Section Heatmap + Recent Activity ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Heatmap -- 3 of 5 columns */}
        <div className="lg:col-span-3 bg-gc-surface border border-gc-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gc-text mb-4">
            Section Traffic
          </h2>
          {loading ? (
            <CardSkeleton className="h-64" />
          ) : heatmapData.length === 0 ? (
            <p className="text-gc-text-secondary text-sm">
              No section traffic data yet.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={heatmapData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8B8FA3', fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9595A5', fontSize: 13 }}
                    width={100}
                  />
                  <Tooltip
                    content={<HeatmapTooltip />}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="views" radius={[0, 6, 6, 0]} barSize={20}>
                    {heatmapData.map((entry) => (
                      <Cell key={entry.key} fill="#14B8A6" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Activity -- 2 of 5 columns */}
        <div className="lg:col-span-2 bg-gc-surface border border-gc-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gc-text mb-4">
            Recent Activity
          </h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="bg-gc-surface-elevated h-4 w-16 rounded" />
                  <div className="bg-gc-surface-elevated h-4 flex-1 rounded" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <p className="text-gc-text-secondary text-sm">
              No recent activity.
            </p>
          ) : (
            <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {events.map((evt, i) => {
                const investorName =
                  evt.event_data?.investor_name || 'Anonymous';
                return (
                  <li
                    key={`${evt.created_at}-${i}`}
                    className="flex flex-col gap-0.5"
                  >
                    <span className="text-xs text-gc-muted">
                      {formatEventTime(evt.created_at)}
                    </span>
                    <span className="text-sm">
                      <Link
                        to={`/admin/investors/${evt.investor_id}`}
                        className="text-gc-accent-light hover:underline font-medium"
                      >
                        {investorName}
                      </Link>{' '}
                      <span className="text-gc-text-secondary">
                        {describeEvent(evt)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ---- Top Chatbot Questions ---- */}
      <div className="bg-gc-surface border border-gc-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gc-text mb-4">
          Top Chatbot Questions
        </h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gc-surface-elevated h-5 w-3/4 rounded"
              />
            ))}
          </div>
        ) : !dashboard?.top_questions ||
          dashboard.top_questions.length === 0 ? (
          <p className="text-gc-text-secondary text-sm">
            No chat questions recorded yet.
          </p>
        ) : (
          <ol className="list-decimal list-inside space-y-2 text-sm text-gc-text-secondary">
            {dashboard.top_questions.map((q, i) => (
              <li key={i} className="leading-relaxed">
                {q}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
