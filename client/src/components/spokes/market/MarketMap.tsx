import { motion } from 'framer-motion';

interface MarketMapProps {
  imageUrl: string;
  subjectLabel?: string;
  caption?: string;
}

export default function MarketMap({ imageUrl, subjectLabel, caption }: MarketMapProps) {
  if (!imageUrl?.trim()) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-5">Market & Submarket</h2>
      <div className="bg-gc-surface border border-gc-border rounded-2xl overflow-hidden">
        <div className="relative">
          <img
            src={imageUrl}
            alt="Market and submarket map"
            className="w-full h-auto max-h-[400px] object-contain"
          />
          {subjectLabel && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gc-bg/90 border border-gc-border rounded-lg px-2.5 py-1.5 text-xs font-medium text-gc-text">
              <span className="w-2 h-2 rounded-full bg-gc-accent shrink-0" />
              {subjectLabel}
            </div>
          )}
        </div>
        {caption && (
          <p className="px-5 py-3 text-gc-text-muted text-xs border-t border-gc-border">
            {caption}
          </p>
        )}
      </div>
    </motion.section>
  );
}
