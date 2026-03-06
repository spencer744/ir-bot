import { motion } from 'framer-motion';
import { Landmark, Home, Hammer, BarChart3, type LucideIcon } from 'lucide-react';

interface Pillar {
  entity: string;
  division: string;
  icon: string;
  functions: string[];
}

interface VerticalIntegrationProps {
  narrative: string;
  pillars: Pillar[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  Landmark,
  Home,
  Hammer,
  BarChart3,
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function VerticalIntegration({ narrative, pillars }: VerticalIntegrationProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-4">Vertically Integrated Platform</h2>

      <p className="text-gc-text-secondary text-sm leading-relaxed mb-8">
        {narrative}
      </p>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {pillars.map((pillar) => {
          const Icon = ICON_MAP[pillar.icon] || Landmark;
          return (
            <motion.div
              key={pillar.entity}
              variants={item}
              className="bg-gc-surface border border-gc-border rounded-xl p-6"
            >
              {/* Icon */}
              <Icon className="w-8 h-8 text-gc-accent mb-4" />

              {/* Entity name */}
              <h3 className="text-lg font-bold text-gc-accent mb-1">{pillar.entity}</h3>

              {/* Division label */}
              <p className="text-gc-text-secondary text-sm uppercase tracking-wider mb-4">
                {pillar.division}
              </p>

              {/* Functions list */}
              <ul className="space-y-2">
                {pillar.functions.map((fn) => (
                  <li key={fn} className="flex items-center gap-2 text-sm text-gc-text">
                    <span className="w-1.5 h-1.5 rounded-full bg-gc-text-muted shrink-0" />
                    {fn}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
