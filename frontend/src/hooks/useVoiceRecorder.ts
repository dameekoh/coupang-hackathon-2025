import { useState, useEffect, useRef } from 'react';

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  detectedCommand: 'add' | 'cart' | null;
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
  clearCommand: () => void;
  setProcessing: (processing: boolean) => void;
  isSupported: boolean;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [detectedCommand, setDetectedCommand] = useState<'add' | 'cart' | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const processingTimerRef = useRef<number | null>(null);
  const isManualStopRef = useRef(false);

  // Detect voice commands from transcript
  const detectCommand = (text: string): 'add' | 'cart' | null => {
    const lowerText = text.toLowerCase().trim();

    // Check for "add" command (English, Korean romanization, Korean)
    if (lowerText.includes('add') || lowerText.includes('애드') || lowerText.includes('추가') || lowerText.includes('babushka') || lowerText.includes('yes')) {
      return 'add';
    }

    // Check for "cart" command (Korean, English, variations)
    if (lowerText.includes('장바구니') || lowerText.includes('카트') || lowerText.includes('cart')) {
      return 'cart';
    }

    return null;
  };

  // Check if browser supports Web Speech API
  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('[onstart] Recording actually started');
      setIsRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Clear existing silence timer when speech is detected
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptPiece + ' ';
        } else {
          interim += transcriptPiece;
        }
      }

      if (final) {
        // Use functional update to avoid stale closure
        setTranscript(prev => {
          const newTranscript = prev + final;

          // Detect command from the new transcript
          const command = detectCommand(newTranscript);
          if (command) {
            setDetectedCommand(command);
          }

          return newTranscript;
        });
      }
      setInterimTranscript(interim);

      // Start new silence timer (2 seconds)
      silenceTimerRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, 2000);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(`Recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      console.log('[onend] Called', { isManualStop: isManualStopRef.current });
      setIsRecording(false);
      setInterimTranscript('');
      // Clear silence timer when recognition ends
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // Processing state will be managed by App.tsx during API call
      // No artificial delay here anymore
      console.log('[onend] Processing state will be handled by API call');

      // Reset manual stop flag
      isManualStopRef.current = false;
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (processingTimerRef.current) {
        clearTimeout(processingTimerRef.current);
      }
    };
  }, [isSupported]);

  const startRecording = () => {
    console.log('[startRecording] Called', { isSupported, hasRecognition: !!recognitionRef.current, isRecording });

    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    // Don't start if already recording
    if (isRecording) {
      console.log('[startRecording] Already recording, skipping');
      return;
    }

    // Cancel processing state if we're starting a new recording
    if (processingTimerRef.current) {
      clearTimeout(processingTimerRef.current);
      processingTimerRef.current = null;
      setIsProcessing(false);
    }

    try {
      setError(null);
      console.log('[startRecording] Calling recognition.start()');
      recognitionRef.current.start();
      console.log('[startRecording] start() called, waiting for onstart event');
    } catch (err) {
      console.error('[startRecording] Error:', err);
      setError('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    console.log('[stopRecording] Called', { isRecording });
    if (recognitionRef.current && isRecording) {
      isManualStopRef.current = true; // Mark as manual stop
      console.log('[stopRecording] Calling recognition.stop()');
      recognitionRef.current.stop();
    }
    // Clear silence timer when manually stopping
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const resetTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    setDetectedCommand(null);
  };

  const clearCommand = () => {
    setDetectedCommand(null);
  };

  const setProcessingState = (processing: boolean) => {
    setIsProcessing(processing);
  };

  return {
    isRecording,
    isProcessing,
    transcript,
    interimTranscript,
    error,
    detectedCommand,
    startRecording,
    stopRecording,
    resetTranscript,
    clearCommand,
    setProcessing: setProcessingState,
    isSupported,
  };
}

// Type definitions for Web Speech API (for TypeScript)
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};
