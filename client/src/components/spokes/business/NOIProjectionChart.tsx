import { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { chartTheme } from '../market/chartTheme';
import ChartTooltip from '../market/ChartTooltip';

interface NOIDataPoint {
  year: number;
  conservative: number;
  base: number;
  upside: number;
}

interface NOIProjectionChartProps {
  data: NOIDataPoint[];
  narrative: string;
}

const fmtDollar = (v: number) => `$${(v / 1_000_000).toFixed(2)}M`;

export default function NOIProjectionChart({ data, narrative }: NOIProjectionChartProps) {
  const [inView, setInView] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
      onViewportEnter={() => setInView(true)}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-2">NOI Growth Projection</h2>
      <p className="text-gc-text-muted text-sm mb-6">Projected net operating income across three scenarios.</p>

      <div className="bg-gc-surface border border-gc-border rounded-2xl p-5 mb-6">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="gradUpside" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartTheme.accent} stopOpacity={0.08} />
                  <stop offset="95%" stopColor={chartTheme.accent} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradBase" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartTheme.accent} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={chartTheme.accent} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradConservative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartTheme.warning} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={chartTheme.warning} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fill: chartTheme.axisTickColor, fontSize: 11 }}
                axisLine={{ stroke: chartTheme.axisStroke }}
                tickLine={false}
                tickFormatter={v => `Year ${v}`}
              />
              <YAxis
                tick={{ fill: chartTheme.axisTickColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`}
              />
              <Tooltip content={<ChartTooltip formatter={(v) => fmtDollar(v)} />} />
              <Legend
                verticalAlign="top"
                iconType="line"
                iconSize={12}
                formatter={(value) => <span style={{ color: chartTheme.axisTickColor, fontSize: 11 }}>{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="upside"
                name="Upside"
                stroke={chartTheme.positive}
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#gradUpside)"
                isAnimationActive={inView}
                animationDuration={1000}
              />
              <Area
                type="monotone"
                dataKey="base"
                name="Base Case"
                stroke={chartTheme.accent}
                strokeWidth={3}
                fill="url(#gradBase)"
                isAnimationActive={inView}
                animationDuration={1000}
              />
              <Area
                type="monotone"
                dataKey="conservative"
                name="Conservative"
                stroke={chartTheme.warning}
                strokeWidth={2}
                fill="url(#gradConservative)"
                isAnimationActive={inView}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Narrative */}
      <div className="bg-gc-surface border border-gc-border rounded-2xl p-6 sm:p-8">
        <div className="text-gc-text-secondary text-sm leading-relaxed space-y-4">
          {narrative.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
