import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { fairmontTheme } from '../charts/chartConfig';
import type { MonteCarloResult } from '../../types/monteCarlo';

const T = fairmontTheme;

interface Props {
  result: MonteCarloResult | null;
  investmentAmount: number;
}

interface FanDataPoint {
  year: number;
  [key: string]: number;
}

const CustomTooltip = ({
  active, payload, label, investmentAmount,
}: {
  active?: boolean;
  payload?: Array<{ value: number; stroke: string; dataKey: string }>;
  label?: string;
  investmentAmount: number;
}) => {
  if (!active || !payload?.length) return null;
  const year = parseInt(label ?? '0');
  const medianEntry = payload.find((p) => p.dataKey === 'median');
  const medianVal = medianEntry ? medianEntry.value * investmentAmount : null;
  return (
    <div
      className="rounded-lg p-3 text-xs font-mono border"
      style={{ background: T.tooltipBg, borderColor: T.border, color: T.textPrimary }}
    >
      <p style={{ color: T.textMuted }} className="mb-1">Year {year}</p>
      {medianVal !== null && (
        <p style={{ color: T.gold }}>
          Median: <span className="font-bold">
            {medianVal >= 1_000_000
              ? `$${(medianVal / 1_000_000).toFixed(2)}M`
              : `$${(medianVal / 1000).toFixed(0)}K`}
          </span>
        </p>
      )}
      <p style={{ color: T.textMuted }} className="mt-1 text-[10px]">
        {payload.length - 1} paths shown
      </p>
    </div>
  );
};

export default function MonteCarloFanChart({ result, investmentAmount }: Props) {
  if (!result || !result.equityPaths?.length) {
    return (
      <div
        className="rounded-2xl p-6 h-[280px] flex items-center justify-center border"
        style={{ background: T.surface, borderColor: T.border }}
      >
        <p className="text-xs" style={{ color: T.textMuted }}>No path data available.</p>
      </div>
    );
  }

  const holdYears = result.holdYears;
  const paths = result.equityPaths ?? [];
  const numPaths = paths.length;

  // Build data array — each entry is { year, path0, path1, ... median }
  const years = Array.from({ length: holdYears + 1 }, (_, i) => i);

  // Compute median path at each year
  const medianByYear: number[] = years.map((year) => {
    const vals = paths.map((p) => p[Math.min(year, p.length - 1)] ?? 1);
    const sorted = [...vals].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted[mid] ?? 1;
  });

  // Build chart data rows
  const chartData: FanDataPoint[] = years.map((year) => {
    const row: FanDataPoint = { year, median: medianByYear[year] };
    // Sample every 2nd path for legibility
    const step = Math.max(1, Math.floor(numPaths / 60));
    for (let i = 0; i < numPaths; i += step) {
      row[`path${i}`] = paths[i][Math.min(year, paths[i].length - 1)] ?? 1;
    }
    return row;
  });

  // Keys for background paths
  const step = Math.max(1, Math.floor(numPaths / 60));
  const pathKeys: string[] = [];
  for (let i = 0; i < numPaths; i += step) {
    pathKeys.push(`path${i}`);
  }

  // Y-axis formatter
  const fmtY = (v: number) => {
    const dollars = v * investmentAmount;
    if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
    return `$${(dollars / 1000).toFixed(0)}K`;
  };

  const p10Exit = result.emPercentiles.p10 * investmentAmount;
  const p90Exit = result.emPercentiles.p90 * investmentAmount;
  const medianExit = result.emPercentiles.p50 * investmentAmount;
  const fmtDollars = (v: number) =>
    v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : `$${(v / 1000).toFixed(0)}K`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl p-4 sm:p-6 border relative overflow-hidden"
      style={{ background: T.surface, borderColor: T.border }}
    >
      {/* Scanline */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.07) 1px, rgba(0,0,0,0.07) 2px)',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: T.textPrimary }}>
              Return Path Simulation
            </h3>
            <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>
              {numPaths} simulated equity value paths · {holdYears}-year hold
            </p>
          </div>
          {/* Exit value summary */}
          <div className="flex gap-4 text-right">
            {[
              { label: 'P10 exit', val: p10Exit, color: T.red },
              { label: 'Median exit', val: medianExit, color: T.gold },
              { label: 'P90 exit', val: p90Exit, color: T.green },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[9px] uppercase tracking-wider" style={{ color: T.textMuted }}>
                  {item.label}
                </p>
                <p className="text-sm font-mono font-bold" style={{ color: item.color }}>
                  {fmtDollars(item.val)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-[260px] sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,53,0.5)" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fill: T.axisTickColor, fontSize: 10, fontFamily: 'monospace' }}
                axisLine={{ stroke: T.axisStroke }}
                tickLine={false}
                tickFormatter={(v) => `Yr ${v}`}
              />
              <YAxis
                tick={{ fill: T.axisTickColor, fontSize: 10, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                width={56}
                tickFormatter={fmtY}
              />
              <Tooltip
                content={<CustomTooltip investmentAmount={investmentAmount} />}
                cursor={{ stroke: T.border, strokeDasharray: '3 3' }}
              />

              {/* Initial investment reference */}
              <ReferenceLine
                y={1}
                stroke={T.textMuted}
                strokeWidth={1}
                strokeDasharray="4 4"
                strokeOpacity={0.5}
                label={{
                  value: `Invested ${fmtDollars(investmentAmount)}`,
                  position: 'insideBottomLeft',
                  fill: T.textMuted,
                  fontSize: 9,
                  fontFamily: 'monospace',
                }}
              />

              {/* Fan path lines — semi-transparent */}
              {pathKeys.map((key) => (
                <Line
                  key={key}
                  dataKey={key}
                  type="monotone"
                  stroke={T.gold}
                  strokeWidth={1}
                  strokeOpacity={0.12}
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              ))}

              {/* Median path — gold, bold, glowing */}
              <Line
                dataKey="median"
                type="monotone"
                stroke={T.gold}
                strokeWidth={2.5}
                dot={(props) => {
                  if (props.index !== holdYears) return <g key={props.key} />;
                  return (
                    <circle
                      key={props.key}
                      cx={props.cx}
                      cy={props.cy}
                      r={6}
                      fill={T.gold}
                      stroke={T.bg}
                      strokeWidth={2}
                      style={{ filter: `drop-shadow(0 0 6px ${T.gold})` }}
                    />
                  );
                }}
                activeDot={{ r: 5, fill: T.gold, stroke: T.bg, strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={1000}
                style={{ filter: `drop-shadow(0 0 5px ${T.gold}88)` }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-4 mt-2 text-[10px]" style={{ color: T.textMuted }}>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-px" style={{ background: T.gold }} />
            Median path
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-px" style={{ background: T.gold, opacity: 0.25 }} />
            Simulated paths
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-px" style={{ background: T.textMuted, opacity: 0.4 }} />
            Initial investment
          </span>
        </div>
      </div>
    </motion.div>
  );
}
