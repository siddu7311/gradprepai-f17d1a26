import { motion } from 'framer-motion';
import { Lightbulb, Target, MessageSquare, Brain, Award } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

interface ImprovementSuggestionsProps {
  scores: {
    technical: number;
    communication: number;
    problemSolving: number;
    confidence: number;
  };
}

export function ImprovementSuggestions({ scores }: ImprovementSuggestionsProps) {
  const suggestions = [];

  if (scores.technical < 70) {
    suggestions.push({
      icon: Brain,
      title: 'Strengthen Technical Knowledge',
      description: 'Review data structures, algorithms, and system design concepts. Practice coding problems daily.',
      priority: 'high',
    });
  }

  if (scores.communication < 70) {
    suggestions.push({
      icon: MessageSquare,
      title: 'Improve Communication',
      description: 'Practice explaining technical concepts clearly. Use the STAR method for behavioral questions.',
      priority: 'high',
    });
  }

  if (scores.problemSolving < 70) {
    suggestions.push({
      icon: Target,
      title: 'Enhance Problem Solving',
      description: 'Break down problems into smaller steps. Practice thinking out loud while solving.',
      priority: 'medium',
    });
  }

  if (scores.confidence < 70) {
    suggestions.push({
      icon: Award,
      title: 'Build Confidence',
      description: 'Practice more mock interviews. Record yourself to identify areas of improvement.',
      priority: 'medium',
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      icon: Lightbulb,
      title: 'Keep Up the Great Work!',
      description: 'Your scores are excellent. Continue practicing to maintain your edge.',
      priority: 'low',
    });
  }

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-5 h-5 text-secondary" />
        <h3 className="font-display text-lg font-semibold text-foreground">
          Personalized Improvement Tips
        </h3>
      </div>
      
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 p-4 rounded-lg bg-muted/30"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              suggestion.priority === 'high' ? 'bg-red-500/20' :
              suggestion.priority === 'medium' ? 'bg-yellow-500/20' :
              'bg-green-500/20'
            }`}>
              <suggestion.icon className={`w-5 h-5 ${
                suggestion.priority === 'high' ? 'text-red-400' :
                suggestion.priority === 'medium' ? 'text-yellow-400' :
                'text-green-400'
              }`} />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">{suggestion.title}</h4>
              <p className="text-sm text-muted-foreground">{suggestion.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
