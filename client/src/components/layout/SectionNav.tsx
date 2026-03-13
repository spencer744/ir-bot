import { SPOKES } from '../../constants/spokes';

interface SectionNavProps {
  currentSection: string;
  onSectionChange: (sectionId: string) => void;
  trackEvent?: (event: string, payload?: Record<string, unknown>) => void;
}

export default function SectionNav({
  currentSection,
  onSectionChange,
  trackEvent,
}: SectionNavProps) {
  const handleClick = (sectionId: string) => {
    onSectionChange(sectionId);
    trackEvent?.('section_nav_click', { section: sectionId });
  };

  return (
    <nav
      className="overflow-x-auto flex-nowrap md:overflow-visible scroll-smooth"
      aria-label="Deal sections"
    >
      <div className="flex gap-2 min-w-max py-1">
        {SPOKES.map((spoke) => {
          const Icon = spoke.icon;
          const label = spoke.shortTitle ?? spoke.title;
          const isActive = currentSection === spoke.id;

          return (
            <button
              key={spoke.id}
              type="button"
              onClick={() => handleClick(spoke.id)}
              aria-current={isActive ? 'true' : undefined}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
                whitespace-nowrap border transition-colors
                ${isActive
                  ? 'bg-gc-surface-elevated border-gc-accent/40 text-gc-text ring-1 ring-gc-accent/20'
                  : 'bg-gc-bg border-gc-border text-gc-text-secondary hover:text-gc-text hover:border-gc-border'
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
