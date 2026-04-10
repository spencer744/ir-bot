import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { fairmontTheme } from './chartConfig';
import FairmontTooltip from './FairmontTooltip';

interface OccupancyItem {
  quarter: string;
  fairmont: number | null;
  franklin_co: number;
  columbus_msa: number;
}

interface Props {
  data: OccupancyItem[];
}

// Custom dot that only shows when value is not null
const ConditionalDot = (props: any) => {
  const { cx, cy, value } = props;
  if (value === null || value === undefined) return null;
  return <circle cx={cx} cy={cy} r={4} fill={fairmontTheme.gold} stroke={fairmontTheme.bg} strokeWidth={1.5} />;
};

export default function OccupancyTrackingChart({ data }: Props) {
  const [inView, setInView] = useState(false);

  // Find acquisition quarter for annotation
  const acqIdx = data.findIndex(d => d.fairmont !== null);
  const acqLabel = acqIdx >= 0 ? data[acqIdx].quarter : null;

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
          Occupancy Tracking
        </h3>
        <div className="text-xs font-mono" style={{ color: fairmontTheme.textMuted }}>
          Fairmont <span style={{ color: fairmontTheme.gold }}>vs</span> Market
        </div>
      </div>
      <div className="h-[250px]">
        {inView && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 0, right: 10, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={fairmontTheme.gridStroke} vertical={false} />
              <XAxis
                dataKey="quarter"
                tick={{ fill: fairmontTheme.axisTickColor, fontSize: 10 }}
                axisLine={{ stroke: fairmontTheme.axisStroke }}
                tickLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fill: fairmontTheme.axisTickColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}%`}
                domain={[55, 100]}
                width={38}
              />
              <Tooltip
                content={
                  <FairmontTooltip
                    formatter={(v) => `${v.toFixed(1)}%`}
                  />
                }
              />
              <Legend
                verticalAlign="top"
                iconType="line"
                iconSize={14}
                formatter={(value) => (
                  <span style={{ color: fairmontTheme.textMuted, fontSize: 11 }}>{value}</span>
                )}
              />
              {acqLabel && (
                <ReferenceLine
                  x={acqLabel}
                  stroke={fairmontTheme.gold}
                  strokeDasharray="4 3"
                  strokeOpacity={0.5}
                  label={{
                    value: 'Acquisition',
                    position: 'top',
                    fontSize: 9,
                    fill: fairmontTheme.gold,
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="fairmont"
                name="Fairmont"
                stroke={fairmontTheme.gold}
                strokeWidth={3}
                dot={<ConditionalDot />}
                connectNulls={false}
                isAnimationActive={inView}
                animationDuration={900}
              />
              <Line
                type="monotone"
                dataKey="franklin_co"
                name="Franklin Co."
                stroke={fairmontTheme.blue}
                strokeWidth={2}
                dot={false}
                isAnimationActive={inView}
                animationDuration={900}
              />
              <Line
                type="monotone"
                dataKey="columbus_msa"
                name="Columbus MSA"
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
