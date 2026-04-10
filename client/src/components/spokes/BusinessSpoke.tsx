import { useState, useEffect } from 'react';
import { useDeal } from '../../context/DealContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { api } from '../../lib/api';
import SpokeLayout from './SpokeLayout';
import { SkeletonBlock, SkeletonText, SkeletonChart, SkeletonCard } from '../shared/Skeleton';
import BusinessHero from './business/BusinessHero';
import ValuePillars from './business/ValuePillars';
import InteriorRenovation from './business/InteriorRenovation';
import ExteriorImprovements from './business/ExteriorImprovements';
import RenovationTimeline from './business/RenovationTimeline';
import RentBridgeChart from './business/RentBridgeChart';
import OperationalEdge from './business/OperationalEdge';
import NOIProjectionChart from './business/NOIProjectionChart';
import KeyAssumptions from './business/KeyAssumptions';
import FairmontChartsSection from '../charts/FairmontChartsSection';

export default function BusinessSpoke() {
  const { deal } = useDeal();
  const { trackSectionView } = useAnalytics();
  const [bpData, setBpData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { trackSectionView('business'); }, []);

  useEffect(() => {
    if (!deal) return;
    if ((deal as any).business_plan_data) {
      setBpData((deal as any).business_plan_data);
      setLoading(false);
    } else {
      api.getDealBusinessPlan(deal.slug)
        .then(res => setBpData(res.business_plan_data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [deal]);

  if (!deal) return null;

  const bp = bpData;

  return (
    <SpokeLayout
      title="Business Plan"
      subtitle="Value-Add Strategy & Execution Roadmap"
    >
      {loading && (
        <div className="space-y-10 sm:space-y-14">
          {/* Thesis hero skeleton */}
          <div className="bg-gc-surface border border-gc-border rounded-2xl p-6 sm:p-8 space-y-4">
            <SkeletonBlock className="h-6 w-2/3" />
            <SkeletonText lines={2} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <SkeletonBlock className="h-4 w-1/2" />
                  <SkeletonBlock className="h-7 w-3/4" />
                </div>
              ))}
            </div>
          </div>
          {/* Value pillars skeleton */}
          <div className="grid sm:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          {/* Chart skeletons */}
          <SkeletonChart height="h-72" />
          <SkeletonCard />
          <SkeletonChart height="h-64" />
        </div>
      )}

      {!loading && !bp && (
        <div className="bg-gc-surface border border-gc-border rounded-2xl p-8 text-center">
          <p className="text-gc-text-secondary">Business plan details will be available once uploaded by the deal team.</p>
        </div>
      )}

      {!loading && bp && (
        <div className="space-y-10 sm:space-y-14">

          {/* 1. Hero — Thesis + Strategy Metrics */}
          <BusinessHero thesis={bp.thesis_statement} metrics={bp.strategy_metrics} />

          {/* 2. Value Creation Pillars */}
          {bp.value_pillars && (
            <ValuePillars pillars={bp.value_pillars} />
          )}

          {/* 3. Interior Renovation Program */}
          {bp.interior_scope && bp.interior_cost_summary && (
            <InteriorRenovation scope={bp.interior_scope} costSummary={bp.interior_cost_summary} />
          )}

          {/* 4. Exterior & Community Improvements */}
          {bp.exterior_scope && (
            <ExteriorImprovements scope={bp.exterior_scope} total={bp.exterior_total} />
          )}

          {/* 5. Renovation Timeline */}
          {bp.timeline && (
            <RenovationTimeline
              totalMonths={bp.timeline.total_months}
              milestones={bp.timeline.milestones}
            />
          )}

          {/* 6. Rent Bridge / Waterfall */}
          {bp.rent_bridge && (
            <RentBridgeChart data={bp.rent_bridge} narrative={bp.rent_bridge_narrative} />
          )}

          {/* 7. Operational Edge */}
          {bp.operational_pillars && (
            <OperationalEdge pillars={bp.operational_pillars} />
          )}

          {/* 8. NOI Growth Projection */}
          {bp.noi_projections && (
            <NOIProjectionChart data={bp.noi_projections} narrative={bp.noi_narrative} />
          )}

          {/* 9. Key Assumptions + CTA */}
          {bp.scenario_assumptions && (
            <KeyAssumptions rows={bp.scenario_assumptions} />
          )}

          {/* 10. Live Chart Data: Loss-to-Lease, Lease-Up, Occupancy */}
          <FairmontChartsSection section="business" />

          {/* Footer Disclaimer */}
          <div className="border-t border-gc-border pt-6">
            <p className="text-xs text-gc-text-muted italic leading-relaxed">
              Forward-looking projections are estimates based on current assumptions and market conditions. Actual results may vary.
              See the Private Placement Memorandum for complete risk factors and disclosures.
            </p>
          </div>
        </div>
      )}
    </SpokeLayout>
  );
}
