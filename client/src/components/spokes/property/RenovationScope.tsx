import { motion } from 'framer-motion';
import { Hammer, PaintBucket, DollarSign, Clock, TrendingUp } from 'lucide-react';

interface RenovationData {
  interior_scope: string[];
  exterior_scope: string[];
  interior_cost_per_unit: number;
  total_interior_budget: number;
  exterior_budget: number;
  total_budget: number;
  timeline_months: number;
  units_per_month: number;
  comparable_premium_range: [number, number];
}

interface RenovationScopeProps {
  renovation: RenovationData;
}

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function RenovationScope({ renovation }: RenovationScopeProps) {
  const budgetItems = [
    { icon: DollarSign, label: 'Interior / Unit', value: formatCurrency(renovation.interior_cost_per_unit) },
    { icon: Hammer, label: 'Total Interior', value: formatCurrency(renovation.total_interior_budget) },
    { icon: PaintBucket, label: 'Exterior Budget', value: formatCurrency(renovation.exterior_budget) },
    { icon: DollarSign, label: 'Total Budget', value: formatCurrency(renovation.total_budget) },
    { icon: Clock, label: 'Timeline', value: `${renovation.timeline_months} months` },
    { icon: TrendingUp, label: 'Target Premium', value: `$${renovation.comparable_premium_range[0]}–$${renovation.comparable_premium_range[1]}/mo` },
  ];

  const timelineProgress = renovation.units_per_month;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-5">Renovation Scope</h2>

      {/* Budget summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {budgetItems.map(b => (
          <div key={b.label} className="bg-gc-surface border border-gc-border rounded-xl p-4">
            <b.icon className="w-4 h-4 text-gc-accent mb-2" />
            <p className="text-[10px] text-gc-text-muted uppercase tracking-wider mb-1">{b.label}</p>
            <p className="text-sm font-semibold text-gc-text">{b.value}</p>
          </div>
        ))}
      </div>

      {/* Timeline bar */}
      <div className="bg-gc-surface border border-gc-border rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gc-text">Renovation Timeline</p>
          <p className="text-xs text-gc-text-muted">{timelineProgress} units/month</p>
        </div>
        <div className="h-2 bg-gc-bg rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-gc-accent to-gc-positive rounded-full"
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gc-text-muted">
          <span>Month 1</span>
          <span>Month {renovation.timeline_months}</span>
        </div>
      </div>

      {/* Scope lists */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Interior scope */}
        <div className="bg-gc-surface border border-gc-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gc-text mb-4 flex items-center gap-2">
            <Hammer className="w-4 h-4 text-gc-accent" />
            Interior Scope
          </h3>
          <ul className="space-y-2">
            {renovation.interior_scope.map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-gc-text-secondary">
                <span className="text-gc-positive mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Exterior scope */}
        <div className="bg-gc-surface border border-gc-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gc-text mb-4 flex items-center gap-2">
            <PaintBucket className="w-4 h-4 text-gc-accent" />
            Exterior Scope
          </h3>
          <ul className="space-y-2">
            {renovation.exterior_scope.map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-gc-text-secondary">
                <span className="text-gc-positive mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.section>
  );
}
