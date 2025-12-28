import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Sparkles, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlowButton } from '@/components/ui/GlowButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyEmail() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const checkVerification = async () => {
      // Check URL hash for email confirmation tokens
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      
      if (type === 'email' || type === 'signup') {
        // Email was just confirmed via link
        setIsVerified(true);
        setIsVerifying(false);
        
        // Get current session to show user email
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          setUserEmail(session.user.email);
        }
        return;
      }

      // Check if user is logged in and email is confirmed
      if (user) {
        setUserEmail(user.email || null);
        // In Supabase, if auto-confirm is disabled, email_confirmed_at will be null until confirmed
        const emailConfirmed = user.email_confirmed_at !== null;
        setIsVerified(emailConfirmed);
      }
      
      setIsVerifying(false);
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUserEmail(session.user.email || null);
        const emailConfirmed = session.user.email_confirmed_at !== null;
        setIsVerified(emailConfirmed);
        setIsVerifying(false);
      }
    });

    checkVerification();

    return () => subscription.unsubscribe();
  }, [user]);

  const handleResendVerification = async () => {
    if (!userEmail) {
      toast({
        title: "Error",
        description: "No email address found. Please sign up again.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: userEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
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
        description: "A new verification link has been sent to your email.",
      });
    }

    setIsResending(false);
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AnimatedBackground />
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-muted-foreground">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Verify Email - GradPrep AI</title>
        <meta name="description" content="Verify your email address for GradPrep AI." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-4">
        <AnimatedBackground />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <GlassCard hover={false} className="p-8">
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
                <span className="font-display text-xl font-bold gradient-text">GradPrep AI</span>
              </Link>
              
              {isVerified ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                    Email Verified!
                  </h1>
                  <p className="text-muted-foreground">
                    Your email has been successfully verified. You can now access all features.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                    Verify Your Email
                  </h1>
                  <p className="text-muted-foreground">
                    {userEmail ? (
                      <>We've sent a verification link to <span className="text-foreground font-medium">{userEmail}</span></>
                    ) : (
                      'Please check your email for a verification link'
                    )}
                  </p>
                </>
              )}
            </div>

            {isVerified ? (
              <div className="space-y-4">
                <GlowButton
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                >
                  Go to Dashboard
                </GlowButton>
                <Link to="/" className="block">
                  <GlowButton variant="outline" className="w-full">
                    Back to Home
                  </GlowButton>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <h3 className="font-medium text-foreground mb-2">Didn't receive the email?</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Check your spam or junk folder</li>
                    <li>• Make sure you entered the correct email</li>
                    <li>• Wait a few minutes and try again</li>
                  </ul>
                </div>

                <GlowButton
                  onClick={handleResendVerification}
                  className="w-full"
                  variant="outline"
                  disabled={isResending || !userEmail}
                >
                  {isResending ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Resend Verification Email
                    </span>
                  )}
                </GlowButton>

                <Link to="/signin" className="block">
                  <GlowButton variant="ghost" className="w-full">
                    Back to Sign In
                  </GlowButton>
                </Link>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </>
  );
}