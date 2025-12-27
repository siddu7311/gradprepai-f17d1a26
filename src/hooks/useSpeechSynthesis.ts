import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceSettings {
  pitch?: number;
  rate?: number;
  volume?: number;
  voice?: 'male' | 'female';
}

interface UseSpeechSynthesisResult {
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  speak: (text: string, settings?: VoiceSettings) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  voices: SpeechSynthesisVoice[];
}

export function useSpeechSynthesis(): UseSpeechSynthesisResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesReady, setVoicesReady] = useState(false);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        setVoicesReady(true);
        console.log('Voices loaded:', availableVoices.length);
      }
    };

    // Try loading immediately
    loadVoices();
    
    // Also listen for the event (Chrome needs this)
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    // Fallback polling for some browsers
    const interval = setInterval(() => {
      if (!voicesReady) {
        loadVoices();
      }
    }, 100);

    return () => {
      clearInterval(interval);
      window.speechSynthesis.cancel();
    };
  }, [isSupported, voicesReady]);

  // Helper function that takes a voice list directly (for use when voices might not be in state yet)
  const findVoiceFromList = useCallback((voiceList: SpeechSynthesisVoice[], preferredGender: 'male' | 'female') => {
    const englishVoices = voiceList.filter(v => v.lang.startsWith('en'));
    
    console.log('Finding voice from list, count:', voiceList.length, 'english:', englishVoices.length);
    console.log('Looking for:', preferredGender);
    
    if (preferredGender === 'female') {
      const femalePatterns = /female|woman|samantha|victoria|karen|moira|tessa|fiona|veena|zira|hazel|susan|linda|emily|emma|olivia|ava|sophia|isabella|mia|charlotte|amelia|harper|evelyn|abigail|ella|scarlett|grace|chloe|zoey|lily|aria|ellie|nora|riley|layla|penelope|camila|lucy|anna|brooklyn|leah|audrey|natalie|hannah|aurora|savannah|stella|bella/i;
      const femaleVoice = englishVoices.find(v => femalePatterns.test(v.name));
      if (femaleVoice) {
        console.log('Selected female voice:', femaleVoice.name);
        return femaleVoice;
      }
      const ziraVoice = englishVoices.find(v => v.name.toLowerCase().includes('zira'));
      if (ziraVoice) {
        console.log('Selected Zira voice:', ziraVoice.name);
        return ziraVoice;
      }
    } else {
      const malePatterns = /male|man|daniel|alex|fred|thomas|oliver|james|david|mark|george|richard|william|john|robert|michael|christopher|matthew|anthony|joshua|andrew|joseph|charles|steven|kevin|brian|edward|ronald|timothy|jason|jeffrey|ryan|jacob|nicholas|gary|eric|jonathan|stephen|larry|justin|scott|brandon|benjamin|samuel|gregory|patrick|frank|raymond|jack|dennis|jerry|tyler|aaron|jose|adam|nathan|henry|douglas|zachary|peter|kyle|noah|ethan|jeremy|walter|christian|keith|roger|terry|austin|sean|gerald|carl|dylan|harold|jordan|jesse|bryan|lawrence|arthur|gabriel|bruce|logan|billy|albert|joe|willie|alan|eugene|ralph|roy|louis|russell|philip|randy|johnny|vincent|bobby|dylan|howard/i;
      const maleVoice = englishVoices.find(v => malePatterns.test(v.name));
      if (maleVoice) {
        console.log('Selected male voice:', maleVoice.name);
        return maleVoice;
      }
      const davidVoice = englishVoices.find(v => v.name.toLowerCase().includes('david'));
      if (davidVoice) {
        console.log('Selected David voice:', davidVoice.name);
        return davidVoice;
      }
    }
    
    console.log('Using fallback voice');
    return englishVoices[0] || voiceList[0];
  }, []);

  const findVoice = useCallback((preferredGender: 'male' | 'female') => {
    return findVoiceFromList(voices, preferredGender);
  }, [voices, findVoiceFromList]);

  const speak = useCallback((text: string, settings: VoiceSettings = {}) => {
    if (!isSupported) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Wait for voices to be ready if they aren't yet
    const attemptSpeak = () => {
      const currentVoices = window.speechSynthesis.getVoices();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Apply settings
      utterance.pitch = settings.pitch ?? 1;
      utterance.rate = settings.rate ?? 1;
      utterance.volume = settings.volume ?? 1;

      // Set voice based on gender preference - use fresh voice list
      if (settings.voice && currentVoices.length > 0) {
        const selectedVoice = findVoiceFromList(currentVoices, settings.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log(`Speaking with voice: ${selectedVoice.name} (${settings.voice})`);
        }
      } else if (currentVoices.length > 0) {
        const englishVoices = currentVoices.filter(v => v.lang.startsWith('en'));
        if (englishVoices.length > 0) {
          utterance.voice = englishVoices[0];
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    // If voices aren't ready, wait a bit
    const currentVoices = window.speechSynthesis.getVoices();
    if (currentVoices.length === 0) {
      console.log('Voices not ready, waiting...');
      const waitForVoices = setInterval(() => {
        const v = window.speechSynthesis.getVoices();
        if (v.length > 0) {
          clearInterval(waitForVoices);
          attemptSpeak();
        }
      }, 50);
      // Timeout after 2 seconds
      setTimeout(() => clearInterval(waitForVoices), 2000);
    } else {
      attemptSpeak();
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.pause();
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.resume();
    }
  }, [isSupported]);

  const cancel = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  return {
    isSpeaking,
    isPaused,
    isSupported,
    speak,
    pause,
    resume,
    cancel,
    voices
  };
}
