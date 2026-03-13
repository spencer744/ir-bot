import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye } from 'lucide-react';
import { useAdminApi } from '../../hooks/useAdminApi';
import { DealOverviewTab } from './DealOverviewTab';
import { DealSensitivityTab } from './DealSensitivityTab';
import { DealMediaTab } from './DealMediaTab';
import { DealContentTab } from './DealContentTab';
import { DealKBTab } from './DealKBTab';
import { DealAnalyticsTab } from './DealAnalyticsTab';
import { DealExportTab } from './DealExportTab';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Tab {
  id: string;
  label: string;
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview & Terms' },
  { id: 'scenarios', label: 'Scenarios & Sensitivity' },
  { id: 'media', label: 'Media' },
  { id: 'content', label: 'Content' },
  { id: 'kb', label: 'KB Files' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'export', label: 'Export PDF' },
];

/* ------------------------------------------------------------------ */
/*  Placeholder Tab                                                    */
/* ------------------------------------------------------------------ */

function PlaceholderTab({ name }: { name: string }) {
  return (
    <div className="text-gc-text-secondary text-sm py-8 text-center">
      {name} tab coming soon...
    </div>
  );
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
/*  Loading Skeleton                                                   */
/* ------------------------------------------------------------------ */

function EditorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="animate-pulse bg-gc-surface-elevated h-6 w-6 rounded" />
        <div className="animate-pulse bg-gc-surface-elevated h-8 w-64 rounded" />
      </div>
      <div className="flex gap-1 border-b border-gc-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gc-surface-elevated h-10 w-28 rounded-t" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gc-surface-elevated h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function DealEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const api = useAdminApi();

  const isNew = id === 'new';

  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(!isNew);
  const [activeTab, setActiveTab] = useState('overview');

  /* ---- Load deal data ---- */
  useEffect(() => {
    if (isNew) {
      setDeal(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    api
      .get(`/api/admin/deals/${id}`)
      .then((data: { deal: any }) => {
        if (!cancelled) setDeal(data.deal ?? null);
      })
      .catch(() => {
        if (!cancelled) setDeal(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ---- Save callback (used by overview tab) ---- */
  const handleSave = (updatedDeal: any) => {
    setDeal(updatedDeal);
    // If it was a new deal, navigate to the real edit URL
    if (isNew && updatedDeal?.id) {
      navigate(`/admin/deals/${updatedDeal.id}`, { replace: true });
    }
  };

  /* ---- Render active tab content ---- */
  function renderTabContent() {
    switch (activeTab) {
      case 'overview':
        return (
          <DealOverviewTab
            deal={deal}
            dealId={id ?? 'new'}
            onSave={handleSave}
          />
        );
      case 'scenarios':
        return <DealSensitivityTab deal={deal} dealId={id ?? 'new'} onSave={handleSave} />;
      case 'media':
        return <DealMediaTab deal={deal} dealId={id ?? 'new'} onSave={handleSave} />;
      case 'content':
        return <DealContentTab deal={deal} dealId={id ?? 'new'} onSave={handleSave} />;
      case 'kb':
        return <DealKBTab deal={deal} dealId={id ?? 'new'} onSave={handleSave} />;
      case 'analytics':
        return <DealAnalyticsTab deal={deal} dealId={id ?? 'new'} onSave={handleSave} />;
      case 'export':
        return <DealExportTab deal={deal} dealId={id ?? 'new'} onSave={handleSave} />;
      default:
        return <PlaceholderTab name={activeTab} />;
    }
  }

  if (loading) {
    return <EditorSkeleton />;
  }

  const dealName = deal?.name || (isNew ? 'New Deal' : 'Untitled Deal');
  const dealStatus = deal?.status || 'draft';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/admin/deals"
          className="text-gc-text-secondary hover:text-gc-text transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gc-text">{dealName}</h1>
        <StatusBadge status={dealStatus} />
        {deal?.slug && (
          <a
            href={`/deals/${deal.slug}?lp_preview=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium text-gc-accent-light hover:bg-gc-accent-light/10 touch-manipulation"
          >
            <Eye className="w-4 h-4" />
            Switch to LP view
          </a>
        )}
      </div>

      {/* Tab Bar: scrollable on small screens, touch-friendly */}
      <div className="flex gap-1 border-b border-gc-border mb-6 overflow-x-auto pb-px -mx-1 px-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-[44px] px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap touch-manipulation ${
              activeTab === tab.id
                ? 'border-gc-accent-light text-gc-accent-light'
                : 'border-transparent text-gc-text-secondary hover:text-gc-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
