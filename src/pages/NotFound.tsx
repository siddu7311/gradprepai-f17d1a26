import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlowButton } from '@/components/ui/GlowButton';
import { Footer } from '@/components/layout/Footer';
import { Sparkles, Home } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="font-display text-lg font-bold gradient-text">GradPrep AI</span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-8xl font-bold gradient-text">404</h1>
          <p className="mb-8 text-xl text-muted-foreground">Oops! Page not found</p>
          <Link to="/">
            <GlowButton size="lg">
              <Home className="w-5 h-5 mr-2" />
              Return to Home
            </GlowButton>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
