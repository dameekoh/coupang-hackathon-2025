import { useState, useEffect, useRef } from 'react';

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  detectedCommand: 'add' | 'cart' | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  clearCommand: () => void;
  setProcessing: (processing: boolean) => void;
  isSupported: boolean;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [detectedCommand, setDetectedCommand] = useState<'add' | 'cart' | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const isListeningRef = useRef(false);
  const stopRestartRef = useRef(false);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const detectCommand = (text: string): 'add' | 'cart' | null => {
    const lowerText = text.toLowerCase().trim();
    if (lowerText.includes('add') || lowerText.includes('애드') || lowerText.includes('추가') || lowerText.includes('yes')) {
      return 'add';
    }
    if (lowerText.includes('장바구니') || lowerText.includes('카트') || lowerText.includes('cart')) {
      return 'cart';
    }
    return null;
  };

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('[onstart] Recognition started');
      setIsRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (!isListeningRef.current) return;

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
        setTranscript(prev => {
          const newTranscript = prev + final;
          const command = detectCommand(newTranscript);
          if (command) {
            setDetectedCommand(command);
          }
          return newTranscript;
        });
      }
      setInterimTranscript(interim);

      silenceTimerRef.current = setTimeout(() => {
        console.log('[silence] Silence detected, stopping listening.');
        stopListening();
      }, 2000);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone access denied. Please allow microphone permissions.');
        stopRestartRef.current = true; // Prevent restart on critical error
      } else {
        setError(`Recognition error: ${event.error}`);
      }
      setIsRecording(false);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('[onend] Recognition ended');
      setIsRecording(false);
      setIsListening(false);
      setInterimTranscript('');
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      
      if (!stopRestartRef.current) {
        console.log('[onend] Restarting recognition...');
        setTimeout(() => recognition.start(), 100); // Restart after a short delay
      }
    };
    
    // Start recognition immediately
    recognition.start();

    return () => {
      console.log('[cleanup] Stopping recognition permanently.');
      stopRestartRef.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // Avoid restart on unmount
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [isSupported]);

  const startListening = () => {
    console.log('[startListening] Called');
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    if (!isRecording) {
      console.log('[startListening] Recognition not ready, trying to start it.');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('[startListening] Error starting recognition:', err);
        setError('Failed to start recording. Please check microphone permissions.');
        return;
      }
    }
    
    setIsListening(true);
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  };

  const stopListening = () => {
    console.log('[stopListening] Called');
    setIsListening(false);
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
    isListening,
    isProcessing,
    transcript,
    interimTranscript,
    error,
    detectedCommand,
    startListening,
    stopListening,
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
