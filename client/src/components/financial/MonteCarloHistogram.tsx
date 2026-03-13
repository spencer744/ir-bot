import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { chartTheme } from '../spokes/market/chartTheme';
import type { MonteCarloResult } from '../../types/monteCarlo';

interface Props {
  result: MonteCarloResult | null;
  metric: 'irr' | 'equity_multiple';
}

export default function MonteCarloHistogram({ result, metric: initialMetric }: Props) {
  const [metric, setMetric] = useState<'irr' | 'equity_multiple'>(initialMetric);

  if (!result) {
    return (
      <div className="bg-gc-surface border border-gc-border rounded-2xl p-6 h-[280px] flex items-center justify-center">
        <p className="text-gc-text-muted text-sm">No simulation data available.</p>
      </div>
    );
  }

  const bins = metric === 'irr' ? result.irrHistogramBins : result.emHistogramBins;
  const chartData = bins.map((b) => ({
    name: metric === 'irr' ? `${(b.mid * 100).toFixed(1)}%` : `${b.mid.toFixed(2)}x`,
    mid: b.mid,
    count: b.count,
  }));

  const fmtCount = (n: number) => n.toString();

  return (
    <div className="bg-gc-surface border border-gc-border rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <h3 className="text-sm font-semibold text-gc-text">Outcome distribution</h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setMetric('irr')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              metric === 'irr'
                ? 'bg-gc-accent text-white'
                : 'bg-gc-bg border border-gc-border text-gc-text-secondary hover:border-gc-accent/40'
            }`}
          >
            IRR
          </button>
          <button
            type="button"
            onClick={() => setMetric('equity_multiple')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              metric === 'equity_multiple'
                ? 'bg-gc-accent text-white'
                : 'bg-gc-bg border border-gc-border text-gc-text-secondary hover:border-gc-accent/40'
            }`}
          >
            Equity multiple
          </button>
        </div>
      </div>

      <div className="h-[250px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: chartTheme.axisTickColor, fontSize: 10 }}
              axisLine={{ stroke: chartTheme.axisStroke }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: chartTheme.axisTickColor, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtCount}
              width={32}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: chartTheme.tooltipBg,
                border: `1px solid ${chartTheme.tooltipBorder}`,
                borderRadius: '8px',
                color: chartTheme.tooltipTextColor,
                fontSize: '12px',
              }}
              formatter={(value: number | undefined) => [value ?? 0, 'Simulations']}
              labelFormatter={(label) => (metric === 'irr' ? `IRR ${label}` : `EM ${label}`)}
            />
            <Bar
              dataKey="count"
              fill={chartTheme.accent}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-gc-text-muted text-[10px] mt-2 text-center">
        {metric === 'irr' ? 'IRR (%)' : 'Equity multiple'} — distribution of simulated outcomes.
      </p>
    </div>
  );
}
