import { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { chartTheme } from './chartTheme';
import ChartTooltip from './ChartTooltip';

interface SectorData {
  sector: string;
  pct: number;
}

interface SectorDonutChartProps {
  data: SectorData[];
}

const COLORS = ['#34D399', '#3B82F6', '#8B8FA3', '#F59E0B', '#A78BFA', '#60A5FA', '#F97316', '#6B7280'];

export default function SectorDonutChart({ data }: SectorDonutChartProps) {
  const [inView, setInView] = useState(false);

  return (
    <motion.div
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true, margin: '-60px' }}
    >
      <h3 className="text-sm font-semibold text-gc-text mb-4">Employment by Sector</h3>
      <div className="h-[250px] md:h-[400px] min-h-[200px]">
        {inView ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="pct"
              nameKey="sector"
              cx="50%"
              cy="45%"
              innerRadius="50%"
              outerRadius="80%"
              paddingAngle={2}
              isAnimationActive={inView}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span style={{ color: chartTheme.axisTickColor, fontSize: 11 }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
        ) : (
          <div className="w-full h-full" aria-hidden />
        )}
      </div>
    </motion.div>
  );
}
