import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAdminApi } from '../../hooks/useAdminApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Investor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  investment_goal: string;
  syndication_experience: string;
  target_range: string;
  engagement_score: number;
  sections_viewed?: string[];
  sections_visited?: string[];
  chat_message_count: number;
  last_visit?: string | null;
  last_active_at?: string | null;
  ppm_requested: boolean;
  interest_indicated: boolean;
  hubspot_contact_id?: string | null;
  indicated_amount_range?: string | null;
  lead_source?: string | null;
}

interface Session {
  id: string;
  deal_id: string;
  started_at: string;
  total_seconds: number;
  engagement_score: number;
  sections_viewed: string[];
  chat_message_count: number;
}

interface ChatMessage {
  message?: string;
  content?: string;
  role?: 'user' | 'assistant';
  timestamp?: string;
  created_at?: string;
}

interface InvestorResponse {
  investor: Investor;
  sessions: Session[];
  chat_history: ChatMessage[];
}

interface TimelineEvent {
  type: string;
  section: string | null;
  data: Record<string, unknown>;
  timestamp: string;
}

interface TimelineResponse {
  investor_id: string;
  event_count: number;
  timeline: TimelineEvent[];
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

const GOAL_LABELS: Record<string, string> = {
  cash_flow: 'Cash Flow',
  appreciation: 'Appreciation',
  tax_benefits: 'Tax Benefits',
  balanced: 'Balanced',
  diversification: 'Diversification',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  first_deal: 'First Deal',
  'first deal': 'First Deal',
  first_time: 'First Deal',
  '1-3 deals': '1-3 Deals',
  '1-3_deals': '1-3 Deals',
  '1_to_3': '1-3 Deals',
  '4+_deals': '4+ Deals',
  '4+ deals': '4+ Deals',
  '4_plus': '4+ Deals',
};

function formatGoal(goal: string): string {
  return (
    GOAL_LABELS[goal] ||
    goal.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function formatExperience(exp: string): string {
  return (
    EXPERIENCE_LABELS[exp] ||
    exp.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatTimestamp(iso: string): string {
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

function getScoreColor(score: number): {
  bg: string;
  text: string;
  ring: string;
} {
  if (score >= 80)
    return {
      bg: 'bg-emerald-400/10',
      text: 'text-emerald-400',
      ring: 'ring-emerald-400/30',
    };
  if (score >= 50)
    return {
      bg: 'bg-amber-400/10',
      text: 'text-amber-400',
      ring: 'ring-amber-400/30',
    };
  if (score >= 25)
    return {
      bg: 'bg-blue-400/10',
      text: 'text-blue-400',
      ring: 'ring-blue-400/30',
    };
  return {
    bg: 'bg-gray-400/10',
    text: 'text-gray-400',
    ring: 'ring-gray-400/30',
  };
}

function getEventDotColor(type: string): string {
  if (type === 'section_view' || type === 'page_view') return 'bg-blue-400';
  if (type.startsWith('chat')) return 'bg-purple-400';
  if (type === 'document_download') return 'bg-gray-400';
  if (
    type === 'ppm_requested' ||
    type === 'interest_indicated' ||
    type === 'schedule_call_clicked'
  )
    return 'bg-emerald-400';
  return 'bg-gray-400';
}

function describeTimelineEvent(event: TimelineEvent): string {
  switch (event.type) {
    case 'section_view':
      return `Viewed ${SECTION_LABELS[event.section || ''] || event.section || 'a section'}`;
    case 'page_view':
      return `Viewed ${SECTION_LABELS[event.section || ''] || event.section || 'a page'}`;
    case 'chat_message_sent': {
      const msg = (event.data?.message as string) || '';
      const truncated =
        msg.length > 80 ? msg.slice(0, 80) + '\u2026' : msg;
      return truncated ? `Asked: \u201C${truncated}\u201D` : 'Sent a chat message';
    }
    case 'ppm_requested':
      return 'Requested the PPM';
    case 'interest_indicated':
      return 'Indicated investment interest';
    case 'session_start':
      return 'Started session';
    case 'session_end':
      return 'Session ended';
    case 'financial_explorer_used':
      return 'Used Financial Explorer';
    case 'document_download':
      return 'Downloaded a document';
    case 'schedule_call_clicked':
      return 'Clicked to schedule a call';
    case 'scenario_changed':
      return 'Changed scenario in Financial Explorer';
    default:
      return event.type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

/** Extract text from a chat message regardless of API shape */
function getChatMessageText(msg: ChatMessage): string {
  return msg.message || msg.content || '';
}

/** Extract timestamp from a chat message regardless of API shape */
function getChatMessageTime(msg: ChatMessage): string {
  return msg.timestamp || msg.created_at || '';
}

/* ------------------------------------------------------------------ */
/*  Loading Skeleton                                                   */
/* ------------------------------------------------------------------ */

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back link */}
      <div className="h-5 w-36 bg-gc-surface-elevated rounded" />

      {/* Header card */}
      <div className="bg-gc-surface rounded-xl border border-gc-border p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-7 w-48 bg-gc-surface-elevated rounded" />
            <div className="h-4 w-56 bg-gc-surface-elevated rounded" />
            <div className="flex gap-2 mt-3">
              <div className="h-6 w-20 bg-gc-surface-elevated rounded-full" />
              <div className="h-6 w-24 bg-gc-surface-elevated rounded-full" />
              <div className="h-6 w-28 bg-gc-surface-elevated rounded-full" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-28 bg-gc-surface-elevated rounded-full" />
              <div className="h-6 w-32 bg-gc-surface-elevated rounded-full" />
            </div>
          </div>
          <div className="w-16 h-16 bg-gc-surface-elevated rounded-full" />
        </div>
      </div>

      {/* Session summary */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-gc-surface rounded-xl border border-gc-border p-4"
          >
            <div className="h-6 w-12 bg-gc-surface-elevated rounded mb-1" />
            <div className="h-3 w-20 bg-gc-surface-elevated rounded" />
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-gc-surface rounded-xl border border-gc-border p-6">
          <div className="h-6 w-36 bg-gc-surface-elevated rounded mb-5" />
          <div className="space-y-5 pl-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-3 h-3 rounded-full bg-gc-surface-elevated mt-1 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-20 bg-gc-surface-elevated rounded" />
                  <div className="h-4 w-3/4 bg-gc-surface-elevated rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 bg-gc-surface rounded-xl border border-gc-border p-6">
          <div className="h-6 w-28 bg-gc-surface-elevated rounded mb-5" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-16 bg-gc-surface-elevated rounded" />
                <div className="h-10 w-full bg-gc-surface-elevated rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function InvestorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const api = useAdminApi();

  const [investor, setInvestor] = useState<Investor | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/api/admin/investors/${id}`),
      api.get(`/api/analytics/admin/investor/${id}/timeline`),
    ])
      .then(
        ([investorRes, timelineRes]: [InvestorResponse, TimelineResponse]) => {
          if (cancelled) return;
          if (!investorRes.investor) {
            setError('Investor not found');
            return;
          }
          setInvestor(investorRes.investor);
          setSessions(investorRes.sessions ?? []);
          setChatHistory(investorRes.chat_history ?? []);
          setTimeline(timelineRes.timeline ?? []);
        }
      )
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load investor details');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ---- Derived data ---- */
  const totalSessions = sessions.length;
  const totalTime = sessions.reduce(
    (acc, s) => acc + (s.total_seconds || 0),
    0
  );
  const sectionsViewed =
    investor?.sections_viewed ?? investor?.sections_visited ?? [];
  const sectionsVisitedCount = sectionsViewed.length;

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  if (loading) {
    return <PageSkeleton />;
  }

  if (error || !investor) {
    return (
      <div className="space-y-6">
        <Link
          to="/admin/investors"
          className="inline-flex items-center gap-1 text-sm text-gc-text-secondary hover:text-gc-text transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Investors
        </Link>
        <div className="bg-gc-surface rounded-xl border border-gc-border p-8 text-center">
          <p className="text-gc-text text-lg font-semibold">
            Investor not found
          </p>
          <p className="text-gc-text-secondary text-sm mt-2">
            {error ||
              'The investor you are looking for does not exist or could not be loaded.'}
          </p>
          <Link
            to="/admin/investors"
            className="inline-block mt-4 text-sm text-gc-accent hover:text-gc-accent-light transition-colors"
          >
            Return to investor list
          </Link>
        </div>
      </div>
    );
  }

  const scoreColors = getScoreColor(investor.engagement_score);
  const fullName =
    [investor.first_name, investor.last_name].filter(Boolean).join(' ') ||
    'Unknown Investor';

  return (
    <div className="space-y-6">
      {/* ---- Back Link ---- */}
      <Link
        to="/admin/investors"
        className="inline-flex items-center gap-1 text-sm text-gc-text-secondary hover:text-gc-text transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Investors
      </Link>

      {/* ---- Header Card ---- */}
      <div className="bg-gc-surface rounded-xl border border-gc-border p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left side */}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gc-text">{fullName}</h1>
            <p className="text-gc-text-secondary text-sm mt-1">
              {investor.email}
              {investor.phone && (
                <span className="ml-3">{investor.phone}</span>
              )}
            </p>

            {/* Intake badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {investor.investment_goal && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gc-surface-elevated text-gc-text-secondary border border-gc-border">
                  {formatGoal(investor.investment_goal)}
                </span>
              )}
              {investor.syndication_experience && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gc-surface-elevated text-gc-text-secondary border border-gc-border">
                  {formatExperience(investor.syndication_experience)}
                </span>
              )}
              {investor.target_range && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gc-surface-elevated text-gc-text-secondary border border-gc-border">
                  {investor.target_range}
                </span>
              )}
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  investor.ppm_requested
                    ? 'bg-emerald-400/10 text-emerald-400'
                    : 'bg-gray-400/10 text-gray-400'
                }`}
              >
                PPM Requested
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  investor.interest_indicated
                    ? 'bg-emerald-400/10 text-emerald-400'
                    : 'bg-gray-400/10 text-gray-400'
                }`}
              >
                Interest Indicated
              </span>
            </div>
          </div>

          {/* Right side: Engagement Score Circle */}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ring-2 ${scoreColors.bg} ${scoreColors.ring}`}
          >
            <span
              className={`text-xl font-bold font-mono-numbers ${scoreColors.text}`}
            >
              {investor.engagement_score}
            </span>
          </div>
        </div>
      </div>

      {/* ---- Session Summary ---- */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gc-surface rounded-xl border border-gc-border p-4">
          <p className="text-lg font-bold text-gc-text font-mono-numbers">
            {totalSessions}
          </p>
          <p className="text-xs text-gc-text-secondary mt-0.5">
            Total Sessions
          </p>
        </div>
        <div className="bg-gc-surface rounded-xl border border-gc-border p-4">
          <p className="text-lg font-bold text-gc-text font-mono-numbers">
            {formatDuration(totalTime)}
          </p>
          <p className="text-xs text-gc-text-secondary mt-0.5">Total Time</p>
        </div>
        <div className="bg-gc-surface rounded-xl border border-gc-border p-4">
          <p className="text-lg font-bold text-gc-text font-mono-numbers">
            {sectionsVisitedCount}
          </p>
          <p className="text-xs text-gc-text-secondary mt-0.5">
            Sections Visited
          </p>
        </div>
      </div>

      {/* ---- Two Column Layout ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column: Activity Timeline (3/5 = 60%) */}
        <div className="lg:col-span-3 bg-gc-surface rounded-xl border border-gc-border p-6">
          <h2 className="text-lg font-semibold text-gc-text mb-5">
            Activity Timeline
          </h2>

          {timeline.length === 0 ? (
            <p className="text-gc-text-secondary text-sm">
              No activity recorded yet.
            </p>
          ) : (
            <div className="relative pl-6">
              {/* Vertical line */}
              <div className="absolute left-[5px] top-2 bottom-2 border-l-2 border-gc-border" />

              <ul className="space-y-5">
                {timeline.map((event, i) => (
                  <li key={`${event.timestamp}-${i}`} className="relative">
                    {/* Dot */}
                    <div
                      className={`absolute -left-6 top-1 w-3 h-3 rounded-full ${getEventDotColor(event.type)} ring-2 ring-gc-surface`}
                    />
                    {/* Content */}
                    <div>
                      <span className="text-xs text-gc-muted block">
                        {formatTimestamp(event.timestamp)}
                      </span>
                      <p className="text-sm text-gc-text mt-0.5">
                        {describeTimelineEvent(event)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right column: Chat History (2/5 = 40%) */}
        <div className="lg:col-span-2 bg-gc-surface rounded-xl border border-gc-border p-6">
          <h2 className="text-lg font-semibold text-gc-text mb-5">
            Chat History
          </h2>

          {chatHistory.length === 0 ? (
            <p className="text-gc-text-secondary text-sm">
              No chat messages yet.
            </p>
          ) : (
            <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {chatHistory.map((msg, i) => {
                const text = getChatMessageText(msg);
                const time = getChatMessageTime(msg);
                const isAssistant = msg.role === 'assistant';

                return (
                  <li key={`${time}-${i}`}>
                    <span className="text-xs text-gc-muted block">
                      {isAssistant && (
                        <span className="text-gc-accent-light mr-1">AI</span>
                      )}
                      {time ? formatTimestamp(time) : ''}
                    </span>
                    <div
                      className={`mt-1 border rounded-lg px-3 py-2 text-sm text-gc-text ${
                        isAssistant
                          ? 'bg-gc-accent/5 border-gc-accent/20'
                          : 'bg-gc-surface-elevated border-gc-border'
                      }`}
                    >
                      {text}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
