import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDeal } from '../../../context/DealContext';

interface AssumptionRow {
  assumption: string;
  conservative: string;
  base: string;
  upside: string;
  strategic: string;
}

interface KeyAssumptionsProps {
  rows: AssumptionRow[];
}

const SCENARIO_COLORS: Record<string, string> = {
  conservative: '#FBBF24',
  base: '#3B82F6',
  upside: '#34D399',
  strategic: '#A78BFA',
};

export default function KeyAssumptions({ rows }: KeyAssumptionsProps) {
  const { deal } = useDeal();
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-2">Key Assumptions</h2>
      <p className="text-gc-text-muted text-sm mb-6">The assumptions behind each scenario driving the business plan.</p>

      <div className="bg-gc-surface border border-gc-border rounded-2xl overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-gc-border">
                <th className="text-left px-4 py-3 text-gc-text-muted text-xs uppercase tracking-wider font-medium">Assumption</th>
                {(['conservative', 'base', 'upside', 'strategic'] as const).map(scenario => (
                  <th key={scenario} className="text-center px-3 py-3 text-xs uppercase tracking-wider font-semibold" style={{ color: SCENARIO_COLORS[scenario] }}>
                    {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gc-text">
              {rows.map((row, i) => (
                <tr key={row.assumption} className={i < rows.length - 1 ? 'border-b border-gc-border/50' : ''}>
                  <td className="px-4 py-3 text-gc-text-secondary text-xs sm:text-sm">{row.assumption}</td>
                  <td className="px-3 py-3 text-center font-mono-numbers text-xs sm:text-sm">{row.conservative}</td>
                  <td className="px-3 py-3 text-center font-mono-numbers text-xs sm:text-sm font-semibold">{row.base}</td>
                  <td className="px-3 py-3 text-center font-mono-numbers text-xs sm:text-sm">{row.upside}</td>
                  <td className="px-3 py-3 text-center font-mono-numbers text-xs sm:text-sm">{row.strategic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA Card */}
      <div
        className="bg-gc-surface border-2 border-gc-accent/30 rounded-2xl p-6 sm:p-8 cursor-pointer hover:border-gc-accent transition-colors"
        onClick={() => navigate(`/deal/${deal?.slug}/financials`)}
      >
        <h3 className="text-lg font-bold text-gc-text mb-2">Explore These Scenarios Interactively</h3>
        <p className="text-sm text-gc-text-secondary mb-4">
          The Financial Explorer lets you adjust assumptions, see how returns change, and compare this deal to alternative investments.
        </p>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-gc-accent">
          Explore Financial Projections <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </motion.section>
  );
}
