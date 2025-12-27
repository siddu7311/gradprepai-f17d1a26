import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Settings, 
  User, 
  LayoutDashboard,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';

interface MainLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function MainLayout({ children, showFooter = true }: MainLayoutProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate('/');
  };

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="font-display text-lg font-bold gradient-text">GradPrep AI</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
                </motion.button>
              </Link>
              
              <Link to="/settings">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground hidden sm:block">
                      {profile?.display_name || 'My Account'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  );
}
