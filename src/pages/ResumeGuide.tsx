import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FileText, CheckCircle, XCircle, Star, Layout, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';

const dos = [
  'Keep it to one page for early career roles',
  'Use action verbs to start each bullet point',
  'Quantify achievements with numbers and percentages',
  'Tailor your resume for each application',
  'Include relevant projects with GitHub links',
  'List technical skills prominently',
  'Proofread multiple times for errors',
];

const donts = [
  'Include a photo or personal details',
  'Use generic objective statements',
  'List every technology you have touched',
  'Include references or "available upon request"',
  'Use fancy fonts or excessive colors',
  'Exceed two pages unless you have 10+ years experience',
  'Lie or exaggerate your experience',
];

const sections = [
  {
    icon: Star,
    title: 'Contact Information',
    description: 'Include your name, phone, email, LinkedIn, and GitHub. Keep it professional and easy to find.',
  },
  {
    icon: Layout,
    title: 'Education',
    description: 'List your degree, university, graduation date, and relevant coursework. Include GPA if above 3.0.',
  },
  {
    icon: Zap,
    title: 'Experience',
    description: 'Focus on impact, not just responsibilities. Use metrics and specific technologies used.',
  },
  {
    icon: FileText,
    title: 'Projects',
    description: 'Showcase 2-3 relevant projects. Include the problem solved, your role, and technologies used.',
  },
];

const ResumeGuide = () => {
  return (
    <>
      <Helmet>
        <title>Resume Guide - GradPrep AI</title>
        <meta name="description" content="Create a standout tech resume with our comprehensive guide. Learn what to include, common mistakes to avoid, and how to stand out." />
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Career Resources
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Resume
                <br />
                <span className="gradient-text">Writing Guide</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Craft a resume that gets you noticed by recruiters and passes ATS systems.
              </p>
            </motion.div>

            {/* Key Sections */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-16"
            >
              <h2 className="font-display text-2xl font-bold text-center text-foreground mb-8">Essential Sections</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {sections.map((section, index) => (
                  <GlassCard key={section.title} className="text-center">
                    <section.icon className="w-10 h-10 mx-auto mb-4 text-primary" />
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">{section.title}</h3>
                    <p className="text-muted-foreground text-sm">{section.description}</p>
                  </GlassCard>
                ))}
              </div>
            </motion.div>

            {/* Do's and Don'ts */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <GlassCard className="h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <h3 className="font-display text-2xl font-bold text-foreground">Do</h3>
                  </div>
                  <ul className="space-y-3">
                    {dos.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <GlassCard className="h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <XCircle className="w-8 h-8 text-red-500" />
                    <h3 className="font-display text-2xl font-bold text-foreground">Don&apos;t</h3>
                  </div>
                  <ul className="space-y-3">
                    {donts.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </motion.div>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center"
            >
              <GlassCard className="max-w-2xl mx-auto">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Ready to Build Your Resume?</h2>
                <p className="text-muted-foreground mb-6">
                  Use our AI-powered resume builder to create a professional resume in minutes.
                </p>
                <Link to="/resume-builder">
                  <GlowButton size="lg">
                    Try Resume Builder
                  </GlowButton>
                </Link>
              </GlassCard>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ResumeGuide;
