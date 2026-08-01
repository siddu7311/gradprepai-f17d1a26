import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Check, Zap } from 'lucide-react';
import { GlowButton } from './GlowButton';
import { PLANS } from '@/hooks/useSubscription';
import { UpiPaymentModal } from './UpiPaymentModal';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

const proFeatures = [
  'Unlimited mock interviews',
  'Voice interview practice',
  'Advanced AI feedback',
  'All role categories',
  'Performance analytics',
  'Priority support',
];

export const UpgradeModal = ({ isOpen, onClose, feature }: UpgradeModalProps) => {
  const [payOpen, setPayOpen] = useState(false);

  return (
   <>
    <AnimatePresence>
      {isOpen && !payOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 z-50 flex items-center justify-center overflow-y-auto py-4"
          >
            <div className="w-full max-w-md mx-auto">
              <div className="glass border border-primary/30 rounded-2xl p-8 shadow-glow bg-background">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Upgrade to Pro
                  </h2>
                  <p className="text-muted-foreground">
                    <span className="text-primary font-medium">{feature}</span> is a Pro feature
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {proFeatures.map((feat, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-foreground text-sm">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div className="text-center mb-6 py-4 border-y border-border/50">
                  <span className="font-display text-4xl font-bold gradient-text">₹{PLANS.PRO.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                {/* CTA */}
                <GlowButton onClick={() => setPayOpen(true)} className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Pay with UPI / PhonePe QR
                </GlowButton>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  One-time ₹{PLANS.PRO.price} UPI payment · 30 days of Pro access.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    <UpiPaymentModal
      isOpen={payOpen}
      feature={feature}
      onClose={() => {
        setPayOpen(false);
        onClose();
      }}
    />
   </>
  );
};
