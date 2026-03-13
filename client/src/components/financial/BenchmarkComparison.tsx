import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Deal, ScenarioKey } from '../../types/deal';

interface Props {
  deal: Deal;
  scenario: ScenarioKey;
  investmentAmount: number;
}

const BENCHMARK_COLORS = {
  deal: '#3B82F6',
  savings: '#6B6B7B',
  treasury: '#FBBF24',
  muni: '#A78BFA',
  sp500: '#F87171',
};

export default function BenchmarkComparison({ deal, scenario, investmentAmount }: Props) {
  const data = useMemo(() => {
    const holdYears = deal.projected_hold_years;
    const scenarioMults: Record<ScenarioKey, number> = {
      downside: 0.8,
      base: 1.0,
      upside: 1.2,
      strategic: 1.4,
    };
    const sm = scenarioMults[scenario];

    const rates = deal.benchmark_rates || {
      savings: 0.045,
      treasury_10yr: 0.042,
      muni_bond: 0.035,
      sp500_avg: 0.10,
    };

    // Deal: linear growth with bumps for distributions
    const dealEquityMult = 1 + (deal.target_equity_multiple - 1) * sm;
    const dealAnnualReturn = Math.pow(dealEquityMult, 1 / holdYears) - 1;

    const points = [];
    for (let y = 0; y <= holdYears; y++) {
      points.push({
        year: y === 0 ? 'Start' : `Y${y}`,
        deal: Math.round(investmentAmount * Math.pow(1 + dealAnnualReturn, y)),
        savings: Math.round(investmentAmount * Math.pow(1 + rates.savings, y)),
        treasury: Math.round(investmentAmount * Math.pow(1 + rates.treasury_10yr, y)),
        muni: Math.round(investmentAmount * Math.pow(1 + rates.muni_bond, y)),
        sp500: Math.round(investmentAmount * Math.pow(1 + rates.sp500_avg, y)),
      });
    }
    return points;
  }, [deal, scenario, investmentAmount]);

  const fmt = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n}`;
  };

  const scenarioLabel = scenario === 'downside' ? 'Conservative' : scenario.charAt(0).toUpperCase() + scenario.slice(1);

  return (
    <div className="bg-gc-surface border border-gc-border rounded-2xl p-4 sm:p-6">
      <p className="text-gc-text-secondary text-xs mb-4">
        Growth of ${(investmentAmount / 1_000).toFixed(0)}K over {deal.projected_hold_years} years ({scenarioLabel} scenario)
      </p>

      <div className="h-[250px] sm:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9595A5', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B6B7B', fontSize: 11 }}
              tickFormatter={fmt}
              width={65}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1C1C24',
                border: '1px solid #2A2A35',
                borderRadius: '8px',
                color: '#F0F0F5',
                fontSize: '12px',
              }}
              formatter={(value: number | undefined, name?: string) => {
                const labels: Record<string, string> = {
                  deal: `This Deal (${scenarioLabel})`,
                  savings: 'High-Yield Savings',
                  treasury: '10-Year Treasury',
                  muni: 'Muni Bond Index',
                  sp500: 'S&P 500 (Avg)',
                };
                const key = name ?? '';
                return [value != null ? fmt(value) : '', labels[key] || key];
              }}
            />
            <Line
              type="monotone"
              dataKey="deal"
              stroke={BENCHMARK_COLORS.deal}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="sp500"
              stroke={BENCHMARK_COLORS.sp500}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="treasury"
              stroke={BENCHMARK_COLORS.treasury}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="muni"
              stroke={BENCHMARK_COLORS.muni}
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="savings"
              stroke={BENCHMARK_COLORS.savings}
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3 justify-center text-[11px] text-gc-text-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-gc-accent rounded" />
          This Deal
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-gc-negative rounded opacity-70" />
          S&P 500
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-gc-warning rounded opacity-70" />
          10Y Treasury
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 rounded" style={{ background: '#A78BFA' }} />
          Muni Bonds
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-gc-text-muted rounded" />
          Savings
        </div>
      </div>

      <p className="text-gc-text-muted text-[10px] text-center mt-3">
        Benchmark rates as of deal launch. S&P 500 uses 100-year average (~10%). Real estate returns include projected distributions and exit proceeds.
      </p>
    </div>
  );
}
