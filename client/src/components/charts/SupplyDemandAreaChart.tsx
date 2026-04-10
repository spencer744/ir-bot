import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fairmontTheme } from './chartConfig';
import FairmontTooltip from './FairmontTooltip';

interface SupplyDemandItem {
  year: string;
  deliveries: number;
  absorption: number;
}

interface Props {
  data: SupplyDemandItem[];
}

export default function SupplyDemandAreaChart({ data }: Props) {
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
          Columbus MSA — Supply vs. Absorption
        </h3>
        <div className="flex items-center gap-3 text-xs" style={{ color: fairmontTheme.textMuted }}>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: fairmontTheme.gray }} />
            Deliveries
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: fairmontTheme.gold }} />
            Absorption
          </span>
        </div>
      </div>
      <div className="h-[240px]">
        {inView && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, right: 10, top: 4, bottom: 4 }}>
              <defs>
                <linearGradient id="deliveriesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={fairmontTheme.gray} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={fairmontTheme.gray} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="absorptionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={fairmontTheme.gold} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={fairmontTheme.gold} stopOpacity={0.02} />
                </linearGradient>
              </defs>
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
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toString()}
                width={38}
              />
              <Tooltip
                content={<FairmontTooltip formatter={(v) => `${v.toLocaleString()} units`} />}
              />
              <Area
                type="monotone"
                dataKey="deliveries"
                name="Deliveries"
                stroke={fairmontTheme.gray}
                strokeWidth={2}
                fill="url(#deliveriesGrad)"
                isAnimationActive={inView}
                animationDuration={900}
              />
              <Area
                type="monotone"
                dataKey="absorption"
                name="Absorption"
                stroke={fairmontTheme.gold}
                strokeWidth={2}
                fill="url(#absorptionGrad)"
                isAnimationActive={inView}
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
