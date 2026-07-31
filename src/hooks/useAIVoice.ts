import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type VoicePersona = 'amds' | 'lusy' | 'male' | 'female';

interface SpeakOptions {
  persona?: VoicePersona;
  speed?: number;
}

interface UseAIVoiceResult {
  isSpeaking: boolean;
  isLoading: boolean;
  speak: (text: string, options?: SpeakOptions) => Promise<void>;
  cancel: () => void;
}

/**
 * Makes the spoken text pronounce our agent names correctly instead of
 * letting the engine spell them out awkwardly.
 */
export function humanizeForSpeech(text: string): string {
  return text
    .replace(/\bAMDS\b/g, 'Amdis')
    .replace(/\bLUSY\b/g, 'Lucy')
    .replace(/\bA\.M\.D\.S\.?\b/g, 'Amdis');
}

const browserFallback = (text: string, persona: VoicePersona, onEnd: () => void) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
  const wantFemale = persona === 'lusy' || persona === 'female';
  const pattern = wantFemale
    ? /female|woman|samantha|victoria|karen|zira|hazel|aria|jenny|emma|lily|natasha/i
    : /male|man|daniel|alex|david|george|mark|guy|ryan|thomas/i;
  utterance.voice = voices.find((v) => pattern.test(v.name)) || voices[0] || null;
  utterance.pitch = wantFemale ? 1.15 : 0.95;
  utterance.rate = 0.98;
  utterance.volume = 1;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
};

export function useAIVoice(): UseAIVoiceResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestIdRef = useRef(0);

  const cancel = useCallback(() => {
    requestIdRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  useEffect(() => cancel, [cancel]);

  const speak = useCallback(
    async (rawText: string, options: SpeakOptions = {}) => {
      const text = humanizeForSpeech((rawText || '').trim());
      if (!text) return;

      cancel();
      const requestId = requestIdRef.current;
      const persona = options.persona ?? 'lusy';

      setIsLoading(true);
      setIsSpeaking(true);

      const finish = () => {
        if (requestId !== requestIdRef.current) return;
        setIsSpeaking(false);
        setIsLoading(false);
      };

      try {
        const { data, error } = await supabase.functions.invoke('voice-tts', {
          body: { text, persona, speed: options.speed ?? 1 },
        });

        if (requestId !== requestIdRef.current) return;
        if (error || !data?.audioContent) throw error || new Error('No audio returned');

        const audio = new Audio(`data:${data.mimeType || 'audio/mpeg'};base64,${data.audioContent}`);
        audioRef.current = audio;
        audio.onended = finish;
        audio.onerror = finish;
        setIsLoading(false);
        await audio.play();
      } catch (err) {
        console.warn('Cloud TTS unavailable, using browser voice:', err);
        if (requestId !== requestIdRef.current) return;
        setIsLoading(false);
        browserFallback(text, persona, finish);
      }
    },
    [cancel],
  );

  return { isSpeaking, isLoading, speak, cancel };
}
