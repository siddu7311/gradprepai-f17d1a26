import { useCallback, useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useAIVoice, VoicePersona } from './useAIVoice';

export type ConversationStatus = 'idle' | 'speaking' | 'listening' | 'thinking' | 'paused';

interface UseVoiceConversationOptions {
  persona: VoicePersona;
  /** Given what the user just said, return what the assistant should say back. */
  getReply: (userText: string) => Promise<string>;
  onUserSpeech?: (text: string) => void;
  onAssistantSpeech?: (text: string) => void;
  /** How long a pause in speech means "the user finished their turn". */
  silenceMs?: number;
  pausedPhrase?: string;
  resumedPhrase?: string;
}

/** Short utterances like "siddu stop for a second" / "lusy wait" pause the session. */
const PAUSE_RE =
  /\b(stop|pause|hold on|hold up|wait|one (sec|second|minute)|ek (minute|second)|ruko|rukiye|thodi der)\b/i;
const RESUME_RE =
  /\b(continue|resume|carry on|go ahead|go on|start again|next question|i'?m ready|ready now|chalo|shuru)\b/i;
/** Said while the agent is talking, these cut it off immediately (barge-in). */
const INTERRUPT_RE =
  /\b(lusy|lucy|siddu|sidhu|amds)?\s*(stop|wait|pause|hold on|ruko|one second|repeat|say (that )?again|repeat the question)\b/i;

export function useVoiceConversation(options: UseVoiceConversationOptions) {
  const { silenceMs = 1800 } = options;

  const [status, setStatus] = useState<ConversationStatus>('idle');
  const [isActive, setIsActive] = useState(false);
  const [liveText, setLiveText] = useState('');

  const optionsRef = useRef(options);
  optionsRef.current = options;
  const personaRef = useRef<VoicePersona>(options.persona);
  personaRef.current = options.persona;

  const activeRef = useRef(false);
  const pausedRef = useRef(false);
  const busyRef = useRef(false);
  const speakingRef = useRef(false);
  const lastSpokenRef = useRef('');
  const bufferRef = useRef('');
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const takeTurnRef = useRef<() => void>(() => {});
  const wasSpeakingRef = useRef(false);

  const { speak, cancel, isSpeaking } = useAIVoice();
  speakingRef.current = isSpeaking;

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const scheduleTurn = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => takeTurnRef.current(), silenceMs);
  }, [silenceMs]);

  const handleResult = useCallback(
    (text: string) => {
      if (!activeRef.current) return;

      // While the agent is talking, only listen for an interrupt ("lusy stop").
      if (speakingRef.current) {
        const echo = lastSpokenRef.current.toLowerCase().includes(text.trim().toLowerCase());
        if (!echo && INTERRUPT_RE.test(text)) {
          cancel();
          bufferRef.current = '';
          setLiveText('');
          setStatus('listening');
        }
        return;
      }

      if (busyRef.current) return;
      bufferRef.current = `${bufferRef.current} ${text}`.trim();
      setLiveText(bufferRef.current);
      scheduleTurn();
    },
    [cancel, scheduleTurn],
  );

  const {
    isListening,
    interimTranscript,
    startListening: startRecognition,
    stopListening: stopRecognition,
    resetTranscript,
    isSupported,
  } = useSpeechRecognition({ onResult: handleResult, continuous: true, interimResults: true });

  // Keep the turn alive while the user is still mid-sentence.
  useEffect(() => {
    if (interimTranscript && activeRef.current && !busyRef.current && !speakingRef.current) scheduleTurn();
  }, [interimTranscript, scheduleTurn]);

  const beginListening = useCallback(() => {
    if (!activeRef.current || !isSupported) return;
    bufferRef.current = '';
    setLiveText('');
    resetTranscript();
    startRecognition();
    setStatus(pausedRef.current ? 'paused' : 'listening');
  }, [isSupported, resetTranscript, startRecognition]);

  const say = useCallback(
    async (text: string) => {
      if (!text) return;
      clearSilenceTimer();
      bufferRef.current = '';
      setLiveText('');
      lastSpokenRef.current = text;
      optionsRef.current.onAssistantSpeech?.(text);
      setStatus('speaking');
      // The mic stays on so the user can cut in with "lusy stop".
      if (activeRef.current && isSupported) startRecognition();
      await speak(text, { persona: personaRef.current, speed: 1 });
    },
    [speak, isSupported, startRecognition],
  );

  // When the assistant finishes speaking, hand the mic back automatically.
  useEffect(() => {
    const wasSpeaking = wasSpeakingRef.current;
    wasSpeakingRef.current = isSpeaking;

    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }

    if (wasSpeaking && !isSpeaking && activeRef.current && !busyRef.current) {
      resumeTimerRef.current = setTimeout(() => {
        if (activeRef.current && !busyRef.current) beginListening();
      }, 250);
    }
  }, [isSpeaking, beginListening]);

  takeTurnRef.current = () => {
    clearSilenceTimer();
    const text = bufferRef.current.trim();
    bufferRef.current = '';
    setLiveText('');
    if (!text || !activeRef.current || busyRef.current) return;

    const words = text.split(/\s+/).filter(Boolean);
    const isShort = words.length <= 10;

    void (async () => {
      if (pausedRef.current) {
        if (RESUME_RE.test(text)) {
          pausedRef.current = false;
          await say(optionsRef.current.resumedPhrase ?? "Perfect, let's continue where we left off.");
        }
        return;
      }

      if (isShort && PAUSE_RE.test(text)) {
        pausedRef.current = true;
        await say(
          optionsRef.current.pausedPhrase ??
            "Sure, take your time. Just say continue whenever you're ready.",
        );
        return;
      }

      if (words.length < 2) {
        // Too little to act on — keep listening.
        return;
      }

      busyRef.current = true;
      setStatus('thinking');
      optionsRef.current.onUserSpeech?.(text);
      try {
        const reply = await optionsRef.current.getReply(text);
        busyRef.current = false;
        if (activeRef.current) await say(reply);
      } catch (err) {
        console.error('[voice-conversation] reply failed', err);
        busyRef.current = false;
        if (activeRef.current) await say('Sorry, I missed that. Could you say it once more?');
      }
    })();
  };

  const start = useCallback(
    async (intro?: string) => {
      activeRef.current = true;
      pausedRef.current = false;
      busyRef.current = false;
      setIsActive(true);
      if (intro) {
        await say(intro);
      } else {
        beginListening();
      }
    },
    [say, beginListening],
  );

  const stop = useCallback(() => {
    activeRef.current = false;
    pausedRef.current = false;
    busyRef.current = false;
    bufferRef.current = '';
    clearSilenceTimer();
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    cancel();
    stopRecognition();
    setLiveText('');
    setIsActive(false);
    setStatus('idle');
  }, [cancel, stopRecognition]);

  useEffect(() => stop, [stop]);

  return {
    status,
    isActive,
    isPaused: status === 'paused',
    isSpeaking,
    isListening,
    liveText,
    isSupported,
    start,
    stop,
    say,
  };
}
