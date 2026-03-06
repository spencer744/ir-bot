import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Deal, SensitivityData, ScenarioKey } from '../../types/deal';

interface Props {
  deal: Deal;
  sensitivityData: SensitivityData | null;
  scenario: ScenarioKey;
  investmentAmount: number;
  ownershipPct: number;
}

export default function ScenarioViewer({ deal, sensitivityData, scenario, investmentAmount, ownershipPct }: Props) {
  // Compute scenario returns
  const metrics = useMemo(() => {
    // Use deal-level targets when no sensitivity data
    // In production, these would come from scenario-specific data
    const scenarioMultipliers: Record<ScenarioKey, number> = {
      downside: 0.8,
      base: 1.0,
      upside: 1.2,
      strategic: 1.4,
    };
    const mult = scenarioMultipliers[scenario];

    const irr = deal.target_irr_base * mult;
    const equityMultiple = 1 + (deal.target_equity_multiple - 1) * mult;
    const coc = deal.target_coc * mult;
    const totalDistributions = investmentAmount * equityMultiple;

    return { irr, equityMultiple, coc, totalDistributions };
  }, [deal, scenario, investmentAmount]);

  // Compute waterfall
  const waterfall = useMemo(() => {
    const prefRate = deal.waterfall_terms?.pref_rate || 0.08;
    const holdYears = deal.projected_hold_years;
    const prefReturn = investmentAmount * prefRate * holdYears;
    const totalProfit = metrics.totalDistributions - investmentAmount;
    const profitAbovePref = Math.max(0, totalProfit - prefReturn);
    const lpSplit = deal.waterfall_terms?.split_above_hurdle_1?.lp || 0.7;
    const gpSplit = deal.waterfall_terms?.split_above_hurdle_1?.gp || 0.3;

    return {
      returnOfCapital: investmentAmount,
      preferredReturn: Math.min(prefReturn, totalProfit),
      lpShareAbovePref: profitAbovePref * lpSplit,
      gpPromote: profitAbovePref * gpSplit,
      totalToInvestor: investmentAmount + Math.min(prefReturn, totalProfit) + profitAbovePref * lpSplit,
    };
  }, [deal, metrics, investmentAmount]);

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Cash-on-Cash Yield" value={fmtPct(metrics.coc)} color="text-gc-text" />
        <MetricCard label="Equity Multiple" value={`${metrics.equityMultiple.toFixed(2)}x`} color="text-gc-text" />
        <MetricCard label="IRR" value={fmtPct(metrics.irr)} color="text-gc-positive" />
        <MetricCard label="Total Distributions" value={fmt(metrics.totalDistributions)} color="text-gc-positive" />
      </div>

      {/* Waterfall Breakdown */}
      <div className="bg-gc-surface border border-gc-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gc-text mb-4">Waterfall Breakdown</h3>
        <div className="space-y-3">
          <WaterfallRow label="Return of Capital" value={fmt(waterfall.returnOfCapital)} />
          <WaterfallRow
            label={`Preferred Return (${fmtPct(deal.waterfall_terms?.pref_rate || 0.08)})`}
            value={fmt(waterfall.preferredReturn)}
          />
          <WaterfallRow
            label={`LP Share Above Pref (${((deal.waterfall_terms?.split_above_hurdle_1?.lp || 0.7) * 100).toFixed(0)}%)`}
            value={fmt(waterfall.lpShareAbovePref)}
          />
          <div className="border-t border-gc-border pt-3">
            <WaterfallRow
              label="Your Total Distributions"
              value={fmt(waterfall.totalToInvestor)}
              bold
            />
          </div>
          <div className="border-t border-gc-border/50 pt-3">
            <WaterfallRow
              label={`GP Promote (${((deal.waterfall_terms?.split_above_hurdle_1?.gp || 0.3) * 100).toFixed(0)}%)`}
              value={fmt(waterfall.gpPromote)}
              muted
            />
          </div>
        </div>
      </div>

      {/* Scenario Assumptions */}
      {sensitivityData?.scenarios?.[scenario] && (
        <div className="bg-gc-surface border border-gc-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gc-text mb-3">
            {sensitivityData.scenarios[scenario].label} Scenario Assumptions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-gc-text-muted">Annual Rent Growth</p>
              <p className="text-gc-text font-mono-numbers font-medium">
                {fmtPct(sensitivityData.scenarios[scenario].assumptions.annual_rent_growth)}
              </p>
            </div>
            <div>
              <p className="text-gc-text-muted">Exit Cap Rate</p>
              <p className="text-gc-text font-mono-numbers font-medium">
                {fmtPct(sensitivityData.scenarios[scenario].assumptions.exit_cap)}
              </p>
            </div>
            <div>
              <p className="text-gc-text-muted">Avg Occupancy</p>
              <p className="text-gc-text font-mono-numbers font-medium">
                {fmtPct(sensitivityData.scenarios[scenario].assumptions.avg_occupancy)}
              </p>
            </div>
            <div>
              <p className="text-gc-text-muted">Expense Growth</p>
              <p className="text-gc-text font-mono-numbers font-medium">
                {fmtPct(sensitivityData.scenarios[scenario].assumptions.annual_expense_growth)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gc-surface border border-gc-border rounded-xl p-4 text-center"
    >
      <p className="text-[10px] text-gc-text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl sm:text-2xl font-bold font-mono-numbers ${color}`}>{value}</p>
    </motion.div>
  );
}

function WaterfallRow({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${bold ? 'font-semibold text-gc-text' : muted ? 'text-gc-text-muted' : 'text-gc-text-secondary'}`}>
        {label}
      </span>
      <span className={`font-mono-numbers text-sm ${bold ? 'font-bold text-gc-positive' : muted ? 'text-gc-text-muted' : 'text-gc-text'}`}>
        {value}
      </span>
    </div>
  );
}
