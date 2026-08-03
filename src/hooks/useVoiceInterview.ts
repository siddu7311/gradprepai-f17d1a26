import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useVoiceConversation, ConversationStatus } from './useVoiceConversation';

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
  communicationScore?: number;
  problemSolvingScore?: number;
  confidenceScore?: number;
  technicalScore?: number;
}

const INTRO = {
  amds: (role: string) =>
    `Hey there, I am Siddu, your interviewer. Let's start our interview for the ${role} role. Feel free to answer in any language you are comfortable with. Here is my first question.`,
  lusy: (role: string) =>
    `Hey there, I am Lusy, your interviewer. Let's start our interview for the ${role} role. Answer in whichever language feels comfortable for you. Here is my first question.`,
};

export function useVoiceInterview() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [analyses, setAnalyses] = useState<ResponseAnalysis[]>([]);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  const questionsRef = useRef<InterviewQuestion[]>([]);
  const indexRef = useRef(0);
  const configRef = useRef<InterviewConfig | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const analysesRef = useRef<ResponseAnalysis[]>([]);

  const addToTranscript = useCallback((role: 'ai' | 'user', text: string) => {
    setTranscript((prev) => [...prev, { role, text, timestamp: new Date() }]);
  }, []);

  const completeSession = useCallback(async () => {
    const endTime = new Date();
    const durationMinutes = startTimeRef.current
      ? Math.max(1, Math.round((endTime.getTime() - startTimeRef.current.getTime()) / 60000))
      : 1;
    const list = analysesRef.current;
    const avgScore = list.length
      ? Math.round((list.reduce((sum, a) => sum + (a.score || 0), 0) / list.length) * 10)
      : 0;

    if (user?.id && sessionIdRef.current) {
      try {
        await supabase
          .from('interview_sessions')
          .update({
            status: 'completed',
            completed_at: endTime.toISOString(),
            duration_minutes: durationMinutes,
            overall_score: avgScore,
            completed_questions: list.length,
          })
          .eq('id', sessionIdRef.current);
        queryClient.invalidateQueries({ queryKey: ['interview_sessions'] });
        queryClient.invalidateQueries({ queryKey: ['interview_results'] });
        queryClient.invalidateQueries({ queryKey: ['all_interview_results'] });
      } catch (err) {
        console.error('Failed to complete session:', err);
      }
    }
  }, [user?.id, queryClient]);

  /** Analyse the spoken answer, then continue the conversation with the next question. */
  const getReply = useCallback(
    async (answer: string): Promise<string> => {
      const cfg = configRef.current;
      const idx = indexRef.current;
      const currentQ = questionsRef.current[idx];
      if (!cfg || !currentQ) return 'Thanks for that.';

      let feedback = 'Thank you for that answer.';
      try {
        const { data, error: fnError } = await supabase.functions.invoke('analyze-interview-response', {
          body: {
            question: currentQ.question,
            answer,
            persona: cfg.interviewer,
            role: cfg.role,
            expectedTopics: currentQ.expectedTopics,
          },
        });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);

        setAnalyses((prev) => {
          const next = [...prev, data];
          analysesRef.current = next;
          return next;
        });
        feedback = (data.feedback || feedback).toString();

        if (user?.id && sessionIdRef.current) {
          const clamp = (value: unknown, fallback: number) =>
            typeof value === 'number' && Number.isFinite(value)
              ? Math.min(100, Math.max(0, Math.round(value * 10)))
              : fallback;
          const scorePercent = clamp(data.score, 0);
          await supabase.from('interview_results').insert({
            user_id: user.id,
            session_id: sessionIdRef.current,
            question_number: idx + 1,
            question_text: currentQ.question,
            user_answer: answer,
            score: scorePercent,
            feedback: data.feedback,
            strengths: data.strengths || [],
            weaknesses: data.improvements || [],
            technical_score: clamp(data.technicalScore, scorePercent),
            communication_score: clamp(data.communicationScore, scorePercent),
            problem_solving_score: clamp(data.problemSolvingScore, scorePercent),
            confidence_score: clamp(data.confidenceScore, scorePercent),
          });
          await supabase
            .from('interview_sessions')
            .update({ completed_questions: idx + 1 })
            .eq('id', sessionIdRef.current);
          queryClient.invalidateQueries({ queryKey: ['interview_sessions'] });
          queryClient.invalidateQueries({ queryKey: ['interview_results'] });
          queryClient.invalidateQueries({ queryKey: ['all_interview_results'] });
        }
      } catch (err) {
        console.error('Failed to analyse response:', err);
      }

      const hasNext = idx + 1 < questionsRef.current.length;
      if (hasNext) {
        indexRef.current = idx + 1;
        setCurrentQuestion(idx + 1);
        const nextQ = questionsRef.current[idx + 1].question;
        const bridge = cfg.interviewer === 'amds' ? 'Next question.' : "Alright, let's keep going.";
        return `${feedback} ${bridge} ${nextQ}`;
      }

      setIsFinished(true);
      void completeSession();
      const closing =
        cfg.interviewer === 'amds'
          ? 'That completes our interview. Thank you for your time — let me pull up your results.'
          : "And that's a wrap! Thank you so much for talking with me today. Let me pull up your results.";
      return `${feedback} ${closing}`;
    },
    [user?.id, queryClient, completeSession],
  );

  const conversation = useVoiceConversation({
    persona: config?.interviewer === 'amds' ? 'siddu' : 'lusy',
    getReply,
    silenceMs: 2000,
    onUserSpeech: (text) => addToTranscript('user', text),
    onAssistantSpeech: (text) => addToTranscript('ai', text),
    pausedPhrase: "Sure, no problem — take your time. Just say continue when you're ready.",
    resumedPhrase: "Great, let's continue.",
  });

  const startInterview = useCallback(
    async (interviewConfig: InterviewConfig) => {
      setIsLoading(true);
      setError(null);
      setConfig(interviewConfig);
      configRef.current = interviewConfig;
      startTimeRef.current = new Date();
      indexRef.current = 0;
      analysesRef.current = [];
      setAnalyses([]);
      setTranscript([]);
      setIsFinished(false);

      const questionCount = interviewConfig.questionCount || 5;
      const askedKey = `gp_asked_${interviewConfig.role}_${interviewConfig.language}_${interviewConfig.difficulty}`;
      let previousQuestions: string[] = [];
      try {
        const stored = JSON.parse(localStorage.getItem(askedKey) || '[]');
        previousQuestions = Array.isArray(stored) ? stored : [];
      } catch {
        previousQuestions = [];
      }

      try {
        if (user?.id) {
          const { data: sessionData, error: sessionError } = await supabase
            .from('interview_sessions')
            .insert({
              user_id: user.id,
              role_type: interviewConfig.role,
              difficulty: interviewConfig.difficulty,
              status: 'in_progress',
              total_questions: questionCount,
              completed_questions: 0,
            })
            .select()
            .single();
          if (sessionError) console.error('Failed to create session:', sessionError);
          else sessionIdRef.current = sessionData.id;
        }

        const { data, error: fnError } = await supabase.functions.invoke('generate-interview-questions', {
          body: {
            role: interviewConfig.role,
            language: interviewConfig.language,
            difficulty: interviewConfig.difficulty,
            persona: interviewConfig.interviewer,
            questionCount,
            previousQuestions: previousQuestions.slice(-40),
            seed: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          },
        });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);

        const list: InterviewQuestion[] = data.questions || [];
        if (!list.length) throw new Error('No questions were generated');
        questionsRef.current = list;
        setQuestions(list);

        try {
          const merged = [...previousQuestions, ...list.map((q) => q.question)].slice(-60);
          localStorage.setItem(askedKey, JSON.stringify(merged));
        } catch {
          /* variety still handled by the seed */
        }

        setIsInterviewActive(true);
        setCurrentQuestion(0);
        setIsLoading(false);

        const intro = INTRO[interviewConfig.interviewer](interviewConfig.role);
        await conversation.start(`${intro} ${list[0].question}`);
      } catch (err) {
        console.error('Failed to start interview:', err);
        setError(err instanceof Error ? err.message : 'Failed to start interview');
        toast.error('Failed to start interview. Please try again.');
        setIsLoading(false);
      }
    },
    [user?.id, conversation],
  );

  const endInterview = useCallback(async () => {
    conversation.stop();
    setIsInterviewActive(false);
    await completeSession();
  }, [conversation, completeSession]);

  return {
    isLoading,
    error,
    status: conversation.status as ConversationStatus,
    isAISpeaking: conversation.isSpeaking,
    isUserSpeaking: conversation.isListening,
    isPaused: conversation.isPaused,
    liveText: conversation.liveText,
    isSupported: conversation.isSupported,
    isInterviewActive,
    isFinished,
    questions,
    currentQuestion,
    transcript,
    analyses,
    config,
    startInterview,
    endInterview,
  };
}
