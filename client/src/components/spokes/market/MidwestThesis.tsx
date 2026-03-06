import { motion } from 'framer-motion';
import {
  DollarSign, Shield, Briefcase, TrendingDown, Users, BarChart3, type LucideIcon,
} from 'lucide-react';

interface ThesisCard {
  icon: string;
  headline: string;
  description: string;
}

interface MidwestThesisProps {
  cards: ThesisCard[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  DollarSign,
  Shield,
  Briefcase,
  TrendingDown,
  Users,
  BarChart3,
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function MidwestThesis({ cards }: MidwestThesisProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-2">Why Midwest Multifamily</h2>
      <p className="text-gc-text-muted text-sm mb-6">
        Gray Capital's thesis on why the Midwest offers superior risk-adjusted returns.
      </p>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {cards.map(card => {
          const Icon = ICON_MAP[card.icon] || DollarSign;
          return (
            <motion.div
              key={card.headline}
              variants={item}
              className="bg-gc-surface-elevated border border-gc-border rounded-xl p-6"
            >
              <Icon className="w-8 h-8 text-gc-accent mb-3" />
              <h3 className="text-base font-bold text-gc-text mb-2">{card.headline}</h3>
              <p className="text-sm text-gc-text-secondary leading-relaxed">{card.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
