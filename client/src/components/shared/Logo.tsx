import { useState } from 'react';

/**
 * Gray Capital logo component per brand guidelines.
 * Uses asset at /logo-graycapital.png (white on dark); optional tagline.
 * Falls back to wordmark if image is missing or fails to load.
 * Use iconOnly for chrome (StickyBar, ChatHeader) for subtle branding.
 */
interface LogoProps {
  variant?: 'vertical' | 'horizontal';
  theme?: 'dark' | 'light';
  tagline?: string;
  className?: string;
  /** Minimum width of logo graphic in pixels (brand: 72) */
  minWidth?: number;
  /** Show only the "G" icon (small square crop) for subtle chrome placement */
  iconOnly?: boolean;
  /** Slightly reduce prominence (e.g. 0.9) in chrome */
  opacity?: number;
}

const LOGO_SRC = '/logo-graycapital.png';

export default function Logo({
  variant = 'vertical',
  theme = 'dark',
  tagline,
  className = '',
  minWidth = 72,
  iconOnly = false,
  opacity,
}: LogoProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const isDark = theme === 'dark';

  const containerClass =
    variant === 'horizontal'
      ? 'flex items-center gap-3'
      : 'flex flex-col items-center';

  if (imgFailed) {
    return (
      <div className={`${containerClass} ${className}`.trim()}>
        {iconOnly ? (
          <span className="text-gc-text font-bold text-lg leading-none" aria-hidden>G</span>
        ) : (
          <>
            <LogoWordmark />
            {tagline && (
              <p
                className={
                  isDark
                    ? 'text-gc-text-secondary text-sm mt-1'
                    : 'text-gc-text-muted text-sm mt-1'
                }
              >
                {tagline}
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  if (iconOnly) {
    return (
      <div
        className={`inline-flex items-center shrink-0 ${className}`.trim()}
        style={opacity != null ? { opacity } : undefined}
      >
        <img
          src={LOGO_SRC}
          alt="Gray Capital"
          className="w-7 h-7 object-cover object-top rounded-sm flex-shrink-0"
          width={28}
          height={28}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${containerClass} ${className}`.trim()}
      style={opacity != null ? { opacity } : undefined}
    >
      <img
        src={LOGO_SRC}
        alt="Gray Capital"
        className="object-contain flex-shrink-0"
        style={{ minWidth: minWidth, maxWidth: variant === 'horizontal' ? 140 : 200 }}
        width={variant === 'horizontal' ? 120 : 160}
        height={variant === 'horizontal' ? 32 : 72}
        onError={() => setImgFailed(true)}
      />
      {tagline && (
        <p
          className={
            isDark
              ? 'text-gc-text-secondary text-sm mt-1'
              : 'text-gc-text-muted text-sm mt-1'
          }
        >
          {tagline}
        </p>
      )}
    </div>
  );
}

/**
 * Wordmark-only fallback when logo image is not available.
 * Per brand: "GRAY" bold, "CAPITAL" regular, all caps, letter-spacing 0.15–0.2em.
 */
export function LogoWordmark({
  className = '',
}: {
  className?: string;
}) {
  return (
    <span
      className={`uppercase tracking-[0.18em] text-gc-text ${className}`}
    >
      <span className="font-bold">GRAY</span>
      <span className="font-normal"> CAPITAL</span>
    </span>
  );
}
