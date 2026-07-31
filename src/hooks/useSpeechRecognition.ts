import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

interface SpeechRecognitionResult {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Extend Window interface for speech recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): SpeechRecognitionResult {
  const {
    onResult,
    onEnd,
    continuous = true,
    interimResults = true,
    language = 'en-US'
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const shouldRestartRef = useRef(false);
  const isStartedRef = useRef(false);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartCountRef = useRef(0);
  const lastActivityRef = useRef<number>(Date.now());

  // Clear any pending restart timeout
  const clearRestartTimeout = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  // Safe restart function with exponential backoff
  const safeRestart = useCallback(() => {
    if (!shouldRestartRef.current || !recognitionRef.current || isStartedRef.current) {
      return;
    }

    // Reset restart count if there's been recent activity
    const timeSinceActivity = Date.now() - lastActivityRef.current;
    if (timeSinceActivity < 5000) {
      restartCountRef.current = 0;
    }

    // Calculate delay with exponential backoff (max 2 seconds)
    const baseDelay = 150;
    const maxDelay = 2000;
    const delay = Math.min(baseDelay * Math.pow(1.5, restartCountRef.current), maxDelay);
    restartCountRef.current++;

    console.log(`Scheduling restart in ${delay}ms (attempt ${restartCountRef.current})`);

    clearRestartTimeout();
    restartTimeoutRef.current = setTimeout(() => {
      if (shouldRestartRef.current && recognitionRef.current && !isStartedRef.current) {
        console.log('Restarting speech recognition...');
        try {
          recognitionRef.current.start();
          isStartedRef.current = true;
          setIsListening(true);
          // Reset count on successful start
          restartCountRef.current = Math.max(0, restartCountRef.current - 1);
        } catch (err: any) {
          console.error('Failed to restart recognition:', err?.message || err);
          isStartedRef.current = false;
          
          // If already started error, just mark as listening
          if (err?.message?.includes('already started')) {
            isStartedRef.current = true;
            setIsListening(true);
            restartCountRef.current = 0;
          } else if (shouldRestartRef.current && restartCountRef.current < 10) {
            // Try again with longer delay
            safeRestart();
          } else {
            console.log('Max restart attempts reached, stopping');
            shouldRestartRef.current = false;
            setIsListening(false);
          }
        }
      }
    }, delay);
  }, [clearRestartTimeout]);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    const recognition = recognitionRef.current;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      lastActivityRef.current = Date.now();
      restartCountRef.current = 0; // Reset on successful speech
      
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalTranscript) {
        console.log('Speech recognized:', finalTranscript.trim());
        setTranscript(prev => prev + finalTranscript);
        onResult?.(finalTranscript.trim());
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('Speech recognition event:', event.error);
      
      // Handle different error types
      switch (event.error) {
        case 'no-speech':
          // This is normal - just continue listening
          console.log('No speech detected, continuing...');
          break;
        case 'aborted':
          // Intentionally stopped - don't restart
          console.log('Recognition aborted');
          break;
        case 'audio-capture':
          setError('Microphone not available');
          shouldRestartRef.current = false;
          setIsListening(false);
          break;
        case 'not-allowed':
          setError('Microphone permission denied');
          shouldRestartRef.current = false;
          setIsListening(false);
          break;
        case 'network':
          console.log('Network error, will retry...');
          // Network errors are recoverable
          break;
        default:
          console.error('Speech recognition error:', event.error);
          setError(event.error);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended, shouldRestart:', shouldRestartRef.current, 'isStarted:', isStartedRef.current);
      isStartedRef.current = false;
      setInterimTranscript('');
      
      // Auto-restart if still supposed to be listening
      if (shouldRestartRef.current && continuous) {
        safeRestart();
      } else {
        setIsListening(false);
        onEnd?.();
      }
    };

    recognition.onaudiostart = () => {
      console.log('Audio capture started');
      lastActivityRef.current = Date.now();
    };

    recognition.onspeechstart = () => {
      console.log('Speech detected');
      lastActivityRef.current = Date.now();
      restartCountRef.current = 0;
    };

    return () => {
      shouldRestartRef.current = false;
      clearRestartTimeout();
      try {
        recognition.abort();
      } catch (e) {
        // Ignore abort errors
      }
    };
  }, [isSupported, continuous, interimResults, language, onResult, onEnd, safeRestart, clearRestartTimeout]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition not supported');
      return;
    }

    // If already listening, just ensure state is correct
    if (isStartedRef.current) {
      console.log('Already listening, ensuring state is correct');
      setIsListening(true);
      shouldRestartRef.current = true;
      return;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    shouldRestartRef.current = true;
    restartCountRef.current = 0;
    lastActivityRef.current = Date.now();
    clearRestartTimeout();
    
    try {
      recognitionRef.current.start();
      isStartedRef.current = true;
      setIsListening(true);
      console.log('Speech recognition started');
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err?.message || err);
      
      // If already started, just update state
      if (err?.message?.includes('already started')) {
        isStartedRef.current = true;
        setIsListening(true);
      } else {
        setError('Failed to start speech recognition');
        shouldRestartRef.current = false;
        isStartedRef.current = false;
      }
    }
  }, [isSupported, clearRestartTimeout]);

  const stopListening = useCallback(() => {
    console.log('Stopping speech recognition');
    shouldRestartRef.current = false;
    clearRestartTimeout();
    restartCountRef.current = 0;
    
    if (recognitionRef.current && isStartedRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
    }
    
    isStartedRef.current = false;
    setIsListening(false);
  }, [clearRestartTimeout]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
}
