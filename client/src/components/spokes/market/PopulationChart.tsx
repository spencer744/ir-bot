import { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { chartTheme } from './chartTheme';
import ChartTooltip from './ChartTooltip';

interface PopulationChartProps {
  data: { year: number; population: number }[];
}

export default function PopulationChart({ data }: PopulationChartProps) {
  const [inView, setInView] = useState(false);

  return (
    <motion.div
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true, margin: '-60px' }}
    >
      <h3 className="text-sm font-semibold text-gc-text mb-4">MSA Population Growth</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="popGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartTheme.accent} stopOpacity={0.2} />
                <stop offset="95%" stopColor={chartTheme.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fill: chartTheme.axisTickColor, fontSize: 11 }}
              axisLine={{ stroke: chartTheme.axisStroke }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: chartTheme.axisTickColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1_000_000).toFixed(2)}M`}
              domain={['dataMin - 20000', 'dataMax + 20000']}
            />
            <Tooltip content={<ChartTooltip formatter={(v) => `${(v / 1_000_000).toFixed(3)}M`} />} />
            <Area
              type="monotone"
              dataKey="population"
              name="Population"
              stroke={chartTheme.accent}
              strokeWidth={2}
              fill="url(#popGradient)"
              dot={{ r: 3, fill: chartTheme.accent, stroke: chartTheme.accent }}
              isAnimationActive={inView}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
