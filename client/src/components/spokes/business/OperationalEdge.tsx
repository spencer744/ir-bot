import { motion } from 'framer-motion';
import { TrendingUp, Scissors, Heart, type LucideIcon } from 'lucide-react';

interface OperationalPillar {
  icon: string;
  title: string;
  points: string[];
  stat_label: string;
  stat_value: string;
}

interface OperationalEdgeProps {
  pillars: OperationalPillar[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp,
  Scissors,
  Heart,
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function OperationalEdge({ pillars }: OperationalEdgeProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-2">The Gray Residential Edge</h2>
      <p className="text-gc-text-muted text-sm mb-6">Why vertical integration is our competitive advantage.</p>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid sm:grid-cols-3 gap-4"
      >
        {pillars.map(p => {
          const Icon = ICON_MAP[p.icon] || TrendingUp;
          return (
            <motion.div
              key={p.title}
              variants={item}
              className="bg-gc-surface border border-gc-border rounded-xl p-6 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gc-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5 text-gc-accent" />
                </div>
                <h3 className="text-base font-bold text-gc-text">{p.title}</h3>
              </div>

              <div className="space-y-2.5 flex-1">
                {p.points.map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-gc-text-muted shrink-0 mt-2" />
                    <p className="text-xs text-gc-text-secondary leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>

              {/* Stat highlight */}
              <div className="mt-5 pt-4 border-t border-gc-border">
                <p className="text-[10px] text-gc-text-muted uppercase tracking-wider mb-1">{p.stat_label}</p>
                <p className="font-mono-numbers text-sm font-bold text-gc-positive">{p.stat_value}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
