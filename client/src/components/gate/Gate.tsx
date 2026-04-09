import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
// import { api } from '../../lib/api';
import Logo from '../shared/Logo';

interface GateProps {
  dealSlug: string;
  dealName: string;
  heroImage: string;
}

const EMAIL_LOOKUP_DEBOUNCE_MS = 600;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Gate({ dealSlug, dealName, heroImage }: GateProps) {
  const { authenticate } = useDeal();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    accredited: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Returning investor fast-pass state
  const [returningInvestor, setReturningInvestor] = useState<{ first_name: string; email: string } | null>(null);
  const [_checkingEmail, setCheckingEmail] = useState(false);
  const [emailChecked, setEmailChecked] = useState('');

  // Check email on blur/debounce for returning investor
  useEffect(() => {
    const email = form.email.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email) || email === emailChecked) return;
    const timer = setTimeout(async () => {
      setCheckingEmail(true);
      setEmailChecked(email);
      try {
        const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            setReturningInvestor({ first_name: data.first_name, email });
          } else {
            setReturningInvestor(null);
          }
        }
      } catch {
        // Non-critical, fail silently
      } finally {
        setCheckingEmail(false);
      }
    }, EMAIL_LOOKUP_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [form.email, emailChecked]);

  const handleReturningEntry = async () => {
    if (!returningInvestor) return;
    setSubmitting(true);
    setError('');
    try {
      await authenticate({
        first_name: returningInvestor.first_name,
        last_name: '',
        email: returningInvestor.email,
        deal_slug: dealSlug,
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    const first = form.first_name.trim();
    const last = form.last_name.trim();
    const email = form.email.trim();

    if (!first) errors.first_name = 'Required';
    if (!last) errors.last_name = 'Required';
    if (!email) {
      errors.email = 'Required';
    } else if (!EMAIL_RE.test(email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!form.accredited) {
      errors.accredited = 'You must confirm accredited investor status to continue.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setError(fieldErrors.accredited || '');
      return;
    }
    setError('');
    setFieldErrors({});
    setSubmitting(true);
    try {
      await authenticate({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
        deal_slug: dealSlug,
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background */}
      {heroImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gc-bg/85 backdrop-blur-sm" />
        </div>
      )}
      {!heroImage && <div className="absolute inset-0 bg-gc-bg" />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo variant="vertical" theme="dark" tagline="Interactive Deal Room" />
        </div>

        {/* Institutional fast track link */}
        <p className="text-center mb-4 text-[11px] text-gc-text-muted">
          Institutional investor or family office?{' '}
          <Link to={`/institutional/${dealSlug}`} className="text-gc-accent hover:underline">
            Fast-track access →
          </Link>
        </p>

        {/* Form Card */}
        <div className="bg-gc-surface border border-gc-border rounded-2xl p-5 sm:p-8">
          <h2 className="text-xl font-semibold text-gc-text mb-1">{dealName}</h2>
          <p className="text-gc-text-secondary text-sm mb-6">
            Enter your details to access the deal room.
          </p>

          {/* Returning investor fast-pass */}
          {returningInvestor && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-4 bg-gc-accent/10 border border-gc-accent/30 rounded-xl"
            >
              <p className="text-gc-accent text-sm font-semibold mb-1">
                Welcome back, {returningInvestor.first_name}!
              </p>
              <p className="text-gc-text-secondary text-xs mb-3">
                We recognize your email. Click to access the deal room instantly.
              </p>
              <button
                onClick={handleReturningEntry}
                disabled={submitting}
                className="w-full bg-gc-accent hover:bg-gc-accent-hover disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
              >
                {submitting ? 'Accessing…' : `Continue as ${returningInvestor.first_name} →`}
              </button>
              <button
                type="button"
                onClick={() => setReturningInvestor(null)}
                className="w-full text-gc-text-muted text-[11px] mt-2 hover:text-gc-text transition-colors py-1"
              >
                Not you? Fill in the form below
              </button>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gc-text-secondary mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={form.first_name}
                  onChange={e => { setForm(f => ({ ...f, first_name: e.target.value })); setFieldErrors(fe => ({ ...fe, first_name: '' })); }}
                  className={`w-full bg-gc-bg border rounded-lg px-3 py-2.5 text-base text-gc-text placeholder:text-gc-text-muted focus:border-gc-accent focus:ring-1 focus:ring-gc-accent transition-colors ${fieldErrors.first_name ? 'border-gc-negative' : 'border-gc-border'}`}
                  placeholder="John"
                />
                {fieldErrors.first_name && <p className="text-gc-negative text-[10px] mt-1">{fieldErrors.first_name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gc-text-secondary mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={form.last_name}
                  onChange={e => { setForm(f => ({ ...f, last_name: e.target.value })); setFieldErrors(fe => ({ ...fe, last_name: '' })); }}
                  className={`w-full bg-gc-bg border rounded-lg px-3 py-2.5 text-base text-gc-text placeholder:text-gc-text-muted focus:border-gc-accent focus:ring-1 focus:ring-gc-accent transition-colors ${fieldErrors.last_name ? 'border-gc-negative' : 'border-gc-border'}`}
                  placeholder="Smith"
                />
                {fieldErrors.last_name && <p className="text-gc-negative text-[10px] mt-1">{fieldErrors.last_name}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gc-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setFieldErrors(fe => ({ ...fe, email: '' })); }}
                className={`w-full bg-gc-bg border rounded-lg px-3 py-2.5 text-base text-gc-text placeholder:text-gc-text-muted focus:border-gc-accent focus:ring-1 focus:ring-gc-accent transition-colors ${fieldErrors.email ? 'border-gc-negative' : 'border-gc-border'}`}
                placeholder="john@example.com"
              />
              {fieldErrors.email && <p className="text-gc-negative text-[10px] mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gc-text-secondary mb-1.5">
                Phone <span className="text-gc-text-muted">(optional)</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full bg-gc-bg border border-gc-border rounded-lg px-3 py-2.5 text-base text-gc-text placeholder:text-gc-text-muted focus:border-gc-accent focus:ring-1 focus:ring-gc-accent transition-colors"
                placeholder="(555) 123-4567"
              />
            </div>

            <label className="flex items-start gap-3 pt-2 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={form.accredited}
                onChange={e => setForm(f => ({ ...f, accredited: e.target.checked }))}
                className="mt-0.5 w-5 h-5 min-w-[20px] rounded border-gc-border bg-gc-bg text-gc-accent focus:ring-gc-accent focus:ring-offset-0"
              />
              <span className="text-xs text-gc-text-secondary leading-relaxed">
                I confirm that I am an accredited investor as defined by SEC Regulation D, Rule 501.
              </span>
            </label>

            {error && (
              <p className="text-gc-negative text-xs">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gc-accent hover:bg-gc-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg text-sm transition-colors"
            >
              {submitting ? 'Accessing...' : 'Access Deal Room'}
            </button>
          </form>
        </div>

        <p className="text-center text-gc-text-muted text-[10px] mt-4 leading-relaxed max-w-sm mx-auto">
          This material is for informational purposes only and does not constitute an offer to sell
          or a solicitation of an offer to buy any security.
        </p>
        <div className="flex justify-center gap-3 mt-3">
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
