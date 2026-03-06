import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface ExteriorItem {
  item: string;
  detail: string;
  budget: number;
}

interface ExteriorImprovementsProps {
  scope: ExteriorItem[];
  total: number;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function ExteriorImprovements({ scope, total }: ExteriorImprovementsProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-2">Exterior & Community Improvements</h2>
      <p className="text-gc-text-muted text-sm mb-6">Property-wide upgrades to curb appeal, amenities, and common areas.</p>

      <div className="bg-gc-surface border border-gc-border rounded-xl overflow-hidden">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="divide-y divide-gc-border/50"
        >
          {scope.map(s => (
            <motion.div
              key={s.item}
              variants={item}
              className="flex items-start gap-3 px-5 py-4"
            >
              <CheckCircle2 className="w-4 h-4 text-gc-positive shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gc-text">{s.item}</p>
                <p className="text-xs text-gc-text-secondary mt-0.5">{s.detail}</p>
              </div>
              <span className="font-mono-numbers text-sm text-gc-text-secondary shrink-0">
                ${s.budget.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Total */}
        <div className="flex justify-between items-center px-5 py-4 bg-gc-bg border-t border-gc-border">
          <span className="text-sm font-bold text-gc-text">Total Exterior / Common Budget</span>
          <span className="font-mono-numbers text-base font-bold text-gc-text">${total.toLocaleString()}</span>
        </div>
      </div>
    </motion.section>
  );
}
