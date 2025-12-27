import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Camera, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Target,
  Award,
  TrendingUp,
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useInterviewSessions, useInterviewResults } from '@/hooks/useInterviewSessions';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

export default function Profile() {
  const { user } = useAuth();
  const { profile, uploadAvatar, isUpdating } = useProfile();
  const { sessions } = useInterviewSessions();
  const { allResults } = useInterviewResults();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadAvatar(file);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Calculate statistics
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const totalInterviews = completedSessions.length;
  const averageScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((acc, s) => acc + (s.overall_score || 0), 0) / completedSessions.length)
    : 0;
  const totalMinutes = completedSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  const totalQuestions = completedSessions.reduce((acc, s) => acc + s.completed_questions, 0);

  // Calculate skill averages
  const skillAverages = {
    technical: 0,
    communication: 0,
    problemSolving: 0,
    confidence: 0,
  };

  if (allResults.length > 0) {
    skillAverages.technical = Math.round(
      allResults.reduce((acc, r) => acc + (r.technical_score || 0), 0) / allResults.length
    );
    skillAverages.communication = Math.round(
      allResults.reduce((acc, r) => acc + (r.communication_score || 0), 0) / allResults.length
    );
    skillAverages.problemSolving = Math.round(
      allResults.reduce((acc, r) => acc + (r.problem_solving_score || 0), 0) / allResults.length
    );
    skillAverages.confidence = Math.round(
      allResults.reduce((acc, r) => acc + (r.confidence_score || 0), 0) / allResults.length
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Please sign in to view your profile</h1>
          <Link to="/signin">
            <GlowButton>Sign In</GlowButton>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Profile - GradPrep AI</title>
        <meta name="description" content="View your profile, interview statistics, and performance metrics." />
      </Helmet>

      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-1"
            >
              <GlassCard className="text-center">
                <div className="relative inline-block mb-6">
                  <Avatar className="w-32 h-32 mx-auto">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-3xl font-bold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarClick}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                  {profile?.display_name || 'User'}
                </h1>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      {profile.phone}
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>

                {profile?.bio && (
                  <p className="text-muted-foreground text-sm border-t border-border pt-4">
                    {profile.bio}
                  </p>
                )}

                <div className="mt-6">
                  <Link to="/settings">
                    <GlowButton variant="outline" className="w-full">
                      Edit Profile
                    </GlowButton>
                  </Link>
                </div>
              </GlassCard>
            </motion.div>

            {/* Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Interviews', value: totalInterviews, icon: Target, gradient: 'from-cyan-500 to-blue-500' },
                  { label: 'Avg Score', value: `${averageScore}%`, icon: Award, gradient: 'from-green-500 to-emerald-500' },
                  { label: 'Practice Time', value: `${totalMinutes}m`, icon: TrendingUp, gradient: 'from-purple-500 to-pink-500' },
                  { label: 'Questions', value: totalQuestions, icon: BarChart3, gradient: 'from-orange-500 to-red-500' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <GlassCard className="text-center py-6">
                      <div className={`w-10 h-10 mx-auto mb-3 rounded-lg bg-gradient-to-br ${stat.gradient} p-2`}>
                        <stat.icon className="w-full h-full text-white" />
                      </div>
                      <div className="font-display text-2xl font-bold text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stat.label}
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>

              {/* Skill Breakdown */}
              <GlassCard>
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                  Skill Breakdown
                </h2>
                
                <div className="space-y-6">
                  {[
                    { name: 'Technical Knowledge', score: skillAverages.technical || 75, color: 'bg-cyan-500' },
                    { name: 'Communication', score: skillAverages.communication || 70, color: 'bg-green-500' },
                    { name: 'Problem Solving', score: skillAverages.problemSolving || 80, color: 'bg-purple-500' },
                    { name: 'Confidence', score: skillAverages.confidence || 65, color: 'bg-orange-500' },
                  ].map((skill) => (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{skill.name}</span>
                        <span className="text-sm font-bold text-foreground">{skill.score}%</span>
                      </div>
                      <Progress value={skill.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Recent Activity */}
              <GlassCard>
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                  Recent Interviews
                </h2>
                
                {sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No interviews yet. Start practicing!</p>
                    <Link to="/interview/setup" className="mt-4 inline-block">
                      <GlowButton size="sm">Start Interview</GlowButton>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.slice(0, 5).map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div>
                          <p className="font-medium text-foreground">{session.role_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`text-lg font-bold ${
                          (session.overall_score || 0) >= 80 ? 'text-green-400' :
                          (session.overall_score || 0) >= 60 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {session.overall_score || 0}%
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
