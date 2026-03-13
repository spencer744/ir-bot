import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gc-bg flex items-center justify-center p-6">
          <div className="bg-gc-surface rounded-xl border border-gc-border p-8 max-w-md text-center">
            <h2 className="text-xl font-bold text-gc-text mb-2">
              Something went wrong
            </h2>
            <p className="text-gc-text-secondary mb-4">
              We hit an unexpected error. Please refresh the page to continue
              exploring the deal room.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gc-accent text-white rounded-lg hover:bg-blue-600 transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
