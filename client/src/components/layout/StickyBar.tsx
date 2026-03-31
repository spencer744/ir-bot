import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeal } from '../../context/DealContext';
import { useConfig } from '../../hooks/useConfig';
import { ArrowLeft } from 'lucide-react';
import SectionNav from './SectionNav';
import Logo from '../shared/Logo';

export default function StickyBar() {
  const { deal, currentSection, setCurrentSection, trackEvent } = useDeal();
  const { investmentPortalUrl } = useConfig();
  const [scrollPast, setScrollPast] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollPast(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const inSpoke = currentSection !== 'hub';
  const visible = inSpoke || scrollPast;

  const handleSectionChange = (sectionId: string) => {
    setCurrentSection(sectionId);
    trackEvent('spoke_click', { spoke: sectionId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          <div className="w-full px-4 sm:px-6 py-3 flex flex-col gap-2 md:gap-0 md:flex-row md:items-center md:justify-between md:h-14 min-h-14">
            {/* Row 1 on mobile: left + CTA. On desktop: left block only (SectionNav and right follow in same row) */}
            <div className="flex items-center justify-between md:justify-start gap-3 min-w-0 shrink-0">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <Logo iconOnly opacity={0.9} className="border-r border-gc-border pr-3" />
                {inSpoke && (
                  <button
                    onClick={() => setCurrentSection('hub')}
                    className="text-gc-text-secondary hover:text-gc-text transition-colors shrink-0"
                    aria-label="Back to overview"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <span className="font-semibold text-gc-text text-sm truncate">{deal.name}</span>
                <span className="hidden sm:inline text-gc-text-muted text-xs shrink-0">
                  {deal.city}, {deal.state}
                </span>
                <span className="md:hidden text-gc-positive text-sm font-semibold font-mono-numbers shrink-0">
                  {formatPct(deal.target_irr_base)}
                </span>
              </div>
              {investmentPortalUrl ? (
                <a
                  href={investmentPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="md:hidden bg-gc-accent hover:bg-gc-accent-hover text-white text-xs font-medium py-2 px-4 rounded-lg transition-colors whitespace-nowrap shrink-0 inline-block"
                >
                  Invest
                </a>
              ) : (
                <button className="md:hidden bg-gc-accent hover:bg-gc-accent-hover text-white text-xs font-medium py-2 px-4 rounded-lg transition-colors whitespace-nowrap shrink-0">
                  Invest
                </button>
              )}
            </div>

            {/* Desktop: scrollable region for SectionNav + metrics + CTA (prevents overlap) */}
            <div className="hidden md:flex flex-1 min-w-0 overflow-x-auto overflow-y-hidden pr-2">
              <div className="flex items-center gap-4 md:gap-6 min-w-max py-1">
                {inSpoke && (
                  <SectionNav
                    currentSection={currentSection}
                    onSectionChange={handleSectionChange}
                    trackEvent={trackEvent}
                  />
                )}
                <div className="flex items-center gap-4 md:gap-6 shrink-0">
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
                  <button className="bg-gc-accent hover:bg-gc-accent-hover text-white text-xs font-medium py-2 px-4 rounded-lg transition-colors whitespace-nowrap shrink-0">
                    Indicate Interest
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile: SectionNav on its own row */}
            {inSpoke && (
              <div className="md:hidden w-full -mx-1 overflow-x-auto">
                <SectionNav
                  currentSection={currentSection}
                  onSectionChange={handleSectionChange}
                  trackEvent={trackEvent}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
