import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { TrendingUp, Target, Clock, Award } from 'lucide-react';

interface StatsCardsProps {
  totalInterviews: number;
  averageScore: number;
  totalMinutes: number;
  completedQuestions: number;
}

export function StatsCards({ totalInterviews, averageScore, totalMinutes, completedQuestions }: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Interviews',
      value: totalInterviews,
      icon: Target,
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'Average Score',
      value: `${averageScore}%`,
      icon: Award,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Practice Time',
      value: `${totalMinutes} min`,
      icon: Clock,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Questions Answered',
      value: completedQuestions,
      icon: TrendingUp,
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <GlassCard className="text-center py-6">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.gradient} p-3`}>
              <stat.icon className="w-full h-full text-white" />
            </div>
            <div className="font-display text-2xl font-bold text-foreground mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">
              {stat.title}
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
