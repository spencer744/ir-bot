import { motion } from 'framer-motion';

/* -------------------------------------------------- */
/*  Types                                              */
/* -------------------------------------------------- */

interface Project {
  project_name: string;
  market: string;
  acquired: string;
  cash_on_cash: number;
  strategy: string;
  is_fund_asset: boolean;
}

interface ActivePortfolioTableProps {
  projects: Project[];
}

/* -------------------------------------------------- */
/*  Helpers                                            */
/* -------------------------------------------------- */

/** Format ISO date string to "M/YYYY" */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`;
}

/** Strategy pill styles */
function strategyPill(strategy: string): string {
  switch (strategy) {
    case 'Value-Add':
      return 'bg-blue-500/20 text-blue-400';
    case 'Core Plus':
      return 'bg-emerald-500/20 text-emerald-400';
    default:
      return 'bg-gc-border text-gc-text-secondary';
  }
}

/* -------------------------------------------------- */
/*  Component                                          */
/* -------------------------------------------------- */

export default function ActivePortfolioTable({
  projects,
}: ActivePortfolioTableProps) {
  if (!projects || projects.length === 0) return null;

  const hasFundAssets = projects.some((p) => p.is_fund_asset);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      {/* Section header */}
      <h2 className="text-2xl md:text-3xl font-bold text-gc-text mb-2">
        Active Portfolio
      </h2>
      <p className="text-gc-text-secondary text-sm md:text-base mb-6">
        {projects.length} properties across Indiana, Ohio, Michigan, and
        Kentucky
      </p>

      {/* Table container */}
      <div className="bg-gc-surface border border-gc-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            {/* Header */}
            <thead>
              <tr className="bg-gc-surface-elevated">
                <th className="text-left px-4 sm:px-6 py-3 text-[#8B8FA3] text-xs uppercase tracking-wider font-medium">
                  Project Name
                </th>
                <th className="text-left px-4 sm:px-6 py-3 text-[#8B8FA3] text-xs uppercase tracking-wider font-medium">
                  Market
                </th>
                <th className="text-left px-4 sm:px-6 py-3 text-[#8B8FA3] text-xs uppercase tracking-wider font-medium">
                  Acquisition Date
                </th>
                <th className="text-right px-4 sm:px-6 py-3 text-[#8B8FA3] text-xs uppercase tracking-wider font-medium">
                  Cash-on-Cash
                </th>
                <th className="text-left px-4 sm:px-6 py-3 text-[#8B8FA3] text-xs uppercase tracking-wider font-medium">
                  Strategy
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {projects.map((project, i) => {
                const rowBg =
                  i % 2 === 0 ? 'bg-gc-surface' : 'bg-gc-bg';

                return (
                  <tr key={project.project_name} className={rowBg}>
                    <td className="px-4 sm:px-6 py-3 font-medium text-gc-text">
                      {project.project_name}
                      {project.is_fund_asset && (
                        <span className="text-gc-text-muted text-xs ml-1">
                          *
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-gc-text-secondary">
                      {project.market}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-gc-text-secondary font-mono-numbers">
                      {formatDate(project.acquired)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right font-mono-numbers text-gc-text">
                      {Math.round(project.cash_on_cash)}%
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${strategyPill(project.strategy)}`}
                      >
                        {project.strategy}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footnote */}
      {hasFundAssets && (
        <p className="text-xs text-gc-text-muted mt-2">
          * Gray Fund Asset
        </p>
      )}
    </motion.section>
  );
}
