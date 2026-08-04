import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Download,
  Share2,
  RotateCcw,
  Home,
  CheckCircle2,
  XCircle,
  TrendingUp,
  MessageSquare,
  Target,
  Lightbulb,
  Award,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Progress } from '@/components/ui/progress';
import { Footer } from '@/components/layout/Footer';
import { Helmet } from 'react-helmet-async';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';

interface QuestionResult {
  question_number: number;
  question_text: string;
  user_answer: string | null;
  score: number | null;
  feedback: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  ideal_answer: string | null;
  technical_score: number | null;
  communication_score: number | null;
  problem_solving_score: number | null;
  confidence_score: number | null;
}

interface SessionData {
  id: string;
  overall_score: number | null;
  role_type: string;
  difficulty: string;
  completed_questions: number;
  total_questions: number;
  duration_minutes: number | null;
}

const careerTips = [
  "Focus on practicing system design questions for senior roles",
  "Improve explanation of complex concepts with real-world examples",
  "Practice explaining your thought process while coding",
  "Prepare more specific examples from your projects",
  "Work on quantifying your achievements in responses"
];

export default function InterviewResults() {
  const { user } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionData | null>(null);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [scores, setScores] = useState({
    technical: 0,
    communication: 0,
    problemSolving: 0,
    confidence: 0
  });
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    const shareData = {
      title: 'My Interview Results - GradPrep AI',
      text: `I scored ${overallScore}% on my ${session?.role_type} interview practice! Check out GradPrep AI for interview preparation.`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast.success('Link copied to clipboard!');
      }
    }
  };

  const handleDownload = () => {
    if (!resultsRef.current) return;
    
    toast.loading('Generating PDF...', { id: 'pdf-download' });
    
    const opt = {
      margin: [10, 10],
      filename: `interview-results-${session?.role_type || 'report'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0a0a0f' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf()
      .set(opt)
      .from(resultsRef.current)
      .save()
      .then(() => {
        toast.success('PDF downloaded successfully!', { id: 'pdf-download' });
      })
      .catch((error: Error) => {
        console.error('PDF generation error:', error);
        toast.error('Failed to generate PDF', { id: 'pdf-download' });
      });
  };

  /** Plain-text interview notes: every question, the user's answer and a model answer. */
  const handleDownloadNotes = () => {
    const lines: string[] = [
      'GradPrep AI — Interview Notes',
      '='.repeat(40),
      `Role: ${session?.role_type || '—'}`,
      `Difficulty: ${session?.difficulty || '—'}`,
      `Questions answered: ${answeredQuestions.length} / ${results.length || session?.total_questions || 0}`,
      `Overall score: ${overallScore}%`,
      `Date: ${new Date().toLocaleString()}`,
      '',
    ];

    results.forEach((result) => {
      lines.push(
        `Q${result.question_number}. ${result.question_text}`,
        '',
        `Your answer: ${result.user_answer?.trim() || '(no answer given)'}`,
        '',
        `Correct / model answer: ${result.ideal_answer?.trim() || 'Not available for this question.'}`,
        '',
        `Score: ${result.score ?? 0}%`,
        `Feedback: ${result.feedback?.trim() || '—'}`,
      );
      if (result.strengths?.length) lines.push(`Strengths: ${result.strengths.join('; ')}`);
      if (result.weaknesses?.length) lines.push(`To improve: ${result.weaknesses.join('; ')}`);
      lines.push('', '-'.repeat(40), '');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-notes-${session?.role_type || 'session'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Interview notes downloaded');
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get the most recent completed session
        const { data: sessionData, error: sessionError } = await supabase
          .from('interview_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();

        if (sessionError || !sessionData) {
          console.log('No completed session found');
          setLoading(false);
          return;
        }

        setSession(sessionData);

        // Get results for this session
        const { data: resultsData, error: resultsError } = await supabase
          .from('interview_results')
          .select('*')
          .eq('session_id', sessionData.id)
          .order('question_number', { ascending: true });

        if (resultsError) {
          console.error('Error fetching results:', resultsError);
          setLoading(false);
          return;
        }

        setResults(resultsData || []);

        // Calculate average scores from actual results
        if (resultsData && resultsData.length > 0) {
          const answeredResults = resultsData.filter(r => r.user_answer && r.user_answer.trim().length > 0);
          
          if (answeredResults.length > 0) {
            const avgTechnical = answeredResults.reduce((sum, r) => sum + (r.technical_score || 0), 0) / answeredResults.length;
            const avgCommunication = answeredResults.reduce((sum, r) => sum + (r.communication_score || 0), 0) / answeredResults.length;
            const avgProblemSolving = answeredResults.reduce((sum, r) => sum + (r.problem_solving_score || 0), 0) / answeredResults.length;
            const avgConfidence = answeredResults.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / answeredResults.length;

            setScores({
              technical: Math.round(avgTechnical),
              communication: Math.round(avgCommunication),
              problemSolving: Math.round(avgProblemSolving),
              confidence: Math.round(avgConfidence)
            });
          }
        }
      } catch (err) {
        console.error('Error loading results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user]);

  // Calculate overall score from answered questions only
  const answeredQuestions = results.filter(r => r.user_answer && r.user_answer.trim().length > 0);
  const overallScore = answeredQuestions.length > 0
    ? Math.round(answeredQuestions.reduce((sum, r) => sum + (r.score || 0), 0) / answeredQuestions.length)
    : 0;

  const scoreBreakdown = [
    { name: 'Technical Knowledge', score: scores.technical, icon: Target },
    { name: 'Communication', score: scores.communication, icon: MessageSquare },
    { name: 'Problem Solving', score: scores.problemSolving, icon: Lightbulb },
    { name: 'Confidence', score: scores.confidence, icon: Award },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!session || results.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <AnimatedBackground />
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="font-display text-lg font-bold gradient-text">GradPrep AI</span>
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
          <GlassCard className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">No Interview Results</h2>
            <p className="text-muted-foreground mb-6">
              Complete an interview first to see your results here.
            </p>
            <Link to="/interview/setup">
              <GlowButton>Start an Interview</GlowButton>
            </Link>
          </GlassCard>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Interview Results - GradPrep AI</title>
        <meta name="description" content="Your interview performance analysis with detailed feedback and improvement suggestions." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <AnimatedBackground />
        
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="font-display text-lg font-bold gradient-text">GradPrep AI</span>
              </Link>
              
              <div className="flex items-center gap-3">
                <GlowButton variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </GlowButton>
                <GlowButton variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </GlowButton>
                <GlowButton variant="outline" size="sm" onClick={handleDownloadNotes}>
                  <FileText className="w-4 h-4 mr-2" />
                  Notes (.txt)
                </GlowButton>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8" ref={resultsRef}>
          {/* Overall Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Interview Complete! 🎉
            </h1>
            
            <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-4 border-primary mb-4 relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-center"
              >
                <span className="font-display text-5xl font-bold gradient-text">
                  {overallScore}
                </span>
                <span className="text-muted-foreground text-lg">%</span>
              </motion.div>
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="4"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 283" }}
                  animate={{ strokeDasharray: `${overallScore * 2.83} 283` }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <p className="text-xl text-muted-foreground">
              {answeredQuestions.length === 0 
                ? "You didn't answer any questions in this interview."
                : overallScore >= 80 
                  ? "Great job! You performed above average."
                  : overallScore >= 60
                    ? "Good effort! Keep practicing to improve."
                    : "There's room for improvement. Keep practicing!"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {session.role_type} • {session.difficulty} • {answeredQuestions.length}/{results.length} questions answered
            </p>
          </motion.div>

          {/* Score Breakdown - only show if there are answered questions */}
          {answeredQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-4 gap-4 mb-12"
            >
              {scoreBreakdown.map((score, index) => (
                <motion.div
                  key={score.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <GlassCard className="text-center">
                    <score.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                    <div className="font-display text-2xl font-bold text-foreground mb-1">
                      {score.score}%
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      {score.name}
                    </div>
                    <Progress value={score.score} className="h-2" />
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Question-wise Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Question Analysis
            </h2>
            
            <div className="space-y-6">
              {results.map((result, index) => {
                const hasAnswer = result.user_answer && result.user_answer.trim().length > 0;
                
                return (
                  <motion.div
                    key={result.question_number}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <GlassCard>
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-semibold text-foreground flex-1 pr-4">
                          Q{result.question_number}: {result.question_text}
                        </h3>
                        {hasAnswer ? (
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            (result.score || 0) >= 80 ? 'bg-green-500/20 text-green-400' :
                            (result.score || 0) >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {result.score || 0}%
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-muted text-muted-foreground">
                            Not Answered
                          </span>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">Your Answer:</p>
                          <p className="text-sm text-foreground">
                            {hasAnswer 
                              ? result.user_answer 
                              : <span className="italic text-muted-foreground">No answer provided</span>
                            }
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-primary/10">
                          <p className="text-xs text-primary mb-1">Feedback:</p>
                          <p className="text-sm text-foreground">
                            {result.feedback || (hasAnswer 
                              ? "Analysis not available" 
                              : "Answer the question to receive feedback"
                            )}
                          </p>
                        </div>
                      </div>
                      
                      {hasAnswer && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-green-400 mb-2 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Strengths
                            </p>
                            <ul className="space-y-1">
                              {(result.strengths && result.strengths.length > 0) ? (
                                result.strengths.map((s, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-green-400">•</span> {s}
                                  </li>
                                ))
                              ) : (
                                <li className="text-sm text-muted-foreground italic">No strengths identified</li>
                              )}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs text-yellow-400 mb-2 flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Areas to Improve
                            </p>
                            <ul className="space-y-1">
                              {(result.weaknesses && result.weaknesses.length > 0) ? (
                                result.weaknesses.map((w, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-yellow-400">•</span> {w}
                                  </li>
                                ))
                              ) : (
                                <li className="text-sm text-muted-foreground italic">No improvements identified</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      )}
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Career Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-secondary" />
              Career Tips & Recommendations
            </h2>
            
            <GlassCard>
              <ul className="space-y-3">
                {careerTips.map((tip, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-secondary text-sm font-semibold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-foreground">{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/interview/setup">
              <GlowButton size="lg">
                <RotateCcw className="w-5 h-5 mr-2" />
                Practice Again
              </GlowButton>
            </Link>
            <Link to="/dashboard">
              <GlowButton variant="outline" size="lg">
                <Home className="w-5 h-5 mr-2" />
                Back to Dashboard
              </GlowButton>
            </Link>
          </motion.div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}