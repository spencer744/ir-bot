import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useDeal } from '../../context/DealContext';

interface SpokeLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function SpokeLayout({ title, subtitle, children }: SpokeLayoutProps) {
  const { setCurrentSection } = useDeal();

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
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
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gc-text mb-2">{title}</h1>
          {subtitle && <p className="text-gc-text-secondary text-lg">{subtitle}</p>}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
