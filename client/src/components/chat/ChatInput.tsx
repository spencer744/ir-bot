import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
  autoFocus?: boolean;
}

export default function ChatInput({ onSend, disabled, autoFocus }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 80) + 'px';
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-3 border-t border-gc-border bg-gc-surface shrink-0">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about this deal..."
          rows={1}
          disabled={disabled}
          className="flex-1 bg-gc-bg border border-gc-border rounded-xl px-4 py-2.5 text-sm text-gc-text placeholder:text-gc-text-muted focus:border-gc-accent focus:ring-1 focus:ring-gc-accent transition-colors resize-none disabled:opacity-50"
        />
        {input.trim() && (
          <button
            onClick={handleSend}
            disabled={disabled}
            className="bg-gc-accent hover:bg-gc-accent-hover disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl p-2.5 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="text-[9px] text-gc-text-muted mt-2 text-center">
        Projections discussed are estimates. Consult the PPM for complete details.
      </p>
    </div>
  );
}
