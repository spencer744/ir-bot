import { motion } from 'framer-motion';
import { Building2, Calendar, Ruler, Car, Layers, Users, MapPin } from 'lucide-react';

interface PropertyFacts {
  year_built: number;
  acreage: number;
  building_style: string;
  parking: string;
  stories: string;
  avg_unit_sf: number;
  current_occupancy: number;
}

interface PropertyQuickFactsProps {
  facts: PropertyFacts;
  totalUnits: number;
  purchasePrice: number;
  address: string;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function PropertyQuickFacts({ facts, totalUnits, purchasePrice, address: _address }: PropertyQuickFactsProps) {
  const pricePerUnit = Math.round(purchasePrice / totalUnits);

  const stats = [
    { icon: Building2, label: 'Total Units', value: totalUnits.toString() },
    { icon: Calendar, label: 'Year Built', value: facts.year_built.toString() },
    { icon: Ruler, label: 'Avg Unit SF', value: `${facts.avg_unit_sf.toLocaleString()} sf` },
    { icon: Layers, label: 'Building Style', value: facts.building_style },
    { icon: Car, label: 'Parking', value: facts.parking },
    { icon: Users, label: 'Occupancy', value: `${(facts.current_occupancy * 100).toFixed(0)}%` },
    { icon: MapPin, label: 'Acreage', value: `${facts.acreage} acres` },
    { icon: Building2, label: 'Price / Unit', value: `$${pricePerUnit.toLocaleString()}` },
  ];

  return (
    <section>
      <h2 className="text-xl font-semibold text-gc-text mb-5">Property Quick Facts</h2>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {stats.map(s => (
          <motion.div
            key={s.label}
            variants={item}
            className="bg-gc-surface border border-gc-border rounded-xl p-4"
          >
            <s.icon className="w-4 h-4 text-gc-accent mb-2" />
            <p className="text-[10px] text-gc-text-muted uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-sm font-semibold text-gc-text">{s.value}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
