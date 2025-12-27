import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { HelpCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How does the AI interviewer work?',
    answer: 'Our AI interviewer uses advanced natural language processing to conduct realistic mock interviews. It asks role-specific questions, listens to your responses via voice or text, and provides detailed feedback on your answers, communication style, and areas for improvement.',
  },
  {
    question: 'What types of roles can I practice for?',
    answer: 'GradPrep AI supports over 20 tech roles including Frontend Developer, Backend Developer, Full Stack Developer, Data Scientist, DevOps Engineer, Cloud Engineer, AI/ML Engineer, Cybersecurity Analyst, QA Engineer, and more. Each role has tailored questions and evaluation criteria.',
  },
  {
    question: 'Can I use GradPrep AI for non-technical interviews?',
    answer: 'Currently, GradPrep AI is specialized for technical and tech-adjacent roles. We focus on behavioral questions, technical concepts, and role-specific scenarios. We are working on expanding to other industries in the future.',
  },
  {
    question: 'How accurate is the AI feedback?',
    answer: 'Our AI has been trained on thousands of real interview scenarios and feedback from hiring managers. While no AI is perfect, our feedback helps identify common mistakes, improve clarity of responses, and build confidence. We recommend using it alongside mentorship and real practice.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we take privacy seriously. Your interview recordings and resume data are encrypted and stored securely. We do not share your personal information with third parties. You can delete your data at any time from your account settings.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Absolutely! You can cancel your Pro subscription at any time from your account settings. You will continue to have access until the end of your billing period, and you can always return to the free plan.',
  },
  {
    question: 'Do you offer student discounts?',
    answer: 'Yes! We offer a 50% discount for students with a valid .edu email address. Contact our support team with your student email to receive your discount code.',
  },
  {
    question: 'How do I get started with voice interviews?',
    answer: 'Voice interviews are available on the Pro plan. Simply start a new interview session, allow microphone access when prompted, and speak your answers naturally. The AI will transcribe and analyze your responses in real-time.',
  },
];

const FAQ = () => {
  return (
    <>
      <Helmet>
        <title>FAQ - GradPrep AI</title>
        <meta name="description" content="Frequently asked questions about GradPrep AI's AI-powered interview preparation platform." />
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
                <HelpCircle className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Got Questions?
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Frequently Asked
                <br />
                <span className="gradient-text">Questions</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about GradPrep AI and how it can help you ace your interviews.
              </p>
            </motion.div>

            {/* FAQ Accordion */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="glass border border-border/50 rounded-xl px-6 overflow-hidden"
                  >
                    <AccordionTrigger className="text-left text-foreground hover:text-primary py-6">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-16"
            >
              <p className="text-muted-foreground">
                Still have questions?{' '}
                <a href="mailto:support@gradprep.ai" className="text-primary hover:underline">
                  Contact our support team
                </a>
              </p>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FAQ;
