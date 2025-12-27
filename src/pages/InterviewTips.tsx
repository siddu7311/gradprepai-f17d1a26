import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Lightbulb, MessageSquare, Code, Brain, Clock, Users } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';

const tips = [
  {
    icon: Brain,
    title: 'Understand the Role',
    description: 'Research the company and role thoroughly. Know their tech stack, products, and recent news. This shows genuine interest and helps you ask informed questions.',
    details: [
      'Review the job description multiple times',
      'Research the company on LinkedIn and Glassdoor',
      'Understand the team structure if possible',
      'Prepare role-specific questions to ask',
    ],
  },
  {
    icon: Code,
    title: 'Practice Coding Out Loud',
    description: 'Technical interviews require you to explain your thought process. Practice solving problems while narrating your approach.',
    details: [
      'Explain your approach before coding',
      'Talk through edge cases and trade-offs',
      'Practice with a timer to simulate pressure',
      'Review common data structures and algorithms',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Master the STAR Method',
    description: 'For behavioral questions, structure your answers using Situation, Task, Action, Result. This keeps your responses focused and impactful.',
    details: [
      'Prepare 5-7 stories that showcase different skills',
      'Quantify your impact with numbers when possible',
      'Keep each answer under 2 minutes',
      'Practice with common behavioral questions',
    ],
  },
  {
    icon: Clock,
    title: 'Manage Your Time',
    description: 'In coding interviews, time management is crucial. Spend time understanding the problem before jumping into code.',
    details: [
      'Clarify requirements first (5 minutes)',
      'Discuss approach before coding (5 minutes)',
      'Code the solution (20-25 minutes)',
      'Test and optimize (5-10 minutes)',
    ],
  },
  {
    icon: Users,
    title: 'Show Collaboration Skills',
    description: 'Interviewers want to see how you work with others. Be receptive to hints and show you can incorporate feedback.',
    details: [
      'Ask clarifying questions naturally',
      'Accept hints gracefully',
      'Explain trade-offs in your decisions',
      'Show enthusiasm for learning',
    ],
  },
  {
    icon: Lightbulb,
    title: 'Prepare Your Questions',
    description: 'The questions you ask reveal your priorities. Prepare thoughtful questions about the team, growth, and challenges.',
    details: [
      'Ask about day-to-day responsibilities',
      'Inquire about team culture and collaboration',
      'Ask about growth and learning opportunities',
      'Show interest in the company mission',
    ],
  },
];

const InterviewTips = () => {
  return (
    <>
      <Helmet>
        <title>Interview Tips - GradPrep AI</title>
        <meta name="description" content="Expert tips and strategies to help you ace your tech interviews. Learn how to prepare, practice, and perform at your best." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <AnimatedBackground />
        <Navbar />

        <main className="relative z-10 pt-32 pb-20">
          <div className="container mx-auto px-4">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Expert Advice
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Interview
                <br />
                <span className="gradient-text">Tips & Strategies</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Proven techniques to help you stand out in your next tech interview.
              </p>
            </motion.div>

            {/* Tips Grid */}
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {tips.map((tip, index) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <GlassCard className="h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <tip.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold text-foreground">{tip.title}</h3>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">{tip.description}</p>
                    <ul className="space-y-2">
                      {tip.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <span className="text-primary mt-1">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default InterviewTips;
