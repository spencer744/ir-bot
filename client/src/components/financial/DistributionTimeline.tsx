import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { Deal, SensitivityData, ScenarioKey } from '../../types/deal';

interface Props {
  deal: Deal;
  sensitivityData: SensitivityData | null;
  scenario: ScenarioKey;
  investmentAmount: number;
  ownershipPct: number;
}

export default function DistributionTimeline({ deal, sensitivityData, scenario, investmentAmount, ownershipPct }: Props) {
  const data = useMemo(() => {
    const holdYears = deal.projected_hold_years;
    const coc = deal.target_coc || 0.07;
    const equityMult = deal.target_equity_multiple || 1.9;
    const scenarioMults: Record<ScenarioKey, number> = {
      downside: 0.8,
      base: 1.0,
      upside: 1.2,
      strategic: 1.4,
    };
    const sm = scenarioMults[scenario];

    // Check if we have real annual cash flow data
    if (sensitivityData?.annual_cash_flows?.[scenario]) {
      const flows = sensitivityData.annual_cash_flows[scenario];
      return Object.entries(flows).map(([year, cf]) => {
        const yearNum = parseInt(year.replace('year_', ''));
        const isExit = yearNum > holdYears;
        return {
          name: isExit ? 'Exit' : `Y${yearNum}`,
          cashFlow: Math.round(cf.distribution_per_unit * ownershipPct * deal.total_raise / deal.min_investment),
          isExit,
        };
      });
    }

    // Generate estimated data
    const annualCashFlow = investmentAmount * coc * sm;
    const years = [];
    for (let y = 1; y <= holdYears; y++) {
      // Ramp up: lower distributions in early years during renovation
      const ramp = y <= 2 ? 0.5 + (y - 1) * 0.25 : 1;
      years.push({
        name: `Y${y}`,
        cashFlow: Math.round(annualCashFlow * ramp),
        isExit: false,
      });
    }
    // Exit proceeds
    const totalReturn = investmentAmount * equityMult * sm;
    const totalCashFlows = years.reduce((sum, y) => sum + y.cashFlow, 0);
    const exitProceeds = Math.round(totalReturn - totalCashFlows);
    years.push({ name: 'Exit', cashFlow: Math.max(0, exitProceeds), isExit: true });

    return years;
  }, [deal, sensitivityData, scenario, investmentAmount, ownershipPct]);

  const fmt = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n}`;
  };

  const totalDistributions = data.reduce((sum, d) => sum + d.cashFlow, 0);

  return (
    <div className="bg-gc-surface border border-gc-border rounded-2xl p-6">
      <div className="flex justify-between items-baseline mb-4">
        <p className="text-gc-text-secondary text-xs">
          ${(investmentAmount / 1_000).toFixed(0)}K Invested &middot; {scenario === 'downside' ? 'Conservative' : scenario.charAt(0).toUpperCase() + scenario.slice(1)} Case
        </p>
        <p className="text-gc-text text-sm font-semibold font-mono-numbers">
          Total: {fmt(totalDistributions)}
        </p>
      </div>

      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9595A5', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B6B7B', fontSize: 11 }}
              tickFormatter={fmt}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1C1C24',
                border: '1px solid #2A2A35',
                borderRadius: '8px',
                color: '#F0F0F5',
                fontSize: '12px',
              }}
              formatter={(value: number) => [fmt(value), 'Distribution']}
            />
            <Bar dataKey="cashFlow" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.isExit ? '#3B82F6' : '#34D399'}
                  fillOpacity={entry.isExit ? 1 : 0.7 + (i / data.length) * 0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 mt-3 justify-center text-xs text-gc-text-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-gc-positive" />
          Cash Flow Distributions
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-gc-accent" />
          Sale Proceeds
        </div>
      </div>
    </div>
  );
}
