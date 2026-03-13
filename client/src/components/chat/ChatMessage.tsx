import React from 'react';
import { motion } from 'framer-motion';
import type { ChatMessage as ChatMessageType } from '../../types/investor';

interface ChatMessageProps {
  message: ChatMessageType;
}

/** Simple markdown: bold, links, newlines */
function renderSimpleMarkdown(text: string) {
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    if (!line.trim()) return <br key={`br-${lineIdx}`} />;

    const elements: (string | React.ReactElement)[] = [];
    let remaining = line;
    let keyIdx = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

      const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;
      const linkIdx = linkMatch ? remaining.indexOf(linkMatch[0]) : Infinity;

      if (boldIdx === Infinity && linkIdx === Infinity) {
        elements.push(remaining);
        break;
      }

      if (boldIdx <= linkIdx && boldMatch) {
        elements.push(remaining.slice(0, boldIdx));
        elements.push(
          <strong key={`b-${lineIdx}-${keyIdx++}`} className="font-semibold">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldIdx + boldMatch[0].length);
      } else if (linkMatch) {
        elements.push(remaining.slice(0, linkIdx));
        elements.push(
          <a
            key={`a-${lineIdx}-${keyIdx++}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gc-accent underline hover:text-gc-accent-hover"
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.slice(linkIdx + linkMatch[0].length);
      }
    }

    return (
      <span key={`line-${lineIdx}`}>
        {lineIdx > 0 && lines[lineIdx - 1].trim() !== '' && <br />}
        {elements}
      </span>
    );
  });
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-6 h-6 bg-gc-accent/10 rounded-full flex items-center justify-center shrink-0 mt-1 mr-2">
          <span className="text-gc-accent text-[9px] font-bold">GC</span>
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-gc-accent/20 text-gc-text rounded-br-md'
            : 'bg-gc-bg border border-gc-border text-gc-text rounded-bl-md'
        }`}
      >
        {isUser ? message.content : renderSimpleMarkdown(message.content)}
      </div>
    </motion.div>
  );
}
