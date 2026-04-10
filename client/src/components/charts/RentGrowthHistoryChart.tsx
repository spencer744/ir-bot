import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { fairmontTheme } from './chartConfig';
import FairmontTooltip from './FairmontTooltip';

interface RentGrowthItem {
  year: number;
  submarket: number;
  msa: number;
  national: number;
}

interface Props {
  data: RentGrowthItem[];
}

export default function RentGrowthHistoryChart({ data }: Props) {
  const [inView, setInView] = useState(false);

  return (
    <motion.div
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true, margin: '-60px' }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: fairmontTheme.textPrimary }}>
          YoY Rent Growth History
        </h3>
        <div className="flex items-center gap-3 text-xs" style={{ color: fairmontTheme.textMuted }}>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 rounded" style={{ borderColor: fairmontTheme.gold }} />
            Submarket
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 rounded" style={{ borderColor: fairmontTheme.blue }} />
            MSA
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t border-dashed" style={{ borderColor: fairmontTheme.gray }} />
            National
          </span>
        </div>
      </div>
      <div className="h-[240px]">
        {inView && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 0, right: 10, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={fairmontTheme.gridStroke} vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fill: fairmontTheme.axisTickColor, fontSize: 11 }}
                axisLine={{ stroke: fairmontTheme.axisStroke }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: fairmontTheme.axisTickColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}%`}
                width={36}
              />
              <Tooltip
                content={<FairmontTooltip formatter={(v) => `${v.toFixed(1)}%`} />}
              />
              <ReferenceLine
                y={0}
                stroke={fairmontTheme.border}
                strokeWidth={1}
              />
              <Line
                type="monotone"
                dataKey="submarket"
                name="Submarket"
                stroke={fairmontTheme.gold}
                strokeWidth={3}
                dot={{ r: 4, fill: fairmontTheme.gold, strokeWidth: 0 }}
                isAnimationActive={inView}
                animationDuration={900}
              />
              <Line
                type="monotone"
                dataKey="msa"
                name="Columbus MSA"
                stroke={fairmontTheme.blue}
                strokeWidth={2}
                dot={{ r: 3, fill: fairmontTheme.blue, strokeWidth: 0 }}
                isAnimationActive={inView}
                animationDuration={900}
              />
              <Line
                type="monotone"
                dataKey="national"
                name="National"
                stroke={fairmontTheme.gray}
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                isAnimationActive={inView}
                animationDuration={900}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
