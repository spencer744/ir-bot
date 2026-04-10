import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
} from 'recharts';
import { fairmontTheme } from './chartConfig';
import FairmontTooltip from './FairmontTooltip';

interface LossToLeaseItem {
  unit_type: string;
  in_place: number;
  market: number;
  gap_pct: number;
}

interface Props {
  data: LossToLeaseItem[];
}

const GapLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (!value) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      fontSize={11}
      fontFamily="var(--font-mono, monospace)"
      fill={fairmontTheme.gold}
      fontWeight={600}
    >
      +{value}%
    </text>
  );
};

export default function LossToLeaseChart({ data }: Props) {
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
          Loss-to-Lease by Unit Type
        </h3>
        <div className="flex items-center gap-4 text-xs" style={{ color: fairmontTheme.textMuted }}>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: fairmontTheme.gold }} />
            In-Place
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: fairmontTheme.blue }} />
            Market
          </span>
        </div>
      </div>
      <div className="h-[260px]">
        {inView && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="25%" margin={{ left: 0, right: 10, top: 24, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={fairmontTheme.gridStroke} vertical={false} />
              <XAxis
                dataKey="unit_type"
                tick={{ fill: fairmontTheme.axisTickColor, fontSize: 11 }}
                axisLine={{ stroke: fairmontTheme.axisStroke }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: fairmontTheme.axisTickColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${v.toLocaleString()}`}
                domain={['auto', 'auto']}
                width={62}
              />
              <Tooltip
                content={
                  <FairmontTooltip
                    formatter={(v) => `$${v.toLocaleString()}`}
                  />
                }
              />
              <Bar
                dataKey="in_place"
                name="In-Place Rent"
                fill={fairmontTheme.gold}
                radius={[4, 4, 0, 0]}
                isAnimationActive={inView}
                animationDuration={700}
              />
              <Bar
                dataKey="market"
                name="Market Rent"
                fill={fairmontTheme.blue}
                radius={[4, 4, 0, 0]}
                isAnimationActive={inView}
                animationDuration={700}
              >
                <LabelList dataKey="gap_pct" content={<GapLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* CRT accent: data callout row */}
      <div className="mt-3 flex gap-3 flex-wrap">
        {data.map(d => (
          <div
            key={d.unit_type}
            className="flex-1 min-w-[80px] rounded-lg px-3 py-2 text-center"
            style={{ background: fairmontTheme.goldMuted, border: `1px solid ${fairmontTheme.goldDim}30` }}
          >
            <div className="text-xs font-mono font-semibold" style={{ color: fairmontTheme.gold }}>
              {d.unit_type}
            </div>
            <div className="text-xs font-mono" style={{ color: fairmontTheme.textMuted }}>
              +{d.gap_pct}% gap
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
