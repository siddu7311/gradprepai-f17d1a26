import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';

export const CTASection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Card */}
          <div className="relative rounded-3xl p-12 md:p-16 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" />
            <div className="absolute inset-0 glass" />
            
            {/* Animated border */}
            <div className="absolute inset-0 rounded-3xl animated-border opacity-50" />
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-8"
              >
                <Zap className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Ready to Ace Your
                <br />
                <span className="gradient-text">Next Interview?</span>
              </h2>
              
              <p className="text-xl text-muted-foreground max-w-xl mx-auto mb-10">
                Join 50,000+ graduates who transformed their interview skills 
                with GradPrep AI. Start your free trial today.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <GlowButton size="lg" className="min-w-[200px]">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </GlowButton>
                </Link>
                <Link to="/signin">
                  <GlowButton variant="outline" size="lg" className="min-w-[200px]">
                    Sign In
                  </GlowButton>
                </Link>
              </div>
              
              <p className="mt-6 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 inline mr-1" />
                No credit card required • Free forever plan available
              </p>
            </div>
            
            {/* Decorative elements */}
            <motion.div
              animate={{ y: [-20, 20, -20] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute -top-10 -left-10 w-40 h-40 bg-primary/30 rounded-full blur-[80px]"
            />
            <motion.div
              animate={{ y: [20, -20, 20] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/30 rounded-full blur-[80px]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
