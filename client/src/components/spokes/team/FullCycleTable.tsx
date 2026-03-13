import { motion } from 'framer-motion';

/* -------------------------------------------------- */
/*  Types                                              */
/* -------------------------------------------------- */

interface Deal {
  project_name: string;
  market: string;
  entry_date: string;
  exit_date: string;
  net_irr: number;
  net_equity_multiple: number;
}

interface FullCycleTableProps {
  deals: Deal[];
}

/* -------------------------------------------------- */
/*  Helpers                                            */
/* -------------------------------------------------- */

/** Format ISO date string to "M/YYYY" */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`;
}

/* -------------------------------------------------- */
/*  Component                                          */
/* -------------------------------------------------- */

export default function FullCycleTable({ deals }: FullCycleTableProps) {
  if (!deals || deals.length === 0) return null;

  const maxIrr = Math.max(...deals.map((d) => d.net_irr));

  const avgIrr =
    deals.reduce((sum, d) => sum + d.net_irr, 0) / deals.length;
  const avgEm =
    deals.reduce((sum, d) => sum + d.net_equity_multiple, 0) / deals.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      {/* Section header */}
      <h2 className="text-2xl md:text-3xl font-bold text-gc-text mb-2">
        Full-Cycle Deals
      </h2>
      <p className="text-gc-text-secondary text-sm md:text-base mb-6">
        {deals.length} realized investments across Indiana markets
      </p>

      {/* Table container */}
      <div className="bg-gc-surface border border-gc-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap min-w-[640px]">
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
                  Entry Date
                </th>
                <th className="text-left px-4 sm:px-6 py-3 text-[#8B8FA3] text-xs uppercase tracking-wider font-medium">
                  Exit Date
                </th>
                <th className="text-right px-4 sm:px-6 py-3 text-[#8B8FA3] text-xs uppercase tracking-wider font-medium">
                  Net IRR
                </th>
                <th className="text-right px-4 sm:px-6 py-3 text-[#8B8FA3] text-xs uppercase tracking-wider font-medium">
                  Net Equity Multiple
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {deals.map((deal, i) => {
                const irrBarWidth =
                  maxIrr > 0 ? (deal.net_irr / maxIrr) * 100 : 0;
                const rowBg =
                  i % 2 === 0 ? 'bg-gc-surface' : 'bg-gc-bg';

                return (
                  <tr key={deal.project_name} className={rowBg}>
                    <td className="px-4 sm:px-6 py-3 font-medium text-gc-text">
                      {deal.project_name}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-gc-text-secondary">
                      {deal.market}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-gc-text-secondary font-mono-numbers">
                      {formatDate(deal.entry_date)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-gc-text-secondary font-mono-numbers">
                      {formatDate(deal.exit_date)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 hidden sm:block">
                          <div className="h-1.5 rounded-full bg-gc-border overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gc-positive"
                              style={{ width: `${irrBarWidth}%` }}
                            />
                          </div>
                        </div>
                        <span className="font-mono-numbers font-semibold text-gc-positive">
                          {Math.round(deal.net_irr)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right font-mono-numbers text-gc-text">
                      {deal.net_equity_multiple.toFixed(2)}x
                    </td>
                  </tr>
                );
              })}

              {/* Average row */}
              <tr className="bg-gc-surface-elevated border-t border-gc-border">
                <td className="px-4 sm:px-6 py-3 font-bold text-gc-text">
                  Average
                </td>
                <td className="px-4 sm:px-6 py-3" />
                <td className="px-4 sm:px-6 py-3" />
                <td className="px-4 sm:px-6 py-3" />
                <td className="px-4 sm:px-6 py-3 text-right font-mono-numbers font-bold text-gc-positive">
                  {avgIrr.toFixed(1)}%
                </td>
                <td className="px-4 sm:px-6 py-3 text-right font-mono-numbers font-bold text-gc-text">
                  {avgEm.toFixed(2)}x
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </motion.section>
  );
}
