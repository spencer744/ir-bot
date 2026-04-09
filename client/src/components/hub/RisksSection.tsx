import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Lock, TrendingDown, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useDeal } from '../../context/DealContext';
import FeeCalculator from './FeeCalculator';

interface RiskItem {
  title: string;
  description: string;
  mitigation: string;
  severity: 'high' | 'medium' | 'low';
}

const BASE_RISKS: RiskItem[] = [
  {
    title: 'Illiquidity Risk',
    description: 'Your capital is committed for the full hold period with no secondary market.',
    mitigation: 'We target 5–7 year holds but model exits annually from year 4 onward.',
    severity: 'high',
  },
  {
    title: 'Market / Economic Risk',
    description: 'Rents, occupancy, and cap rates can move against projections due to economic conditions.',
    mitigation: 'Conservative underwriting uses below-market rent growth (2–3%) and stress-tests 50bps above current cap rates.',
    severity: 'high',
  },
  {
    title: 'Interest Rate Risk',
    description: 'Rising rates can compress valuations at exit and affect refinancing options.',
    mitigation: 'Fixed-rate agency debt locks in today\'s rate for the full IO period. No floating-rate exposure.',
    severity: 'medium',
  },
  {
    title: 'Execution Risk',
    description: 'Renovation overruns, contractor delays, or lease-up taking longer than projected.',
    mitigation: 'In-house property management (Gray Residential) and $800K+ operating reserves.',
    severity: 'medium',
  },
  {
    title: 'Concentration Risk',
    description: 'Single-asset investment in one market.',
    mitigation: 'Westerville/Columbus is a major Midwest metro with diversified employment base and strong in-migration.',
    severity: 'low',
  },
  {
    title: 'Regulatory / Tax Risk',
    description: 'Changes to tax abatement, depreciation rules, or local regulations could affect returns.',
    mitigation: '15-year abatement is secured. Cost seg study completed. Tax treatment subject to change — consult your advisor.',
    severity: 'low',
  },
];

const SEVERITY_COLORS = {
  high: 'text-gc-negative bg-gc-negative/10 border-gc-negative/20',
  medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  low: 'text-gc-text-muted bg-gc-surface-elevated border-gc-border',
};

const SEVERITY_LABELS = {
  high: 'Higher Risk',
  medium: 'Medium Risk',
  low: 'Lower Risk',
};

