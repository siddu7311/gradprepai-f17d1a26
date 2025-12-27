import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mic, 
  FileText, 
  ChevronRight,
  PlayCircle,
  Brain,
  TrendingUp
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { InterviewHistory } from '@/components/dashboard/InterviewHistory';
import { ImprovementSuggestions } from '@/components/dashboard/ImprovementSuggestions';
import { useAuth } from '@/contexts/AuthContext';
import { useInterviewSessions, useInterviewResults } from '@/hooks/useInterviewSessions';
import { Helmet } from 'react-helmet-async';
import { format, subDays } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const { sessions } = useInterviewSessions();
  const { allResults } = useInterviewResults();

  // Calculate stats
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const totalInterviews = completedSessions.length;
  const averageScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((acc, s) => acc + (s.overall_score || 0), 0) / completedSessions.length)
    : 0;
  const totalMinutes = completedSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  const totalQuestions = completedSessions.reduce((acc, s) => acc + s.completed_questions, 0);

  // Calculate skill averages
  const skillAverages = {
    technical: allResults.length > 0 ? Math.round(allResults.reduce((acc, r) => acc + (r.technical_score || 70), 0) / allResults.length) : 70,
    communication: allResults.length > 0 ? Math.round(allResults.reduce((acc, r) => acc + (r.communication_score || 65), 0) / allResults.length) : 65,
    problemSolving: allResults.length > 0 ? Math.round(allResults.reduce((acc, r) => acc + (r.problem_solving_score || 75), 0) / allResults.length) : 75,
    confidence: allResults.length > 0 ? Math.round(allResults.reduce((acc, r) => acc + (r.confidence_score || 60), 0) / allResults.length) : 60,
  };

  // Generate chart data
  const chartData = completedSessions.length > 0 
    ? completedSessions.slice(0, 7).reverse().map(s => ({
        date: format(new Date(s.created_at), 'MMM d'),
        score: s.overall_score || 0,
      }))
    : Array.from({ length: 7 }, (_, i) => ({
        date: format(subDays(new Date(), 6 - i), 'MMM d'),
        score: 65 + Math.floor(Math.random() * 20),
      }));

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Please sign in to access dashboard</h1>
          <Link to="/signin"><GlowButton>Sign In</GlowButton></Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - GradPrep AI</title>
        <meta name="description" content="Your personal dashboard for interview preparation." />
      </Helmet>

      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Welcome to GradPrep AI! 👋</h1>
            <p className="text-muted-foreground text-lg">Ready to ace your next interview? Start practicing now.</p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid md:grid-cols-2 gap-4 mb-8">
            <Link to="/interview/setup">
              <GlassCard className="flex items-center gap-4 group" glow>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent p-3 group-hover:scale-110 transition-transform">
                  <Mic className="w-full h-full text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">Start New Interview</h3>
                  <p className="text-sm text-muted-foreground">Practice with AI interviewers</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </GlassCard>
            </Link>
            <Link to="/resume-builder">
              <GlassCard className="flex items-center gap-4 group" glow>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-purple-600 p-3 group-hover:scale-110 transition-transform">
                  <FileText className="w-full h-full text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">Resume Builder</h3>
                  <p className="text-sm text-muted-foreground">Upload or improve your resume</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
              </GlassCard>
            </Link>
          </motion.div>

          {/* Stats Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
            <StatsCards totalInterviews={totalInterviews} averageScore={averageScore} totalMinutes={totalMinutes} completedQuestions={totalQuestions} />
          </motion.div>

          {/* Charts and History */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <ProgressChart data={chartData} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <ImprovementSuggestions scores={skillAverages} />
            </motion.div>
          </div>

          {/* Interview History */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <InterviewHistory sessions={sessions} />
          </motion.div>
        </div>
      </MainLayout>
    </>
  );
}
