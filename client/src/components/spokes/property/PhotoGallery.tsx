import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import type { DealMedia } from '../../../types/deal';

interface PhotoGalleryProps {
  photos: DealMedia[];
  onPhotoClick: (index: number) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  exterior: 'Exterior',
  interior: 'Interior',
  amenity: 'Amenities',
  renovation: 'Renovation',
  aerial: 'Aerial',
};

export default function PhotoGallery({ photos, onPhotoClick }: PhotoGalleryProps) {
  const [activeCategory, setActiveCategory] = useState('all');

  // Build category tabs from available media (filter out undefined)
  const availableCategories = ['all', ...new Set(photos.map(p => p.category).filter(Boolean) as string[])];

  const filtered = activeCategory === 'all'
    ? photos
    : photos.filter(p => p.category === activeCategory);

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gc-text">Photo & Video Gallery</h2>
        <span className="text-gc-text-muted text-sm">{filtered.length} items</span>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {availableCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`relative px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'text-white'
                : 'text-gc-text-secondary hover:text-gc-text'
            }`}
          >
            {activeCategory === cat && (
              <motion.div
                layoutId="gallery-pill"
                className="absolute inset-0 bg-gc-accent rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{CATEGORY_LABELS[cat] || cat}</span>
          </button>
        ))}
      </div>

      {/* Media grid — hero larger; videos show play icon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((item, i) => {
          const isHero = i === 0 && filtered.length > 2;
          const isVideo = item.type === 'video';
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.35 }}
              onClick={() => {
                const globalIndex = photos.findIndex(p => p.id === item.id);
                onPhotoClick(globalIndex >= 0 ? globalIndex : i);
              }}
              className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-gc-surface-elevated group cursor-pointer ${
                isHero ? 'md:col-span-2 md:row-span-2 md:aspect-[4/3]' : ''
              }`}
            >
              {isVideo ? (
                <>
                  <video
                    src={item.url}
                    muted
                    preload="metadata"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Play className="w-7 h-7 text-gc-bg fill-gc-bg ml-1" />
                    </div>
                  </div>
                </>
              ) : (
                <img
                  src={item.url}
                  alt={item.caption || ''}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              {item.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-xs">{item.caption}</p>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