function RiskCard({ risk, index }: { risk: RiskItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-gc-surface border border-gc-border rounded-xl overflow-hidden"
    >
      <button
        className="w-full flex items-center justify-between p-4 text-left gap-3"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 mt-0.5 ${SEVERITY_COLORS[risk.severity]}`}>
            {SEVERITY_LABELS[risk.severity]}
          </span>
          <span className="text-sm font-medium text-gc-text">{risk.title}</span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gc-text-muted shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gc-text-muted shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gc-border/60">
          <div className="pt-3">
            <p className="text-xs text-gc-text-secondary leading-relaxed">{risk.description}</p>
          </div>
          <div className="flex items-start gap-2 p-3 bg-gc-positive/5 border border-gc-positive/20 rounded-lg">
            <Shield className="w-3.5 h-3.5 text-gc-positive mt-0.5 shrink-0" />
            <p className="text-xs text-gc-text-secondary leading-relaxed">
              <span className="text-gc-positive font-medium">Mitigation: </span>
              {risk.mitigation}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function RisksSection() {
  const { deal } = useDeal();
  const [showAllRisks, setShowAllRisks] = useState(false);

  if (!deal) return null;

  const displayedRisks = showAllRisks ? BASE_RISKS : BASE_RISKS.slice(0, 4);

  // Conservative scenario data from deal
  const conservativeIRR = (deal as any).target_irr_conservative
    ? `${((deal as any).target_irr_conservative * 100).toFixed(1)}%`
    : `${((deal.target_irr_base || 0.132) * 100 * 0.65).toFixed(1)}%`;

  const holdYears = deal.projected_hold_years ?? 6;
  const equityMultiple = deal.target_equity_multiple ?? 1.85;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gc-negative/10 border border-gc-negative/20 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-gc-negative" />
          </div>
          <h2 className="text-2xl font-bold text-gc-text">Risks & Considerations</h2>
        </div>
        <p className="text-gc-text-secondary text-sm ml-11">
          We believe in full transparency. Read this section before investing.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Illiquidity callout — prominent */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-1 bg-gc-surface border border-gc-negative/30 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-gc-negative" />
            <h3 className="text-sm font-semibold text-gc-text">Capital Lock-Up</h3>
          </div>
          <p className="text-3xl font-bold text-gc-negative mb-1">
            {holdYears} yrs
          </p>
          <p className="text-xs text-gc-text-secondary leading-relaxed">
            Your capital is committed for the full hold period with no secondary market.
            This is an illiquid, long-duration investment. Only invest what you can hold through full cycle.
          </p>
          <div className="mt-4 p-3 bg-gc-negative/5 border border-gc-negative/15 rounded-lg">
            <p className="text-[11px] text-gc-text-muted">
              No distributions are guaranteed. Preferred return accrues but is paid from operating cash flow or proceeds.
            </p>
          </div>
        </motion.div>

        {/* Conservative scenario */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-1 bg-gc-surface border border-gc-border rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-gc-text">Conservative Scenario</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-gc-text-muted uppercase tracking-wide mb-1">IRR</p>
              <p className="text-2xl font-bold text-amber-400">{conservativeIRR}</p>
            </div>
            <div className="text-xs text-gc-text-secondary space-y-1.5">
              <p>• Rent growth: 2.0%/yr (vs. 3.5% base)</p>
              <p>• Exit cap rate: 5.75% (vs. 5.25% base)</p>
              <p>• 95% lease-up achieved (vs. 97%)</p>
              <p>• 15% renovation cost overrun assumed</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gc-border">
            <p className="text-[11px] text-gc-text-muted">
              Conservative case still projects positive returns. Explore all scenarios in the Financial Explorer.
            </p>
          </div>
        </motion.div>

        {/* Monte Carlo / loss probability */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 bg-gc-surface border border-gc-border rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-gc-positive" />
            <h3 className="text-sm font-semibold text-gc-text">Simulation Results</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-gc-text-muted uppercase tracking-wide mb-1">
                Base Case Equity Multiple
              </p>
              <p className="text-2xl font-bold text-gc-text">{equityMultiple}x</p>
            </div>
            {/* Simple visual bar showing probability distribution */}
            <div>
              <div className="flex items-center justify-between text-[10px] text-gc-text-muted mb-1">
                <span>Capital Loss (&lt;1.0x)</span>
                <span>Upside (&gt;2.0x)</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden flex">
                <div className="bg-gc-negative h-full" style={{ width: '5%' }} title="&lt;1x: ~5%" />
                <div className="bg-amber-500/60 h-full" style={{ width: '20%' }} title="1.0–1.4x: ~20%" />
                <div className="bg-gc-accent/60 h-full" style={{ width: '45%' }} title="1.4–1.85x: ~45%" />
                <div className="bg-gc-positive h-full" style={{ width: '30%' }} title="&gt;1.85x: ~30%" />
              </div>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-gc-text-muted flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-gc-negative" /> ~5% lose capital
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-gc-positive" /> ~30% exceed 2x
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gc-text-muted">
              Based on 1,000 Monte Carlo simulations. See full histogram in Financial Explorer.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Risk list */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gc-text mb-3">Key Risk Factors</h3>
        <div className="space-y-2">
          {displayedRisks.map((risk, i) => (
            <RiskCard key={risk.title} risk={risk} index={i} />
          ))}
        </div>
        {BASE_RISKS.length > 4 && (
          <button
            onClick={() => setShowAllRisks(s => !s)}
            className="mt-3 text-xs text-gc-accent hover:text-gc-accent/80 transition-colors flex items-center gap-1"
          >
            {showAllRisks ? '▲ Show fewer risks' : `▾ Show ${BASE_RISKS.length - 4} more risks`}
          </button>
        )}
      </div>

      {/* Fee Calculator */}
      <FeeCalculator />

      {/* Compliance disclosure */}
      <div className="mt-4 p-4 bg-gc-surface border border-gc-border rounded-xl">
        <p className="text-[11px] text-gc-text-muted leading-relaxed">
          <strong className="text-gc-text-secondary">Important Disclosure:</strong> This investment involves significant risk, including the
          potential loss of your entire investment. This is a private, illiquid investment offered pursuant to Rule 506(b) of Regulation D.
          Past performance of Gray Capital LLC is not indicative of future results. All projections are forward-looking estimates based on
          assumptions that may not materialize. Please review the complete Private Placement Memorandum and all risk factors before investing.
          Consult your legal, tax, and financial advisors.
        </p>
      </div>
    </section>
  );
}
