import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface SpokeCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  index: number;
  badge?: string;
  onClick: () => void;
}

export default function SpokeCard({ title, description, icon: Icon, index, badge, onClick }: SpokeCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2, ease: 'easeInOut' } }}
      onClick={onClick}
      className="group relative bg-gc-surface border border-gc-border hover:border-gc-accent/40 rounded-xl p-6 text-left transition-colors w-full"
    >
      {badge && (
        <span className="absolute top-3 right-3 bg-gc-accent text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <div className="w-10 h-10 bg-gc-accent/10 border border-gc-accent/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gc-accent/20 transition-colors">
        <Icon className="w-5 h-5 text-gc-accent" />
      </div>
      <h3 className="font-semibold text-gc-text mb-1">{title}</h3>
      <p className="text-sm text-gc-text-secondary leading-relaxed">{description}</p>
    </motion.button>
  );
}
