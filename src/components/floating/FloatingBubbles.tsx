import { useState } from 'react';
import { Calendar, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScheduleManager from './ScheduleManager';
import LusyChatbot from './LusyChatbot';

const FloatingBubbles = () => {
  const [activePanel, setActivePanel] = useState<'schedule' | 'chat' | null>(null);

  const togglePanel = (panel: 'schedule' | 'chat') => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Panels */}
      <AnimatePresence>
        {activePanel === 'schedule' && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-24 right-0 w-80 sm:w-96"
          >
            <ScheduleManager onClose={() => setActivePanel(null)} />
          </motion.div>
        )}
        {activePanel === 'chat' && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-24 right-0 w-80 sm:w-96"
          >
            <LusyChatbot onClose={() => setActivePanel(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Bubble */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => togglePanel('schedule')}
        className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-colors border ${
          activePanel === 'schedule' 
            ? 'bg-primary text-primary-foreground border-primary' 
            : 'bg-card text-foreground hover:bg-primary hover:text-primary-foreground border-border hover:border-primary'
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span className="text-sm font-medium">Schedule</span>
      </motion.button>

      {/* LUSY Chat Bubble */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => togglePanel('chat')}
        className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-colors border ${
          activePanel === 'chat' 
            ? 'bg-primary text-primary-foreground border-primary' 
            : 'bg-card text-foreground hover:bg-primary hover:text-primary-foreground border-border hover:border-primary'
        }`}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium">LUSY</span>
      </motion.button>
    </div>
  );
};

export default FloatingBubbles;
