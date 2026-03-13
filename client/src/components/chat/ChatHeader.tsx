import { X, ArrowLeft, Download } from 'lucide-react';
import Logo from '../shared/Logo';

interface ChatHeaderProps {
  onClose: () => void;
  onExport?: () => void;
  isDemoMode: boolean;
  isMobile: boolean;
}

export default function ChatHeader({ onClose, onExport, isDemoMode, isMobile }: ChatHeaderProps) {
  return (
    <div className="flex flex-col shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gc-border bg-gc-surface">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              onClick={onClose}
              className="text-gc-text-muted hover:text-gc-text transition-colors p-1 -ml-1 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
              title="Minimize chat"
              aria-label="Minimize chat"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Logo iconOnly opacity={0.9} className="shrink-0" />
          <div>
            <p className="text-sm font-medium text-gc-text">Gray Capital Advisor</p>
            <p className="text-[10px] text-gc-positive flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gc-positive rounded-full inline-block" />
              {isDemoMode ? 'Demo Mode' : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onExport && (
            <button
              onClick={onExport}
              className="text-gc-text-muted hover:text-gc-text transition-colors p-1.5"
              title="Download chat transcript"
              aria-label="Download chat transcript"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          {!isMobile && (
            <button
              onClick={onClose}
              className="text-gc-text-muted hover:text-gc-text transition-colors p-1"
              title="Minimize chat"
              aria-label="Minimize chat"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      {isDemoMode && (
        <div className="px-4 py-1.5 bg-gc-warning/10 border-b border-gc-warning/20">
          <p className="text-[11px] text-gc-warning text-center">Demo Mode — Connect API for full AI experience</p>
        </div>
      )}
    </div>
  );
}
