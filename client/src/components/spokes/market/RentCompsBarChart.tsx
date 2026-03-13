import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { chartTheme } from './chartTheme';

interface RentCompBarItem {
  name: string;
  avg_rent: number;
  highlight?: 'current' | 'proforma';
}

interface RentCompsBarChartProps {
  data: RentCompBarItem[];
}

function getBarColor(highlight?: 'current' | 'proforma'): string {
  if (highlight === 'current') return chartTheme.warning;
  if (highlight === 'proforma') return chartTheme.positive;
  return chartTheme.accent;
}

export default function RentCompsBarChart({ data }: RentCompsBarChartProps) {
  const [inView, setInView] = useState(false);
  const truncated = (s: string, max = 18) =>
    s.length > max ? s.slice(0, max - 3) + '...' : s;

  return (
    <motion.div
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true, margin: '-60px' }}
    >
      <h3 className="text-sm font-semibold text-gc-text mb-4">Average Rent by Comparable</h3>
      <div className="h-[250px] md:h-[400px] min-h-[200px]">
        {inView ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ left: 0, right: 10, top: 5, bottom: 5 }}
            barCategoryGap="12%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: chartTheme.axisTickColor, fontSize: 11 }}
              axisLine={{ stroke: chartTheme.axisStroke }}
              tickLine={false}
              tickFormatter={(v) => truncated(v)}
              interval={0}
            />
            <YAxis
              tick={{ fill: chartTheme.axisTickColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as RentCompBarItem;
                return (
                  <div
                    className="rounded-lg px-3 py-2 text-xs shadow-lg border"
                    style={{
                      backgroundColor: chartTheme.tooltipBg,
                      borderColor: chartTheme.tooltipBorder,
                      color: chartTheme.tooltipTextColor,
                    }}
                  >
                    <p className="text-gc-text-muted mb-1 font-medium">{row.name}</p>
                    <p className="font-mono-numbers font-semibold">
                      ${row.avg_rent.toLocaleString()}
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="avg_rent"
              radius={[4, 4, 0, 0]}
              isAnimationActive={inView}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={getBarColor(entry.highlight)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        ) : (
          <div className="w-full h-full" aria-hidden />
        )}
      </div>
    </motion.div>
  );
}
