import { motion } from 'framer-motion';

const QUICK_ACTIONS = [
  "What are the projected returns?",
  "Tell me about the tax benefits",
  "What's Gray Capital's track record?",
  "How does the fee structure work?",
  "What are the risks?",
  "How do I invest?",
];

interface QuickActionsProps {
  onSelect: (text: string) => void;
}

export default function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex flex-wrap gap-2 px-1"
    >
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action}
          onClick={() => onSelect(action)}
          className="text-xs text-gc-text-secondary bg-gc-surface-elevated border border-gc-border rounded-full px-3 py-1.5 hover:bg-gc-border/50 hover:text-gc-text transition-colors whitespace-nowrap"
        >
          {action}
        </button>
      ))}
    </motion.div>
  );
}
