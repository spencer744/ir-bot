/**
 * Skeleton loading components for the Gray Capital Deal Room.
 * All variants use animate-pulse on the dark theme palette.
 */

interface SkeletonBlockProps {
  className?: string;
  rounded?: boolean;
}

export function SkeletonBlock({ className = 'h-6 w-full', rounded = false }: SkeletonBlockProps) {
  return (
    <div
      className={`animate-pulse bg-[#1C1C24] ${rounded ? 'rounded-full' : 'rounded-lg'} ${className}`}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-[#1C1C24] rounded h-4 ${
            i === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

interface SkeletonChartProps {
  height?: string;
  className?: string;
}

export function SkeletonChart({ height = 'h-64', className = '' }: SkeletonChartProps) {
  return (
    <div
      className={`animate-pulse bg-[#1C1C24] rounded-2xl ${height} w-full ${className}`}
    />
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`bg-gc-surface border border-gc-border rounded-2xl p-6 space-y-4 ${className}`}>
      <SkeletonBlock className="h-5 w-1/3" />
      <SkeletonText lines={3} />
      <SkeletonBlock className="h-10 w-1/2" />
    </div>
  );
}
