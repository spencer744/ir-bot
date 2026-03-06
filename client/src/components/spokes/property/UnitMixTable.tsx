import { motion } from 'framer-motion';

interface UnitMixRow {
  type: string;
  count: number;
  avg_sf: number;
  current_rent: number;
  pro_forma_rent: number;
}

interface UnitMixTableProps {
  unitMix: UnitMixRow[];
  totalUnits: number;
}

export default function UnitMixTable({ unitMix, totalUnits }: UnitMixTableProps) {
  if (!unitMix || unitMix.length === 0) return null;

  // Weighted averages
  const totalCount = unitMix.reduce((s, u) => s + u.count, 0);
  const avgSf = Math.round(unitMix.reduce((s, u) => s + u.avg_sf * u.count, 0) / totalCount);
  const avgCurrentRent = Math.round(unitMix.reduce((s, u) => s + u.current_rent * u.count, 0) / totalCount);
  const avgProFormaRent = Math.round(unitMix.reduce((s, u) => s + u.pro_forma_rent * u.count, 0) / totalCount);
  const avgPremium = avgProFormaRent - avgCurrentRent;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-5">Unit Mix</h2>
      <div className="bg-gc-surface border border-gc-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gc-border">
                <th className="text-left px-4 sm:px-6 py-3 text-gc-text-muted text-xs uppercase tracking-wider font-medium">Type</th>
                <th className="text-right px-4 sm:px-6 py-3 text-gc-text-muted text-xs uppercase tracking-wider font-medium">Units</th>
                <th className="text-right px-4 sm:px-6 py-3 text-gc-text-muted text-xs uppercase tracking-wider font-medium hidden sm:table-cell">Avg SF</th>
                <th className="text-right px-4 sm:px-6 py-3 text-gc-text-muted text-xs uppercase tracking-wider font-medium">Current</th>
                <th className="text-right px-4 sm:px-6 py-3 text-gc-text-muted text-xs uppercase tracking-wider font-medium">Pro Forma</th>
                <th className="text-right px-4 sm:px-6 py-3 text-gc-text-muted text-xs uppercase tracking-wider font-medium hidden md:table-cell">Premium</th>
              </tr>
            </thead>
            <tbody className="text-gc-text">
              {unitMix.map((unit, i) => {
                const premium = unit.pro_forma_rent - unit.current_rent;
                return (
                  <tr
                    key={unit.type}
                    className={i < unitMix.length - 1 ? 'border-b border-gc-border/50' : ''}
                  >
                    <td className="px-4 sm:px-6 py-3 font-medium">{unit.type}</td>
                    <td className="px-4 sm:px-6 py-3 text-right font-mono-numbers">{unit.count}</td>
                    <td className="px-4 sm:px-6 py-3 text-right font-mono-numbers hidden sm:table-cell">{unit.avg_sf.toLocaleString()}</td>
                    <td className="px-4 sm:px-6 py-3 text-right font-mono-numbers">${unit.current_rent.toLocaleString()}</td>
                    <td className="px-4 sm:px-6 py-3 text-right font-mono-numbers text-gc-positive">${unit.pro_forma_rent.toLocaleString()}</td>
                    <td className="px-4 sm:px-6 py-3 text-right font-mono-numbers text-gc-positive hidden md:table-cell">+${premium}</td>
                  </tr>
                );
              })}
              {/* Weighted average row */}
              <tr className="border-t-2 border-gc-border bg-gc-bg/50">
                <td className="px-4 sm:px-6 py-3 font-semibold text-gc-text-secondary">Weighted Avg</td>
                <td className="px-4 sm:px-6 py-3 text-right font-mono-numbers font-semibold">{totalCount}</td>
                <td className="px-4 sm:px-6 py-3 text-right font-mono-numbers font-semibold hidden sm:table-cell">{avgSf.toLocaleString()}</td>
                <td className="px-4 sm:px-6 py-3 text-right font-mono-numbers font-semibold">${avgCurrentRent.toLocaleString()}</td>
                <td className="px-4 sm:px-6 py-3 text-right font-mono-numbers font-semibold text-gc-positive">${avgProFormaRent.toLocaleString()}</td>
                <td className="px-4 sm:px-6 py-3 text-right font-mono-numbers font-semibold text-gc-positive hidden md:table-cell">+${avgPremium}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-gc-text-muted text-xs mt-2">
        Total: {totalUnits} units &middot; Average rent premium: ${avgPremium}/unit/month &middot; Annual revenue uplift: ~${((avgPremium * totalCount * 12) / 1000).toFixed(0)}K
      </p>
    </motion.section>
  );
}
