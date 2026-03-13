import { useState, useMemo } from 'react';
import type { Deal } from '../../types/deal';

interface Props {
  deal: Deal;
  investmentAmount: number;
}

const TAX_BRACKETS = [
  { rate: 0.24, label: '24%' },
  { rate: 0.32, label: '32%' },
  { rate: 0.35, label: '35%' },
  { rate: 0.37, label: '37%' },
];

export default function TaxEstimator({ deal, investmentAmount }: Props) {
  const [selectedRate, setSelectedRate] = useState(0.37);

  const estimates = useMemo(() => {
    const costSeg = deal.cost_seg_data;
    const depreciationPct = costSeg?.year_1_accelerated_depreciation_pct || 0.60;

    const acceleratedDepreciation = Math.round(investmentAmount * depreciationPct);
    const taxSavings = Math.round(acceleratedDepreciation * selectedRate);
    const effectiveNetCost = investmentAmount - taxSavings;

    return {
      acceleratedDepreciation,
      taxSavings,
      effectiveNetCost,
      depreciationPct,
    };
  }, [deal, investmentAmount, selectedRate]);

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

  return (
    <div className="bg-gc-surface border border-gc-border rounded-2xl p-4 sm:p-6">
      {/* Tax Bracket Selector */}
      <div className="mb-6">
        <p className="text-sm text-gc-text-secondary mb-3">Your Marginal Tax Rate</p>
        <div className="flex gap-2 flex-wrap">
          {TAX_BRACKETS.map(b => (
            <button
              key={b.rate}
              onClick={() => setSelectedRate(b.rate)}
              className={`px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
                selectedRate === b.rate
                  ? 'bg-gc-accent text-white'
                  : 'bg-gc-bg border border-gc-border text-gc-text-secondary hover:border-gc-accent/40'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-2">
          <span className="text-sm text-gc-text-secondary">Investment Amount</span>
          <span className="font-mono-numbers text-sm text-gc-text font-medium shrink-0">{fmt(investmentAmount)}</span>
        </div>
        <div className="flex justify-between items-start gap-2 max-sm:flex-col">
          <span className="text-sm text-gc-text-secondary">
            Est. Year 1 Accelerated Depreciation
            <span className="text-gc-text-muted ml-1">
              ({(estimates.depreciationPct * 100).toFixed(0)}% via cost segregation)
            </span>
          </span>
          <span className="font-mono-numbers text-sm text-gc-text font-medium shrink-0">{fmt(estimates.acceleratedDepreciation)}</span>
        </div>
        <div className="flex justify-between items-start gap-2 max-sm:flex-col">
          <span className="text-sm text-gc-text-secondary">
            Estimated Tax Savings
            <span className="text-gc-text-muted ml-1">
              (at {(selectedRate * 100).toFixed(0)}% rate)
            </span>
          </span>
          <span className="font-mono-numbers text-sm text-gc-positive font-bold shrink-0">{fmt(estimates.taxSavings)}</span>
        </div>
        <div className="border-t border-gc-border pt-4 flex justify-between items-center gap-2">
          <span className="text-sm text-gc-text font-semibold">Effective Year 1 Net Cost</span>
          <span className="font-mono-numbers text-lg text-gc-text font-bold shrink-0">{fmt(estimates.effectiveNetCost)}</span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-gc-bg rounded-lg border border-gc-border">
        <p className="text-gc-warning text-xs flex items-start gap-2">
          <span className="shrink-0 mt-0.5">⚠</span>
          <span>
            This is an estimate for illustrative purposes. Actual depreciation determined by the
            cost segregation study. Passive activity loss rules may limit current-year deductibility.
            Gray Capital does not provide tax advice. Consult your tax advisor.
          </span>
        </p>
      </div>
    </div>
  );
}
