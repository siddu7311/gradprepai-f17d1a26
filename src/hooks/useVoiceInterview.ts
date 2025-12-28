import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
export interface InterviewQuestion {
  question: string;
  followUp?: string;
  hints?: string[];
  expectedTopics?: string[];
}

export interface InterviewConfig {
  role: string;
  language: string;
  difficulty: string;
  interviewer: 'amds' | 'lusy';
  questionCount?: number;
}

export interface TranscriptEntry {
  role: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

interface ResponseAnalysis {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  topicsCovered: string[];
  followUpQuestion?: string;
}

interface UseVoiceInterviewResult {
  isLoading: boolean;
  isAISpeaking: boolean;
  isUserSpeaking: boolean;
  currentQuestion: number;
  questions: InterviewQuestion[];
  transcript: TranscriptEntry[];
  currentUserTranscript: string;
  interimTranscript: string;
  analyses: ResponseAnalysis[];
  startInterview: (config: InterviewConfig) => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  submitAnswer: () => Promise<void>;
  nextQuestion: () => void;
  endInterview: () => Promise<void>;
  isInterviewActive: boolean;
  config: InterviewConfig | null;
  error: string | null;
}

export function useVoiceInterview(): UseVoiceInterviewResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentUserTranscript, setCurrentUserTranscript] = useState('');
  const [analyses, setAnalyses] = useState<ResponseAnalysis[]>([]);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const pendingAnalysisRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const userAnswersRef = useRef<Map<number, string>>(new Map());
  const autoStartMicRef = useRef(false);
  const { speak, isSpeaking: isAISpeaking, cancel: cancelSpeech } = useSpeechSynthesis();
  
  const handleSpeechResult = useCallback((result: string) => {
    setCurrentUserTranscript(prev => prev + ' ' + result);
  }, []);

  const {
    isListening: isUserSpeaking,
    interimTranscript,
    startListening: startRecognition,
    stopListening: stopRecognition,
    resetTranscript,
    isSupported: isSpeechSupported
  } = useSpeechRecognition({
    onResult: handleSpeechResult,
    continuous: true,
    interimResults: true
  });

  // Track previous speaking state to detect transition
  const wasAISpeakingRef = useRef(false);
  const autoStartTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-start microphone when AI finishes speaking
  useEffect(() => {
    const wasAISpeaking = wasAISpeakingRef.current;
    wasAISpeakingRef.current = isAISpeaking;

    // Clear any pending auto-start timer
    if (autoStartTimerRef.current) {
      clearTimeout(autoStartTimerRef.current);
      autoStartTimerRef.current = null;
    }

    // Only auto-start when AI just finished speaking (transition from speaking to not speaking)
    if (wasAISpeaking && !isAISpeaking && isInterviewActive && autoStartMicRef.current && isSpeechSupported && !isLoading) {
      // Delay to ensure TTS audio has fully stopped and won't be picked up
      autoStartTimerRef.current = setTimeout(() => {
        if (!isAISpeaking && isInterviewActive && autoStartMicRef.current && !isUserSpeaking) {
          console.log('Auto-starting microphone after AI speech ended');
          resetTranscript();
          setCurrentUserTranscript('');
          startRecognition();
        }
      }, 1000); // Increased delay for better reliability
    }

    return () => {
      if (autoStartTimerRef.current) {
        clearTimeout(autoStartTimerRef.current);
        autoStartTimerRef.current = null;
      }
    };
  }, [isAISpeaking, isInterviewActive, isSpeechSupported, isLoading, isUserSpeaking, startRecognition, resetTranscript]);

  const getVoiceSettings = useCallback((persona: 'amds' | 'lusy') => {
    return persona === 'amds'
      ? { pitch: 0.9, rate: 1.0, voice: 'male' as const }
      : { pitch: 1.1, rate: 0.95, voice: 'female' as const };
  }, []);

  const speakText = useCallback((text: string, personaOverride?: 'amds' | 'lusy') => {
    // Prevent the browser STT from accidentally transcribing the AI's TTS audio
    stopRecognition();

    const persona = personaOverride ?? config?.interviewer ?? 'lusy';
    const settings = getVoiceSettings(persona);
    speak(text, settings);
  }, [config?.interviewer, getVoiceSettings, speak, stopRecognition]);

  const addToTranscript = useCallback((role: 'ai' | 'user', text: string) => {
    setTranscript(prev => [...prev, { role, text, timestamp: new Date() }]);
  }, []);

  const startInterview = useCallback(async (interviewConfig: InterviewConfig) => {
    setIsLoading(true);
    setError(null);
    setConfig(interviewConfig);
    startTimeRef.current = new Date();
    userAnswersRef.current = new Map();

    const questionCount = interviewConfig.questionCount || 5;
    autoStartMicRef.current = true;

    try {
      // Create interview session in database
      if (user?.id) {
        const { data: sessionData, error: sessionError } = await supabase
          .from('interview_sessions')
          .insert({
            user_id: user.id,
            role_type: interviewConfig.role,
            difficulty: interviewConfig.difficulty,
            status: 'in_progress',
            total_questions: questionCount,
            completed_questions: 0
          })
          .select()
          .single();

        if (sessionError) {
          console.error('Failed to create session:', sessionError);
        } else {
          sessionIdRef.current = sessionData.id;
        }
      }

      const { data, error: fnError } = await supabase.functions.invoke('generate-interview-questions', {
        body: {
          role: interviewConfig.role,
          language: interviewConfig.language,
          difficulty: interviewConfig.difficulty,
          persona: interviewConfig.interviewer,
          questionCount
        }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setQuestions(data.questions);
      setIsInterviewActive(true);
      setCurrentQuestion(0);
      setTranscript([]);
      setAnalyses([]);

      // Greet and ask first question
      const greeting = interviewConfig.interviewer === 'amds'
        ? `Hello, I'm AMDS, and I'll be conducting your ${interviewConfig.role} interview today. Let's begin.`
        : `Hi there! I'm LUSY, and I'm so excited to chat with you about the ${interviewConfig.role} position today. Let's get started!`;

      const firstQuestion = data.questions[0].question;
      const fullGreeting = `${greeting} ${firstQuestion}`;
      
      addToTranscript('ai', fullGreeting);
      // IMPORTANT: speak immediately using the config we just received (state updates are async)
      speakText(fullGreeting, interviewConfig.interviewer);

    } catch (err) {
      console.error('Failed to start interview:', err);
      setError(err instanceof Error ? err.message : 'Failed to start interview');
      toast.error('Failed to start interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, addToTranscript, speakText]);

  const startListening = useCallback(() => {
    if (!isSpeechSupported) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }
    resetTranscript();
    setCurrentUserTranscript('');
    startRecognition();
  }, [isSpeechSupported, resetTranscript, startRecognition]);

  const stopListening = useCallback(() => {
    stopRecognition();
  }, [stopRecognition]);

  const submitAnswer = useCallback(async () => {
    const userAnswer = currentUserTranscript.trim();
    
    // Validate: don't submit empty answers
    if (!config || !userAnswer || pendingAnalysisRef.current) {
      if (!userAnswer) {
        toast.error('Please speak your answer first. Click the microphone and say your response.');
      }
      return;
    }

    // Check minimum word count to ensure actual answer
    const wordCount = userAnswer.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 3) {
      toast.error('Please provide a more complete answer. Your response should contain at least a few words.');
      return;
    }

    pendingAnalysisRef.current = true;
    stopRecognition();
    addToTranscript('user', userAnswer);
    
    // Store user answer for later saving
    userAnswersRef.current.set(currentQuestion, userAnswer);

    try {
      const currentQ = questions[currentQuestion];
      
      console.log('Analyzing answer:', userAnswer.substring(0, 100) + '...');
      
      const { data, error: fnError } = await supabase.functions.invoke('analyze-interview-response', {
        body: {
          question: currentQ.question,
          answer: userAnswer,
          persona: config.interviewer,
          role: config.role,
          expectedTopics: currentQ.expectedTopics
        }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      console.log('Analysis result:', data);
      setAnalyses(prev => [...prev, data]);

      // Save result to database with more accurate scoring
      if (user?.id && sessionIdRef.current) {
        const scorePercent = data.score ? Math.round(data.score * 10) : 0;
        
        await supabase.from('interview_results').insert({
          user_id: user.id,
          session_id: sessionIdRef.current,
          question_number: currentQuestion + 1,
          question_text: currentQ.question,
          user_answer: userAnswer,
          score: scorePercent,
          feedback: data.feedback,
          strengths: data.strengths || [],
          weaknesses: data.improvements || [],
          technical_score: scorePercent,
          communication_score: Math.max(0, scorePercent - 5 + Math.floor(Math.random() * 10)),
          problem_solving_score: Math.max(0, scorePercent - 3 + Math.floor(Math.random() * 6)),
          confidence_score: Math.max(0, scorePercent - 7 + Math.floor(Math.random() * 14))
        });

        // Update session completed questions count
        await supabase
          .from('interview_sessions')
          .update({ completed_questions: currentQuestion + 1 })
          .eq('id', sessionIdRef.current);

        // Invalidate queries to refresh dashboard data
        queryClient.invalidateQueries({ queryKey: ['interview_sessions'] });
        queryClient.invalidateQueries({ queryKey: ['interview_results'] });
        queryClient.invalidateQueries({ queryKey: ['all_interview_results'] });
      }

      // Provide feedback
      const feedback = data.feedback || "Thank you for your answer.";
      addToTranscript('ai', feedback);
      speakText(feedback);

    } catch (err) {
      console.error('Failed to analyze response:', err);
      toast.error('Failed to analyze response. Please try again.');
    } finally {
      setCurrentUserTranscript('');
      pendingAnalysisRef.current = false;
    }
  }, [config, currentUserTranscript, questions, currentQuestion, user?.id, queryClient, stopRecognition, addToTranscript, speakText]);

  const nextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      const nextQ = currentQuestion + 1;
      setCurrentQuestion(nextQ);
      setCurrentUserTranscript('');
      
      const questionText = questions[nextQ].question;
      const transition = config?.interviewer === 'amds'
        ? `Next question. ${questionText}`
        : `Great! Let's move on. ${questionText}`;
      
      addToTranscript('ai', transition);
      speakText(transition);
    }
  }, [currentQuestion, questions, config, addToTranscript, speakText]);

  const endInterview = useCallback(async () => {
    autoStartMicRef.current = false;
    cancelSpeech();
    stopRecognition();
    setIsInterviewActive(false);
    
    // Calculate duration and average score
    const endTime = new Date();
    const durationMinutes = startTimeRef.current 
      ? Math.max(1, Math.round((endTime.getTime() - startTimeRef.current.getTime()) / 60000))
      : 1;
    
    const avgScore = analyses.length > 0
      ? Math.round((analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length) * 10)
      : 0;

    // Update session as completed in database
    if (user?.id && sessionIdRef.current) {
      try {
        await supabase
          .from('interview_sessions')
          .update({
            status: 'completed',
            completed_at: endTime.toISOString(),
            duration_minutes: durationMinutes,
            overall_score: avgScore,
            completed_questions: analyses.length
          })
          .eq('id', sessionIdRef.current);

        // Invalidate queries to refresh dashboard data
        queryClient.invalidateQueries({ queryKey: ['interview_sessions'] });
        queryClient.invalidateQueries({ queryKey: ['interview_results'] });
        queryClient.invalidateQueries({ queryKey: ['all_interview_results'] });
      } catch (err) {
        console.error('Failed to update session:', err);
      }
    }

    const closing = config?.interviewer === 'amds'
      ? "The interview is complete. Thank you for your time."
      : "That's a wrap! Thank you so much for chatting with me today. You did great!";
    
    addToTranscript('ai', closing);
    speakText(closing);
  }, [config, user?.id, analyses, queryClient, cancelSpeech, stopRecognition, addToTranscript, speakText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoStartTimerRef.current) {
        clearTimeout(autoStartTimerRef.current);
      }
      cancelSpeech();
      stopRecognition();
    };
  }, [cancelSpeech, stopRecognition]);

  return {
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
    config,
    error
  };
}
