import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDeal } from '../../context/DealContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import SpokeLayout from './SpokeLayout';
import PhotoGallery from './property/PhotoGallery';
import PhotoLightbox from './property/PhotoLightbox';
import PropertyQuickFacts from './property/PropertyQuickFacts';
import UnitMixTable from './property/UnitMixTable';
import AmenitiesGrid from './property/AmenitiesGrid';
import RenovationScope from './property/RenovationScope';

export default function PropertySpoke() {
  const { deal, media } = useDeal();
  const { trackSectionView } = useAnalytics();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => { trackSectionView('property'); }, []);

  if (!deal) return null;

  const galleryMedia = media.filter(m => m.type === 'photo' || m.type === 'video');
  const dealAny = deal as any;

  return (
    <SpokeLayout title="Property Deep Dive" subtitle={`${deal.name} — ${deal.city}, ${deal.state}`}>
      <div className="space-y-14">

        {/* 1. Photo & Video Gallery */}
        {galleryMedia.length > 0 && (
          <PhotoGallery
            photos={galleryMedia}
            onPhotoClick={(index) => setLightboxIndex(index)}
          />
        )}

        {/* 2. Property Overview Narrative */}
        {dealAny.property_overview_md && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-gc-text mb-5">Property Overview</h2>
            <div className="bg-gc-surface border border-gc-border rounded-2xl p-6 sm:p-8">
              <div className="max-w-none text-gc-text-secondary text-sm leading-relaxed space-y-4">
                {dealAny.property_overview_md.split('\n\n').map((para: string, i: number) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* 3. Quick Facts */}
        {dealAny.property_facts && (
          <PropertyQuickFacts
            facts={dealAny.property_facts}
            totalUnits={deal.total_units}
            purchasePrice={deal.purchase_price}
            address={deal.property_address}
          />
        )}

        {/* 4. Unit Mix Table */}
        {dealAny.unit_mix && (
          <UnitMixTable
            unitMix={dealAny.unit_mix}
            totalUnits={deal.total_units}
          />
        )}

        {/* 5. Community Amenities */}
        {dealAny.amenities && (
          <AmenitiesGrid amenities={dealAny.amenities} />
        )}

        {/* 6. Renovation Scope */}
        {dealAny.renovation && (
          <RenovationScope renovation={dealAny.renovation} />
        )}

        {/* Empty state when no data at all */}
        {galleryMedia.length === 0 && !dealAny.property_overview_md && !dealAny.unit_mix && (
          <section>
            <div className="bg-gc-surface border border-gc-border rounded-2xl p-8 text-center">
              <p className="text-gc-text-secondary">Property photos and details will be available once uploaded by the deal team.</p>
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={galleryMedia}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(index) => setLightboxIndex(index)}
        />
      )}
    </SpokeLayout>
  );
}
