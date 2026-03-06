import { motion } from 'framer-motion';
import {
  Handshake,
  FileText,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

/* -------------------------------------------------- */
/*  Types                                              */
/* -------------------------------------------------- */

interface DifferentiatorItem {
  title: string;
  icon: string;
  detail: string;
}

interface DifferentiatorsProps {
  items: DifferentiatorItem[];
}

/* -------------------------------------------------- */
/*  Icon map                                           */
/* -------------------------------------------------- */

const iconMap: Record<string, LucideIcon> = {
  Handshake,
  FileText,
  BarChart3,
};

/* -------------------------------------------------- */
/*  Framer variants                                    */
/* -------------------------------------------------- */

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* -------------------------------------------------- */
/*  Main component                                     */
/* -------------------------------------------------- */

export default function Differentiators({ items }: DifferentiatorsProps) {
  return (
    <section>
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gc-text">
          Our Differentiators
        </h2>
      </motion.div>

      {/* Cards grid */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {items.map((diff) => {
          const Icon = iconMap[diff.icon] ?? Handshake;
          return (
            <motion.div
              key={diff.title}
              variants={item}
              className="bg-gc-surface-elevated rounded-xl p-8"
            >
              <Icon className="w-10 h-10 text-gc-accent" />
              <h3 className="font-bold text-xl text-gc-text mt-4">
                {diff.title}
              </h3>
              <p className="text-sm text-gc-text-secondary mt-2 leading-relaxed">
                {diff.detail}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
