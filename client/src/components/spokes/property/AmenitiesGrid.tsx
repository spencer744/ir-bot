import { motion } from 'framer-motion';
import {
  Waves, Dumbbell, Home, Dog, TreePine, Shirt,
  Car, Footprints, Briefcase, Package, Wrench, type LucideIcon,
} from 'lucide-react';

interface AmenitiesGridProps {
  amenities: string[];
}

// Map amenity name keywords to Lucide icons
const ICON_MAP: Record<string, LucideIcon> = {
  pool: Waves,
  swimming: Waves,
  fitness: Dumbbell,
  gym: Dumbbell,
  clubhouse: Home,
  dog: Dog,
  playground: TreePine,
  laundry: Shirt,
  garage: Car,
  parking: Car,
  trail: Footprints,
  walking: Footprints,
  business: Briefcase,
  package: Package,
  locker: Package,
  maintenance: Wrench,
};

function getIcon(amenity: string): LucideIcon {
  const lower = amenity.toLowerCase();
  for (const [keyword, icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(keyword)) return icon;
  }
  return Home;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function AmenitiesGrid({ amenities }: AmenitiesGridProps) {
  if (!amenities || amenities.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-5">Community Amenities</h2>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
      >
        {amenities.map(amenity => {
          const Icon = getIcon(amenity);
          return (
            <motion.div
              key={amenity}
              variants={item}
              className="flex items-center gap-3 bg-gc-surface border border-gc-border rounded-xl px-4 py-3"
            >
              <Icon className="w-4 h-4 text-gc-accent shrink-0" />
              <span className="text-sm text-gc-text">{amenity}</span>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
