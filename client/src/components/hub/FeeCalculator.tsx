import { useState, useEffect } from 'react';
import { Calculator, Info } from 'lucide-react';
import { useDeal } from '../../context/DealContext';

const PRESETS = [100_000, 250_000, 500_000, 1_000_000];

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function fmtDollar(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

interface FeeBreakdown {
  acquisition: number;
  assetMgmtPerYear: number;
  assetMgmtTotal: number;
  disposition: number;
  constructionMgmt: number;
  totalFees: number;
  grossReturnBase: number;
  netToInvestor: number;
}

function calcFees(investment: number, deal: any): FeeBreakdown {
  // Default fee structure (sourced from deal data where available)
  const fees = deal?.deal_fees || {};
  // Fairmont fee structure:
  //   Acquisition fee: 1.5% of purchase price ($937,500)
  //   Asset management fee: 2.0% of EGI (ongoing)
  //   Disposition fee: 1.0% of sale price at exit
  //   Construction management: N/A (no renovation)
  //   Preferred return: 8% cumulative non-compounding
  const acqFeeRate = fees.acquisition_fee_pct ?? 0.015;          // 1.5% of purchase price
  const assetMgmtRate = fees.asset_mgmt_fee_pct ?? 0.02;         // 2%/yr on EGI
  const dispositionRate = fees.disposition_fee_pct ?? 0.01;      // 1% of sale price
  const holdYears = deal?.projected_hold_years ?? 7;
  const equityMultiple = deal?.target_equity_multiple ?? 2.2;
  const totalRaise = deal?.total_raise ?? 22_082_000;
  const purchasePrice = deal?.purchase_price ?? 62_500_000;
  // No renovation / construction management for Fairmont (new construction)
  // const totalRenoBudget = 0; // unused — no renovation fees

  // Fee calculations on this investor's share
  const investorPct = totalRaise > 0 ? investment / totalRaise : 0;
  // Acquisition fee is 1.5% of purchase price, prorated by investor share
  const acquisition = purchasePrice * acqFeeRate * investorPct;
  // Asset mgmt fee is 2% of EGI — approximated as % of investment per year
  const assetMgmtPerYear = investment * assetMgmtRate;
  const assetMgmtTotal = assetMgmtPerYear * holdYears;
  const investorShareOfSalePrice = purchasePrice * equityMultiple * investorPct;
  const disposition = investorShareOfSalePrice * dispositionRate;
  const constructionMgmt = 0; // N/A — no renovation
  const totalFees = acquisition + assetMgmtTotal + disposition + constructionMgmt;

  // Gross return at base case, then subtract fees
  const grossReturnBase = investment * equityMultiple;
  const netToInvestor = grossReturnBase - acquisition - assetMgmtTotal - disposition;

  return {
    acquisition,
    assetMgmtPerYear,
    assetMgmtTotal,
    disposition,
    constructionMgmt,
    totalFees,
    grossReturnBase,
    netToInvestor,
  };
}

interface FeeCalculatorProps {
  externalAmount?: number; // synced from Financial Explorer slider
}

export default function FeeCalculator({ externalAmount }: FeeCalculatorProps) {
  const { deal } = useDeal();
  const [investment, setInvestment] = useState(externalAmount || 250_000);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (externalAmount && externalAmount !== investment) {
      setInvestment(externalAmount);
    }
  }, [externalAmount]);

  if (!deal) return null;

  const fees = calcFees(investment, deal);
  const holdYears = deal.projected_hold_years ?? 6;
  const assetMgmtPct = (deal as any).deal_fees?.asset_mgmt_fee_pct ?? 0.02;

  return (
    <div className="bg-gc-surface border border-gc-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-4 h-4 text-gc-accent" />
        <h3 className="text-sm font-semibold text-gc-text">Fee Impact Calculator</h3>
        <span className="ml-auto text-[10px] text-gc-text-muted bg-gc-surface-elevated border border-gc-border px-2 py-0.5 rounded-full">
          Non-binding estimates
        </span>
      </div>

      {/* Investment amount selector */}
      <div className="mb-5">
        <label className="block text-xs text-gc-text-muted mb-2">Your Investment Amount</label>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {PRESETS.map(p => (
            <button
              key={p}
              onClick={() => setInvestment(p)}
              className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                investment === p
                  ? 'bg-gc-accent/20 border-gc-accent text-gc-accent'
                  : 'bg-gc-bg border-gc-border text-gc-text-secondary hover:border-gc-accent/40'
              }`}
            >
              {fmt(p)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gc-text-muted text-sm">$</span>
          <input
            type="number"
            value={investment}
            min={deal.min_investment || 100_000}
            step={25_000}
            onChange={e => setInvestment(Math.max(0, parseInt(e.target.value) || 0))}
            className="flex-1 bg-gc-bg border border-gc-border rounded-lg px-3 py-2 text-sm text-gc-text focus:border-gc-accent focus:ring-1 focus:ring-gc-accent transition-colors"
          />
        </div>
        <input
          type="range"
          min={deal.min_investment || 100_000}
          max={2_000_000}
          step={25_000}
          value={Math.min(investment, 2_000_000)}
          onChange={e => setInvestment(parseInt(e.target.value))}
          className="w-full mt-2 accent-gc-accent"
        />
      </div>

      {/* Summary output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between py-2 border-b border-gc-border/50">
          <span className="text-xs text-gc-text-secondary">Acquisition fee <span className="text-gc-text-muted">(1.5% of purchase price, one-time)</span></span>
          <span className="text-sm font-mono text-gc-text">{fmtDollar(fees.acquisition)}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gc-border/50">
          <span className="text-xs text-gc-text-secondary">
            Asset mgmt fee <span className="text-gc-text-muted">({(assetMgmtPct * 100).toFixed(0)}%/yr × {holdYears} yrs)</span>
          </span>
          <span className="text-sm font-mono text-gc-text">{fmtDollar(fees.assetMgmtTotal)}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gc-border/50">
          <span className="text-xs text-gc-text-secondary">Disposition fee <span className="text-gc-text-muted">(est. at exit)</span></span>
          <span className="text-sm font-mono text-gc-text">{fmtDollar(fees.disposition)}</span>
        </div>

        {showDetails && (
          <div className="flex items-center justify-between py-2 border-b border-gc-border/50">
            <span className="text-xs text-gc-text-secondary">Construction mgmt fee <span className="text-gc-text-muted">(N/A — new construction)</span></span>
            <span className="text-sm font-mono text-gc-text-muted">$0</span>
          </div>
        )}

        <button
          onClick={() => setShowDetails(d => !d)}
          className="text-[11px] text-gc-accent hover:text-gc-accent/80 transition-colors py-1"
        >
          {showDetails ? '▲ Hide details' : '▾ Show all fees'}
        </button>

        {/* Totals */}
        <div className="pt-2 mt-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gc-text-secondary">Total estimated fees over hold</span>
            <span className="text-sm font-semibold font-mono text-gc-negative">{fmtDollar(fees.totalFees)}</span>
          </div>
          <div className="flex items-center justify-between py-3 px-3 bg-gc-positive/5 border border-gc-positive/20 rounded-xl">
            <div>
              <p className="text-xs font-medium text-gc-text">Net to you at base case</p>
              <p className="text-[10px] text-gc-text-muted mt-0.5">
                Gross {fmtDollar(fees.grossReturnBase)} − fees = net
              </p>
            </div>
            <span className="text-lg font-bold font-mono text-gc-positive">{fmtDollar(fees.netToInvestor)}</span>
          </div>
        </div>
      </div>

      {/* Disclosure */}
      <div className="flex items-start gap-1.5 mt-4 p-3 bg-gc-bg rounded-lg">
        <Info className="w-3.5 h-3.5 text-gc-text-muted mt-0.5 shrink-0" />
        <p className="text-[10px] text-gc-text-muted leading-relaxed">
          Fee estimates are illustrative. Actual fees are as described in the PPM. Net return excludes GP promote,
          distributions received during hold, and tax benefits. Consult your tax and financial advisors.
        </p>
      </div>
    </div>
  );
}
