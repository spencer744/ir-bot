import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { fairmontTheme } from './chartConfig';
import FairmontTooltip from './FairmontTooltip';

interface LeaseUpPaceItem {
  month: string;
  units: number;
}

interface Props {
  data: LeaseUpPaceItem[];
}

export default function LeaseUpPaceChart({ data }: Props) {
  const [inView, setInView] = useState(false);

  const avg = data.length ? Math.round(data.reduce((s, d) => s + d.units, 0) / data.length) : 0;
  const total = data.reduce((s, d) => s + d.units, 0);

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
          Lease-Up Pace
        </h3>
        <div className="flex items-center gap-4 text-xs font-mono" style={{ color: fairmontTheme.textMuted }}>
          <span>
            <span style={{ color: fairmontTheme.gold }}>{total}</span> total units
          </span>
          <span>
            avg <span style={{ color: fairmontTheme.gold }}>{avg}</span>/mo
          </span>
        </div>
      </div>
      <div className="h-[220px]">
        {inView && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 0, right: 10, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={fairmontTheme.gridStroke} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: fairmontTheme.axisTickColor, fontSize: 10 }}
                axisLine={{ stroke: fairmontTheme.axisStroke }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: fairmontTheme.axisTickColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                content={<FairmontTooltip formatter={(v) => `${v} units`} />}
              />
              <ReferenceLine
                y={avg}
                stroke={fairmontTheme.gold}
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{
                  value: `avg ${avg}`,
                  position: 'insideTopRight',
                  fontSize: 10,
                  fill: fairmontTheme.gold,
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              />
              <Bar
                dataKey="units"
                name="Units Leased"
                fill={fairmontTheme.gold}
                radius={[3, 3, 0, 0]}
                isAnimationActive={inView}
                animationDuration={700}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
