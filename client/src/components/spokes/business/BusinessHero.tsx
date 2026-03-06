import { motion } from 'framer-motion';

interface StrategyMetric {
  label: string;
  value: string;
}

interface BusinessHeroProps {
  thesis: string;
  metrics: StrategyMetric[];
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function BusinessHero({ thesis, metrics }: BusinessHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      {/* Thesis pull-quote */}
      <div className="border-l-4 border-l-gc-accent bg-gc-surface rounded-r-2xl p-6 sm:p-8 mb-8">
        <p className="text-xl md:text-2xl font-medium text-gc-text leading-relaxed">
          &ldquo;{thesis}&rdquo;
        </p>
      </div>

      {/* Strategy metrics row */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {metrics.map(m => (
          <motion.div
            key={m.label}
            variants={item}
            className="bg-gc-surface border border-gc-border rounded-xl p-4 text-center"
          >
            <p className="font-mono-numbers text-xl sm:text-2xl font-bold text-gc-accent mb-1">
              {m.value}
            </p>
            <p className="text-xs text-gc-text-muted uppercase tracking-wider">{m.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
