import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, DollarSign } from 'lucide-react';
import { useDeal } from '../../context/DealContext';

const AMOUNTS = ['$50K', '$100K', '$250K', '$500K', '$1M+', 'Custom'];
const TIMELINES = [
  { value: 'ready_now', label: 'Ready to invest now' },
  { value: '30_days', label: 'Within 30 days' },
  { value: '60_days', label: 'Within 60 days' },
  { value: '90_days', label: 'Within 90 days' },
  { value: 'exploring', label: 'Still exploring' },
];

interface IndicateInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function IndicateInterestModal({ isOpen, onClose, onSuccess }: IndicateInterestModalProps) {
  const { deal, investor } = useDeal();
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [timeline, setTimeline] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const effectiveAmount = amount === 'Custom' ? customAmount : amount;

  const handleSubmit = async () => {
    if (!effectiveAmount) {
      setError('Please select or enter an investment amount.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('gc_session_token');
      const res = await fetch(`/api/deal/${deal?.slug || 'fairmont-apartments'}/interest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount: effectiveAmount,
          timeline,
          notes: notes.slice(0, 500),
        }),
      });

      if (!res.ok) throw new Error('Submission failed');

      setSubmitted(true);
      onSuccess();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-gc-surface border border-gc-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gc-border">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gc-positive" />
              <h2 className="text-lg font-semibold text-gc-text">Indicate Interest</h2>
            </div>
            <button onClick={onClose} className="text-gc-text-muted hover:text-gc-text transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            /* Confirmation state */
            <div className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <CheckCircle className="w-16 h-16 text-gc-positive mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gc-text mb-2">Interest Received</h3>
              <p className="text-gc-text-secondary text-sm mb-1">
                Thank you{investor?.first_name ? `, ${investor.first_name}` : ''}! Your interest in {deal?.name || 'this deal'} has been recorded.
              </p>
              <p className="text-gc-text-muted text-xs mb-6">
                A member of our Investor Relations team will be in touch shortly.
              </p>
              <button
                onClick={onClose}
                className="bg-gc-accent hover:bg-gc-accent-hover text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            /* Form state */
            <div className="p-5 space-y-5">
              <p className="text-gc-text-secondary text-sm">
                Let us know your estimated investment amount for <span className="text-gc-text font-medium">{deal?.name || 'this deal'}</span>. This is non-binding.
              </p>

              {/* Amount selector */}
              <div>
                <label className="block text-sm font-medium text-gc-text mb-2">Investment Amount</label>
                <div className="grid grid-cols-3 gap-2">
                  {AMOUNTS.map((a) => (
                    <button
                      key={a}
                      onClick={() => { setAmount(a); setError(''); }}
                      className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors ${
                        amount === a
                          ? 'bg-gc-accent/20 border-gc-accent text-gc-accent'
                          : 'bg-gc-surface-elevated border-gc-border text-gc-text-secondary hover:border-gc-accent/40'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                {amount === 'Custom' && (
                  <input
                    type="text"
                    placeholder="e.g. $175,000"
                    value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); setError(''); }}
                    className="mt-2 w-full bg-gc-surface-elevated border border-gc-border rounded-lg px-3 py-2.5 text-sm text-gc-text placeholder-gc-text-muted focus:outline-none focus:border-gc-accent"
                  />
                )}
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm font-medium text-gc-text mb-2">Investment Timeline</label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full bg-gc-surface-elevated border border-gc-border rounded-lg px-3 py-2.5 text-sm text-gc-text focus:outline-none focus:border-gc-accent appearance-none"
                >
                  <option value="">Select timeline...</option>
                  {TIMELINES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gc-text mb-2">
                  Notes <span className="text-gc-text-muted font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                  placeholder="Any questions or details you'd like to share..."
                  rows={3}
                  maxLength={500}
                  className="w-full bg-gc-surface-elevated border border-gc-border rounded-lg px-3 py-2.5 text-sm text-gc-text placeholder-gc-text-muted focus:outline-none focus:border-gc-accent resize-none"
                />
                <p className="text-xs text-gc-text-muted mt-1 text-right">{notes.length}/500</p>
              </div>

              {error && (
                <p className="text-sm text-gc-negative">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || !effectiveAmount}
                className="w-full bg-gc-positive hover:bg-gc-positive/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg text-sm transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Interest Indication'}
              </button>

              <p className="text-xs text-gc-text-muted text-center">
                This is a non-binding indication of interest. No capital commitment is required at this time.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
