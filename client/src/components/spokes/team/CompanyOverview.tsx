import { motion } from 'framer-motion';

interface CompanyOverviewProps {
  stats: { label: string; value: string }[];
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/** Returns true when a stat value contains numeric characters, $, or % */
function isNumericValue(value: string): boolean {
  return /[\d$%]/.test(value);
}

export default function CompanyOverview({ stats }: CompanyOverviewProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-2">Our Company</h2>
      <p className="text-gc-text-secondary text-sm leading-relaxed mb-6">
        A vertically integrated private equity real estate investment firm focused on multifamily
        opportunities
      </p>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={item}
            className="bg-gc-surface rounded-lg p-4"
          >
            <p className="text-xs text-[#8B8FA3] uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <p
              className={`font-semibold text-gc-text ${isNumericValue(stat.value) ? 'font-mono-numbers' : ''}`}
            >
              {stat.value}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
