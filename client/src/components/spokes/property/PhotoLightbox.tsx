import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DealMedia } from '../../../types/deal';

interface PhotoLightboxProps {
  photos: DealMedia[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function PhotoLightbox({ photos, currentIndex, onClose, onNavigate }: PhotoLightboxProps) {
  const item = photos[currentIndex];
  if (!item) return null;
  const isVideo = item.type === 'video';

  const goNext = useCallback(() => {
    onNavigate((currentIndex + 1) % photos.length);
  }, [currentIndex, photos.length, onNavigate]);

  const goPrev = useCallback(() => {
    onNavigate((currentIndex - 1 + photos.length) % photos.length);
  }, [currentIndex, photos.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goNext, goPrev]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <span className="text-white/70 text-sm font-mono-numbers">
            {currentIndex + 1} / {photos.length}
          </span>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-3 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media area — image or video */}
        <div className="flex-1 flex items-center justify-center relative min-h-0 px-4 pb-4">
          {/* Prev button */}
          <button
            onClick={goPrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white/80 hover:text-white p-2.5 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {isVideo ? (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="max-w-full max-h-full flex items-center justify-center"
            >
              <video
                src={item.url}
                controls
                className="max-w-full max-h-full rounded-lg"
                title={item.caption || 'Video'}
              />
            </motion.div>
          ) : (
            <motion.img
              key={item.id}
              src={item.url}
              alt={item.caption || ''}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="max-w-full max-h-full object-contain rounded-lg select-none"
              draggable={false}
            />
          )}

          {/* Next button */}
          <button
            onClick={goNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white/80 hover:text-white p-2.5 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Caption */}
        {item.caption && (
          <div className="text-center px-4 pb-4 shrink-0">
            <p className="text-white/80 text-sm">{item.caption}</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
