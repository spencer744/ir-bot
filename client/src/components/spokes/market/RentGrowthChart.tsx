import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { chartTheme } from './chartTheme';
import ChartTooltip from './ChartTooltip';

interface RentGrowthData {
  year: number;
  submarket: number;
  msa: number;
  national: number;
}

interface RentGrowthChartProps {
  data: RentGrowthData[];
}

export default function RentGrowthChart({ data }: RentGrowthChartProps) {
  const [inView, setInView] = useState(false);

  return (
    <motion.div
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true, margin: '-60px' }}
    >
      <h3 className="text-sm font-semibold text-gc-text mb-4">YoY Rent Growth (%)</h3>
      <div className="h-[250px] md:h-[400px] min-h-[200px]">
        {inView ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
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
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
            <Legend
              verticalAlign="top"
              iconType="line"
              iconSize={12}
              formatter={(value) => <span style={{ color: chartTheme.axisTickColor, fontSize: 11 }}>{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="submarket"
              name="Submarket"
              stroke={chartTheme.accent}
              strokeWidth={3}
              dot={{ r: 4, fill: chartTheme.accent }}
              isAnimationActive={inView}
              animationDuration={800}
            />
            <Line
              type="monotone"
              dataKey="msa"
              name="MSA"
              stroke={chartTheme.positive}
              strokeWidth={2}
              dot={{ r: 3, fill: chartTheme.positive }}
              isAnimationActive={inView}
              animationDuration={800}
            />
            <Line
              type="monotone"
              dataKey="national"
              name="National"
              stroke={chartTheme.secondary}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: chartTheme.secondary }}
              isAnimationActive={inView}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
        ) : (
          <div className="w-full h-full" aria-hidden />
        )}
      </div>
    </motion.div>
  );
}
