import { motion } from 'framer-motion';

interface KVPair {
  label: string;
  value: string;
}

interface DealStructureProps {
  structure: {
    investment_terms: KVPair[];
    one_time_fees: KVPair[];
    recurring_fees: KVPair[];
  };
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/** Returns true for values that look like numbers, percentages, or dollar amounts. */
function isNumericValue(value: string): boolean {
  return /[\d$%]/.test(value);
}

/** Checks if a value should be highlighted in green (co-invest highlight). */
function isCoInvestValue(label: string, value: string): boolean {
  const lower = label.toLowerCase();
  return (lower.includes('co-invest') || lower.includes('coinvest')) && value.includes('14');
}

function KVRow({ label, value }: KVPair) {
  const highlighted = isCoInvestValue(label, value);
  const mono = isNumericValue(value);

  return (
    <div className="flex items-baseline justify-between py-3 border-b border-gc-border last:border-b-0">
      <span className="text-sm text-[#8B8FA3]">{label}</span>
      <span
        className={`text-sm text-gc-text ${mono ? 'font-mono-numbers' : ''} ${highlighted ? 'text-gc-positive font-bold' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function DealStructure({ structure }: DealStructureProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-6">Deal Structure</h2>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid md:grid-cols-2 gap-4 mb-4"
      >
        {/* LEFT — Investment Structure */}
        <motion.div
          variants={item}
          className="bg-gc-surface rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-gc-text mb-4">Investment Structure</h3>
          <div>
            {structure.investment_terms.map((kv) => (
              <KVRow key={kv.label} label={kv.label} value={kv.value} />
            ))}
          </div>
        </motion.div>

        {/* RIGHT — Fee Structure */}
        <motion.div
          variants={item}
          className="bg-gc-surface rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-gc-text mb-4">Fee Structure</h3>

          {/* One-Time Fees */}
          <p className="text-xs text-[#8B8FA3] uppercase tracking-wider mb-2">One-Time Fees</p>
          <div className="mb-5">
            {structure.one_time_fees.map((kv) => (
              <KVRow key={kv.label} label={kv.label} value={kv.value} />
            ))}
          </div>

          {/* Recurring Fees */}
          <p className="text-xs text-[#8B8FA3] uppercase tracking-wider mb-2">Recurring Fees</p>
          <div>
            {structure.recurring_fees.map((kv) => (
              <KVRow key={kv.label} label={kv.label} value={kv.value} />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Callout */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="border-l-4 border-gc-accent bg-gc-surface rounded-lg p-6"
      >
        <p className="text-gc-text-secondary text-sm leading-relaxed">
          <span className="text-2xl font-bold text-gc-positive font-mono-numbers mr-1">14%</span>
          Average Sponsor Co-Invest &mdash; 3x the market average. Gray Capital wins when investors
          win. High alignment of interest means our incentives are directly tied to yours.
        </p>
      </motion.div>
    </motion.section>
  );
}
