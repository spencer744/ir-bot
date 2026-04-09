import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdminApi } from '../../hooks/useAdminApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InvestorRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  investment_goal: string | null;
  syndication_experience: string | null;
  target_range: string | null;
  engagement_score: number;
  sections_viewed: string[];
  chat_message_count: number;
  last_visit: string | null;
  ppm_requested: boolean;
  interest_indicated: boolean;
}

interface InvestorsResponse {
  investors: InvestorRow[];
}

type SortField = 'name' | 'score' | 'chats' | 'last_visit';
type SortDir = 'asc' | 'desc';
type EngagementTier = 'all' | 'hot' | 'warm' | 'cool' | 'cold';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const TOTAL_SECTIONS = 6;

const GOAL_LABELS: Record<string, string> = {
  cash_flow: 'Cash Flow',
  appreciation: 'Appreciation',
  tax_benefits: 'Tax Benefits',
  diversification: 'Diversification',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  first_time: 'First Time',
  '1_to_3': '1-3 Deals',
  '1-3 deals': '1-3 Deals',
  '4_plus': '4+ Deals',
  '4+ deals': '4+ Deals',
};

function formatGoal(goal: string | null): string {
  if (!goal) return '--';
  return GOAL_LABELS[goal] ?? goal;
}

function formatExperience(exp: string | null): string {
  if (!exp) return '--';
  return EXPERIENCE_LABELS[exp] ?? EXPERIENCE_LABELS[exp.toLowerCase()] ?? exp;
}

