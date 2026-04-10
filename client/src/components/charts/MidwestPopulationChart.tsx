import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { fairmontTheme } from './chartConfig';
import FairmontTooltip from './FairmontTooltip';

interface MidwestPopItem {
  city: string;
  growth_pct: number;
}

interface Props {
  data: MidwestPopItem[];
}

export default function MidwestPopulationChart({ data }: Props) {
  const [inView, setInView] = useState(false);

  // Sort descending
  const sorted = [...data].sort((a, b) => b.growth_pct - a.growth_pct);

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
          Population Growth — Midwest Metros
        </h3>
        <div
          className="text-xs font-mono px-2 py-0.5 rounded"
          style={{ background: fairmontTheme.goldMuted, color: fairmontTheme.gold, border: `1px solid ${fairmontTheme.goldDim}40` }}
        >
          Columbus #1
        </div>
      </div>
      <div className="h-[280px]">
        {inView && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={sorted}
              margin={{ left: 80, right: 48, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={fairmontTheme.gridStroke} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: fairmontTheme.axisTickColor, fontSize: 10 }}
                axisLine={{ stroke: fairmontTheme.axisStroke }}
                tickLine={false}
                tickFormatter={v => `${v}%`}
                domain={[0, 'dataMax + 0.2']}
              />
              <YAxis
                type="category"
                dataKey="city"
                tick={{ fill: fairmontTheme.axisTickColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={76}
              />
              <Tooltip
                content={<FairmontTooltip formatter={(v) => `${v.toFixed(2)}%`} />}
              />
              <Bar
                dataKey="growth_pct"
                name="YoY Growth"
                radius={[0, 4, 4, 0]}
                isAnimationActive={inView}
                animationDuration={700}
              >
                <LabelList
                  dataKey="growth_pct"
                  position="right"
                  formatter={(v: unknown) => `${(v as number).toFixed(2)}%`}
                  style={{ fontSize: 10, fontFamily: 'var(--font-mono, monospace)', fill: fairmontTheme.textMuted }}
                />
                {sorted.map((entry) => (
                  <Cell
                    key={entry.city}
                    fill={
                      entry.city === 'Columbus'
                        ? fairmontTheme.gold
                        : entry.city === 'U.S. Avg'
                        ? fairmontTheme.gray
                        : fairmontTheme.blue
                    }
                    fillOpacity={entry.city === 'Columbus' ? 1 : entry.city === 'U.S. Avg' ? 0.6 : 0.55}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
