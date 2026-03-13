import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../hooks/useChat';
import { useAnalytics } from '../../hooks/useAnalytics';
import Logo from '../shared/Logo';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import QuickActions from './QuickActions';

export default function ChatWidget() {
  const {
    messages,
    isLoading,
    isOpen,
    isDemoMode,
    hasUserSentMessage,
    setIsOpen,
    sendMessage,
    showWelcome,
  } = useChat();

  const { trackChatMessage, trackEvent } = useAnalytics();

  const handleSendMessage = useCallback((message: string) => {
    trackChatMessage(message);
    sendMessage(message);
  }, [sendMessage, trackChatMessage]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const handleExportTranscript = useCallback(() => {
    const lines = messages.map((m) => {
      const who = m.role === 'user' ? 'You' : 'Gray Capital Advisor';
      return `${who}: ${m.content}`;
    });
    const text = `Gray Capital Deal Room — Chat Transcript\n${new Date().toISOString().slice(0, 10)}\n\n${lines.join('\n\n')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [messages]);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Show welcome message when opened
  useEffect(() => {
    if (isOpen) {
      showWelcome();
    }
  }, [isOpen, showWelcome]);

  return (
    <>
      {/* Floating chat box (pill when collapsed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            onClick={() => { setIsOpen(true); trackEvent({ eventType: 'chat_opened' }); }}
            aria-label="Open chat"
            className={`fixed z-50 flex items-center gap-2 bg-gc-surface border border-gc-border rounded-xl shadow-lg hover:bg-gc-surface-elevated transition-colors ${
              isMobile
                ? 'bottom-4 right-4 px-3 py-2.5 min-h-[44px] min-w-[44px]'
                : 'bottom-6 right-6 px-4 py-2.5'
            }`}
          >
            <Logo iconOnly opacity={0.9} className="shrink-0" />
            <span className="text-sm font-medium text-gc-text whitespace-nowrap">Chat</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-50 flex flex-col overflow-hidden ${
              isMobile
                ? 'inset-0 bg-gc-bg pb-[env(safe-area-inset-bottom)]'
                : 'bottom-6 right-6 w-[400px] h-[600px] max-h-[80vh] bg-gc-surface border border-gc-border rounded-2xl shadow-2xl'
            }`}
          >
            {/* Header */}
            <ChatHeader
              onClose={() => setIsOpen(false)}
              onExport={handleExportTranscript}
              isDemoMode={isDemoMode}
              isMobile={isMobile}
            />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg, idx) => (
                <ChatMessage key={msg.id + '-' + idx} message={msg} />
              ))}

              {/* Quick Actions -- show after welcome, hide after first user message */}
              {!hasUserSentMessage && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && (
                <QuickActions onSelect={handleSendMessage} />
              )}

              {/* Typing Indicator */}
              {isLoading && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <ChatInput
              onSend={handleSendMessage}
              disabled={isLoading}
              autoFocus={isOpen}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
