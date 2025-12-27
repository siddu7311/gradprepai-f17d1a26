import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FileText } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - GradPrep AI</title>
        <meta name="description" content="Terms and conditions for using GradPrep AI's interview preparation platform." />
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
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Legal
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Terms of <span className="gradient-text">Service</span>
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
                <h2 className="text-foreground">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing or using GradPrep AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>

                <h2 className="text-foreground">2. Description of Service</h2>
                <p className="text-muted-foreground">
                  GradPrep AI provides an AI-powered interview preparation platform. Our services include mock interviews, resume analysis, feedback, and educational resources to help users prepare for job interviews.
                </p>

                <h2 className="text-foreground">3. User Accounts</h2>
                <p className="text-muted-foreground">
                  You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate information and be at least 16 years old.
                </p>

                <h2 className="text-foreground">4. Acceptable Use</h2>
                <p className="text-muted-foreground">
                  You agree not to misuse our services. This includes not attempting to access accounts that are not yours, not interfering with our systems, not uploading harmful content, and not using our services for any illegal purposes.
                </p>

                <h2 className="text-foreground">5. Subscription and Payments</h2>
                <p className="text-muted-foreground">
                  Some features require a paid subscription. Subscriptions are billed in advance on a monthly or annual basis. You can cancel at any time, and access continues until the end of your billing period. Refunds are provided in accordance with our refund policy.
                </p>

                <h2 className="text-foreground">6. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  All content, features, and functionality of GradPrep AI are owned by us and protected by copyright and other intellectual property laws. You may not copy, modify, or distribute our content without permission.
                </p>

                <h2 className="text-foreground">7. User Content</h2>
                <p className="text-muted-foreground">
                  You retain ownership of content you upload, such as resumes and interview recordings. By uploading content, you grant us a license to use it to provide our services. You are responsible for ensuring you have the right to share any content you upload.
                </p>

                <h2 className="text-foreground">8. Disclaimer of Warranties</h2>
                <p className="text-muted-foreground">
                  Our services are provided "as is" without warranties of any kind. We do not guarantee that our AI feedback will result in job offers or that our services will be uninterrupted or error-free.
                </p>

                <h2 className="text-foreground">9. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  To the maximum extent permitted by law, GradPrep AI shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.
                </p>

                <h2 className="text-foreground">10. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We may modify these terms at any time. We will notify you of significant changes. Continued use of our services after changes constitutes acceptance of the new terms.
                </p>

                <h2 className="text-foreground">11. Contact</h2>
                <p className="text-muted-foreground">
                  For questions about these terms, contact us at{' '}
                  <a href="mailto:legal@gradprep.ai" className="text-primary hover:underline">legal@gradprep.ai</a>.
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

export default Terms;
