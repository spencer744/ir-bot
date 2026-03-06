import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDeal } from '../../context/DealContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import SpokeLayout from '../spokes/SpokeLayout';
import ScenarioViewer from './ScenarioViewer';
import DistributionTimeline from './DistributionTimeline';
import BenchmarkComparison from './BenchmarkComparison';
import TaxEstimator from './TaxEstimator';
import type { ScenarioKey } from '../../types/deal';

export default function FinancialSpoke() {
  const { deal, sensitivityData, trackEvent } = useDeal();
  const { trackSectionView, trackScenarioChange, trackFinancialExplorerUsed } = useAnalytics();
  const [investmentAmount, setInvestmentAmount] = useState(250_000);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey>('base');

  useEffect(() => { trackSectionView('financial'); }, []);

  if (!deal) return null;

  const ownershipPct = investmentAmount / deal.total_raise;

  return (
    <SpokeLayout title="Financial Explorer" subtitle="Interactive projections and analysis">
      <p className="text-gc-text-secondary text-xs mb-8 border border-gc-border rounded-lg p-3 bg-gc-surface">
        Projections are estimates based on current assumptions. Actual results may vary.
        Review the Private Placement Memorandum for complete details.
      </p>

      {/* Investment Amount Slider */}
      <section className="mb-10">
        <div className="bg-gc-surface border border-gc-border rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gc-text mb-4">Your Investment</h2>
          <div className="mb-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-gc-text-muted text-xs">$100K</span>
              <span className="text-2xl font-bold text-gc-text font-mono-numbers">
                ${(investmentAmount / 1_000).toFixed(0)}K
              </span>
              <span className="text-gc-text-muted text-xs">$5M</span>
            </div>
            <input
              type="range"
              min={100_000}
              max={5_000_000}
              step={25_000}
              value={investmentAmount}
              onChange={e => {
                setInvestmentAmount(Number(e.target.value));
                trackEvent('financial_slider_adjusted', { amount: e.target.value });
                trackFinancialExplorerUsed();
              }}
              className="w-full h-1.5 bg-gc-border rounded-full appearance-none cursor-pointer accent-gc-accent"
            />
          </div>
          <p className="text-gc-text-muted text-xs">
            Ownership: {(ownershipPct * 100).toFixed(2)}% of total equity
          </p>
        </div>
      </section>

      {/* Scenario Selector */}
      <section className="mb-10">
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['downside', 'base', 'upside', 'strategic'] as ScenarioKey[]).map(s => (
            <button
              key={s}
              onClick={() => { setSelectedScenario(s); trackScenarioChange(s); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedScenario === s
                  ? 'bg-gc-accent text-white'
                  : 'bg-gc-surface border border-gc-border text-gc-text-secondary hover:border-gc-accent/40'
              }`}
            >
              {s === 'downside' ? 'Conservative' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <ScenarioViewer
          deal={deal}
          sensitivityData={sensitivityData}
          scenario={selectedScenario}
          investmentAmount={investmentAmount}
          ownershipPct={ownershipPct}
        />
      </section>

      {/* Distribution Timeline */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gc-text mb-4">Distribution Timeline</h2>
        <DistributionTimeline
          deal={deal}
          sensitivityData={sensitivityData}
          scenario={selectedScenario}
          investmentAmount={investmentAmount}
          ownershipPct={ownershipPct}
        />
      </section>

      {/* Benchmark Comparison */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gc-text mb-4">Benchmark Comparison</h2>
        <BenchmarkComparison
          deal={deal}
          scenario={selectedScenario}
          investmentAmount={investmentAmount}
        />
      </section>

      {/* Tax Estimator */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gc-text mb-4">Tax Impact Estimator</h2>
        <TaxEstimator
          deal={deal}
          investmentAmount={investmentAmount}
        />
      </section>
    </SpokeLayout>
  );
}
