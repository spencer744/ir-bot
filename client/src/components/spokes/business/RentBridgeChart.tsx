import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Text } from 'recharts';
import { chartTheme } from '../market/chartTheme';
import ChartTooltip from '../market/ChartTooltip';

interface BridgeItem {
  label: string;
  value: number;
  type: 'base' | 'increase' | 'total';
}

interface RentBridgeChartProps {
  data: BridgeItem[];
  narrative: string;
}

export default function RentBridgeChart({ data, narrative }: RentBridgeChartProps) {
  const [inView, setInView] = useState(false);

  // Build waterfall data: each bar has an invisible base + visible segment
  let running = 0;
  const chartData = data.map(d => {
    if (d.type === 'base') {
      running = d.value;
      return { name: d.label, invisible: 0, visible: d.value, type: d.type, total: d.value };
    } else if (d.type === 'increase') {
      const base = running;
      running += d.value;
      return { name: d.label, invisible: base, visible: d.value, type: d.type, total: running };
    } else {
      // total
      return { name: d.label, invisible: 0, visible: d.value, type: d.type, total: d.value };
    }
  });

  const CustomLabel = (props: any) => {
    const { x, y, width, value: _value, index } = props;
    const item = chartData[index];
    if (!item) return null;
    const labelText = `$${item.total.toLocaleString()}`;
    return (
      <Text
        x={x + width / 2}
        y={y - 8}
        textAnchor="middle"
        fill={chartTheme.tooltipTextColor}
        fontSize={10}
        fontFamily="'JetBrains Mono', monospace"
        fontWeight={600}
      >
        {labelText}
      </Text>
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
      onViewportEnter={() => setInView(true)}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-2">Rent Growth Plan</h2>
      <p className="text-gc-text-muted text-sm mb-6">From current rents to stabilized pro forma.</p>

      <div className="bg-gc-surface border border-gc-border rounded-2xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-gc-text mb-4">Rent Bridge — Current to Stabilized</h3>
        <div className="h-[250px] sm:h-[350px] min-h-[200px]">
          {inView ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 0, right: 10, top: 25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: chartTheme.axisTickColor, fontSize: 9 }}
                axisLine={{ stroke: chartTheme.axisStroke }}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: chartTheme.axisTickColor, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${v.toLocaleString()}`}
                domain={[0, 'dataMax + 100']}
                width={55}
              />
              <Tooltip content={<ChartTooltip formatter={(v, name) => name === 'invisible' ? '' : `$${v.toLocaleString()}`} />} />
              {/* Invisible base */}
              <Bar dataKey="invisible" stackId="stack" fill="transparent" isAnimationActive={false} />
              {/* Visible segment */}
              <Bar
                dataKey="visible"
                stackId="stack"
                radius={[4, 4, 0, 0]}
                isAnimationActive={inView}
                animationDuration={800}
                label={<CustomLabel />}
              >
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.type === 'increase' ? chartTheme.positive : chartTheme.accent}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          ) : (
            <div className="w-full h-full" aria-hidden />
          )}
        </div>
      </div>

      {/* Narrative */}
      <div className="bg-gc-surface border border-gc-border rounded-2xl p-6 sm:p-8">
        <div className="text-gc-text-secondary text-sm leading-relaxed space-y-4">
          {narrative.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
