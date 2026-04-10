import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { fairmontTheme } from '../charts/chartConfig';
import type { MonteCarloResult } from '../../types/monteCarlo';

const T = fairmontTheme;

interface Props {
  result: MonteCarloResult | null;
  metric?: 'irr' | 'equity_multiple';
}

/** Gaussian KDE evaluated at x given samples and bandwidth h */
function kde(samples: number[], h: number, x: number): number {
  const n = samples.length;
  if (n === 0) return 0;
  let sum = 0;
  for (const xi of samples) {
    const u = (x - xi) / h;
    sum += Math.exp(-0.5 * u * u);
  }
  return sum / (n * h * Math.sqrt(2 * Math.PI));
}

function buildKdeCurve(
  _bins: ReturnType<typeof Array.prototype.map>,
  numPoints: number,
  xMin: number,
  xMax: number,
  sampleMids: number[],
  maxCount: number
): { mid: number; kde: number }[] {
  if (sampleMids.length === 0) return [];
  const h = (xMax - xMin) / 6; // Silverman-ish bandwidth
  const step = (xMax - xMin) / (numPoints - 1);
  const kdePts: { mid: number; kde: number }[] = [];
  for (let i = 0; i < numPoints; i++) {
    const x = xMin + i * step;
    const density = kde(sampleMids, h, x);
    kdePts.push({ mid: x, kde: density });
  }
  // Scale KDE to match bar chart counts
  const maxKde = Math.max(...kdePts.map((p) => p.kde));
  if (maxKde === 0) return kdePts;
  const scale = maxCount / maxKde;
  return kdePts.map((p) => ({ ...p, kde: p.kde * scale }));
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label, metric }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
  metric: 'irr' | 'equity_multiple';
}) => {
  if (!active || !payload?.length) return null;
  const countEntry = payload.find((p) => p.name === 'count');
  const kdeEntry = payload.find((p) => p.name === 'kde');
  const val = parseFloat(label ?? '0');
  const displayVal = metric === 'irr'
    ? `${(val * 100).toFixed(1)}%`
    : `${val.toFixed(2)}x`;
  return (
    <div
      className="rounded-lg p-3 text-xs font-mono border"
      style={{
        background: T.tooltipBg,
        border: `1px solid ${T.border}`,
        color: T.textPrimary,
      }}
    >
      <p className="text-[10px] mb-1.5" style={{ color: T.textMuted }}>
        {metric === 'irr' ? 'IRR' : 'Equity Multiple'} ≈ {displayVal}
      </p>
      {countEntry && (
        <p style={{ color: T.gold }}>
          Simulations: <span className="font-bold">{Math.round(countEntry.value)}</span>
        </p>
      )}
      {kdeEntry && (
        <p style={{ color: T.textSecondary }}>
          Density (KDE)
        </p>
      )}
    </div>
  );
};

// Gradient bar cell coloring
const GradientBar = ({ x, y, width, height, value, maxCount }: {
  x?: number; y?: number; width?: number; height?: number;
  value?: number; maxCount: number;
}) => {
  if (!x || !y || !width || !height) return null;
  const pct = maxCount > 0 ? (value ?? 0) / maxCount : 0;
  const alpha = 0.35 + pct * 0.65;
  return (
    <g>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0C060" stopOpacity={alpha} />
          <stop offset="100%" stopColor="#8A6E2A" stopOpacity={alpha * 0.6} />
        </linearGradient>
      </defs>
      <rect
        x={x} y={y} width={width} height={height}
        fill="url(#barGrad)"
        rx={3} ry={3}
        style={{ filter: `drop-shadow(0 0 ${pct * 6}px rgba(212,168,67,0.4))` }}
      />
    </g>
  );
};

