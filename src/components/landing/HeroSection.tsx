import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Sparkles, Zap, Brain, Mic, X, LogIn, UserPlus } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const HeroSection = () => {
  const [showDemo, setShowDemo] = useState(false);
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">
              AI-Powered Interview Preparation
            </span>
            <span className="px-2 py-0.5 text-xs font-bold bg-primary/20 text-primary rounded-full">
              NEW
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6"
          >
            <span className="text-foreground">Ace Your</span>
            <br />
            <span className="gradient-text-glow">Tech Interview</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Practice with AI interviewers, get instant feedback, and land your dream job. 
            <span className="text-foreground font-medium"> Built for fresh graduates.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            {user ? (
              <>
                <Link to="/interview/setup">
                  <GlowButton size="lg" className="min-w-[200px]">
                    Start Interview
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </GlowButton>
                </Link>
                <Link to="/dashboard">
                  <GlowButton 
                    variant="outline" 
                    size="lg" 
                    className="min-w-[200px]"
                  >
                    Go to Dashboard
                  </GlowButton>
                </Link>
              </>
            ) : (
              <>
                <Link to="/signup">
                  <GlowButton size="lg" className="min-w-[200px]">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </GlowButton>
                </Link>
                <GlowButton 
                  variant="outline" 
                  size="lg" 
                  className="min-w-[200px]"
                  onClick={() => setShowDemo(true)}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </GlowButton>
              </>
            )}
          </motion.div>

        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-10 hidden lg:block"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
            <Brain className="w-10 h-10 text-primary" />
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-10 hidden lg:block"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20 backdrop-blur-sm border border-secondary/20 flex items-center justify-center">
            <Mic className="w-8 h-8 text-secondary" />
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [-5, 15, -5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 left-20 hidden lg:block"
        >
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 backdrop-blur-sm border border-accent/20 flex items-center justify-center">
            <Zap className="w-7 h-7 text-accent" />
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

      {/* Demo Video Dialog */}
      <Dialog open={showDemo} onOpenChange={setShowDemo}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-display">How GradPrep AI Works</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              {/* Demo content - showing feature walkthrough */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center max-w-lg"
                >
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                    AI-Powered Interview Practice
                  </h3>
                  <div className="space-y-4 text-left">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-medium text-foreground">Choose Your Role</p>
                        <p className="text-sm text-muted-foreground">Select from 10+ tech roles and difficulty levels</p>
                      </div>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-medium text-foreground">Practice with AI</p>
                        <p className="text-sm text-muted-foreground">Speak naturally with our AI interviewers (AMDS or LUSY)</p>
                      </div>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
                    >
                      <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-medium text-foreground">Get Instant Feedback</p>
                        <p className="text-sm text-muted-foreground">Receive detailed analysis and improvement suggestions</p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <Link to="/signup" onClick={() => setShowDemo(false)}>
                <GlowButton>
                  Try It Now - Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </GlowButton>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};