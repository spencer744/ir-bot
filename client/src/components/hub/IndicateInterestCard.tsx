import { useState } from 'react';
import { motion } from 'framer-motion';
import { HandCoins, CheckCircle } from 'lucide-react';
import IndicateInterestModal from './IndicateInterestModal';

interface IndicateInterestCardProps {
  index: number;
  visible: boolean;
}

export default function IndicateInterestCard({ index, visible }: IndicateInterestCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!visible) return null;

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        whileHover={!submitted ? { y: -4, scale: 1.02, transition: { duration: 0.2, ease: 'easeInOut' } } : {}}
        onClick={() => !submitted && setModalOpen(true)}
        className={`group relative border rounded-xl p-6 text-left transition-colors w-full ${
          submitted
            ? 'bg-gc-positive/10 border-gc-positive/30'
            : 'bg-gradient-to-br from-gc-positive/10 to-gc-surface border-gc-positive/30 hover:border-gc-positive/60'
        }`}
      >
        {submitted && (
          <span className="absolute top-3 right-3 flex items-center gap-1 text-gc-positive text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            Submitted
          </span>
        )}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${
          submitted
            ? 'bg-gc-positive/20 border border-gc-positive/30'
            : 'bg-gc-positive/10 border border-gc-positive/20 group-hover:bg-gc-positive/20'
        }`}>
          {submitted
            ? <CheckCircle className="w-5 h-5 text-gc-positive" />
            : <HandCoins className="w-5 h-5 text-gc-positive" />
          }
        </div>
        <h3 className="font-semibold text-gc-text mb-1">
          {submitted ? 'Interest Indicated ✓' : 'Indicate Interest'}
        </h3>
        <p className="text-sm text-gc-text-secondary leading-relaxed">
          {submitted
            ? 'Thank you — our IR team will be in touch.'
            : 'Ready to move forward? Let us know your estimated investment amount.'}
        </p>
      </motion.button>

      <IndicateInterestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setSubmitted(true)}
      />
    </>
  );
}
