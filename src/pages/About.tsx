import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Target, Heart, Users, Lightbulb, Instagram, Mail, Facebook, Linkedin } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';

const developers = [
  {
    name: 'Amd Siddu',
    role: 'Lead Developer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    socials: {
      instagram: '#',
      gmail: 'mailto:amdsiddu@gmail.com',
      facebook: '#',
      linkedin: '#',
    },
  },
];

const values = [
  {
    icon: Target,
    title: 'Mission-Driven',
    description: 'We believe every graduate deserves a fair shot at their dream job, regardless of their background or connections.',
  },
  {
    icon: Heart,
    title: 'Student-First',
    description: 'Everything we build starts with understanding the challenges students face during their job search.',
  },
  {
    icon: Users,
    title: 'Inclusive',
    description: 'We design for accessibility and work to reduce bias in hiring through structured interview preparation.',
  },
  {
    icon: Lightbulb,
    title: 'Innovative',
    description: 'We leverage cutting-edge AI to create experiences that were previously only available to the privileged few.',
  },
];

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - GradPrep AI</title>
        <meta name="description" content="Learn about GradPrep AI's mission to democratize interview preparation and help graduates land their dream tech jobs." />
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
                About
                <br />
                <span className="gradient-text">GradPrep AI</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Empowering the next generation of tech professionals through AI-powered interview preparation.
              </p>
            </motion.div>

            {/* Story Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-4xl mx-auto mb-20"
            >
              <GlassCard>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    GradPrep AI was born from a simple observation: interview preparation has always been unequal. Students at top universities get access to career centers, alumni networks, and mock interview sessions. Everyone else has to figure it out on their own.
                  </p>
                  <p>
                    We set out to change that. Using advances in AI and natural language processing, we created an AI interviewer that can provide the same quality of practice and feedback that was previously available only to a select few.
                  </p>
                  <p>
                    Today, GradPrep AI helps thousands of students and recent graduates prepare for technical interviews. Our platform adapts to each user, providing personalized questions and feedback that helps them improve with every session.
                  </p>
                </div>
              </GlassCard>
            </motion.div>

            {/* Developers Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mb-20"
            >
              <h2 className="font-display text-3xl font-bold text-center text-foreground mb-12">Our Developer</h2>
              <div className="flex justify-center max-w-7xl mx-auto">
                {developers.map((dev, index) => (
                  <motion.div
                    key={dev.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <GlassCard className="h-full text-center p-6">
                      <div className="relative mx-auto mb-4 w-24 h-24 rounded-full overflow-hidden ring-2 ring-primary/30">
                        <img 
                          src={dev.image} 
                          alt={dev.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-foreground mb-1">{dev.name}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{dev.role}</p>
                      <div className="flex justify-center gap-3">
                        <a 
                          href={dev.socials.instagram} 
                          className="text-muted-foreground hover:text-primary transition-colors"
                          aria-label={`${dev.name}'s Instagram`}
                        >
                          <Instagram className="w-5 h-5" />
                        </a>
                        <a 
                          href={dev.socials.gmail} 
                          className="text-muted-foreground hover:text-primary transition-colors"
                          aria-label={`Email ${dev.name}`}
                        >
                          <Mail className="w-5 h-5" />
                        </a>
                        <a 
                          href={dev.socials.facebook} 
                          className="text-muted-foreground hover:text-primary transition-colors"
                          aria-label={`${dev.name}'s Facebook`}
                        >
                          <Facebook className="w-5 h-5" />
                        </a>
                        <a 
                          href={dev.socials.linkedin} 
                          className="text-muted-foreground hover:text-primary transition-colors"
                          aria-label={`${dev.name}'s LinkedIn`}
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Values Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-20"
            >
              <h2 className="font-display text-3xl font-bold text-center text-foreground mb-12">Our Values</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {values.map((value, index) => (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  >
                    <GlassCard className="h-full text-center">
                      <value.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                      <h3 className="font-display text-lg font-semibold text-foreground mb-3">{value.title}</h3>
                      <p className="text-muted-foreground text-sm">{value.description}</p>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Contact Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <GlassCard className="max-w-2xl mx-auto">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Get in Touch</h2>
                <p className="text-muted-foreground mb-4">
                  We would love to hear from you. Whether you have feedback, questions, or partnership inquiries, reach out to us.
                </p>
                <a href="mailto:hello@gradprep.ai" className="text-primary hover:underline text-lg font-medium">
                  hello@gradprep.ai
                </a>
              </GlassCard>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default About;
