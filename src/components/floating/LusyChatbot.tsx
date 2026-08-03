import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAIVoice } from '@/hooks/useAIVoice';
import { useVoiceConversation } from '@/hooks/useVoiceConversation';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isVoice?: boolean;
}

interface LusyChatbotProps {
  onClose: () => void;
}

const GREETING = "Hey there, I am Lusy, your assistant. How can I help you today?";

const LusyChatbot = ({ onClose }: LusyChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: GREETING },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<Message[]>(messages);
  historyRef.current = messages;

  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { speak, cancel, isSpeaking: isPlayingOne } = useAIVoice();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  /** Ask LUSY for a reply, using the full conversation so far. */
  const askLusy = useCallback(async (text: string): Promise<string> => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const { data, error } = await supabase.functions.invoke('lusy-chat', {
      headers: { Authorization: `Bearer ${token}` },
      body: {
        messages: [...historyRef.current, { id: 'x', role: 'user' as const, content: text }].map((m) => ({
          role: m.role,
          content: m.content,
        })),
      },
    });

    if (error) throw new Error('Chat service returned an error');
    if (data?.error) throw new Error(String(data.error));
    if (!data?.message) throw new Error('No response received from AI');
    return String(data.message);
  }, []);

  const pushMessage = useCallback((role: 'user' | 'assistant', content: string, isVoice = false) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, role, content, isVoice }]);
  }, []);

  // Hands-free voice assistant: tap the mic once and just keep talking.
  const voice = useVoiceConversation({
    persona: 'lusy',
    silenceMs: 1800,
    getReply: askLusy,
    onUserSpeech: (text) => pushMessage('user', text, true),
    onAssistantSpeech: (text) => {
      const last = historyRef.current[historyRef.current.length - 1];
      if (!(last?.role === 'assistant' && last.content === text)) pushMessage('assistant', text);
    },
    pausedPhrase: "Sure, take your time. Say continue whenever you're ready.",
    resumedPhrase: "Great, I'm listening.",
  });

  const handleSend = async (text?: string) => {
    if (authLoading) return;
    const messageText = (text ?? input).trim();
    if (!messageText || isLoading) return;

    pushMessage('user', messageText);
    setInput('');
    setIsLoading(true);
    try {
      const reply = await askLusy(messageText);
      pushMessage('assistant', reply);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error("I'm having trouble responding right now. Please try again in a moment.");
      pushMessage('assistant', "I'm sorry, I'm having trouble responding right now. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceChat = async () => {
    if (authLoading) return;
    if (!user) {
      toast.error('Please sign in to use voice chat.');
      navigate('/signin');
      return;
    }
    if (!voice.isSupported) {
      toast.error('Voice chat is not supported in this browser.');
      return;
    }
    if (voice.isActive) {
      voice.stop();
      return;
    }
    cancel();
    await voice.start(GREETING);
  };

  const handleSpeak = (text: string) => {
    if (isPlayingOne) cancel();
    else void speak(text, { persona: 'lusy' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const voiceLabel = voice.isPaused
    ? 'Paused — say “continue”'
    : voice.status === 'speaking'
      ? 'LUSY is speaking...'
      : voice.status === 'thinking'
        ? 'Thinking...'
        : voice.status === 'listening'
          ? 'Listening — just talk'
          : '';

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">L</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">LUSY</h3>
            <p className="text-xs text-muted-foreground">
              {voice.isActive ? voiceLabel || 'Voice assistant on' : 'AI Voice Assistant'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="h-80 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.role === 'assistant' && !voice.isActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-6 px-2 text-xs opacity-70 hover:opacity-100"
                    onClick={() => handleSpeak(message.content)}
                  >
                    <Volume2 className={`w-3 h-3 mr-1 ${isPlayingOne ? 'text-primary' : ''}`} />
                    {isPlayingOne ? 'Stop' : 'Listen'}
                  </Button>
                )}
                {message.isVoice && <span className="text-xs opacity-60 ml-2">🎤</span>}
              </div>
            </div>
          ))}
          {voice.liveText && (
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl px-4 py-2 bg-primary/10 text-foreground italic text-sm">
                {voice.liveText}
              </div>
            </div>
          )}
          {(isLoading || voice.status === 'thinking') && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-foreground/60" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border space-y-2">
        {voice.isActive && (
          <p className="text-xs text-center text-muted-foreground">
            Hands-free mode on — speak in any language. Say “stop for a second” to pause.
          </p>
        )}
        <div className="flex gap-2">
          <Button
            variant={voice.isActive ? 'default' : 'outline'}
            size="icon"
            onClick={() => void toggleVoiceChat()}
            disabled={authLoading}
            className={voice.isActive ? 'animate-pulse' : ''}
            aria-label={voice.isActive ? 'Stop voice chat' : 'Start voice chat'}
          >
            {voice.isActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={voice.isActive ? 'Voice chat is on...' : 'Type or tap the mic...'}
            disabled={authLoading || isLoading || voice.isActive}
            className="flex-1"
          />
          <Button
            onClick={() => void handleSend()}
            disabled={!input.trim() || isLoading || voice.isActive}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LusyChatbot;
