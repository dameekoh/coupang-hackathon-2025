import { motion, AnimatePresence } from 'motion/react';

interface TranscriptionDisplayProps {
  transcript: string;
  interimTranscript: string;
  isRecording: boolean;
  error: string | null;
}

export default function TranscriptionDisplay({
  transcript,
  interimTranscript,
  isRecording,
  error,
}: TranscriptionDisplayProps) {
  const hasContent = transcript || interimTranscript || error;

  return (
    <AnimatePresence>
      {hasContent && (
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {error ? (
            // Error message
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          ) : (
            // Transcription display - 4 words per row
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 max-w-2xl">
              {transcript.split(' ').filter(word => word.trim()).map((word, index) => (
                <motion.span
                  key={`final-${index}`}
                  className="text-3xl font-normal text-gray-900"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {word}
                </motion.span>
              ))}
              {interimTranscript.split(' ').filter(word => word.trim()).map((word, index) => (
                <motion.span
                  key={`interim-${index}`}
                  className="text-3xl text-gray-500 italic"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {word}
                </motion.span>
              ))}
              {!transcript && !interimTranscript && isRecording && (
                <span className="text-gray-400 text-sm">
                  Listening...
                </span>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
