import { motion } from 'framer-motion';

interface Strategy {
  strategy: string;
  risk: string;
  irr: string;
  coc: string;
  description: string;
}

interface InvestmentStrategiesProps {
  strategies: Strategy[];
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function getRiskBadgeClasses(risk: string): string {
  const lower = risk.toLowerCase();
  if (lower === 'low') {
    return 'bg-emerald-500/20 text-emerald-400';
  }
  if (lower === 'low – moderate' || lower === 'low - moderate') {
    return 'bg-blue-500/20 text-blue-400';
  }
  if (lower === 'moderate – high' || lower === 'moderate - high') {
    return 'bg-amber-500/20 text-amber-400';
  }
  // Fallback for any other risk level
  return 'bg-gray-500/20 text-gray-400';
}

export default function InvestmentStrategies({ strategies }: InvestmentStrategiesProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-6">Investment Strategies</h2>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid sm:grid-cols-2 gap-4"
      >
        {strategies.map((s) => (
          <motion.div
            key={s.strategy}
            variants={item}
            className="bg-gc-surface rounded-xl p-6"
          >
            {/* Strategy name */}
            <h3 className="text-xl font-bold text-gc-text">{s.strategy}</h3>

            {/* Risk pill */}
            <span
              className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-medium ${getRiskBadgeClasses(s.risk)}`}
            >
              {s.risk}
            </span>

            {/* Return targets */}
            <div className="flex items-center gap-6 mt-4">
              <div>
                <span className="text-xs text-gc-text-muted uppercase tracking-wider">IRR</span>
                <p className="text-lg font-semibold text-gc-positive font-mono-numbers">{s.irr}</p>
              </div>
              <div>
                <span className="text-xs text-gc-text-muted uppercase tracking-wider">CoC</span>
                <p className="text-lg font-semibold text-gc-positive font-mono-numbers">{s.coc}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gc-text-secondary mt-3 leading-relaxed">{s.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
