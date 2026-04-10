import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Shield, Zap, Star } from 'lucide-react';
import { fairmontTheme } from './chartConfig';

interface ScenarioData {
  label: string;
  description?: string;
  assumptions: {
    annual_rent_growth: number;
    exit_cap: number;
    avg_occupancy: number;
    annual_expense_growth: number;
  };
  returns: {
    lp_irr: number;
    equity_multiple: number;
    avg_coc: number;
    distribution_per_100k: number;
  };
}

interface Scenarios {
  downside?: ScenarioData;
  base?: ScenarioData;
  upside?: ScenarioData;
  strategic?: ScenarioData;
}

interface Props {
  scenarios: Scenarios;
}

const SCENARIO_CONFIG = {
  downside: {
    icon: Shield,
    color: fairmontTheme.blue,
    colorMuted: fairmontTheme.blueMuted,
    badge: 'Conservative',
  },
  base: {
    icon: TrendingUp,
    color: fairmontTheme.gold,
    colorMuted: fairmontTheme.goldMuted,
    badge: 'Base Case',
  },
  upside: {
    icon: Zap,
    color: fairmontTheme.green,
    colorMuted: 'rgba(52,211,153,0.12)',
    badge: 'Upside',
  },
  strategic: {
    icon: Star,
    color: fairmontTheme.purple,
    colorMuted: 'rgba(167,139,250,0.12)',
    badge: 'Strategic',
  },
} as const;

type ScenarioKey = keyof typeof SCENARIO_CONFIG;

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs" style={{ color: fairmontTheme.textMuted }}>{label}</div>
      <div className="text-lg font-semibold font-mono" style={{ color: fairmontTheme.textPrimary }}>{value}</div>
    </div>
  );
}

function AssumptionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5" style={{ borderBottom: `1px solid ${fairmontTheme.border}` }}>
      <span className="text-xs" style={{ color: fairmontTheme.textMuted }}>{label}</span>
      <span className="text-xs font-mono font-semibold" style={{ color: fairmontTheme.textSecondary }}>{value}</span>
    </div>
  );
}

export default function SensitivityScenarioViewer({ scenarios }: Props) {
  const [active, setActive] = useState<ScenarioKey>('base');

  const keys = Object.keys(scenarios).filter(k => scenarios[k as ScenarioKey]) as ScenarioKey[];
  const scenario = scenarios[active];

  if (!scenario) return null;

  const cfg = SCENARIO_CONFIG[active];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-sm font-semibold mb-4" style={{ color: fairmontTheme.textPrimary }}>
        Scenario Analysis
      </h3>

      {/* Tab selector */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {keys.map(k => {
          const c = SCENARIO_CONFIG[k];
          const isActive = k === active;
          return (
            <button
              key={k}
              onClick={() => setActive(k)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5"
              style={{
                background: isActive ? c.colorMuted : fairmontTheme.surfaceElevated,
                color: isActive ? c.color : fairmontTheme.textSecondary,
                border: `1px solid ${isActive ? c.color + '50' : fairmontTheme.border}`,
              }}
            >
              <c.icon size={11} />
              {c.badge}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* Returns grid */}
          <div
            className="rounded-xl p-5 mb-4"
            style={{ background: cfg.colorMuted, border: `1px solid ${cfg.color}25` }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Icon size={16} style={{ color: cfg.color }} />
              <span className="text-sm font-semibold" style={{ color: cfg.color }}>{scenario.label}</span>
              {scenario.description && (
                <span className="text-xs ml-1" style={{ color: fairmontTheme.textMuted }}>{scenario.description}</span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCell
                label="LP IRR"
                value={`${(scenario.returns.lp_irr * 100).toFixed(1)}%`}
              />
              <MetricCell
                label="Equity Multiple"
                value={`${scenario.returns.equity_multiple.toFixed(1)}x`}
              />
              <MetricCell
                label="Avg CoC"
                value={`${(scenario.returns.avg_coc * 100).toFixed(1)}%`}
              />
              <MetricCell
                label="Per $100K"
                value={`$${(scenario.returns.distribution_per_100k / 1000).toFixed(0)}K`}
              />
            </div>
          </div>

          {/* Key assumptions */}
          <div
            className="rounded-xl p-4"
            style={{ background: fairmontTheme.surfaceElevated, border: `1px solid ${fairmontTheme.border}` }}
          >
            <h4 className="text-xs font-semibold mb-2" style={{ color: fairmontTheme.textSecondary }}>Key Assumptions</h4>
            <AssumptionRow label="Annual Rent Growth" value={`${(scenario.assumptions.annual_rent_growth * 100).toFixed(1)}%`} />
            <AssumptionRow label="Exit Cap Rate" value={`${(scenario.assumptions.exit_cap * 100).toFixed(2)}%`} />
            <AssumptionRow label="Avg Occupancy" value={`${(scenario.assumptions.avg_occupancy * 100).toFixed(1)}%`} />
            <AssumptionRow label="Expense Growth" value={`${(scenario.assumptions.annual_expense_growth * 100).toFixed(1)}%`} />
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
