import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface InterviewSession {
  id: string;
  user_id: string;
  role_type: string;
  difficulty: string;
  experience_level: string | null;
  company_type: string | null;
  total_questions: number;
  completed_questions: number;
  overall_score: number | null;
  duration_minutes: number | null;
  status: string;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface InterviewResult {
  id: string;
  session_id: string;
  user_id: string;
  question_number: number;
  question_text: string;
  user_answer: string | null;
  ideal_answer: string | null;
  score: number | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  technical_score: number | null;
  communication_score: number | null;
  problem_solving_score: number | null;
  confidence_score: number | null;
  feedback: string | null;
  created_at: string;
}

export function useInterviewSessions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['interview_sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InterviewSession[];
    },
    enabled: !!user?.id,
  });

  const createSession = useMutation({
    mutationFn: async (sessionData: Omit<Partial<InterviewSession>, 'id' | 'user_id' | 'created_at'> & { role_type: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('interview_sessions')
        .insert({
          role_type: sessionData.role_type,
          difficulty: sessionData.difficulty || 'intermediate',
          experience_level: sessionData.experience_level,
          company_type: sessionData.company_type,
          total_questions: sessionData.total_questions || 0,
          completed_questions: sessionData.completed_questions || 0,
          overall_score: sessionData.overall_score,
          duration_minutes: sessionData.duration_minutes,
          status: sessionData.status || 'in_progress',
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as InterviewSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview_sessions', user?.id] });
    },
  });

  const updateSession = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InterviewSession> & { id: string }) => {
      const { data, error } = await supabase
        .from('interview_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as InterviewSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview_sessions', user?.id] });
    },
  });

  return {
    sessions: sessions || [],
    isLoading,
    createSession: createSession.mutateAsync,
    updateSession: updateSession.mutateAsync,
  };
}

export function useInterviewResults(sessionId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: results, isLoading } = useQuery({
    queryKey: ['interview_results', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from('interview_results')
        .select('*')
        .eq('session_id', sessionId)
        .order('question_number', { ascending: true });

      if (error) throw error;
      return data as InterviewResult[];
    },
    enabled: !!sessionId,
  });

  const { data: allResults } = useQuery({
    queryKey: ['all_interview_results', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('interview_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InterviewResult[];
    },
    enabled: !!user?.id,
  });

  const saveResult = useMutation({
    mutationFn: async (resultData: Omit<Partial<InterviewResult>, 'id' | 'user_id' | 'created_at'> & { session_id: string; question_number: number; question_text: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('interview_results')
        .insert({
          session_id: resultData.session_id,
          question_number: resultData.question_number,
          question_text: resultData.question_text,
          user_answer: resultData.user_answer,
          ideal_answer: resultData.ideal_answer,
          score: resultData.score,
          strengths: resultData.strengths,
          weaknesses: resultData.weaknesses,
          technical_score: resultData.technical_score,
          communication_score: resultData.communication_score,
          problem_solving_score: resultData.problem_solving_score,
          confidence_score: resultData.confidence_score,
          feedback: resultData.feedback,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as InterviewResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview_results'] });
      queryClient.invalidateQueries({ queryKey: ['all_interview_results', user?.id] });
    },
  });

  return {
    results: results || [],
    allResults: allResults || [],
    isLoading,
    saveResult: saveResult.mutateAsync,
  };
}
