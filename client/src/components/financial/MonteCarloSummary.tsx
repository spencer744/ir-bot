import { motion } from 'framer-motion';
import type { Deal } from '../../types/deal';
import type { MonteCarloResult } from '../../types/monteCarlo';

interface Props {
  result: MonteCarloResult | null;
  investmentAmount: number;
  deal: Deal | null;
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

const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export default function MonteCarloSummary({ result, deal }: Props) {
  if (!result || !deal) {
    return (
      <div className="bg-gc-surface border border-gc-border rounded-2xl p-6 text-center">
        <p className="text-gc-text-muted text-sm">No simulation data. Sensitivity data is required to run Monte Carlo.</p>
      </div>
    );
  }

  const baseIrr = deal.target_irr_base ?? 0.158;
  const probAboveBase = result.probIrrAboveBase;

  return (
    <div className="bg-gc-surface border border-gc-border rounded-2xl p-4 sm:p-6">
      <p className="text-gc-text-secondary text-xs mb-4">
        Based on {result.iterations.toLocaleString()} simulations. Percentiles from simulated IRR and equity multiple.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <MetricCard label="IRR P10" value={fmtPct(result.irrPercentiles.p10)} color="text-gc-text-secondary" />
        <MetricCard label="IRR P50 (Median)" value={fmtPct(result.irrPercentiles.p50)} color="text-gc-text" />
        <MetricCard label="IRR P90" value={fmtPct(result.irrPercentiles.p90)} color="text-gc-positive" />
        <MetricCard
          label={`Prob IRR ≥ ${(baseIrr * 100).toFixed(0)}%`}
          value={fmtPct(probAboveBase)}
          color="text-gc-accent"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <MetricCard label="Equity Multiple P10" value={`${result.emPercentiles.p10.toFixed(2)}x`} color="text-gc-text-secondary" />
        <MetricCard label="Equity Multiple P50" value={`${result.emPercentiles.p50.toFixed(2)}x`} color="text-gc-text" />
        <MetricCard label="Equity Multiple P90" value={`${result.emPercentiles.p90.toFixed(2)}x`} color="text-gc-positive" />
      </div>

      <div className="border-t border-gc-border pt-4">
        <p className="text-[10px] text-gc-text-muted uppercase tracking-wider mb-2">Total distributions (your investment)</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          <div>
            <span className="text-gc-text-muted">P10</span>
            <span className="font-mono-numbers text-gc-text ml-2">{fmt(result.totalDistPercentiles.p10)}</span>
          </div>
          <div>
            <span className="text-gc-text-muted">P50</span>
            <span className="font-mono-numbers text-gc-text ml-2">{fmt(result.totalDistPercentiles.p50)}</span>
          </div>
          <div>
            <span className="text-gc-text-muted">P90</span>
            <span className="font-mono-numbers text-gc-positive ml-2">{fmt(result.totalDistPercentiles.p90)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
