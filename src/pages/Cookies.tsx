import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Cookie } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';

const Cookies = () => {
  return (
    <>
      <Helmet>
        <title>Cookie Policy - GradPrep AI</title>
        <meta name="description" content="Learn about how GradPrep AI uses cookies and similar technologies." />
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
                <Cookie className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Legal
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Cookie <span className="gradient-text">Policy</span>
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
                <h2 className="text-foreground">What Are Cookies?</h2>
                <p className="text-muted-foreground">
                  Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, keep you logged in, and understand how you use the site.
                </p>

                <h2 className="text-foreground">How We Use Cookies</h2>
                <p className="text-muted-foreground">
                  GradPrep AI uses cookies for the following purposes:
                </p>
                <ul className="text-muted-foreground">
                  <li><strong>Essential cookies:</strong> Required for the website to function properly, including authentication and security.</li>
                  <li><strong>Analytics cookies:</strong> Help us understand how visitors use our site, which pages are popular, and how we can improve.</li>
                  <li><strong>Preference cookies:</strong> Remember your settings and preferences, such as language and theme.</li>
                  <li><strong>Marketing cookies:</strong> Used to deliver relevant advertisements and track campaign effectiveness.</li>
                </ul>

                <h2 className="text-foreground">Types of Cookies We Use</h2>
                
                <h3 className="text-foreground">Essential Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies are necessary for the website to function and cannot be disabled. They include session cookies for authentication and security tokens.
                </p>

                <h3 className="text-foreground">Performance Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies collect anonymous information about how you use our website, such as which pages you visit and any errors you encounter. We use this data to improve our services.
                </p>

                <h3 className="text-foreground">Functionality Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies remember your preferences, such as your preferred language or theme settings, to provide a more personalized experience.
                </p>

                <h2 className="text-foreground">Third-Party Cookies</h2>
                <p className="text-muted-foreground">
                  Some cookies are placed by third-party services that appear on our pages. We do not control these cookies. Third parties that may set cookies include analytics providers and advertising partners.
                </p>

                <h2 className="text-foreground">Managing Cookies</h2>
                <p className="text-muted-foreground">
                  You can control and manage cookies through your browser settings. Most browsers allow you to:
                </p>
                <ul className="text-muted-foreground">
                  <li>View what cookies are stored and delete them individually</li>
                  <li>Block third-party cookies</li>
                  <li>Block cookies from specific sites</li>
                  <li>Block all cookies</li>
                  <li>Delete all cookies when you close your browser</li>
                </ul>
                <p className="text-muted-foreground">
                  Please note that blocking cookies may affect the functionality of our website.
                </p>

                <h2 className="text-foreground">Updates to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this cookie policy from time to time. Any changes will be posted on this page with an updated revision date.
                </p>

                <h2 className="text-foreground">Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have questions about our use of cookies, please contact us at{' '}
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

export default Cookies;
