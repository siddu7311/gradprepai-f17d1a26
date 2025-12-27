import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Shield } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - GradPrep AI</title>
        <meta name="description" content="Learn how GradPrep AI collects, uses, and protects your personal information." />
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
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Legal
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Privacy <span className="gradient-text">Policy</span>
              </h1>
              <p className="text-muted-foreground">Last updated: January 2025</p>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <GlassCard className="prose prose-invert max-w-none">
                <h2 className="text-foreground">1. Information We Collect</h2>
                <p className="text-muted-foreground">
                  We collect information you provide directly, including your name, email address, and resume data when you create an account. We also collect interview recordings and performance data to provide our services.
                </p>

                <h2 className="text-foreground">2. How We Use Your Information</h2>
                <p className="text-muted-foreground">
                  We use your information to provide and improve our AI interview preparation services. This includes analyzing your responses to provide feedback, tracking your progress, and customizing your experience.
                </p>

                <h2 className="text-foreground">3. Data Storage and Security</h2>
                <p className="text-muted-foreground">
                  Your data is stored securely using industry-standard encryption. We use secure cloud infrastructure to protect your personal information and interview recordings. Access to your data is strictly limited to authorized personnel.
                </p>

                <h2 className="text-foreground">4. Data Sharing</h2>
                <p className="text-muted-foreground">
                  We do not sell your personal information to third parties. We may share anonymized, aggregated data for research purposes. We may share data with service providers who help us operate our platform, subject to confidentiality agreements.
                </p>

                <h2 className="text-foreground">5. Your Rights</h2>
                <p className="text-muted-foreground">
                  You have the right to access, correct, or delete your personal data. You can export your data or close your account at any time from your account settings. We will respond to data requests within 30 days.
                </p>

                <h2 className="text-foreground">6. Cookies and Tracking</h2>
                <p className="text-muted-foreground">
                  We use cookies and similar technologies to improve your experience, analyze usage patterns, and provide personalized content. You can control cookie preferences through your browser settings.
                </p>

                <h2 className="text-foreground">7. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Our services are not intended for users under 16 years of age. We do not knowingly collect personal information from children under 16.
                </p>

                <h2 className="text-foreground">8. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this privacy policy from time to time. We will notify you of significant changes by email or through a notice on our platform.
                </p>

                <h2 className="text-foreground">9. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have questions about this privacy policy, please contact us at{' '}
                  <a href="mailto:privacy@gradprep.ai" className="text-primary hover:underline">privacy@gradprep.ai</a>.
                </p>
              </GlassCard>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Privacy;
