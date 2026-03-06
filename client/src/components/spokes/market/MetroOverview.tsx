import { motion } from 'framer-motion';

interface MetroOverviewProps {
  narrative: string;
  snapshot: Record<string, string>;
}

const SNAPSHOT_LABELS: Record<string, string> = {
  msa_population: 'MSA Population',
  population_growth_5yr: 'Population Growth (5yr)',
  median_household_income: 'Median Household Income',
  cost_of_living_index: 'Cost of Living Index',
  major_airport: 'Major Airport',
  fortune_500_hqs: 'Fortune 500 HQs',
};

export default function MetroOverview({ narrative, snapshot }: MetroOverviewProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-5">Metro Overview</h2>
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Narrative */}
        <div className="lg:col-span-3 bg-gc-surface border border-gc-border rounded-2xl p-6 sm:p-8">
          <div className="text-gc-text-secondary text-sm leading-relaxed space-y-4">
            {narrative.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {/* Snapshot card */}
        <div className="lg:col-span-2 bg-gc-surface border border-gc-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gc-text mb-4">Metro Snapshot</h3>
          <div className="space-y-3">
            {Object.entries(snapshot).map(([key, value]) => (
              <div key={key} className="flex justify-between items-start gap-2">
                <span className="text-xs text-gc-text-muted">{SNAPSHOT_LABELS[key] || key}</span>
                <span className="text-sm font-semibold text-gc-text text-right font-mono-numbers">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
