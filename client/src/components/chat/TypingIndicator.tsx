import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="w-6 h-6 bg-gc-accent/10 rounded-full flex items-center justify-center shrink-0 mt-1 mr-2">
        <span className="text-gc-accent text-[9px] font-bold">GC</span>
      </div>
      <div className="bg-gc-bg border border-gc-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="w-2 h-2 bg-gc-text-muted rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}