export default function MonteCarloHistogram({ result, metric: initialMetric = 'irr' }: Props) {
  const [metric, setMetric] = useState<'irr' | 'equity_multiple'>(initialMetric);

  if (!result) {
    return (
      <div
        className="rounded-2xl p-6 h-[280px] flex items-center justify-center border"
        style={{ background: T.surface, borderColor: T.border }}
      >
        <p className="text-xs" style={{ color: T.textMuted }}>No simulation data available.</p>
      </div>
    );
  }

  const bins = metric === 'irr' ? result.irrHistogramBins : result.emHistogramBins;
  const maxCount = Math.max(...bins.map((b) => b.count));
  const piles = result.irrPercentiles;
  const emPiles = result.emPercentiles;

  // Build sample mids for KDE input (weight by count)
  const sampleMids: number[] = [];
  for (const b of bins) {
    const n = Math.min(50, Math.round(b.count / 4)); // downsample for perf
    for (let i = 0; i < n; i++) sampleMids.push(b.mid);
  }

  const xMin = bins[0].binMin;
  const xMax = bins[bins.length - 1].binMax;
  const kdeCurve = buildKdeCurve(bins, 80, xMin, xMax, sampleMids, maxCount);

  // Merge bins + KDE into one data array
  const binData = bins.map((b) => ({
    mid: b.mid,
    count: b.count,
    kde: null as number | null,
  }));
  const kdeData = kdeCurve.map((k) => ({
    mid: k.mid,
    count: null as number | null,
    kde: k.kde,
  }));
  // Sort and interleave for ComposedChart
  const allData = [...binData, ...kdeData].sort((a, b) => a.mid - b.mid);

  const p10 = metric === 'irr' ? piles.p10 : emPiles.p10;
  const p25 = metric === 'irr' ? piles.p25 : emPiles.p25;
  const p50 = metric === 'irr' ? piles.p50 : emPiles.p50;
  const p75 = metric === 'irr' ? piles.p75 : emPiles.p75;
  const p90 = metric === 'irr' ? piles.p90 : emPiles.p90;
  const baseCase = metric === 'irr' ? result.baseCaseIrr : result.baseCaseEm;

  const fmtX = (v: number) => metric === 'irr' ? `${(v * 100).toFixed(0)}%` : `${v.toFixed(1)}x`;
  const fmtLabel = (v: number) => metric === 'irr' ? `${(v * 100).toFixed(1)}%` : `${v.toFixed(2)}x`;

  const xDomain = [xMin - (xMax - xMin) * 0.02, xMax + (xMax - xMin) * 0.02] as [number, number];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-4 sm:p-6 border relative overflow-hidden"
      style={{ background: T.surface, borderColor: T.border }}
    >
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.08) 1px, rgba(0,0,0,0.08) 2px)',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: T.textPrimary }}>
              Outcome Distribution
            </h3>
            <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>
              {result.iterations.toLocaleString()} simulations · KDE probability density
            </p>
          </div>
          <div className="flex gap-1.5">
            {(['irr', 'equity_multiple'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: metric === m ? T.gold : 'transparent',
                  color: metric === m ? '#0A0A0F' : T.textSecondary,
                  border: `1px solid ${metric === m ? T.gold : T.border}`,
                }}
              >
                {m === 'irr' ? 'IRR' : 'Equity Multiple'}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-[280px] sm:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={allData} margin={{ top: 20, right: 20, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="confBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.gold} stopOpacity={0.06} />
                  <stop offset="100%" stopColor={T.gold} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(42,42,53,0.6)"
                vertical={false}
              />
              <XAxis
                dataKey="mid"
                type="number"
                domain={xDomain}
                scale="linear"
                tickCount={7}
                tick={{ fill: T.axisTickColor, fontSize: 10, fontFamily: 'monospace' }}
                axisLine={{ stroke: T.axisStroke }}
                tickLine={false}
                tickFormatter={fmtX}
              />
              <YAxis
                tick={{ fill: T.axisTickColor, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                content={<CustomTooltip metric={metric} />}
                cursor={{ fill: 'rgba(212,168,67,0.05)' }}
              />

              {/* P25–P75 confidence band */}
              <ReferenceArea
                x1={p25}
                x2={p75}
                fill={T.gold}
                fillOpacity={0.06}
              />

              {/* VaR line (P10) */}
              <ReferenceLine
                x={p10}
                stroke={T.red}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                label={{
                  value: `VaR ${fmtLabel(p10)}`,
                  position: 'insideTopRight',
                  fill: T.red,
                  fontSize: 9,
                  fontFamily: 'monospace',
                }}
              />

              {/* P50 median */}
              <ReferenceLine
                x={p50}
                stroke={T.textSecondary}
                strokeWidth={1}
                strokeDasharray="3 3"
                label={{
                  value: `P50 ${fmtLabel(p50)}`,
                  position: 'insideTopLeft',
                  fill: T.textSecondary,
                  fontSize: 9,
                  fontFamily: 'monospace',
                }}
              />

              {/* P90 */}
              <ReferenceLine
                x={p90}
                stroke={T.green}
                strokeWidth={1}
                strokeDasharray="3 3"
                label={{
                  value: `P90 ${fmtLabel(p90)}`,
                  position: 'insideTopLeft',
                  fill: T.green,
                  fontSize: 9,
                  fontFamily: 'monospace',
                }}
              />

              {/* Base case gold line */}
              <ReferenceLine
                x={baseCase}
                stroke={T.gold}
                strokeWidth={2}
                label={{
                  value: metric === 'irr' ? `Base ${fmtLabel(baseCase)}` : `Base ${fmtLabel(baseCase)}`,
                  position: 'top',
                  fill: T.gold,
                  fontSize: 9,
                  fontFamily: 'monospace',
                }}
              />

              {/* Histogram bars */}
              <Bar
                dataKey="count"
                isAnimationActive={true}
                animationDuration={600}
                maxBarSize={24}
                shape={(props: any) => (
                  <GradientBar {...props} maxCount={maxCount} value={props.count ?? props.value ?? 0} />
                )}
              />

              {/* KDE smooth curve */}
              <Line
                dataKey="kde"
                type="monotone"
                stroke={T.gold}
                strokeWidth={2}
                dot={false}
                activeDot={false}
                isAnimationActive={true}
                animationDuration={800}
                connectNulls={false}
                strokeOpacity={0.9}
                style={{ filter: `drop-shadow(0 0 4px ${T.gold}66)` }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-3 text-[10px]" style={{ color: T.textMuted }}>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-2 rounded-sm" style={{ background: T.gold, opacity: 0.7 }} />
            Histogram
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-px" style={{ background: T.gold }} />
            KDE curve
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-px" style={{ background: T.red }} />
            VaR (P10)
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-4 h-2 rounded-sm"
              style={{ background: `${T.gold}22`, border: `1px solid ${T.gold}44` }}
            />
            P25–P75 range
          </span>
        </div>
      </div>
    </motion.div>
  );
}
