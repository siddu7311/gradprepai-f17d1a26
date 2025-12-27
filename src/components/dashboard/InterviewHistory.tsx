import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ChevronRight, Clock, Target, BarChart3 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { InterviewSession } from '@/hooks/useInterviewSessions';

interface InterviewHistoryProps {
  sessions: InterviewSession[];
}

export function InterviewHistory({ sessions }: InterviewHistoryProps) {
  if (sessions.length === 0) {
    return (
      <GlassCard>
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
            No interviews yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Start your first interview to see your history here.
          </p>
          <Link 
            to="/interview/setup"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            Start Interview <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Interview History
        </h3>
        <Link 
          to="/interview/setup"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          New Interview <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="space-y-3">
        {sessions.slice(0, 5).map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{session.role_type}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{format(new Date(session.created_at), 'MMM d, yyyy')}</span>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    {session.difficulty}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {session.overall_score && (
                <div className={`text-lg font-bold ${
                  session.overall_score >= 80 ? 'text-green-400' :
                  session.overall_score >= 60 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {session.overall_score}%
                </div>
              )}
              {session.duration_minutes && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {session.duration_minutes}m
                </div>
              )}
              <Badge 
                variant={session.status === 'completed' ? 'default' : 'secondary'}
                className={session.status === 'completed' ? 'bg-green-500/20 text-green-400' : ''}
              >
                {session.status}
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
