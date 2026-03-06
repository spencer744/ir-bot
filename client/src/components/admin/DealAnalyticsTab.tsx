import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminApi } from '../../hooks/useAdminApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DealAnalyticsTabProps {
  deal: any;
  dealId: string;
  onSave: (deal: any) => void;
}

interface DealMetrics {
  unique_visitors: number;
  total_events: number;
  chat_messages: number;
  ppm_requests: number;
  interest_indications: number;
  document_downloads: number;
}

interface DashboardResponse {
  metrics: DealMetrics;
  section_heatmap: Record<string, number>;
  top_questions: string[];
}

interface Investor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  engagement_score: number;
  sections_viewed: number;
  chat_message_count: number;
  last_visit: string;
  ppm_requested: boolean;
  interest_indicated: boolean;
}

interface InvestorsResponse {
  investors: Investor[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function scoreColor(score: number): string {
  if (score >= 80) return 'text-gc-positive';
  if (score >= 50) return 'text-amber-400';
  if (score >= 25) return 'text-blue-400';
  return 'text-gc-text-secondary';
}

function scoreBg(score: number): string {
  if (score >= 80) return 'bg-gc-positive/10';
  if (score >= 50) return 'bg-amber-400/10';
  if (score >= 25) return 'bg-blue-400/10';
  return 'bg-gc-surface-elevated';
}

function formatLastVisit(iso: string): string {
  if (!iso) return 'Never';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function investorName(inv: Investor): string {
  const first = inv.first_name || '';
  const last = inv.last_name || '';
  const full = `${first} ${last}`.trim();
  return full || 'Anonymous';
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
      <p className="text-2xl font-bold text-gc-text font-mono">
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

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse flex gap-4">
          <div className="bg-gc-surface-elevated h-5 w-32 rounded" />
          <div className="bg-gc-surface-elevated h-5 w-48 rounded" />
          <div className="bg-gc-surface-elevated h-5 w-16 rounded" />
          <div className="bg-gc-surface-elevated h-5 flex-1 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function DealAnalyticsTab({ deal, dealId, onSave }: DealAnalyticsTabProps) {
  const api = useAdminApi();

  const slug = deal?.slug;

  const [metrics, setMetrics] = useState<DealMetrics | null>(null);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [investorsLoading, setInvestorsLoading] = useState(true);

  /* ---- Fetch dashboard metrics ---- */
  useEffect(() => {
    if (!slug) {
      setMetricsLoading(false);
      return;
    }

    let cancelled = false;
    setMetricsLoading(true);

    api
      .get(`/api/analytics/admin/dashboard/${slug}`)
      .then((data: DashboardResponse) => {
        if (!cancelled) setMetrics(data?.metrics ?? null);
      })
      .catch(() => {
        if (!cancelled) setMetrics(null);
      })
      .finally(() => {
        if (!cancelled) setMetricsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  /* ---- Fetch investors ---- */
  useEffect(() => {
    if (!slug) {
      setInvestorsLoading(false);
      return;
    }

    let cancelled = false;
    setInvestorsLoading(true);

    api
      .get(`/api/admin/deals/${dealId}/investors`)
      .then((data: InvestorsResponse) => {
        if (!cancelled) {
          const list: Investor[] = data?.investors ?? [];
          list.sort((a, b) => (b.engagement_score ?? 0) - (a.engagement_score ?? 0));
          setInvestors(list);
        }
      })
      .catch(() => {
        if (!cancelled) setInvestors([]);
      })
      .finally(() => {
        if (!cancelled) setInvestorsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId]);

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  /* No slug guard */
  if (!slug) {
    return (
      <div className="bg-gc-surface border border-gc-border rounded-xl p-8 text-center">
        <p className="text-gc-text-secondary text-sm">
          Save the deal first to view analytics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ---- Metric Cards (4) ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))
        ) : (
          <>
            <MetricCard
              value={String(metrics?.unique_visitors ?? 0)}
              label="Visitors"
            />
            <MetricCard
              value={String(metrics?.chat_messages ?? 0)}
              label="Chat Messages"
            />
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

      {/* ---- Investor Leaderboard ---- */}
      <div className="bg-gc-surface border border-gc-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gc-text mb-4">
          Investor Leaderboard
        </h2>

        {investorsLoading ? (
          <TableSkeleton />
        ) : investors.length === 0 ? (
          <p className="text-gc-text-secondary text-sm">
            No investor activity recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gc-border">
                  <th className="text-left py-3 pr-4 text-gc-text-secondary font-medium">
                    Name
                  </th>
                  <th className="text-left py-3 pr-4 text-gc-text-secondary font-medium hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-center py-3 px-2 text-gc-text-secondary font-medium">
                    Score
                  </th>
                  <th className="text-center py-3 px-2 text-gc-text-secondary font-medium hidden md:table-cell">
                    Sections
                  </th>
                  <th className="text-center py-3 px-2 text-gc-text-secondary font-medium hidden md:table-cell">
                    Chats
                  </th>
                  <th className="text-center py-3 px-2 text-gc-text-secondary font-medium">
                    Last Visit
                  </th>
                  <th className="text-center py-3 px-2 text-gc-text-secondary font-medium hidden lg:table-cell">
                    PPM
                  </th>
                  <th className="text-center py-3 px-2 text-gc-text-secondary font-medium hidden lg:table-cell">
                    Interest
                  </th>
                </tr>
              </thead>
              <tbody>
                {investors.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-gc-border/50 hover:bg-gc-surface-elevated/50 transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <Link
                        to={`/admin/investors/${inv.id}`}
                        className="text-gc-accent-light hover:underline font-medium"
                      >
                        {investorName(inv)}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-gc-text-secondary hidden sm:table-cell">
                      {inv.email || '\u2014'}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold font-mono ${scoreColor(inv.engagement_score)} ${scoreBg(inv.engagement_score)}`}
                      >
                        {inv.engagement_score ?? 0}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-gc-text-secondary font-mono hidden md:table-cell">
                      {inv.sections_viewed ?? 0}/6
                    </td>
                    <td className="py-3 px-2 text-center text-gc-text-secondary font-mono hidden md:table-cell">
                      {inv.chat_message_count ?? 0}
                    </td>
                    <td className="py-3 px-2 text-center text-gc-text-secondary text-xs">
                      {formatLastVisit(inv.last_visit)}
                    </td>
                    <td className="py-3 px-2 text-center hidden lg:table-cell">
                      {inv.ppm_requested ? (
                        <span className="text-gc-positive" title="PPM Requested">
                          &#10003;
                        </span>
                      ) : (
                        <span className="text-gc-text-secondary/40">&mdash;</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center hidden lg:table-cell">
                      {inv.interest_indicated ? (
                        <span className="text-gc-positive" title="Interest Indicated">
                          &#10003;
                        </span>
                      ) : (
                        <span className="text-gc-text-secondary/40">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
