import { useCallback, useRef, useState } from 'react';
import { Mic, MicOff, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useVoiceConversation } from '@/hooks/useVoiceConversation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LusyVoiceAssistantProps {
  onClose: () => void;
}

type VoiceMessage = { role: 'user' | 'assistant'; content: string };

const GREETING = 'Hey there, I am Lusy, your assistant. How can I help you today?';

export default function LusyVoiceAssistant({ onClose }: LusyVoiceAssistantProps) {
  const [history, setHistory] = useState<VoiceMessage[]>([]);
  const historyRef = useRef<VoiceMessage[]>([]);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const remember = useCallback((message: VoiceMessage) => {
    historyRef.current = [...historyRef.current, message].slice(-12);
    setHistory(historyRef.current);
  }, []);

  const getReply = useCallback(async (text: string) => {
    const messages = [...historyRef.current, { role: 'user' as const, content: text }];
    remember({ role: 'user', content: text });
    const { data, error } = await supabase.functions.invoke('lusy-chat', { body: { messages } });
    if (error || !data?.message) throw new Error('LUSY could not respond');
    const reply = String(data.message);
    remember({ role: 'assistant', content: reply });
    return reply;
  }, [remember]);

  const voice = useVoiceConversation({
    persona: 'lusy',
    silenceMs: 1100,
    getReply,
  });

  const toggle = async () => {
    if (loading) return;
    if (!user) {
      toast.error('Please sign in to talk with LUSY.');
      navigate('/signin');
      return;
    }
    if (!voice.isSupported) {
      toast.error('Voice conversations are not supported in this browser.');
      return;
    }
    if (voice.isActive) voice.stop();
    else await voice.start(GREETING);
  };

  const status = voice.status === 'speaking'
    ? 'Speaking — say “stop” anytime'
    : voice.status === 'thinking'
      ? 'Thinking…'
      : voice.status === 'paused'
        ? 'Paused — say “continue”'
        : voice.isActive
          ? 'Listening in any language'
          : 'Tap once for a hands-free conversation';

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-xl" aria-label="LUSY voice assistant">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">LUSY</h2>
            <p className="text-xs text-muted-foreground">Multilingual voice assistant</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close LUSY">
          <X />
        </Button>
      </header>

      <div className="flex min-h-56 flex-col items-center justify-center gap-5 p-6 text-center">
        <Button
          size="icon"
          variant={voice.isActive ? 'default' : 'outline'}
          onClick={() => void toggle()}
          disabled={loading}
          className="h-20 w-20 rounded-full"
          aria-label={voice.isActive ? 'End voice conversation' : 'Start voice conversation'}
        >
          {voice.isActive ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
        </Button>
        <div className="space-y-1">
          <p className="font-medium text-foreground">{status}</p>
          {voice.liveText && <p className="line-clamp-2 text-sm text-muted-foreground">“{voice.liveText}”</p>}
          {!voice.liveText && history.length > 0 && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{history[history.length - 1].content}</p>
          )}
        </div>
      </div>
    </section>
  );
}