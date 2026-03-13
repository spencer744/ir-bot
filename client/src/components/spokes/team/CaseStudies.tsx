import { motion } from 'framer-motion';

interface CaseStudy {
  project_name: string;
  strategy: string;
  market: string;
  units: number;
  year_built: number;
  purchase_price: number;
  cash_on_cash: number;
  irr: string | null;
  hold_period: string;
  narrative: string;
  image_url: string | null;
  stats: Record<string, any>;
}

interface CaseStudiesProps {
  studies: CaseStudy[];
}

function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    return `$${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }
  return `$${price.toLocaleString()}`;
}

function getStrategyColor(strategy: string): string {
  const normalized = strategy.toLowerCase().replace(/[- ]/g, '');
  if (normalized === 'valueadd') return 'bg-gc-accent/15 text-gc-accent';
  if (normalized === 'coreplus' || normalized === 'core plus' || normalized === 'core-plus')
    return 'bg-gc-positive/15 text-gc-positive';
  return 'bg-gc-text-muted/15 text-gc-text-secondary';
}

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function CaseStudies({ studies }: CaseStudiesProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gc-text mb-6">Case Studies</h2>
      <div className="space-y-8">
        {studies.map((study) => {
          const baseStats: { label: string; value: string }[] = [
            { label: 'Units', value: study.units.toLocaleString() },
            { label: 'Year Built', value: study.year_built.toString() },
            { label: 'Purchase Price', value: formatPrice(study.purchase_price) },
            { label: 'Cash-on-Cash', value: `${study.cash_on_cash}%` },
          ];

          if (study.irr !== null) {
            baseStats.push({ label: 'IRR', value: study.irr });
          }

          baseStats.push({ label: 'Hold Period', value: study.hold_period });

          // Show additional stats for projects that have them (e.g. Club Meridian)
          if (study.stats?.noi_increase) {
            baseStats.push({ label: 'NOI Increase', value: study.stats.noi_increase });
          }
          if (study.stats?.price_per_unit) {
            baseStats.push({ label: 'Price / Unit', value: study.stats.price_per_unit });
          }

          return (
            <motion.div
              key={study.project_name}
              variants={cardVariant}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="bg-gc-surface rounded-xl p-5 sm:p-8"
            >
              {/* Header: Name + Strategy Badge */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <h3 className="text-2xl font-bold text-gc-text">{study.project_name}</h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStrategyColor(study.strategy)}`}
                >
                  {study.strategy}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {baseStats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xs text-[#8B8FA3] uppercase tracking-wider mb-1">
                      {stat.label}
                    </p>
                    <p className="font-mono-numbers font-semibold text-gc-text">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Narrative */}
              <p className="text-gc-text-secondary text-sm leading-relaxed mt-6">
                {study.narrative}
              </p>

              {/* Image or Placeholder */}
              {study.image_url ? (
                <img
                  src={study.image_url}
                  alt={study.project_name}
                  className="mt-6 rounded-lg w-full h-48 object-cover"
                />
              ) : (
                <div className="mt-6 rounded-lg bg-gc-surface-elevated h-48 flex items-center justify-center">
                  <span className="text-gc-text-muted text-sm">{study.project_name}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
