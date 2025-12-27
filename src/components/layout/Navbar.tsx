import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Roles', href: '#roles' },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-primary/5"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                className="relative"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="w-8 h-8 text-primary" />
                <div className="absolute inset-0 blur-lg bg-primary/50 animate-pulse" />
              </motion.div>
              <span className="font-display text-xl font-bold gradient-text">
                GradPrep AI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors relative group font-medium"
                  whileHover={{ y: -2 }}
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/signin">
                <GlowButton variant="ghost" size="sm">
                  Sign In
                </GlowButton>
              </Link>
              <Link to="/signup">
                <GlowButton variant="primary" size="sm">
                  Get Started
                </GlowButton>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden pt-20"
          >
            <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative flex flex-col items-center justify-center h-full gap-8 p-8"
            >
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-display font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </motion.a>
              ))}
              <div className="flex flex-col gap-4 mt-8 w-full max-w-xs">
                <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                  <GlowButton variant="outline" className="w-full">
                    Sign In
                  </GlowButton>
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <GlowButton variant="primary" className="w-full">
                    Get Started
                  </GlowButton>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
