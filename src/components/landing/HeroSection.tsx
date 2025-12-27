import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Sparkles, Zap, Brain, Mic } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';

export const HeroSection = () => {
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
            <Link to="/signup">
              <GlowButton size="lg" className="min-w-[200px]">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </GlowButton>
            </Link>
            <GlowButton variant="outline" size="lg" className="min-w-[200px]">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </GlowButton>
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
    </section>
  );
};
