import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScheduleManager from './ScheduleManager';
import LusyVoiceAssistant from './LusyVoiceAssistant';
import { useScheduleNotifications } from '@/hooks/useScheduleNotifications';

const FloatingBubbles = () => {
  const [activePanel, setActivePanel] = useState<'schedule' | 'chat' | null>(null);
  const { pathname } = useLocation();

  useEffect(() => { setActivePanel(null); }, [pathname]);
  useEffect(() => {
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActivePanel(null);
    };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, []);

  // App-wide reminder watcher so notifications fire on any page / background tab.
  useScheduleNotifications();

  const togglePanel = (panel: 'schedule' | 'chat') => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
      {/* Panels */}
      <AnimatePresence>
        {activePanel === 'schedule' && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
             className="absolute bottom-36 right-0 w-80 sm:w-96 max-w-[calc(100vw-3rem)]"
          >
            <ScheduleManager onClose={() => setActivePanel(null)} />
          </motion.div>
        )}
        {activePanel === 'chat' && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
             className="absolute bottom-36 right-0 w-80 sm:w-96 max-w-[calc(100vw-3rem)]"
          >
            <LusyVoiceAssistant onClose={() => setActivePanel(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Bubble */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => togglePanel('schedule')}
        aria-label="Open schedule"
        title="Schedule Manager"
        aria-expanded={activePanel === 'schedule'}
        className={`w-14 h-14 rounded-full shadow-lg transition-all flex items-center justify-center ${
          activePanel === 'schedule' 
            ? 'bg-primary text-primary-foreground shadow-primary/30' 
            : 'bg-card text-foreground hover:bg-primary hover:text-primary-foreground border border-border hover:border-primary hover:shadow-primary/20'
        }`}
        style={{
          boxShadow: activePanel === 'schedule' 
            ? '0 8px 32px -4px hsl(var(--primary) / 0.4)' 
            : '0 8px 24px -4px hsl(var(--background) / 0.3)'
        }}
      >
        <Calendar className="w-6 h-6" />
      </motion.button>

      {/* LUSY Voice Assistant Bubble */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => togglePanel('chat')}
        aria-label="Open LUSY assistant"
        title="LUSY assistant"
        className={`w-14 h-14 rounded-full shadow-lg transition-all flex items-center justify-center ${
          activePanel === 'chat' 
            ? 'bg-primary text-primary-foreground shadow-primary/30' 
            : 'bg-card text-foreground hover:bg-primary hover:text-primary-foreground border border-border hover:border-primary hover:shadow-primary/20'
        }`}
        style={{
          boxShadow: activePanel === 'chat' 
            ? '0 8px 32px -4px hsl(var(--primary) / 0.4)' 
            : '0 8px 24px -4px hsl(var(--background) / 0.3)'
        }}
      >
        <Mic className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default FloatingBubbles;
