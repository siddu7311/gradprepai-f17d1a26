import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Check, Crown, RefreshCw, Sparkles, Calendar, QrCode } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlowButton } from '@/components/ui/GlowButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { useSubscription, PLANS } from '@/hooks/useSubscription';
import { UpiPaymentModal } from '@/components/ui/UpiPaymentModal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const Subscription = () => {
  const { user, loading: authLoading } = useAuth();
  const { isPro, subscriptionEnd, loading, checkSubscription } = useSubscription();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payModalOpen, setPayModalOpen] = useState(false);
  
  const success = searchParams.get('success') === 'true';

  useEffect(() => {
    if (success) {
      toast({
        title: "Welcome to Pro!",
        description: "Your subscription is now active. Enjoy unlimited features!",
      });
      // Refresh subscription status
      checkSubscription();
    }
  }, [success, toast, checkSubscription]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin?redirect=/subscription');
    }
  }, [user, authLoading, navigate]);

  const handleUpgrade = () => setPayModalOpen(true);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Subscription - GradPrep AI</title>
        <meta name="description" content="Manage your GradPrep AI subscription and billing." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <AnimatedBackground />
        <Navbar />

        <main className="relative z-10 pt-32 pb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Your <span className="gradient-text">Subscription</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your plan and billing details
              </p>
            </motion.div>

            {/* Current Plan Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <GlassCard className={`mb-8 ${isPro ? 'border-primary/50 shadow-glow' : ''}`}>
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isPro ? 'bg-primary/20' : 'bg-muted'}`}>
                      {isPro ? (
                        <Crown className="w-8 h-8 text-primary" />
                      ) : (
                        <Sparkles className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-2xl font-bold text-foreground">
                          {isPro ? 'Pro Plan' : 'Free Plan'}
                        </h2>
                        {isPro && (
                          <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        {isPro 
                          ? 'Unlimited interviews & premium features' 
                          : '5 interviews per month with basic features'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-3xl font-bold gradient-text">
                      {isPro ? `₹${PLANS.PRO.price}` : '₹0'}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {isPro ? 'per month' : 'forever'}
                    </div>
                  </div>
                </div>

                {isPro && subscriptionEnd && (
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Pro access valid till: {format(new Date(subscriptionEnd), 'MMMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  {isPro ? (
                    <>
                      <GlowButton onClick={() => checkSubscription()} variant="ghost">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Status
                      </GlowButton>
                      <GlowButton onClick={handleUpgrade} variant="outline">
                        <QrCode className="w-4 h-4 mr-2" />
                        Renew with UPI QR
                      </GlowButton>
                    </>
                  ) : (
                    <GlowButton onClick={handleUpgrade} variant="primary">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </GlowButton>
                  )}
                </div>
              </GlassCard>
            </motion.div>

            {/* Features Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GlassCard>
                <h3 className="font-display text-xl font-bold text-foreground mb-6">
                  {isPro ? 'Your Pro Features' : 'Upgrade to unlock'}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Unlimited mock interviews',
                    'Advanced AI feedback with tips',
                    'Voice interview practice',
                    'All role categories',
                    'Performance analytics',
                    'Priority support',
                    'Interview recording & playback',
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className={`w-5 h-5 ${isPro ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={isPro ? 'text-foreground' : 'text-muted-foreground'}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {!isPro && (
                  <div className="mt-8 pt-6 border-t border-border/50">
                    <GlowButton onClick={handleUpgrade} className="w-full">
                      Start Pro for ₹{PLANS.PRO.price}/month
                      <QrCode className="w-4 h-4 ml-2" />
                    </GlowButton>
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center mt-12"
            >
              <p className="text-muted-foreground">
                Have questions about billing?{' '}
                <Link to="/faq" className="text-primary hover:underline">
                  Check our FAQ
                </Link>
                {' '}or contact support
              </p>
            </motion.div>
          </div>
        </main>

        <Footer />

        <UpiPaymentModal
          isOpen={payModalOpen}
          onClose={() => setPayModalOpen(false)}
        />
      </div>
    </>
  );
};

export default Subscription;