function relativeTime(iso: string | null): string {
  if (!iso) return '--';
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return 'just now';

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

function scoreColorClass(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  if (score >= 25) return 'text-blue-400';
  return 'text-gc-text-secondary';
}

function scoreTier(score: number): EngagementTier {
  if (score >= 80) return 'hot';
  if (score >= 50) return 'warm';
  if (score >= 25) return 'cool';
  return 'cold';
}

function investorSortName(inv: InvestorRow): string {
  return `${inv.last_name ?? ''} ${inv.first_name ?? ''}`.trim().toLowerCase();
}

/* ------------------------------------------------------------------ */
/*  Sort Indicator                                                     */
/* ------------------------------------------------------------------ */

function SortIndicator({
  field,
  activeField,
  activeDir,
}: {
  field: SortField;
  activeField: SortField;
  activeDir: SortDir;
}) {
  const isActive = field === activeField;
  return (
    <span
      className={`ml-1 text-[10px] transition-opacity ${
        isActive ? 'opacity-100 text-gc-accent' : 'opacity-0 group-hover:opacity-50 text-gc-muted'
      }`}
    >
      {isActive && activeDir === 'asc' ? '\u25B2' : '\u25BC'}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Sortable Column Header                                             */
/* ------------------------------------------------------------------ */

interface SortHeaderProps {
  label: string;
  field: SortField;
  activeField: SortField;
  activeDir: SortDir;
  onSort: (field: SortField) => void;
}

function SortHeader({ label, field, activeField, activeDir, onSort }: SortHeaderProps) {
  return (
    <th
      className="pb-3 px-4 cursor-pointer select-none group hover:text-gc-text transition-colors"
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center">
        {label}
        <SortIndicator field={field} activeField={activeField} activeDir={activeDir} />
      </span>
    </th>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton Rows                                                      */
/* ------------------------------------------------------------------ */

function SkeletonRow() {
  return (
    <tr className="border-b border-gc-border/50">
      <td className="py-3 px-4"><div className="animate-pulse bg-gc-surface-elevated h-4 w-32 rounded" /></td>
      <td className="py-3 px-4"><div className="animate-pulse bg-gc-surface-elevated h-4 w-40 rounded" /></td>
      <td className="py-3 px-4"><div className="animate-pulse bg-gc-surface-elevated h-4 w-20 rounded" /></td>
      <td className="py-3 px-4"><div className="animate-pulse bg-gc-surface-elevated h-4 w-16 rounded" /></td>
      <td className="py-3 px-4"><div className="animate-pulse bg-gc-surface-elevated h-4 w-10 rounded" /></td>
      <td className="py-3 px-4"><div className="animate-pulse bg-gc-surface-elevated h-4 w-10 rounded" /></td>
      <td className="py-3 px-4"><div className="animate-pulse bg-gc-surface-elevated h-4 w-8 rounded" /></td>
      <td className="py-3 px-4"><div className="animate-pulse bg-gc-surface-elevated h-4 w-16 rounded" /></td>
      <td className="py-3 px-4"><div className="animate-pulse bg-gc-surface-elevated h-4 w-6 rounded" /></td>
      <td className="py-3 px-4"><div className="animate-pulse bg-gc-surface-elevated h-4 w-6 rounded" /></td>
      <td className="py-3 px-4"><div className="animate-pulse bg-gc-surface-elevated h-4 w-12 rounded" /></td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function InvestorListPage() {
  const api = useAdminApi();

  const [investors, setInvestors] = useState<InvestorRow[]>([]);
  const [loading, setLoading] = useState(true);

  /* Sort state — default: score descending */
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  /* Filter state */
  const [tierFilter, setTierFilter] = useState<EngagementTier>('all');

  /* ---- Fetch investors ---- */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get('/dealroom/api/admin/investors')
      .then((data: InvestorsResponse) => {
        if (!cancelled) setInvestors(data.investors ?? []);
      })
      .catch(() => {
        if (!cancelled) setInvestors([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Sort handler ---- */
  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'name' ? 'asc' : 'desc');
    }
  }

  /* ---- Derived: filtered + sorted list ---- */
  const displayedInvestors = useMemo(() => {
    let list = investors;

    // Engagement tier filter
    if (tierFilter !== 'all') {
      list = list.filter((inv) => scoreTier(inv.engagement_score) === tierFilter);
    }

    // Sort
    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = investorSortName(a).localeCompare(investorSortName(b));
          break;
        case 'score':
          cmp = a.engagement_score - b.engagement_score;
          break;
        case 'chats':
          cmp = a.chat_message_count - b.chat_message_count;
          break;
        case 'last_visit': {
          const aTime = a.last_visit ? new Date(a.last_visit).getTime() : 0;
          const bTime = b.last_visit ? new Date(b.last_visit).getTime() : 0;
          cmp = aTime - bTime;
          break;
        }
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [investors, tierFilter, sortField, sortDir]);

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gc-text">Investors</h1>

        <div className="flex items-center gap-3">
          {/* Deal filter (placeholder — single deal for now) */}
          <select
            className="bg-gc-surface border border-gc-border rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-gc-text focus:outline-none focus:ring-2 focus:ring-gc-accent appearance-none cursor-pointer touch-manipulation"
            defaultValue="all"
          >
            <option value="all">All Deals</option>
          </select>

          {/* Engagement tier filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as EngagementTier)}
            className="bg-gc-surface border border-gc-border rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-gc-text focus:outline-none focus:ring-2 focus:ring-gc-accent appearance-none cursor-pointer touch-manipulation"
          >
            <option value="all">All Tiers</option>
            <option value="hot">Hot (80+)</option>
            <option value="warm">Warm (50-80)</option>
            <option value="cool">Cool (25-50)</option>
            <option value="cold">Cold (&lt;25)</option>
          </select>
        </div>
      </div>

      {/* ---- Table: horizontal scroll on small screens ---- */}
      <div className="bg-gc-surface border border-gc-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto p-4 sm:p-0">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="text-left text-xs text-gc-text-secondary uppercase tracking-wider border-b border-gc-border font-medium">
                <SortHeader
                  label="Name"
                  field="name"
                  activeField={sortField}
                  activeDir={sortDir}
                  onSort={handleSort}
                />
                <th className="pb-3 px-4">Email</th>
                <th className="pb-3 px-4">Goal</th>
                <th className="pb-3 px-4">Experience</th>
                <SortHeader
                  label="Score"
                  field="score"
                  activeField={sortField}
                  activeDir={sortDir}
                  onSort={handleSort}
                />
                <th className="pb-3 px-4">Sections</th>
                <SortHeader
                  label="Chats"
                  field="chats"
                  activeField={sortField}
                  activeDir={sortDir}
                  onSort={handleSort}
                />
                <SortHeader
                  label="Last Visit"
                  field="last_visit"
                  activeField={sortField}
                  activeDir={sortDir}
                  onSort={handleSort}
                />
                <th className="pb-3 px-4">PPM</th>
                <th className="pb-3 px-4">Interest</th>
                <th className="pb-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : displayedInvestors.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-16 text-center text-gc-text-secondary text-sm"
                  >
                    No investors found.
                  </td>
                </tr>
              ) : (
                displayedInvestors.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-gc-border/50 hover:bg-gc-surface-elevated transition-colors"
                  >
                    {/* Name */}
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gc-text whitespace-nowrap">
                        {inv.first_name} {inv.last_name}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gc-text-secondary whitespace-nowrap">
                        {inv.email}
                      </span>
                    </td>

                    {/* Goal */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gc-text-secondary whitespace-nowrap">
                        {formatGoal(inv.investment_goal)}
                      </span>
                    </td>

                    {/* Experience */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gc-text-secondary whitespace-nowrap">
                        {formatExperience(inv.syndication_experience)}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="py-3 px-4">
                      <span
                        className={`text-sm font-semibold font-mono-numbers ${scoreColorClass(
                          inv.engagement_score
                        )}`}
                      >
                        {inv.engagement_score}
                      </span>
                    </td>

                    {/* Sections */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gc-text-secondary font-mono-numbers">
                        {inv.sections_viewed?.length ?? 0}/{TOTAL_SECTIONS}
                      </span>
                    </td>

                    {/* Chats */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gc-text-secondary font-mono-numbers">
                        {inv.chat_message_count}
                      </span>
                    </td>

                    {/* Last Visit */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gc-text-secondary whitespace-nowrap">
                        {relativeTime(inv.last_visit)}
                      </span>
                    </td>

                    {/* PPM */}
                    <td className="py-3 px-4 text-center">
                      {inv.ppm_requested ? (
                        <span className="text-emerald-400 font-medium">{'\u2713'}</span>
                      ) : (
                        <span className="text-gc-muted">{'\u2014'}</span>
                      )}
                    </td>

                    {/* Interest */}
                    <td className="py-3 px-4 text-center">
                      {inv.interest_indicated ? (
                        <span className="text-emerald-400 font-medium">{'\u2713'}</span>
                      ) : (
                        <span className="text-gc-muted">{'\u2014'}</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <Link
                        to={`/admin/investors/${inv.id}`}
                        className="inline-block text-sm text-gc-accent-light hover:underline font-medium py-2 px-2 -mx-2 rounded min-h-[44px] flex items-center touch-manipulation"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
