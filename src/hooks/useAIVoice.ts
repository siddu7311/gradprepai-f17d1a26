import { useCallback, useEffect, useRef, useState } from 'react';

export type VoicePersona = 'amds' | 'siddu' | 'lusy' | 'male' | 'female';

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

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const TTS_URL = `${SUPABASE_URL}/functions/v1/voice-tts`;
const SAMPLE_RATE = 24000;

const isFemalePersona = (persona: VoicePersona) => persona === 'lusy' || persona === 'female';

/**
 * Makes the spoken text pronounce our agent names correctly instead of
 * letting the engine spell them out awkwardly.
 */
export function humanizeForSpeech(text: string): string {
  return text
    .replace(/\bS\.?I\.?D\.?D\.?U\.?\b/gi, 'Siddu')
    .replace(/\bAMDS\b/gi, 'Siddu')
    .replace(/\bL\.?U\.?S\.?Y\.?\b/gi, 'Lucy')
    .replace(/\bLusy\b/g, 'Lucy')
    .replace(/\bA\.M\.D\.S\.?\b/gi, 'Siddu')
    .replace(/[*_#`]+/g, '');
}

/** One shared context keeps playback latency low across utterances. */
let sharedContext: AudioContext | null = null;
const getContext = () => {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedContext || sharedContext.state === 'closed') sharedContext = new Ctor({ sampleRate: SAMPLE_RATE });
  if (sharedContext.state === 'suspended') void sharedContext.resume().catch(() => {});
  return sharedContext;
};

const browserFallback = (text: string, persona: VoicePersona, onEnd: () => void) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
  const wantFemale = isFemalePersona(persona);
  const wanted = wantFemale
    ? /heera|kalpana|veena|neerja|female|woman|samantha|victoria|karen|zira|hazel|aria|jenny|emma|lily|natasha|google uk english female/i
    : /ravi|hemant|prabhat|male|man|daniel|alex|david|george|mark|guy|ryan|thomas|google uk english male/i;
  const unwanted = wantFemale
    ? /male|man|ravi|hemant|daniel|alex|david|george|mark|guy|ryan|thomas/i
    : /female|woman|heera|kalpana|veena|neerja|samantha|victoria|karen|zira|hazel|aria|jenny|emma|lily|natasha/i;
  const indianFirst = voices.filter((v) => /IN|india/i.test(`${v.lang} ${v.name}`));
  const pick = (list: SpeechSynthesisVoice[]) =>
    list.find((v) => wanted.test(v.name) && !unwanted.test(v.name.replace(wanted, ''))) ||
    list.find((v) => wanted.test(v.name));
  utterance.voice = pick(indianFirst) || pick(voices) || voices.find((v) => !unwanted.test(v.name)) || voices[0] || null;
  // Keep the gender readable even if the browser only offers one voice.
  utterance.pitch = wantFemale ? 1.3 : 0.8;
  utterance.rate = 1;
  utterance.volume = 1;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
};

const base64ToBytes = (b64: string) => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

export function useAIVoice(): UseAIVoiceResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    requestIdRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    if (endTimerRef.current) {
      clearTimeout(endTimerRef.current);
      endTimerRef.current = null;
    }
    sourcesRef.current.forEach((s) => {
      try {
        s.stop();
        s.disconnect();
      } catch {
        /* already finished */
      }
    });
    sourcesRef.current = [];
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
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
      const context = getContext();

      setIsLoading(true);
      setIsSpeaking(true);

      const finish = () => {
        if (requestId !== requestIdRef.current) return;
        setIsSpeaking(false);
        setIsLoading(false);
      };

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        if (!context) throw new Error('No audio context');

        const response = await fetch(TTS_URL, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({ text, persona, speed: options.speed ?? 1, stream: true }),
        });

        if (!response.ok || !response.body) throw new Error(`TTS failed: ${response.status}`);
        if (requestId !== requestIdRef.current) return;

        let playhead = 0;
        let pending = new Uint8Array(0);

        const schedule = (incoming: Uint8Array) => {
          const merged = new Uint8Array(pending.length + incoming.length);
          merged.set(pending);
          merged.set(incoming, pending.length);
          const usable = merged.length - (merged.length % 2);
          pending = merged.slice(usable);
          if (usable === 0) return;
          const samples = new Int16Array(merged.buffer, 0, usable / 2);
          const floats = Float32Array.from(samples, (s) => s / 32768);
          const buffer = context.createBuffer(1, floats.length, SAMPLE_RATE);
          buffer.copyToChannel(floats, 0);
          const source = context.createBufferSource();
          source.buffer = buffer;
          source.connect(context.destination);
          playhead = playhead === 0 ? context.currentTime + 0.06 : Math.max(playhead, context.currentTime);
          source.start(playhead);
          playhead += buffer.duration;
          sourcesRef.current.push(source);
        };

        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        let sseBuffer = '';
        let firstChunk = true;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (requestId !== requestIdRef.current) return;
          sseBuffer += value;
          const events = sseBuffer.split('\n\n');
          sseBuffer = events.pop() ?? '';
          for (const event of events) {
            const line = event.split('\n').find((l) => l.startsWith('data:'));
            if (!line) continue;
            const payloadText = line.slice(5).trim();
            if (!payloadText || payloadText === '[DONE]') continue;
            let payload: { type?: string; audio?: string };
            try {
              payload = JSON.parse(payloadText);
            } catch {
              continue;
            }
            if (payload.type === 'speech.audio.delta' && payload.audio) {
              if (firstChunk) {
                firstChunk = false;
                setIsLoading(false);
              }
              schedule(base64ToBytes(payload.audio));
            }
          }
        }

        if (requestId !== requestIdRef.current) return;
        if (firstChunk) throw new Error('No audio streamed');

        // Keep "speaking" true until the last scheduled chunk has actually played.
        const remainingMs = Math.max(0, (playhead - context.currentTime) * 1000) + 120;
        await new Promise<void>((resolve) => {
          endTimerRef.current = setTimeout(() => {
            endTimerRef.current = null;
            resolve();
          }, remainingMs);
        });
        finish();
      } catch (err) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;
        console.warn('Streaming TTS unavailable, using browser voice:', err);
        setIsLoading(false);
        await new Promise<void>((resolve) => browserFallback(text, persona, () => {
          finish();
          resolve();
        }));
      }
    },
    [cancel],
  );

  return { isSpeaking, isLoading, speak, cancel };
}
