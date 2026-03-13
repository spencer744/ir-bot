import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { chartTheme } from '../spokes/market/chartTheme';
import type { Deal } from '../../types/deal';
import type { SensitivityData } from '../../types/deal';

interface Props {
  sensitivityData: SensitivityData | null;
  deal: Deal | null;
  investmentAmount?: number;
}

export default function TornadoChart({ sensitivityData, deal }: Props) {
  const data = useMemo(() => {
    if (!sensitivityData?.sensitivity_tables) return [];

    const tables = sensitivityData.sensitivity_tables;
    const baseIrr = deal?.target_irr_base ?? sensitivityData.scenarios?.base?.returns?.lp_irr ?? 0.158;

    const rows: { driver: string; low: number; high: number; range: number; base: number; lowPct: number; highPct: number }[] = [];

    if (tables.rent_growth_vs_irr?.length) {
      const irrs = tables.rent_growth_vs_irr.map((r) => r.irr ?? 0);
      const low = Math.min(...irrs);
      const high = Math.max(...irrs);
      rows.push({
        driver: 'Rent growth',
        low,
        high,
        range: high - low,
        base: baseIrr,
        lowPct: low * 100,
        highPct: high * 100,
      });
    }

    if (tables.exit_cap_vs_irr?.length) {
      const irrs = tables.exit_cap_vs_irr.map((r) => r.irr ?? 0);
      const low = Math.min(...irrs);
      const high = Math.max(...irrs);
      rows.push({
        driver: 'Exit cap rate',
        low,
        high,
        range: high - low,
        base: baseIrr,
        lowPct: low * 100,
        highPct: high * 100,
      });
    }

    if (tables.occupancy_vs_irr?.length) {
      const irrs = tables.occupancy_vs_irr.map((r) => r.irr ?? 0);
      const low = Math.min(...irrs);
      const high = Math.max(...irrs);
      rows.push({
        driver: 'Occupancy',
        low,
        high,
        range: high - low,
        base: baseIrr,
        lowPct: low * 100,
        highPct: high * 100,
      });
    }

    return rows;
  }, [sensitivityData, deal]);

  if (!sensitivityData || data.length === 0) {
    return (
      <div className="bg-gc-surface border border-gc-border rounded-2xl p-6 text-center">
        <p className="text-gc-text-muted text-sm">Sensitivity data is required for the tornado chart.</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.driver,
    low: d.lowPct,
    range: (d.high - d.low) * 100,
  }));

  const basePct = (deal?.target_irr_base ?? 0.158) * 100;
  const xMin = Math.min(...data.map((d) => d.lowPct), basePct - 5);
  const xMax = Math.max(...data.map((d) => d.highPct), basePct + 5);

  return (
    <div className="bg-gc-surface border border-gc-border rounded-2xl p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gc-text mb-3">IRR sensitivity by driver</h3>
      <p className="text-gc-text-muted text-xs mb-4">
        Range of IRR when each driver moves from table minimum to maximum (all else held at base).
      </p>

      <div className="h-[220px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 8, right: 24, left: 70, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} horizontal={false} />
            <XAxis
              type="number"
              domain={[Math.max(0, xMin - 2), Math.min(30, xMax + 2)]}
              tick={{ fill: chartTheme.axisTickColor, fontSize: 10 }}
              axisLine={{ stroke: chartTheme.axisStroke }}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: chartTheme.axisTickColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={68}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: chartTheme.tooltipBg,
                border: `1px solid ${chartTheme.tooltipBorder}`,
                borderRadius: '8px',
                color: chartTheme.tooltipTextColor,
                fontSize: '12px',
              }}
              formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)}%`, 'IRR range']}
              labelFormatter={(label) => label}
            />
            <ReferenceLine x={basePct} stroke={chartTheme.warning} strokeDasharray="4 4" strokeWidth={1.5} />
            <Bar dataKey="low" stackId="tornado" fill="transparent" barSize={20} />
            <Bar dataKey="range" stackId="tornado" barSize={20} radius={[0, 4, 4, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={chartTheme.accent} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mt-2 text-[10px] text-gc-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-gc-accent rounded" />
          IRR range
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 border border-dashed border-gc-warning rounded" style={{ borderStyle: 'dashed' }} />
          Base case
        </span>
      </div>
    </div>
  );
}
