import { motion, AnimatePresence } from 'motion/react';
import VoiceButton from './components/VoiceButton';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import MicIcon from './assets/mic.svg';

export default function App() {
  const {
    isRecording,
    isProcessing,
    transcript,
    interimTranscript,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
  } = useVoiceRecorder();

  const handleMicClick = () => {
    // Prevent clicking during processing
    if (isProcessing) return;

    if (isRecording) {
      stopRecording();
    } else {
      // Clear previous transcript when starting new recording
      if (transcript) {
        resetTranscript();
      }
      startRecording();
    }
  };

  // Show primary variant when processing, secondary when recording
  const variant = isRecording ? 'secondary' : 'primary';

  return (
    <div className="relative flex items-end justify-center min-h-screen pb-36">
      <div className="relative flex items-center justify-center">
        {/* Ellipse decoration that appears during recording or processing */}
        <AnimatePresence>
          {(isRecording) && (
            <motion.div
              className="absolute"
              style={{
                width: '638px',
                height: '538px',
                borderRadius: '50%',
                background: 'linear-gradient(180deg, #FFFFFF 23%, #ECE0FF 42%, #BEC8FF 58%)',
                zIndex: 0,
                bottom: '-256px',
                filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.15))',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        {/* Transcription Display on top of ellipse */}
        <div className="absolute top-[-480px] z-10 w-full">
          <TranscriptionDisplay
            transcript={transcript}
            interimTranscript={interimTranscript}
            isRecording={isRecording}
            error={error}
          />
        </div>

        {/* Voice Button */}
        <div className="relative z-10">
          <VoiceButton
            icon={MicIcon}
            variant={variant}
            isRecording={isRecording}
            isProcessing={isProcessing}
            onClick={handleMicClick}
          />
        </div>
      </div>
    </div>
  );
}