import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import Logo from '../shared/Logo';

export default function AdminLogin() {
  const { login, isAuthenticated, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect via component (not navigate() during render)
  if (!loading && isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error || 'Invalid credentials');
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gc-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo variant="vertical" theme="dark" tagline="Admin Portal" />
        </div>

        {/* Login Card */}
        <div className="bg-gc-surface border border-gc-border rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gc-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gc-bg border border-gc-border rounded-lg px-4 py-3 text-gc-text placeholder:text-gc-text-muted focus:outline-none focus:border-gc-accent-light transition-colors"
                placeholder="admin@graycapital.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gc-text-secondary mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gc-bg border border-gc-border rounded-lg px-4 py-3 text-gc-text placeholder:text-gc-text-muted focus:outline-none focus:border-gc-accent-light transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gc-accent hover:bg-gc-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg text-sm transition-colors"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>

            {error && (
              <p className="text-gc-negative text-sm text-center">{error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
