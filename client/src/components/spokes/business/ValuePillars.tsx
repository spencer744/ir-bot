import { motion } from 'framer-motion';
import { Hammer, Building, Settings, type LucideIcon } from 'lucide-react';

interface Pillar {
  icon: string;
  title: string;
  description: string;
}

interface ValuePillarsProps {
  pillars: Pillar[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  Hammer,
  Building,
  Settings,
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ValuePillars({ pillars }: ValuePillarsProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-2">Value Creation Strategy</h2>
      <p className="text-gc-text-muted text-sm mb-6">Three levers driving returns at Parkview Commons.</p>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid sm:grid-cols-3 gap-4"
      >
        {pillars.map(p => {
          const Icon = ICON_MAP[p.icon] || Hammer;
          return (
            <motion.div
              key={p.title}
              variants={item}
              className="bg-gc-surface border border-gc-border rounded-xl p-6"
            >
              <div className="w-10 h-10 bg-gc-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-gc-accent" />
              </div>
              <h3 className="text-lg font-bold text-gc-text mb-2">{p.title}</h3>
              <p className="text-sm text-gc-text-secondary leading-relaxed">{p.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
