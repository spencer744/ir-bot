import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { fairmontTheme } from './chartConfig';
import FairmontTooltip from './FairmontTooltip';

interface RentItem {
  name: string;
  rent: number;
  is_subject?: boolean;
}

interface Props {
  data: {
    one_br: RentItem[];
    two_br: RentItem[];
    three_br: RentItem[];
  };
}

const TABS = [
  { key: 'one_br', label: '1BR' },
  { key: 'two_br', label: '2BR' },
  { key: 'three_br', label: '3BR' },
] as const;

type TabKey = 'one_br' | 'two_br' | 'three_br';

function shortenName(name: string) {
  // Shorten long names for axis
  if (name.length <= 10) return name;
  const words = name.split(' ');
  if (words.length >= 2) return words.slice(0, 2).map(w => w.slice(0, 6)).join(' ');
  return name.slice(0, 10);
}

interface ChartBarProps {
  data: RentItem[];
  inView: boolean;
}

function ChartBar({ data, inView }: ChartBarProps) {
  const sorted = [...data].sort((a, b) => a.rent - b.rent);

  return (
    <div className="h-[280px]">
      {inView && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={sorted}
            margin={{ left: 80, right: 60, top: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={fairmontTheme.gridStroke} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: fairmontTheme.axisTickColor, fontSize: 10 }}
              axisLine={{ stroke: fairmontTheme.axisStroke }}
              tickLine={false}
              tickFormatter={v => `$${v.toLocaleString()}`}
              domain={['dataMin - 100', 'dataMax + 100']}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: fairmontTheme.axisTickColor, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={78}
              tickFormatter={shortenName}
            />
            <Tooltip
              content={<FairmontTooltip formatter={(v) => `$${v.toLocaleString()}/mo`} />}
            />
            <Bar
              dataKey="rent"
              name="Avg Rent"
              radius={[0, 4, 4, 0]}
              isAnimationActive={inView}
              animationDuration={700}
            >
              <LabelList
                dataKey="rent"
                position="right"
                formatter={(v: unknown) => `$${(v as number).toLocaleString()}`}
                style={{ fontSize: 10, fontFamily: 'var(--font-mono, monospace)', fill: fairmontTheme.textMuted }}
              />
              {sorted.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.is_subject ? fairmontTheme.gold : fairmontTheme.blue}
                  fillOpacity={entry.is_subject ? 1 : 0.55}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function RentByBedroomChart({ data }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('one_br');
  const [inView, setInView] = useState(false);

  const activeData = data[activeTab];

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
          Rent Comparables by Bedroom
        </h3>
        <div className="flex items-center gap-3 text-xs" style={{ color: fairmontTheme.textMuted }}>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: fairmontTheme.gold }} />
            Fairmont
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: fairmontTheme.blue, opacity: 0.55 }} />
            Comp
          </span>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1.5 mb-5">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
            style={{
              background: activeTab === tab.key ? fairmontTheme.gold : fairmontTheme.surfaceElevated,
              color: activeTab === tab.key ? '#0A0A0F' : fairmontTheme.textSecondary,
              border: `1px solid ${activeTab === tab.key ? fairmontTheme.gold : fairmontTheme.border}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChartBar data={activeData} inView={inView} />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
