import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface Comparable {
  name: string;
  distance: string;
  units: number;
  year_built: number;
  avg_rent: number;
  avg_sf: number;
  rent_per_sf: number;
  occupancy: number;
  renovated: boolean;
  highlight?: 'current' | 'proforma';
}

interface RentComparablesTableProps {
  data: Comparable[];
}

export default function RentComparablesTable({ data }: RentComparablesTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-sm font-semibold text-gc-text mb-4">Rent Comparables</h3>
      <div className="bg-gc-surface border border-gc-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-gc-border">
                <th className="text-left px-4 py-3 text-gc-text-muted text-xs uppercase tracking-wider font-medium">Property</th>
                <th className="text-right px-3 py-3 text-gc-text-muted text-xs uppercase tracking-wider font-medium hidden sm:table-cell">Dist.</th>
                <th className="text-right px-3 py-3 text-gc-text-muted text-xs uppercase tracking-wider font-medium hidden md:table-cell">Units</th>
                <th className="text-right px-3 py-3 text-gc-text-muted text-xs uppercase tracking-wider font-medium">Avg Rent</th>
                <th className="text-right px-3 py-3 text-gc-text-muted text-xs uppercase tracking-wider font-medium hidden sm:table-cell">$/SF</th>
                <th className="text-right px-3 py-3 text-gc-text-muted text-xs uppercase tracking-wider font-medium hidden md:table-cell">Occ.</th>
                <th className="text-center px-3 py-3 text-gc-text-muted text-xs uppercase tracking-wider font-medium">Reno</th>
              </tr>
            </thead>
            <tbody className="text-gc-text">
              {data.map((comp, i) => {
                const borderClass = comp.highlight === 'current'
                  ? 'border-l-4 border-l-amber-400'
                  : comp.highlight === 'proforma'
                    ? 'border-l-4 border-l-gc-positive'
                    : '';
                return (
                  <tr
                    key={comp.name}
                    className={`${borderClass} ${i < data.length - 1 ? 'border-b border-gc-border/50' : ''} ${comp.highlight ? 'bg-gc-bg/50' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-xs sm:text-sm">{comp.name}</td>
                    <td className="px-3 py-3 text-right font-mono-numbers text-gc-text-secondary hidden sm:table-cell">{comp.distance}</td>
                    <td className="px-3 py-3 text-right font-mono-numbers hidden md:table-cell">{comp.units}</td>
                    <td className="px-3 py-3 text-right font-mono-numbers font-semibold">${comp.avg_rent.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right font-mono-numbers hidden sm:table-cell">${comp.rent_per_sf.toFixed(2)}</td>
                    <td className="px-3 py-3 text-right font-mono-numbers hidden md:table-cell">{comp.occupancy}%</td>
                    <td className="px-3 py-3 text-center">
                      {comp.renovated
                        ? <Check className="w-4 h-4 text-gc-positive inline-block" />
                        : <X className="w-4 h-4 text-gc-text-muted inline-block" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
