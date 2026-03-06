import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useDeal } from '../context/DealContext';
import Gate from '../components/gate/Gate';
import Intake from '../components/gate/Intake';
import Hub from '../components/hub/Hub';
import SpokeRouter from '../components/spokes/SpokeRouter';
import StickyBar from '../components/layout/StickyBar';
import ChatWidget from '../components/chat/ChatWidget';
import Disclaimer from '../components/layout/Disclaimer';

export default function DealRoom() {
  const { slug } = useParams<{ slug: string }>();
  const {
    deal,
    loading,
    error,
    isAuthenticated,
    intakeCompleted,
    sessionRestored,
    currentSection,
    loadDeal,
  } = useDeal();

  useEffect(() => {
    if (slug) loadDeal(slug);
  }, [slug]);

  if (loading || !sessionRestored) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gc-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gc-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-gc-text-secondary text-sm">Loading deal room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gc-bg">
        <div className="text-center max-w-md px-6">
          <h2 className="text-xl font-semibold text-gc-text mb-2">Unable to Load Deal</h2>
          <p className="text-gc-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gc-bg">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gc-text mb-2">Deal Not Found</h2>
          <p className="text-gc-text-secondary">The deal you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Gate → Intake → Hub flow
  if (!isAuthenticated) {
    return <Gate dealSlug={slug!} dealName={deal.name} heroImage={deal.hero_image_url} />;
  }

  if (!intakeCompleted) {
    return <Intake dealName={deal.name} />;
  }

  return (
    <div className="min-h-screen bg-gc-bg">
      <StickyBar />
      <AnimatePresence mode="wait">
        {currentSection === 'hub' ? (
          <Hub key="hub" />
        ) : (
          <SpokeRouter key={currentSection} section={currentSection} />
        )}
      </AnimatePresence>
      <Disclaimer />
      <ChatWidget />
    </div>
  );
}
