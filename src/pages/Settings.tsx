import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  Moon,
  Sun,
  Monitor,
  Mail,
  Phone,
  Save,
  ArrowLeft
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { profile, updateProfile, isUpdating } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    phone: '',
    bio: '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    interview_reminders: true,
    weekly_summary: true,
  });

  const [theme, setTheme] = useState('system');

  // Sync state with profile when loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
      });
      setNotifications({
        email: profile.notification_email ?? true,
        push: profile.notification_push ?? true,
        interview_reminders: profile.notification_interview_reminders ?? true,
        weekly_summary: profile.notification_weekly_summary ?? true,
      });
      setTheme(profile.theme_preference || 'system');
    }
  }, [profile, user?.email]);

  // Apply theme to document
  useEffect(() => {
    const applyTheme = (themeName: string) => {
      const root = document.documentElement;
      if (themeName === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else if (themeName === 'light') {
        root.classList.remove('dark');
        root.classList.add('light');
      } else {
        // System theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
          root.classList.remove('light');
        } else {
          root.classList.remove('dark');
          root.classList.add('light');
        }
      }
    };
    applyTheme(theme);
  }, [theme]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        display_name: formData.display_name,
        phone: formData.phone,
        bio: formData.bio,
      });
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await updateProfile({
        notification_email: notifications.email,
        notification_push: notifications.push,
        notification_interview_reminders: notifications.interview_reminders,
        notification_weekly_summary: notifications.weekly_summary,
      });
      toast({
        title: "Notifications updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notifications. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveTheme = async () => {
    try {
      // Apply theme immediately
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else if (theme === 'light') {
        root.classList.remove('dark');
        root.classList.add('light');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
          root.classList.remove('light');
        } else {
          root.classList.remove('dark');
          root.classList.add('light');
        }
      }
      
      await updateProfile({ theme_preference: theme });
      toast({
        title: "Theme updated",
        description: "Your theme preference has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update theme. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      await signOut();
      navigate('/');
      toast({
        title: "Account deleted",
        description: "Your account has been deleted.",
      });
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Please sign in to access settings</h1>
          <Link to="/signin">
            <GlowButton>Sign In</GlowButton>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Settings - GradPrep AI</title>
        <meta name="description" content="Manage your account settings, preferences, and notifications." />
      </Helmet>

      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2">
                <Monitor className="w-4 h-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="w-4 h-4" />
                Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-6">Profile Information</h2>
                  
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={formData.display_name}
                        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                        placeholder="Your name"
                        className="bg-muted/50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          value={formData.email}
                          disabled
                          className="pl-10 bg-muted/50 opacity-70"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className="pl-10 bg-muted/50"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        className="w-full px-3 py-2 bg-muted/50 border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    
                    <GlowButton onClick={handleSaveProfile} disabled={isUpdating}>
                      <Save className="w-4 h-4 mr-2" />
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </GlowButton>
                  </div>
                </GlassCard>
              </motion.div>
            </TabsContent>

            <TabsContent value="notifications">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-6 max-w-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Browser push notifications</p>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Interview Reminders</p>
                        <p className="text-sm text-muted-foreground">Reminders to practice regularly</p>
                      </div>
                      <Switch
                        checked={notifications.interview_reminders}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, interview_reminders: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Weekly Summary</p>
                        <p className="text-sm text-muted-foreground">Weekly progress reports</p>
                      </div>
                      <Switch
                        checked={notifications.weekly_summary}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, weekly_summary: checked })}
                      />
                    </div>
                    
                    <GlowButton onClick={handleSaveNotifications} disabled={isUpdating}>
                      <Save className="w-4 h-4 mr-2" />
                      {isUpdating ? 'Saving...' : 'Save Preferences'}
                    </GlowButton>
                  </div>
                </GlassCard>
              </motion.div>
            </TabsContent>

            <TabsContent value="appearance">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-6">Appearance</h2>
                  
                  <div className="space-y-4 max-w-md">
                    <p className="text-muted-foreground">Choose your preferred theme</p>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'light', icon: Sun, label: 'Light' },
                        { value: 'dark', icon: Moon, label: 'Dark' },
                        { value: 'system', icon: Monitor, label: 'System' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTheme(option.value)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            theme === option.value
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-muted-foreground'
                          }`}
                        >
                          <option.icon className={`w-6 h-6 mx-auto mb-2 ${
                            theme === option.value ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                          <p className={`text-sm font-medium ${
                            theme === option.value ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            {option.label}
                          </p>
                        </button>
                      ))}
                    </div>
                    
                    <GlowButton onClick={handleSaveTheme} disabled={isUpdating}>
                      <Save className="w-4 h-4 mr-2" />
                      {isUpdating ? 'Saving...' : 'Save Theme'}
                    </GlowButton>
                  </div>
                </GlassCard>
              </motion.div>
            </TabsContent>

            <TabsContent value="security">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <GlassCard>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-6">Account Management</h2>
                  
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="font-medium text-foreground mb-1">Connected Email</p>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="font-medium text-foreground mb-1">Account Created</p>
                      <p className="text-muted-foreground">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </GlassCard>
                
                <GlassCard className="border-destructive/20">
                  <h2 className="font-display text-xl font-semibold text-destructive mb-4">Danger Zone</h2>
                  <p className="text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <GlowButton variant="outline" onClick={handleDeleteAccount} className="border-destructive text-destructive hover:bg-destructive/10">
                    Delete Account
                  </GlowButton>
                </GlassCard>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </>
  );
}
