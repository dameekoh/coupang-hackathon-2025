import { motion } from 'motion/react';

interface VoicePromptProps {
  text: string;
}

export default function VoicePrompt({ text }: VoicePromptProps) {
  return (
    <motion.div
      className="flex items-center gap-3 bg-white rounded-full px-6 py-4 shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
            fill="white"
          />
          <path
            d="M19 10v2a7 7 0 1 1-14 0v-2"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="text-base font-medium text-gray-900">{text}</span>
    </motion.div>
  );
}
