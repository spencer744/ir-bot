import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, ChevronDown } from 'lucide-react';

interface RiskItem {
  risk: string;
  detail: string;
  mitigation: string;
}

interface MarketRisksProps {
  risks: RiskItem[];
}

export default function MarketRisks({ risks }: MarketRisksProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-2">Market Considerations</h2>
      <p className="text-gc-text-muted text-sm mb-6">
        An honest assessment of market risks and how we mitigate them.
      </p>
      <div className="space-y-3">
        {risks.map((r, i) => {
          const isOpen = expanded === i;
          return (
            <div
              key={r.risk}
              className="bg-gc-surface border border-gc-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-sm font-semibold text-gc-text">{r.risk}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gc-text-muted transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4">
                      <div className="flex gap-3">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Risk</p>
                          <p className="text-sm text-gc-text-secondary leading-relaxed">{r.detail}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Shield className="w-4 h-4 text-gc-positive shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-gc-positive uppercase tracking-wider mb-1">Mitigation</p>
                          <p className="text-sm text-gc-text-secondary leading-relaxed">{r.mitigation}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
