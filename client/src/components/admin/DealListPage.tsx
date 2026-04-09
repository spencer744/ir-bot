import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminApi } from '../../hooks/useAdminApi';
import DealImportModal from './DealImportModal';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Deal {
  id: string;
  slug: string;
  name: string;
  status: string;
  city: string;
  state: string;
  total_units: number;
  total_raise: number;
  created_at: string;
}

interface DealsResponse {
  deals: Deal[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatRaise(amount: number | null | undefined): string {
  if (!amount) return '--';
  const millions = amount / 1_000_000;
  return `$${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase() ?? 'draft';

  let classes = 'bg-gc-surface-elevated text-gc-text-secondary';
  if (normalized === 'live') {
    classes = 'bg-emerald-500/10 text-emerald-400';
  } else if (normalized === 'coming_soon') {
    classes = 'bg-blue-500/10 text-blue-400';
  } else if (normalized === 'closed') {
    classes = 'bg-amber-500/10 text-amber-400';
  }

  const label = normalized === 'coming_soon' ? 'Coming soon' : normalized;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${classes}`}>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton Rows                                                      */
/* ------------------------------------------------------------------ */

function SkeletonRow() {
  return (
    <tr className="border-b border-gc-border/50">
      <td className="py-3 pr-4"><div className="animate-pulse bg-gc-surface-elevated h-4 w-40 rounded" /></td>
      <td className="py-3 pr-4"><div className="animate-pulse bg-gc-surface-elevated h-4 w-28 rounded" /></td>
      <td className="py-3 pr-4"><div className="animate-pulse bg-gc-surface-elevated h-4 w-12 rounded" /></td>
      <td className="py-3 pr-4"><div className="animate-pulse bg-gc-surface-elevated h-4 w-16 rounded" /></td>
      <td className="py-3 pr-4"><div className="animate-pulse bg-gc-surface-elevated h-4 w-16 rounded" /></td>
      <td className="py-3 pr-4"><div className="animate-pulse bg-gc-surface-elevated h-4 w-24 rounded" /></td>
      <td className="py-3"><div className="animate-pulse bg-gc-surface-elevated h-4 w-20 rounded" /></td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function DealListPage() {
  const api = useAdminApi();
  const navigate = useNavigate();

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get('/admin/deals')
      .then((data: DealsResponse) => {
        if (!cancelled) setDeals(data.deals ?? []);
      })
      .catch(() => {
        if (!cancelled) setDeals([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gc-text">Deals</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="border-2 border-[#3B82F6]/50 text-[#F0F0F5] bg-[#1C1C24] hover:bg-[#2A2A35] px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors touch-manipulation"
          >
            Import from CSV
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/deals/new')}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors touch-manipulation shadow-md shadow-blue-500/20"
          >
            + New Deal
          </button>
        </div>
      </div>

      {/* Table: horizontal scroll on small screens */}
      <div className="bg-gc-surface border border-gc-border rounded-xl p-4 sm:p-6 overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="text-left text-xs text-gc-text-secondary uppercase tracking-wider border-b border-gc-border">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Location</th>
              <th className="pb-3 pr-4">Units</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Total Raise</th>
              <th className="pb-3 pr-4">Created</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : deals.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gc-text-secondary text-sm">
                  No deals found. Click "New Deal" to create one.
                </td>
              </tr>
            ) : (
              deals.map((deal) => (
                <tr key={deal.id} className="border-b border-gc-border/50 hover:bg-gc-surface-elevated/50">
                  <td className="py-3 pr-4">
                    <span className="text-sm font-medium text-gc-text">{deal.name}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-sm text-gc-text-secondary">
                      {deal.city && deal.state ? `${deal.city}, ${deal.state}` : '--'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-sm text-gc-text-secondary font-mono-numbers">
                      {deal.total_units ?? '--'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={deal.status} />
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-sm text-gc-text-secondary font-mono-numbers">
                      {formatRaise(deal.total_raise)}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-sm text-gc-text-secondary">
                      {formatDate(deal.created_at)}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/admin/deals/${deal.id}`}
                        className="inline-flex items-center min-h-[44px] px-3 py-2 rounded-lg text-sm text-gc-accent-light hover:bg-gc-accent-light/10 font-medium touch-manipulation"
                      >
                        Edit
                      </Link>
                      <a
                        href={`/dealroom/deals/${deal.slug}?lp_preview=1`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center min-h-[44px] px-3 py-2 rounded-lg text-sm text-[#9595A5] hover:text-white hover:bg-[#2A2A35] border border-[#2A2A35] touch-manipulation"
                      >
                        Preview
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DealImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={(dealId) => {
          setImportOpen(false);
          navigate(`/admin/deals/${dealId}`);
        }}
      />
    </div>
  );
}
