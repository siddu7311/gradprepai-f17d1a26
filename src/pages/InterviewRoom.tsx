import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Phone,
  Sparkles,
  MessageSquare,
  Clock,
  Volume2,
  VolumeX,
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Footer } from '@/components/layout/Footer';
import { Helmet } from 'react-helmet-async';
import { useVoiceInterview, InterviewConfig } from '@/hooks/useVoiceInterview';
import { toast } from 'sonner';

const PERSONA_AVATARS = {
  amds: '👨‍💼',
  lusy: '👩‍💼'
};

const PERSONA_NAMES = {
  amds: 'AMDS',
  lusy: 'LUSY'
};

const PERSONA_DESCRIPTIONS = {
  amds: 'Professional, direct, technical-focused',
  lusy: 'Friendly, encouraging, thorough'
};

export default function InterviewRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const config = location.state as InterviewConfig | undefined;

  const {
    isLoading,
    isAISpeaking,
    isUserSpeaking,
    currentQuestion,
    questions,
    transcript,
    currentUserTranscript,
    interimTranscript,
    analyses,
    startInterview,
    startListening,
    stopListening,
    submitAnswer,
    nextQuestion,
    endInterview,
    isInterviewActive,
    error
  } = useVoiceInterview();

  // Redirect if no config
  useEffect(() => {
    if (!config) {
      toast.error('Please set up your interview first');
      navigate('/interview/setup');
    }
  }, [config, navigate]);

  // Timer
  useEffect(() => {
    if (!isInterviewActive) return;
    
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isInterviewActive]);

  // Start interview when component mounts with config
  useEffect(() => {
    if (config && !hasStarted && !isLoading) {
      setHasStarted(true);
      startInterview(config);
    }
  }, [config, hasStarted, isLoading, startInterview]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndInterview = async () => {
    // Save the current answer (if any) before ending
    if (currentUserTranscript.trim()) {
      await submitAnswer();
    }

    // Ensure the session is marked completed before navigating to results
    await endInterview();

    navigate('/interview/results', {
      state: {
        config,
        transcript,
        analyses,
        questions,
        elapsedTime
      }
    });
  };

  const handleMicToggle = () => {
    if (isUserSpeaking) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSubmitAnswer = async () => {
    if (currentUserTranscript.trim()) {
      await submitAnswer();
    }
  };

  const handleNextQuestion = async () => {
    // Auto-save the answer when the user moves forward (prevents empty result sessions)
    if (currentUserTranscript.trim()) {
      await submitAnswer();
    }

    if (currentQuestion < questions.length - 1) {
      nextQuestion();
    } else {
      await handleEndInterview();
    }
  };

  const persona = config?.interviewer || 'lusy';
  const avatarEmoji = PERSONA_AVATARS[persona];
  const personaName = PERSONA_NAMES[persona];
  const personaDesc = PERSONA_DESCRIPTIONS[persona];

  const lastAnalysis = analyses[analyses.length - 1];

  if (!config) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Interview Session - GradPrep AI</title>
        <meta name="description" content="Live AI interview session with voice interaction. Answer questions and get real-time feedback." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <AnimatedBackground />
        
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="font-display text-lg font-bold gradient-text">Interview Session</span>
                <Badge variant="outline" className="hidden sm:flex">
                  {config.role}
                </Badge>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{formatTime(elapsedTime)}</span>
                </div>
                {questions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Question</span>
                    <span className="font-semibold text-foreground">{currentQuestion + 1}/{questions.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
          {/* Main Interview Area */}
          <div className="flex-1 flex flex-col">
            {/* AI Interviewer Display */}
            <GlassCard className="flex-1 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
              {isLoading ? (
                <div className="text-center">
                  <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
                  <h2 className="font-display text-xl font-semibold mb-2">Preparing Your Interview</h2>
                  <p className="text-muted-foreground">Generating questions for {config.role}...</p>
                </div>
              ) : error ? (
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                  <h2 className="font-display text-xl font-semibold mb-2">Something Went Wrong</h2>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <GlowButton onClick={() => navigate('/interview/setup')}>
                    Try Again
                  </GlowButton>
                </div>
              ) : (
                <>
                  {/* AI Avatar */}
                  <motion.div
                    animate={isAISpeaking ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 1.5, repeat: isAISpeaking ? Infinity : 0 }}
                    className="relative"
                  >
                    <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center text-6xl ${
                      persona === 'amds' 
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-600' 
                        : 'bg-gradient-to-br from-primary to-secondary'
                    }`}>
                      {avatarEmoji}
                    </div>
                    {isAISpeaking && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-primary/30 -z-10"
                      />
                    )}
                  </motion.div>
                  
                  <h2 className="font-display text-2xl font-bold text-foreground mt-6 mb-2">
                    {personaName}
                  </h2>
                  <p className="text-muted-foreground mb-2">{personaDesc}</p>
                  <Badge variant="secondary" className="mb-4">
                    {config.difficulty} • {config.language}
                  </Badge>
                  
                  {isAISpeaking && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex items-center gap-1"
                    >
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: ['12px', '24px', '12px'] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                          className="w-1 bg-primary rounded-full"
                        />
                      ))}
                    </motion.div>
                  )}

                  {/* Speaking/Listening indicator */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    {isAISpeaking ? (
                      <>
                        <Volume2 className="w-5 h-5 text-primary animate-pulse" />
                        <span className="text-sm text-muted-foreground">Speaking...</span>
                      </>
                    ) : isUserSpeaking ? (
                      <>
                        <Mic className="w-5 h-5 text-secondary animate-pulse" />
                        <span className="text-sm text-muted-foreground">Listening to you...</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Ready</span>
                      </>
                    )}
                  </div>

                  {/* Last score indicator */}
                  {lastAnalysis && (
                    <div className="absolute bottom-4 right-4">
                      <Badge className={`${
                        lastAnalysis.score >= 7 ? 'bg-success' : 
                        lastAnalysis.score >= 5 ? 'bg-warning' : 'bg-destructive'
                      } text-white`}>
                        Last Score: {lastAnalysis.score}/10
                      </Badge>
                    </div>
                  )}
                </>
              )}
            </GlassCard>

            {/* User's Current Response */}
            {isInterviewActive && !isLoading && (
              <GlassCard className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Mic className={`w-4 h-4 ${isUserSpeaking ? 'text-secondary animate-pulse' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium">Your Response</span>
                </div>
                <div className="min-h-[60px] p-3 bg-muted/30 rounded-lg">
                  <p className="text-foreground">
                    {currentUserTranscript}
                    {interimTranscript && (
                      <span className="text-muted-foreground italic"> {interimTranscript}</span>
                    )}
                    {!currentUserTranscript && !interimTranscript && (
                      <span className="text-muted-foreground">
                        {isUserSpeaking ? 'Listening...' : 'Click the microphone to start speaking'}
                      </span>
                    )}
                  </p>
                </div>
              </GlassCard>
            )}

            {/* Controls */}
            {isInterviewActive && !isLoading && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleMicToggle}
                  disabled={isAISpeaking}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    isUserSpeaking 
                      ? 'bg-secondary text-secondary-foreground animate-pulse' 
                      : isAISpeaking
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'glass border border-glass-border/30 hover:border-primary'
                  }`}
                >
                  {isUserSpeaking ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </motion.button>

                {currentUserTranscript.trim() && !isUserSpeaking && (
                  <Button
                    onClick={handleSubmitAnswer}
                    variant="secondary"
                    size="lg"
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Submit Answer
                  </Button>
                )}

                <GlowButton onClick={handleNextQuestion} size="lg" disabled={isAISpeaking}>
                  {currentQuestion < questions.length - 1 ? 'Next Question' : 'End Interview'}
                </GlowButton>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleEndInterview}
                  className="w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <Phone className="w-6 h-6 rotate-[135deg]" />
                </motion.button>
              </div>
            )}
          </div>

          {/* Transcript Sidebar */}
          <div className="lg:w-96">
            <GlassCard className="h-full flex flex-col max-h-[600px]">
              <div className="flex items-center gap-2 pb-4 border-b border-border/50 mb-4">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Live Transcript</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4">
                <AnimatePresence>
                  {transcript.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${item.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm ${
                        item.role === 'ai' 
                          ? persona === 'amds'
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                            : 'bg-gradient-to-br from-primary to-secondary'
                          : 'bg-gradient-to-br from-secondary to-purple-600'
                      }`}>
                        {item.role === 'ai' ? avatarEmoji : '👤'}
                      </div>
                      <div className={`flex-1 p-3 rounded-xl ${
                        item.role === 'ai' 
                          ? 'bg-muted/50' 
                          : 'bg-primary/10'
                      }`}>
                        <p className="text-sm text-foreground">{item.text}</p>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {transcript.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Transcript will appear here</p>
                  </div>
                )}
              </div>

              {/* Score Summary */}
              {analyses.length > 0 && (
                <div className="pt-4 border-t border-border/50 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Average Score</span>
                    <span className="font-semibold">
                      {(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length).toFixed(1)}/10
                    </span>
                  </div>
                  <Progress 
                    value={(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length) * 10} 
                    className="h-2" 
                  />
                </div>
              )}
            </GlassCard>
          </div>
        </main>

        {/* Current Question Display */}
        {isInterviewActive && questions.length > 0 && !isLoading && (
          <div className="sticky bottom-0 bg-background/80 backdrop-blur-xl border-t border-border/50 py-4">
            <div className="container mx-auto px-4">
              <div className="glass rounded-xl p-4 max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-2">Current Question:</p>
                    <p className="text-foreground font-medium text-base md:text-lg leading-relaxed">{questions[currentQuestion]?.question}</p>
                  </div>
                  {questions[currentQuestion]?.hints && questions[currentQuestion].hints.length > 0 && (
                    <div className="w-full md:w-auto md:min-w-[280px] md:max-w-[320px] shrink-0">
                      <p className="text-xs text-muted-foreground mb-2">Hints:</p>
                      <div className="flex flex-wrap gap-1">
                        {questions[currentQuestion].hints.slice(0, 2).map((hint, i) => (
                          <Badge key={i} variant="outline" className="text-xs whitespace-normal text-left">
                            {hint}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <Footer />
      </div>
    </>
  );
}
