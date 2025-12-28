import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Sparkles, ArrowLeft, CheckCircle } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlowButton } from '@/components/ui/GlowButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    setEmailSent(true);
    setIsLoading(false);
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email sent",
        description: "A new password reset link has been sent to your email.",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password - GradPrep AI</title>
        <meta name="description" content="Reset your GradPrep AI account password." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-4">
        <AnimatedBackground />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Link to="/signin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>

          <GlassCard hover={false} className="p-8">
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
                <span className="font-display text-xl font-bold gradient-text">GradPrep AI</span>
              </Link>
              
              {emailSent ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                    Check your email
                  </h1>
                  <p className="text-muted-foreground">
                    We've sent a password reset link to <span className="text-foreground font-medium">{email}</span>
                  </p>
                </>
              ) : (
                <>
                  <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                    Forgot your password?
                  </h1>
                  <p className="text-muted-foreground">
                    Enter your email and we'll send you a reset link
                  </p>
                </>
              )}
            </div>

            {emailSent ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder or click below to resend.
                </p>
                <GlowButton
                  onClick={handleResendEmail}
                  className="w-full"
                  variant="outline"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Resend Email'}
                </GlowButton>
                <Link to="/signin" className="block">
                  <GlowButton className="w-full">
                    Back to Sign In
                  </GlowButton>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-muted/50 border-glass-border/50 focus:border-primary/50"
                      required
                    />
                  </div>
                </div>

                <GlowButton
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      />
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </GlowButton>
              </form>
            )}

            <p className="text-center text-sm text-muted-foreground mt-6">
              Remember your password?{' '}
              <Link to="/signin" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </>
  );
}