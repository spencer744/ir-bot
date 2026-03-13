import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { chartTheme } from './chartTheme';
import ChartTooltip from './ChartTooltip';

interface SupplyDemandData {
  year: string;
  deliveries: number;
  absorption: number;
}

interface SupplyDemandChartProps {
  data: SupplyDemandData[];
}

export default function SupplyDemandChart({ data }: SupplyDemandChartProps) {
  const [inView, setInView] = useState(false);

  return (
    <motion.div
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true, margin: '-60px' }}
    >
      <h3 className="text-sm font-semibold text-gc-text mb-4">New Supply vs. Absorption (Units)</h3>
      <div className="h-[250px] md:h-[400px] min-h-[200px]">
        {inView ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
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
              tickFormatter={(v) => v.toLocaleString()}
            />
            <Tooltip content={<ChartTooltip formatter={(v) => v.toLocaleString() + ' units'} />} />
            <Legend
              verticalAlign="top"
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span style={{ color: chartTheme.axisTickColor, fontSize: 11 }}>{value}</span>}
            />
            <Bar
              dataKey="deliveries"
              name="Deliveries"
              fill={chartTheme.secondary}
              radius={[4, 4, 0, 0]}
              isAnimationActive={inView}
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="absorption"
              name="Absorption"
              fill={chartTheme.accent}
              radius={[4, 4, 0, 0]}
              isAnimationActive={inView}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
        ) : (
          <div className="w-full h-full" aria-hidden />
        )}
      </div>
    </motion.div>
  );
}
