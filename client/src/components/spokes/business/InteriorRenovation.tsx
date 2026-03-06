import { motion } from 'framer-motion';
import {
  ChefHat, LayoutGrid, Refrigerator, Layers, Lightbulb, Bath, Paintbrush, Wrench,
  type LucideIcon,
} from 'lucide-react';

interface ScopeItem {
  item: string;
  spec: string;
  icon: string;
}

interface CostLine {
  label: string;
  value: string;
  highlight?: boolean;
}

interface InteriorRenovationProps {
  scope: ScopeItem[];
  costSummary: CostLine[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  ChefHat, LayoutGrid, Refrigerator, Layers, Lightbulb, Bath, Paintbrush, Wrench,
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function InteriorRenovation({ scope, costSummary }: InteriorRenovationProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-2">Interior Renovation Program</h2>
      <p className="text-gc-text-muted text-sm mb-6">Unit-by-unit upgrades across all 312 apartments.</p>

      {/* Scope Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid md:grid-cols-2 gap-3 mb-8"
      >
        {scope.map(s => {
          const Icon = ICON_MAP[s.icon] || Wrench;
          return (
            <motion.div
              key={s.item}
              variants={item}
              className="flex items-start gap-3 p-4 rounded-xl border-l-2 border-l-gc-accent/30 bg-gc-bg"
            >
              <Icon className="w-5 h-5 text-gc-accent/60 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-gc-text">{s.item}</p>
                <p className="text-xs text-gc-text-secondary mt-0.5">{s.spec}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Cost Summary */}
      <div className="bg-gc-surface border border-gc-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gc-border">
          <h3 className="text-sm font-semibold text-gc-text">Cost Summary</h3>
        </div>
        <div className="divide-y divide-gc-border/50">
          {costSummary.map(line => (
            <div key={line.label} className="flex justify-between items-center px-5 py-3">
              <span className="text-sm text-gc-text-secondary">{line.label}</span>
              <span className={`font-mono-numbers text-sm font-semibold ${line.highlight ? 'text-gc-positive' : 'text-gc-text'}`}>
                {line.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
