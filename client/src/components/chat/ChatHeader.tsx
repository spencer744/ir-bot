import { X, ArrowLeft } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
  isDemoMode: boolean;
  isMobile: boolean;
}

export default function ChatHeader({ onClose, isDemoMode, isMobile }: ChatHeaderProps) {
  return (
    <div className="flex flex-col shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gc-border bg-gc-surface">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button onClick={onClose} className="text-gc-text-muted hover:text-gc-text transition-colors p-1 -ml-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-8 h-8 bg-gc-accent/10 rounded-full flex items-center justify-center">
            <span className="text-gc-accent text-xs font-bold">GC</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gc-text">Gray Capital Advisor</p>
            <p className="text-[10px] text-gc-positive flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gc-positive rounded-full inline-block" />
              {isDemoMode ? 'Demo Mode' : 'Online'}
            </p>
          </div>
        </div>
        {!isMobile && (
          <button
            onClick={onClose}
            className="text-gc-text-muted hover:text-gc-text transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      {isDemoMode && (
        <div className="px-4 py-1.5 bg-gc-warning/10 border-b border-gc-warning/20">
          <p className="text-[11px] text-gc-warning text-center">Demo Mode — Connect API for full AI experience</p>
        </div>
      )}
    </div>
  );
}
