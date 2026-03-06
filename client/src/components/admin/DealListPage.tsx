import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminApi } from '../../hooks/useAdminApi';

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
  } else if (normalized === 'closed') {
    classes = 'bg-amber-500/10 text-amber-400';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${classes}`}>
      {normalized}
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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get('/api/admin/deals')
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
        <button
          onClick={() => navigate('/admin/deals/new')}
          className="bg-gc-accent hover:bg-gc-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          New Deal
        </button>
      </div>

      {/* Table */}
      <div className="bg-gc-surface border border-gc-border rounded-xl p-6 overflow-x-auto">
        <table className="w-full">
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
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/admin/deals/${deal.id}`}
                        className="text-sm text-gc-accent-light hover:underline font-medium"
                      >
                        Edit
                      </Link>
                      <a
                        href={`/deals/${deal.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gc-text-secondary hover:text-gc-text hover:underline"
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
    </div>
  );
}
