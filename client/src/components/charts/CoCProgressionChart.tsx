import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { fairmontTheme, PREF_RATE } from './chartConfig';
import FairmontTooltip from './FairmontTooltip';

interface CoCItem {
  year: string;
  coc: number;
  io: boolean;
}

interface Props {
  data: CoCItem[];
}

export default function CoCProgressionChart({ data }: Props) {
  const [inView, setInView] = useState(false);

  const formatted = data.map(d => ({ ...d, coc_pct: d.coc }));

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
          Cash-on-Cash Progression
        </h3>
        <div className="flex items-center gap-4 text-xs" style={{ color: fairmontTheme.textMuted }}>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: fairmontTheme.gold }} />
            I/O Period
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: fairmontTheme.blue }} />
            Amortizing
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-1 h-3 rounded-sm" style={{ background: 'transparent', borderTop: `2px dashed ${fairmontTheme.green}` }} />
            8% Pref
          </span>
        </div>
      </div>
      <div className="h-[240px]">
        {inView && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={formatted} margin={{ left: 0, right: 10, top: 4, bottom: 4 }}>
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
                domain={[4, 12]}
                width={38}
              />
              <Tooltip
                content={
                  <FairmontTooltip
                    formatter={(v, name) => name === 'CoC Return' ? `${v.toFixed(2)}%` : `${v}%`}
                  />
                }
              />
              {/* 8% preferred return line */}
              <ReferenceLine
                y={PREF_RATE}
                stroke={fairmontTheme.green}
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{
                  value: '8% Pref',
                  position: 'insideTopRight',
                  fontSize: 10,
                  fill: fairmontTheme.green,
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              />
              <Bar
                dataKey="coc_pct"
                name="CoC Return"
                radius={[4, 4, 0, 0]}
                isAnimationActive={inView}
                animationDuration={800}
              >
                {formatted.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.io ? fairmontTheme.gold : fairmontTheme.blue}
                    fillOpacity={entry.io ? 1 : 0.85}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* IO period annotation */}
      <div className="mt-3 flex items-center gap-2">
        <div
          className="text-xs font-mono px-2 py-1 rounded"
          style={{ background: fairmontTheme.goldMuted, color: fairmontTheme.gold, border: `1px solid ${fairmontTheme.goldDim}30` }}
        >
          Yrs 1–4: Interest-Only
        </div>
        <div
          className="text-xs font-mono px-2 py-1 rounded"
          style={{ background: fairmontTheme.blueMuted, color: fairmontTheme.blue, border: `1px solid ${fairmontTheme.blue}20` }}
        >
          Yrs 5–7: Amortizing
        </div>
      </div>
    </motion.div>
  );
}
