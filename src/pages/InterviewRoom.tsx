import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Phone, Sparkles, Clock, Volume2, Loader2, AlertCircle, PauseCircle } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { useVoiceInterview, InterviewConfig } from '@/hooks/useVoiceInterview';
import { toast } from 'sonner';

const PERSONA = {
  amds: { name: 'SIDDU', avatar: '👨‍💼', desc: 'Your interviewer', ring: 'from-blue-500 to-cyan-600' },
  lusy: { name: 'LUSY', avatar: '👩‍💼', desc: 'Your interviewer', ring: 'from-primary to-secondary' },
};

export default function InterviewRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const [elapsedTime, setElapsedTime] = useState(0);
  const startedRef = useRef(false);

  const config = location.state as InterviewConfig | undefined;

  const {
    isLoading,
    error,
    status,
    isAISpeaking,
    isUserSpeaking,
    isPaused,
    liveText,
    isInterviewActive,
    isFinished,
    transcript,
    analyses,
    questions,
    startInterview,
    endInterview,
  } = useVoiceInterview();

  useEffect(() => {
    if (!config) {
      toast.error('Please set up your interview first');
      navigate('/interview/setup');
    }
  }, [config, navigate]);

  useEffect(() => {
    if (!isInterviewActive) return;
    const timer = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isInterviewActive]);

  useEffect(() => {
    if (config && !startedRef.current) {
      startedRef.current = true;
      void startInterview(config);
    }
  }, [config, startInterview]);

  const finish = async () => {
    await endInterview();
    navigate('/interview/results', {
      state: { config, transcript, analyses, questions, elapsedTime },
    });
  };

  // When the interviewer has wrapped up, move to results once they stop talking.
  useEffect(() => {
    if (isFinished && !isAISpeaking) {
      const t = setTimeout(() => void finish(), 800);
      return () => clearTimeout(t);
    }
  }, [isFinished, isAISpeaking]);

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  if (!config) return null;

  const persona = PERSONA[config.interviewer || 'lusy'];

  const statusLabel = isLoading
    ? 'Getting ready...'
    : isPaused
      ? 'Paused — say "continue" when you are ready'
      : status === 'speaking'
        ? `${persona.name} is speaking...`
        : status === 'thinking'
          ? 'Thinking about your answer...'
          : status === 'listening'
            ? 'Listening to you — just keep talking'
            : 'Ready';

  return (
    <>
      <Helmet>
        <title>Interview Session - GradPrep AI</title>
        <meta name="description" content="Live AI voice interview with SIDDU or LUSY — talk naturally and get honest feedback." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <AnimatedBackground />

        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="font-display text-lg font-bold gradient-text">Interview Session</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(elapsedTime)}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-10 flex items-center justify-center">
          <GlassCard className="w-full max-w-2xl flex flex-col items-center justify-center py-14 text-center">
            {isLoading ? (
              <>
                <Loader2 className="w-14 h-14 text-primary animate-spin mb-4" />
                <h2 className="font-display text-xl font-semibold mb-1">Preparing your interview</h2>
                <p className="text-muted-foreground">{persona.name} is getting your questions ready...</p>
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-14 h-14 text-destructive mb-4" />
                <h2 className="font-display text-xl font-semibold mb-2">Something went wrong</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <GlowButton onClick={() => navigate('/interview/setup')}>Try Again</GlowButton>
              </>
            ) : (
              <>
                <motion.div
                  animate={isAISpeaking ? { scale: [1, 1.06, 1] } : {}}
                  transition={{ duration: 1.4, repeat: isAISpeaking ? Infinity : 0 }}
                  className="relative"
                >
                  <div
                    className={`w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center text-7xl bg-gradient-to-br ${persona.ring}`}
                  >
                    {persona.avatar}
                  </div>
                  {(isAISpeaking || isUserSpeaking) && (
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], opacity: [0.45, 0.8, 0.45] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                      className={`absolute inset-0 rounded-full -z-10 ${isAISpeaking ? 'bg-primary/30' : 'bg-secondary/30'}`}
                    />
                  )}
                </motion.div>

                <h2 className="font-display text-3xl font-bold gradient-text mt-6">{persona.name}</h2>
                <p className="text-muted-foreground">{persona.desc}</p>

                <Badge variant="secondary" className="mt-3">
                  {config.role}
                </Badge>

                <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground min-h-[24px]">
                  {isPaused ? (
                    <PauseCircle className="w-4 h-4 text-warning" />
                  ) : isAISpeaking ? (
                    <Volume2 className="w-4 h-4 text-primary animate-pulse" />
                  ) : (
                    <Mic className={`w-4 h-4 ${isUserSpeaking ? 'text-secondary animate-pulse' : ''}`} />
                  )}
                  <span>{statusLabel}</span>
                </div>

                {liveText && (
                  <p className="mt-4 max-w-lg text-sm text-foreground/70 italic">{liveText}</p>
                )}

                <p className="mt-8 text-xs text-muted-foreground max-w-md">
                  Just talk naturally — {persona.name} replies on their own. Say “{persona.name.toLowerCase()}, stop for a
                  second” to pause and “continue” to carry on.
                </p>

                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => void finish()}
                  className="mt-8 w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  aria-label="End interview"
                >
                  <Phone className="w-6 h-6 rotate-[135deg]" />
                </motion.button>
              </>
            )}
          </GlassCard>
        </main>
      </div>
    </>
  );
}
