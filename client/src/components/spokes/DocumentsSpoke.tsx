import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeal } from '../../context/DealContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import {
  FileText,
  Download,
  Lock,
  Eye,
  BookOpen,
  HardDrive,
  X,
  CheckCircle,
  Send,
  ArrowLeft,
  ArrowRight,
  Shield,
  Clock,
  Mail,
} from 'lucide-react';

/* -------------------------------------------------- */
/*  Types                                              */
/* -------------------------------------------------- */

interface DocMedia {
  id: string;
  type: string;
  url: string;
  caption: string;
  description?: string;
  pages?: number;
  file_size?: string;
  file_type?: string;
  access_level?: 'public' | 'restricted';
}

/* -------------------------------------------------- */
/*  Sub-components                                     */
/* -------------------------------------------------- */

function DocumentCard({ doc, index, onDownload }: { doc: DocMedia; index: number; onDownload?: (docId: string, docTitle: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="group bg-gc-surface border border-gc-border hover:border-gc-accent/40 rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-gc-accent/5"
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className="w-12 h-12 bg-gc-accent/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-gc-accent/20 transition-colors">
          <FileText className="w-6 h-6 text-gc-accent" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <h3 className="text-gc-text font-semibold text-sm leading-tight">
              {doc.caption}
            </h3>
            <span className="text-[10px] font-medium bg-gc-surface-elevated text-gc-text-muted px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider">
              {doc.file_type || 'PDF'}
            </span>
          </div>
          <p className="text-gc-text-secondary text-xs leading-relaxed mb-3">
            {doc.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-[11px] text-gc-text-muted">
            {doc.pages && (
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {doc.pages} pages
              </span>
            )}
            {doc.file_size && (
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                {doc.file_size}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gc-border/50">
        <button className="flex items-center gap-1.5 text-gc-accent hover:text-gc-accent-hover text-xs font-medium transition-colors">
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>
        <span className="text-gc-border mx-1">|</span>
        <button onClick={() => onDownload?.(doc.id, doc.caption)} className="flex items-center gap-1.5 text-gc-accent hover:text-gc-accent-hover text-xs font-medium transition-colors">
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
      </div>
    </motion.div>
  );
}

function PPMRequestModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accredited, setAccredited] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
  };

  const handleClose = () => {
    setStep('form');
    setName('');
    setEmail('');
    setAccredited(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-gc-surface border border-gc-border rounded-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {step === 'form' ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gc-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gc-accent/10 rounded-full flex items-center justify-center">
                      <Lock className="w-5 h-5 text-gc-accent" />
                    </div>
                    <div>
                      <h3 className="text-gc-text font-semibold text-sm">
                        Request PPM Access
                      </h3>
                      <p className="text-gc-text-muted text-xs">
                        Accredited investors only
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gc-text-muted hover:text-gc-text transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  <div>
                    <label className="block text-gc-text-secondary text-xs font-medium mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Smith"
                      required
                      className="w-full bg-gc-bg border border-gc-border rounded-lg px-3.5 py-2.5 text-gc-text text-sm placeholder:text-gc-text-muted focus:outline-none focus:border-gc-accent/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gc-text-secondary text-xs font-medium mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                      className="w-full bg-gc-bg border border-gc-border rounded-lg px-3.5 py-2.5 text-gc-text text-sm placeholder:text-gc-text-muted focus:outline-none focus:border-gc-accent/60 transition-colors"
                    />
                  </div>

                  {/* Accredited checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={accredited}
                      onChange={(e) => setAccredited(e.target.checked)}
                      required
                      className="mt-0.5 w-4 h-4 rounded border-gc-border bg-gc-bg text-gc-accent focus:ring-gc-accent/50 accent-[#3B82F6]"
                    />
                    <span className="text-gc-text-secondary text-xs leading-relaxed">
                      I confirm that I am an{' '}
                      <span className="text-gc-text font-medium">
                        accredited investor
                      </span>{' '}
                      as defined by SEC Rule 501 of Regulation D and understand
                      that the PPM contains confidential offering information.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={!name || !email || !accredited}
                    className="w-full bg-gc-accent hover:bg-gc-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Request PPM via DocuSign
                  </button>
                </form>

                <div className="px-5 pb-4">
                  <p className="text-gc-text-muted text-[10px] leading-relaxed text-center">
                    You will receive the PPM and subscription documents via
                    DocuSign within 1 business day. Gray Capital will not share
                    your information with third parties.
                  </p>
                </div>
              </>
            ) : (
              /* Success state */
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-gc-text font-semibold text-lg mb-2">
                  Request Submitted
                </h3>
                <p className="text-gc-text-secondary text-sm mb-1">
                  The PPM and subscription documents will be sent to
                </p>
                <p className="text-gc-accent text-sm font-medium mb-4">
                  {email}
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-gc-text-muted mb-6">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Within 1 business day
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    Via DocuSign
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gc-accent hover:text-gc-accent-hover text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function IndicateInterestModal({
  open,
  onClose,
  dealName,
}: {
  open: boolean;
  onClose: () => void;
  dealName: string;
}) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
  };

  const handleClose = () => {
    setStep('form');
    setName('');
    setEmail('');
    setAmount('');
    setNotes('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-gc-surface border border-gc-border rounded-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {step === 'form' ? (
              <>
                <div className="flex items-center justify-between p-5 border-b border-gc-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-gc-text font-semibold text-sm">
                        Indicate Interest
                      </h3>
                      <p className="text-gc-text-muted text-xs">{dealName}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gc-text-muted hover:text-gc-text transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  <div>
                    <label className="block text-gc-text-secondary text-xs font-medium mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Smith"
                      required
                      className="w-full bg-gc-bg border border-gc-border rounded-lg px-3.5 py-2.5 text-gc-text text-sm placeholder:text-gc-text-muted focus:outline-none focus:border-gc-accent/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gc-text-secondary text-xs font-medium mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                      className="w-full bg-gc-bg border border-gc-border rounded-lg px-3.5 py-2.5 text-gc-text text-sm placeholder:text-gc-text-muted focus:outline-none focus:border-gc-accent/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gc-text-secondary text-xs font-medium mb-1.5">
                      Estimated Investment Amount
                    </label>
                    <select
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full bg-gc-bg border border-gc-border rounded-lg px-3.5 py-2.5 text-gc-text text-sm focus:outline-none focus:border-gc-accent/60 transition-colors appearance-none"
                    >
                      <option value="" className="text-gc-text-muted">
                        Select amount
                      </option>
                      <option value="100000">$100,000</option>
                      <option value="150000">$150,000</option>
                      <option value="250000">$250,000</option>
                      <option value="500000">$500,000</option>
                      <option value="1000000">$1,000,000+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gc-text-secondary text-xs font-medium mb-1.5">
                      Notes{' '}
                      <span className="text-gc-text-muted">(optional)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any questions or comments..."
                      rows={3}
                      className="w-full bg-gc-bg border border-gc-border rounded-lg px-3.5 py-2.5 text-gc-text text-sm placeholder:text-gc-text-muted focus:outline-none focus:border-gc-accent/60 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!name || !email || !amount}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                  >
                    Submit Interest
                  </button>
                </form>

                <div className="px-5 pb-4">
                  <p className="text-gc-text-muted text-[10px] leading-relaxed text-center">
                    Indicating interest is non-binding. A member of the Gray
                    Capital investor relations team will follow up within 1
                    business day.
                  </p>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-gc-text font-semibold text-lg mb-2">
                  Interest Received
                </h3>
                <p className="text-gc-text-secondary text-sm mb-4">
                  Thank you for your interest in {dealName}. Our investor
                  relations team will be in touch within 1 business day.
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-gc-text-muted mb-6">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    1 business day response
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    Non-binding
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gc-accent hover:text-gc-accent-hover text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------- */
/*  Main Component                                     */
/* -------------------------------------------------- */

export default function DocumentsSpoke() {
  const { deal, media, setCurrentSection } = useDeal();
  const { trackSectionView, trackPPMRequested, trackInterestIndicated, trackDocumentDownload, trackScheduleCallClicked } = useAnalytics();
  const [ppmOpen, setPpmOpen] = useState(false);
  const [interestOpen, setInterestOpen] = useState(false);

  useEffect(() => { trackSectionView('documents'); }, []);

  if (!deal) return null;

  const documents = media.filter((m) => m.type === 'document') as DocMedia[];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back nav */}
        <button
          onClick={() => {
            setCurrentSection('hub');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 text-gc-text-secondary hover:text-gc-text text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Deal Overview
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gc-text mb-2">
            Documents
          </h1>
          <p className="text-gc-text-secondary text-lg">
            Due diligence materials for {deal.name}
          </p>
        </motion.div>

        {/* ---- Available Documents ---- */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="flex items-center justify-between mb-5"
          >
            <div>
              <h2 className="text-xl font-semibold text-gc-text">
                Available Documents
              </h2>
              <p className="text-gc-text-muted text-xs mt-0.5">
                {documents.length} documents available for download
              </p>
            </div>
          </motion.div>

          {documents.length > 0 ? (
            <div className="grid gap-3">
              {documents.map((doc, i) => (
                <DocumentCard key={doc.id} doc={doc} index={i} onDownload={trackDocumentDownload} />
              ))}
            </div>
          ) : (
            <div className="bg-gc-surface border border-gc-border rounded-xl p-8 text-center">
              <FileText className="w-8 h-8 text-gc-text-muted mx-auto mb-3" />
              <p className="text-gc-text-secondary text-sm">
                Documents will be available once uploaded by the sponsor.
              </p>
            </div>
          )}
        </section>

        {/* ---- PPM Request ---- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-br from-gc-surface to-gc-surface-elevated border border-gc-border rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-gc-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                <Lock className="w-8 h-8 text-gc-accent" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg font-semibold text-gc-text mb-1">
                  Private Placement Memorandum
                </h2>
                <p className="text-gc-text-secondary text-sm mb-4 max-w-lg">
                  The PPM contains complete offering details, risk factors,
                  subscription agreement, and operating agreement. Available to
                  verified accredited investors via DocuSign.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gc-text-muted mb-4">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    Accredited investors only
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Delivered within 1 business day
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    Sent via DocuSign
                  </span>
                </div>
                <button
                  onClick={() => { setPpmOpen(true); trackPPMRequested(); }}
                  className="bg-gc-accent hover:bg-gc-accent-hover text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Request PPM Access
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ---- Indicate Interest CTA ---- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 text-center">
            <h2 className="text-xl font-semibold text-gc-text mb-2">
              Ready to Invest?
            </h2>
            <p className="text-gc-text-secondary text-sm mb-5 max-w-md mx-auto">
              Indicate your interest in {deal.name} and a member of our investor
              relations team will reach out to discuss next steps. This is
              non-binding.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => { setInterestOpen(true); trackInterestIndicated('unknown'); }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 px-8 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Indicate Interest
              </button>
              <a
                href="#"
                onClick={() => trackScheduleCallClicked()}
                className="text-gc-accent hover:text-gc-accent-hover text-sm font-medium transition-colors inline-flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4" />
                Schedule a Call Instead
              </a>
            </div>
          </div>
        </motion.section>

        {/* Disclaimer */}
        <p className="text-gc-text-muted text-xs leading-relaxed">
          All documents are confidential and for the sole use of prospective
          accredited investors evaluating this investment opportunity. Do not
          distribute, reproduce, or forward without express written consent from
          Gray Capital LLC.
        </p>
      </div>

      {/* Modals */}
      <PPMRequestModal open={ppmOpen} onClose={() => setPpmOpen(false)} />
      <IndicateInterestModal
        open={interestOpen}
        onClose={() => setInterestOpen(false)}
        dealName={deal.name}
      />
    </div>
  );
}
