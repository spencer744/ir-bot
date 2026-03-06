import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeal } from '../../context/DealContext';
import { ArrowLeft } from 'lucide-react';

export default function StickyBar() {
  const { deal, currentSection, setCurrentSection } = useDeal();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!deal) return null;

  const formatCurrency = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n}`;
  };

  const formatPct = (n: number) => `${(n * 100).toFixed(1)}%`;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gc-bg/90 backdrop-blur-md border-b border-gc-border"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {currentSection !== 'hub' && (
                <button
                  onClick={() => setCurrentSection('hub')}
                  className="text-gc-text-secondary hover:text-gc-text transition-colors shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <span className="font-semibold text-gc-text text-sm truncate">{deal.name}</span>
              <span className="hidden sm:inline text-gc-text-muted text-xs shrink-0">
                {deal.city}, {deal.state}
              </span>
              {/* Mobile-only Target IRR */}
              <span className="md:hidden text-gc-positive text-sm font-semibold font-mono-numbers shrink-0">
                {formatPct(deal.target_irr_base)}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <p className="text-[10px] text-gc-text-muted uppercase tracking-wider">Units</p>
                <p className="text-sm font-semibold text-gc-text font-mono-numbers">{deal.total_units}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gc-text-muted uppercase tracking-wider">Target IRR</p>
                <p className="text-sm font-semibold text-gc-positive font-mono-numbers">
                  {formatPct(deal.target_irr_base)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gc-text-muted uppercase tracking-wider">Min Invest</p>
                <p className="text-sm font-semibold text-gc-text font-mono-numbers">
                  {formatCurrency(deal.min_investment)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gc-text-muted uppercase tracking-wider">Hold</p>
                <p className="text-sm font-semibold text-gc-text font-mono-numbers">
                  {deal.projected_hold_years} yrs
                </p>
              </div>
            </div>

            <button className="bg-gc-accent hover:bg-gc-accent-hover text-white text-xs font-medium py-2 px-4 rounded-lg transition-colors whitespace-nowrap">
              Indicate Interest
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
