import { motion } from 'framer-motion';
import type { Deal, DealFees } from '../../types/deal';

interface DealTermsCardProps {
  deal: Deal;
}

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function formatPct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

export default function DealTermsCard({ deal }: DealTermsCardProps) {
  const wt = deal.waterfall_terms;
  const prefRate = wt?.pref_rate ?? 0.08;
  const lpSplitBelow = wt?.split_below_hurdle?.lp ?? 0.8;
  const gpSplitBelow = wt?.split_below_hurdle?.gp ?? 0.2;
  const hurdleRate = wt?.hurdle_1_rate ?? 0.15;
  const lpSplitAbove = wt?.split_above_hurdle_1?.lp ?? 0.6;
  const gpSplitAbove = wt?.split_above_hurdle_1?.gp ?? 0.4;
  const fees: DealFees | null = deal.fees ?? null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 mb-12"
    >
      <div className="bg-gc-surface border border-gc-border rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-gc-text mb-6">Deal Terms & Fees</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Terms */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gc-text-muted uppercase tracking-wider">Key Terms</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gc-text-secondary">Minimum investment</span>
                <span className="font-mono-numbers font-semibold text-gc-text">{formatCurrency(deal.min_investment)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gc-text-secondary">Preferred return</span>
                <span className="font-mono-numbers font-semibold text-gc-text">{formatPct(prefRate)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gc-text-secondary">Split (below {formatPct(hurdleRate)} IRR)</span>
                <span className="font-mono-numbers font-semibold text-gc-text">{Math.round(lpSplitBelow * 100)}/{Math.round(gpSplitBelow * 100)} LP/GP</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gc-text-secondary">Split (above {formatPct(hurdleRate)} IRR)</span>
                <span className="font-mono-numbers font-semibold text-gc-text">{Math.round(lpSplitAbove * 100)}/{Math.round(gpSplitAbove * 100)} LP/GP</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gc-text-secondary">GP catch-up</span>
                <span className="text-sm text-gc-text">None</span>
              </div>
            </div>
          </div>

          {/* Fees */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gc-text-muted uppercase tracking-wider">Fees</h3>
            {fees && (fees.acquisition_fee_pct != null || fees.asset_management_fee_pct != null || fees.property_management_fee_pct != null) ? (
              <div className="space-y-3">
                {fees.acquisition_fee_pct != null && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gc-text-secondary">Acquisition</span>
                    <span className="font-mono-numbers text-sm text-gc-text">{fees.acquisition_fee_pct}%</span>
                  </div>
                )}
                {fees.loan_guarantee_fee_pct != null && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gc-text-secondary">Loan guarantee</span>
                    <span className="font-mono-numbers text-sm text-gc-text">{fees.loan_guarantee_fee_pct}%</span>
                  </div>
                )}
                {fees.asset_management_fee_pct != null && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gc-text-secondary">Asset management</span>
                    <span className="font-mono-numbers text-sm text-gc-text">{fees.asset_management_fee_pct}%</span>
                  </div>
                )}
                {fees.property_management_fee_pct != null && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gc-text-secondary">Property management</span>
                    <span className="font-mono-numbers text-sm text-gc-text">{fees.property_management_fee_pct}%</span>
                  </div>
                )}
                {(fees.asset_management_fee_basis || fees.property_management_fee_basis) && (
                  <p className="text-xs text-gc-text-muted pt-1">AM &amp; PM fees charged on gross revenue</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gc-text-muted">See PPM for complete fee details.</p>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
