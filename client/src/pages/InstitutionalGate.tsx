import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, ArrowLeft } from 'lucide-react';
import { useDeal } from '../context/DealContext';
import Logo from '../components/shared/Logo';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InstitutionalGate() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { authenticate, isAuthenticated, intakeCompleted, loadDeal, deal } = useDeal();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    firm: '',
    accredited: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.first_name.trim()) errors.first_name = 'Required';
    if (!form.last_name.trim()) errors.last_name = 'Required';
    if (!form.email.trim()) {
      errors.email = 'Required';
    } else if (!EMAIL_RE.test(form.email.trim())) {
      errors.email = 'Enter a valid email address';
    }
    if (!form.firm.trim()) errors.firm = 'Required';
    if (!form.accredited) errors.accredited = 'You must confirm accredited investor status to continue.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setError('');
    setSubmitting(true);
    try {
      await authenticate({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: undefined,
        deal_slug: slug!,
        is_institutional: true,
        firm: form.firm.trim(),
      } as any);
      // Load deal if needed, then route directly to hub with financial spoke
      if (!deal && slug) await loadDeal(slug);
      navigate(`/deals/${slug}?institutional=1`, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gc-bg">
      <div className="absolute inset-0 bg-gradient-to-br from-gc-surface via-gc-bg to-gc-bg" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo variant="vertical" theme="dark" tagline="Institutional Access" />
        </div>

        {/* Back link */}
        <Link
          to={`/deals/${slug}`}
          className="flex items-center gap-1.5 text-gc-text-muted text-xs hover:text-gc-text transition-colors mb-5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to standard access
        </Link>

        {/* Card */}
        <div className="bg-gc-surface border border-gc-border rounded-2xl p-5 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gc-accent/10 border border-gc-accent/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-gc-accent" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gc-text">Institutional Fast Track</h2>
              <p className="text-gc-text-muted text-xs">Family offices & institutional allocators</p>
            </div>
          </div>

          <p className="text-gc-text-secondary text-sm mb-5 leading-relaxed">
            Skip the retail onboarding. You'll go directly to the Financial Explorer with full debt structure,
            returns waterfall, and exit analysis.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gc-text-secondary mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  value={form.first_name}
                  onChange={e => { setForm(f => ({ ...f, first_name: e.target.value })); setFieldErrors(fe => ({ ...fe, first_name: '' })); }}
                  className={`w-full bg-gc-bg border rounded-lg px-3 py-2.5 text-sm text-gc-text placeholder:text-gc-text-muted focus:border-gc-accent focus:ring-1 focus:ring-gc-accent transition-colors ${fieldErrors.first_name ? 'border-gc-negative' : 'border-gc-border'}`}
                  placeholder="Margaret"
                />
                {fieldErrors.first_name && <p className="text-gc-negative text-[10px] mt-1">{fieldErrors.first_name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gc-text-secondary mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={form.last_name}
                  onChange={e => { setForm(f => ({ ...f, last_name: e.target.value })); setFieldErrors(fe => ({ ...fe, last_name: '' })); }}
                  className={`w-full bg-gc-bg border rounded-lg px-3 py-2.5 text-sm text-gc-text placeholder:text-gc-text-muted focus:border-gc-accent focus:ring-1 focus:ring-gc-accent transition-colors ${fieldErrors.last_name ? 'border-gc-negative' : 'border-gc-border'}`}
                  placeholder="Chen"
                />
                {fieldErrors.last_name && <p className="text-gc-negative text-[10px] mt-1">{fieldErrors.last_name}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gc-text-secondary mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setFieldErrors(fe => ({ ...fe, email: '' })); }}
                className={`w-full bg-gc-bg border rounded-lg px-3 py-2.5 text-sm text-gc-text placeholder:text-gc-text-muted focus:border-gc-accent focus:ring-1 focus:ring-gc-accent transition-colors ${fieldErrors.email ? 'border-gc-negative' : 'border-gc-border'}`}
                placeholder="margaret@alphacapital.com"
              />
              {fieldErrors.email && <p className="text-gc-negative text-[10px] mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gc-text-secondary mb-1.5">Firm / Organization</label>
              <input
                type="text"
                required
                value={form.firm}
                onChange={e => { setForm(f => ({ ...f, firm: e.target.value })); setFieldErrors(fe => ({ ...fe, firm: '' })); }}
                className={`w-full bg-gc-bg border rounded-lg px-3 py-2.5 text-sm text-gc-text placeholder:text-gc-text-muted focus:border-gc-accent focus:ring-1 focus:ring-gc-accent transition-colors ${fieldErrors.firm ? 'border-gc-negative' : 'border-gc-border'}`}
                placeholder="Alpha Capital Family Office"
              />
              {fieldErrors.firm && <p className="text-gc-negative text-[10px] mt-1">{fieldErrors.firm}</p>}
            </div>

            <label className="flex items-start gap-3 pt-2 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={form.accredited}
                onChange={e => setForm(f => ({ ...f, accredited: e.target.checked }))}
                className="mt-0.5 w-5 h-5 min-w-[20px] rounded border-gc-border bg-gc-bg text-gc-accent focus:ring-gc-accent focus:ring-offset-0"
              />
              <span className="text-xs text-gc-text-secondary leading-relaxed">
                I confirm this entity qualifies as an accredited investor or qualified institutional buyer under SEC regulations.
              </span>
            </label>

            {(error || fieldErrors.accredited) && (
              <p className="text-gc-negative text-xs">{error || fieldErrors.accredited}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gc-accent hover:bg-gc-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg text-sm transition-colors"
            >
              {submitting ? 'Accessing...' : 'Access Institutional Deal Room →'}
            </button>
          </form>
        </div>

        <div className="flex justify-center gap-3 mt-4">
          <Link to="/legal/terms" className="text-gc-text-muted text-[10px] hover:text-gc-text-secondary transition-colors">
            Terms of Use
          </Link>
          <span className="text-gc-text-muted text-[10px]">|</span>
          <Link to="/legal/privacy" className="text-gc-text-muted text-[10px] hover:text-gc-text-secondary transition-colors">
            Privacy Policy
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
