import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { chartTheme } from './chartTheme';
import ChartTooltip from './ChartTooltip';

interface VacancyChartProps {
  data: { year: number; vacancy: number }[];
}

export default function VacancyChart({ data }: VacancyChartProps) {
  const [inView, setInView] = useState(false);

  return (
    <motion.div
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true, margin: '-60px' }}
    >
      <h3 className="text-sm font-semibold text-gc-text mb-4">Vacancy Rate Trend</h3>
      <div className="h-[250px] md:h-[350px] min-h-[200px]">
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
              domain={[0, 'dataMax + 1']}
            />
            <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
            <Line
              type="monotone"
              dataKey="vacancy"
              name="Vacancy Rate"
              stroke={chartTheme.positive}
              strokeWidth={2}
              dot={{ r: 4, fill: chartTheme.positive, stroke: chartTheme.positive }}
              isAnimationActive={inView}
              animationDuration={800}
              animationEasing="ease-out"
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
