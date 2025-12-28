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

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    const recognition = recognitionRef.current;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
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
      console.error('Speech recognition error:', event.error);
      // Only set error for actual problems, not normal end or no-speech
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(event.error);
        // Don't stop listening on recoverable errors
      }
      
      // For no-speech, we should keep listening if continuous mode is on
      if (event.error === 'no-speech' && shouldRestartRef.current && continuous) {
        console.log('No speech detected, will restart...');
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended, shouldRestart:', shouldRestartRef.current);
      isStartedRef.current = false;
      setInterimTranscript('');
      
      // Auto-restart if still supposed to be listening (for continuous mode)
      if (shouldRestartRef.current && continuous) {
        // Add a small delay before restarting to prevent rapid restart loops
        setTimeout(() => {
          if (shouldRestartRef.current && recognitionRef.current) {
            console.log('Restarting speech recognition...');
            try {
              recognitionRef.current.start();
              isStartedRef.current = true;
              setIsListening(true);
            } catch (err) {
              console.error('Failed to restart recognition:', err);
              // If we get an error, try again after a longer delay
              setTimeout(() => {
                if (shouldRestartRef.current && recognitionRef.current && !isStartedRef.current) {
                  try {
                    recognitionRef.current.start();
                    isStartedRef.current = true;
                    setIsListening(true);
                  } catch (retryErr) {
                    console.error('Retry failed:', retryErr);
                    setIsListening(false);
                    shouldRestartRef.current = false;
                  }
                }
              }, 500);
            }
          }
        }, 100);
      } else {
        setIsListening(false);
        onEnd?.();
      }
    };

    return () => {
      shouldRestartRef.current = false;
      recognition.abort();
    };
  }, [isSupported, continuous, interimResults, language, onResult, onEnd]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition not supported');
      return;
    }

    if (isStartedRef.current) {
      console.log('Already listening');
      return;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    shouldRestartRef.current = true;
    
    try {
      recognitionRef.current.start();
      isStartedRef.current = true;
      setIsListening(true);
      console.log('Speech recognition started');
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start speech recognition');
      shouldRestartRef.current = false;
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    isStartedRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      console.log('Speech recognition stopped');
    }
  }, []);

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
