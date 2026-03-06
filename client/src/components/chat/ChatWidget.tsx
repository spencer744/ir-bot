import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useAnalytics } from '../../hooks/useAnalytics';
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
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => { setIsOpen(true); trackEvent({ eventType: 'chat_opened' }); }}
            className={`fixed z-50 bg-gc-accent hover:bg-gc-accent-hover rounded-full flex items-center justify-center shadow-lg shadow-gc-accent/20 transition-colors ${
              isMobile ? 'bottom-4 right-4 w-12 h-12' : 'bottom-6 right-6 w-14 h-14'
            }`}
          >
            <MessageCircle className={isMobile ? 'w-5 h-5 text-white' : 'w-6 h-6 text-white'} />
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
                ? 'inset-0 bg-gc-bg'
                : 'bottom-6 right-6 w-[400px] h-[600px] max-h-[80vh] bg-gc-surface border border-gc-border rounded-2xl shadow-2xl'
            }`}
          >
            {/* Header */}
            <ChatHeader
              onClose={() => setIsOpen(false)}
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
