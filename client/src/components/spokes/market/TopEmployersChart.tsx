import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { chartTheme, SECTOR_COLORS, formatCompact } from './chartTheme';
import ChartTooltip from './ChartTooltip';

interface Employer {
  employer: string;
  employees: number;
  sector: string;
}

interface TopEmployersChartProps {
  data: Employer[];
}

export default function TopEmployersChart({ data }: TopEmployersChartProps) {
  const [inView, setInView] = useState(false);
  const sorted = [...data].sort((a, b) => b.employees - a.employees);

  return (
    <motion.div
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true, margin: '-60px' }}
    >
      <h3 className="text-sm font-semibold text-gc-text mb-4">Top Employers</h3>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} layout="vertical" margin={{ left: 10, right: 40, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: chartTheme.axisTickColor, fontSize: 11 }}
              tickFormatter={formatCompact}
              axisLine={{ stroke: chartTheme.axisStroke }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="employer"
              tick={{ fill: chartTheme.axisTickColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={140}
            />
            <Tooltip content={<ChartTooltip formatter={(v) => v.toLocaleString() + ' employees'} />} />
            <Bar
              dataKey="employees"
              radius={[0, 4, 4, 0]}
              isAnimationActive={inView}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {sorted.map((entry, i) => (
                <Cell key={i} fill={SECTOR_COLORS[entry.sector] || chartTheme.accent} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
