import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { fairmontTheme, PREF_RATE } from '../charts/chartConfig';
import type { MonteCarloResult } from '../../types/monteCarlo';

const T = fairmontTheme;

interface Props {
  result: MonteCarloResult | null;
  metric?: 'irr' | 'equity_multiple';
}

const CustomTooltip = ({
  active, payload, label, metric,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  metric: 'irr' | 'equity_multiple';
}) => {
  if (!active || !payload?.length) return null;
  const val = parseFloat(label ?? '0');
  const prob = payload[0]?.value ?? 0;
  const displayVal = metric === 'irr' ? `${(val * 100).toFixed(1)}%` : `${val.toFixed(2)}x`;
  return (
    <div
      className="rounded-lg p-3 text-xs font-mono border"
      style={{ background: T.tooltipBg, borderColor: T.border, color: T.textPrimary }}
    >
      <p style={{ color: T.textMuted }} className="text-[10px] mb-1">
        {metric === 'irr' ? 'IRR' : 'Equity Multiple'} = {displayVal}
      </p>
      <p style={{ color: T.gold }}>
        Cumulative prob: <span className="font-bold">{(prob * 100).toFixed(1)}%</span>
      </p>
      <p style={{ color: T.textSecondary }} className="mt-1">
        ~{(prob * 100).toFixed(0)}% of runs ≤ this level
      </p>
    </div>
  );
};

export default function MonteCarloCDF({ result, metric = 'irr' }: Props) {
  const [activeMetric] = useState<'irr' | 'equity_multiple'>(metric);

  if (!result) {
    return (
      <div
        className="rounded-2xl p-6 h-[280px] flex items-center justify-center border"
        style={{ background: T.surface, borderColor: T.border }}
      >
        <p className="text-xs" style={{ color: T.textMuted }}>No simulation data.</p>
      </div>
    );
  }

  const data = result.cdfData ?? [];
  const baseIrr = result.baseCaseIrr;
  const prefRate = PREF_RATE / 100; // 8%
  const targetIrr = 0.14; // 14% base target label

  // Probability at pref rate
  const probAbovePref = data.length > 0
    ? 1 - (data.find((d) => d.irr >= prefRate)?.cumProb ?? 0)
    : 0;
  const probAboveTarget = data.length > 0
    ? 1 - (data.find((d) => d.irr >= targetIrr)?.cumProb ?? 0)
    : 0;
  const probOfLoss = data.length > 0
    ? (data.find((d) => d.irr >= 0)?.cumProb ?? 0)
    : 0;

  const xMin = data.length > 0 ? data[0].irr : 0;
  const xMax = data.length > 0 ? data[data.length - 1].irr : 0.3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
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
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: T.textPrimary }}>
              Cumulative Distribution (CDF)
            </h3>
            <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>
              S-curve of simulated outcomes
            </p>
          </div>
        </div>

        {/* Threshold stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Prob IRR < 0', value: probOfLoss, color: T.red, desc: 'Loss scenario' },
            { label: `Prob ≥ ${PREF_RATE}% pref`, value: probAbovePref, color: T.amber, desc: 'Pref return' },
            { label: 'Prob ≥ 14% target', value: probAboveTarget, color: T.green, desc: 'Base case' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl p-3 border text-center"
              style={{ background: T.bg, borderColor: T.border }}
            >
              <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: T.textMuted }}>
                {item.label}
              </p>
              <p className="text-base font-mono font-bold" style={{ color: item.color }}>
                {(item.value * 100).toFixed(0)}%
              </p>
              <p className="text-[9px]" style={{ color: T.textMuted }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CDF Chart */}
        <div className="h-[240px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="cdfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.gold} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={T.gold} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,53,0.6)" vertical={false} />
              <XAxis
                dataKey="irr"
                type="number"
                domain={[xMin - 0.005, xMax + 0.005]}
                scale="linear"
                tickCount={6}
                tick={{ fill: T.axisTickColor, fontSize: 10, fontFamily: 'monospace' }}
                axisLine={{ stroke: T.axisStroke }}
                tickLine={false}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              />
              <YAxis
                tickCount={5}
                tick={{ fill: T.axisTickColor, fontSize: 10, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                width={36}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                domain={[0, 1]}
              />
              <Tooltip content={<CustomTooltip metric={activeMetric} />} />

              {/* IRR = 0 (loss boundary) */}
              <ReferenceLine
                x={0}
                stroke={T.red}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                label={{
                  value: 'Break-even',
                  position: 'insideTopRight',
                  fill: T.red,
                  fontSize: 9,
                  fontFamily: 'monospace',
                }}
              />

              {/* Pref return 8% */}
              <ReferenceLine
                x={prefRate}
                stroke={T.amber}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                label={{
                  value: `${PREF_RATE}% pref`,
                  position: 'insideTopRight',
                  fill: T.amber,
                  fontSize: 9,
                  fontFamily: 'monospace',
                }}
              />

              {/* Base case */}
              <ReferenceLine
                x={baseIrr}
                stroke={T.gold}
                strokeWidth={2}
                label={{
                  value: `Base ${(baseIrr * 100).toFixed(0)}%`,
                  position: 'insideTopLeft',
                  fill: T.gold,
                  fontSize: 9,
                  fontFamily: 'monospace',
                }}
              />

              <Area
                dataKey="cumProb"
                type="monotone"
                stroke={T.gold}
                strokeWidth={2.5}
                fill="url(#cdfGrad)"
                dot={false}
                activeDot={{ r: 4, fill: T.gold, stroke: T.bg, strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={800}
                style={{ filter: `drop-shadow(0 0 6px ${T.gold}55)` }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[9px] mt-2 text-center font-mono" style={{ color: T.textMuted }}>
          X-axis: IRR · Y-axis: Cumulative probability of outcomes ≤ that IRR
        </p>
      </div>
    </motion.div>
  );
}
