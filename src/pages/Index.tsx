import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { RolesSection } from '@/components/landing/RolesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/layout/Footer';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>GradPrep AI - AI-Powered Interview Preparation for Tech Roles</title>
        <meta 
          name="description" 
          content="Practice mock interviews with AI, get instant feedback, and land your dream tech job. Built for fresh graduates preparing for software and tech roles." 
        />
      </Helmet>
      
      <div className="min-h-screen">
        <AnimatedBackground />
        <Navbar />
        <main>
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <RolesSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
