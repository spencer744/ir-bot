import { motion } from 'framer-motion';

interface KVPair {
  label: string;
  value: string;
}

interface AcquisitionCriteriaProps {
  criteria: {
    asset_characteristics: KVPair[];
    typical_financing: KVPair[];
    return_targets: KVPair[];
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

interface CriteriaCardProps {
  title: string;
  pairs: KVPair[];
  highlightValues?: boolean;
}

function CriteriaCard({ title, pairs, highlightValues = false }: CriteriaCardProps) {
  return (
    <motion.div variants={item} className="bg-gc-surface rounded-xl p-6">
      {/* Accent bar */}
      <div className="h-0.5 w-8 bg-gc-accent rounded-full mb-4" />
      <h3 className="text-lg font-semibold text-gc-text mb-4">{title}</h3>

      <div className="space-y-3">
        {pairs.map((kv) => {
          const mono = isNumericValue(kv.value);
          return (
            <div key={kv.label}>
              <p className="text-xs text-[#8B8FA3] uppercase">{kv.label}</p>
              <p
                className={`font-semibold text-gc-text ${mono ? 'font-mono-numbers' : ''} ${highlightValues ? 'text-gc-positive' : ''}`}
              >
                {kv.value}
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function AcquisitionCriteria({ criteria }: AcquisitionCriteriaProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-6">Acquisition Criteria</h2>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <CriteriaCard title="Asset Characteristics" pairs={criteria.asset_characteristics} />
        <CriteriaCard title="Typical Financing" pairs={criteria.typical_financing} />
        <CriteriaCard title="Return Targets" pairs={criteria.return_targets} highlightValues />
      </motion.div>
    </motion.section>
  );
}
