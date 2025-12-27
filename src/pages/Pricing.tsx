import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlowButton } from '@/components/ui/GlowButton';
import { GlassCard } from '@/components/ui/GlassCard';

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: '$0',
    period: 'forever',
    icon: Sparkles,
    features: [
      '5 mock interviews per month',
      'Basic AI feedback',
      'Resume upload & analysis',
      '3 role categories',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'Best for serious job seekers',
    price: '$19',
    period: 'per month',
    icon: Zap,
    features: [
      'Unlimited mock interviews',
      'Advanced AI feedback with tips',
      'Voice interview practice',
      'All role categories',
      'Performance analytics',
      'Priority support',
      'Interview recording & playback',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For universities & bootcamps',
    price: 'Custom',
    period: 'contact us',
    icon: Crown,
    features: [
      'Everything in Pro',
      'Bulk student licenses',
      'Admin dashboard',
      'Custom role categories',
      'API access',
      'Dedicated account manager',
      'White-label options',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const Pricing = () => {
  return (
    <>
      <Helmet>
        <title>Pricing - GradPrep AI</title>
        <meta name="description" content="Choose the perfect plan for your interview preparation journey. Start free or upgrade for unlimited AI-powered mock interviews." />
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
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Simple, Transparent
                <br />
                <span className="gradient-text">Pricing</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Invest in your career with plans designed for every stage of your job search.
              </p>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={plan.popular ? 'relative pt-6' : ''}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 bg-primary rounded-full text-primary-foreground text-sm font-semibold shadow-lg">
                      Most Popular
                    </div>
                  )}
                  <GlassCard className={`h-full flex flex-col ${plan.popular ? 'border-primary/50 shadow-glow' : ''}`}>
                    <div className="text-center mb-6">
                      <plan.icon className={`w-12 h-12 mx-auto mb-4 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                      <h3 className="font-display text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                      <p className="text-muted-foreground text-sm">{plan.description}</p>
                    </div>

                    <div className="text-center mb-8">
                      <span className="font-display text-5xl font-bold gradient-text">{plan.price}</span>
                      <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                    </div>

                    <ul className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link to="/signup">
                      <GlowButton
                        variant={plan.popular ? 'primary' : 'outline'}
                        className="w-full"
                      >
                        {plan.cta}
                      </GlowButton>
                    </Link>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {/* FAQ Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-16"
            >
              <p className="text-muted-foreground">
                Have questions?{' '}
                <Link to="/faq" className="text-primary hover:underline">
                  Check our FAQ
                </Link>
              </p>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Pricing;
