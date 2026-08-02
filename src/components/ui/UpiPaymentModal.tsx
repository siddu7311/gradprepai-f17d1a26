import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Check, Loader2, MessageCircle, ShieldCheck } from 'lucide-react';
import { GlowButton } from './GlowButton';
import { Input } from './input';
import { Label } from './label';
import { useSubscription, PLANS, PAYMENT_WHATSAPP_NUMBER } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import qrAsset from '@/assets/phonepe-qr.jpeg.asset.json';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

const buildReceipt = (params: {
  email?: string | null;
  reference: string;
  phone?: string;
  paymentId?: string;
  expiresAt?: string;
}) => {
  const lines = [
    '*GradPrep AI — Payment Receipt*',
    '',
    `Plan: Pro (Monthly)`,
    `Amount: ₹${PLANS.PRO.price}`,
    `Paid via: PhonePe / UPI QR`,
    `Reference: ${params.reference}`,
    params.phone ? `Payer WhatsApp: +91${params.phone}` : '',
    params.email ? `Account: ${params.email}` : '',
    params.paymentId ? `Receipt ID: ${params.paymentId}` : '',
    params.expiresAt ? `Valid till: ${new Date(params.expiresAt).toLocaleDateString()}` : '',
    `Date: ${new Date().toLocaleString()}`,
    '',
    'Pro access has been activated. Thank you!',
  ];
  return lines.filter(Boolean).join('\n');
};

export const UpiPaymentModal = ({ isOpen, onClose, feature }: UpiPaymentModalProps) => {
  const { submitUpiPayment } = useSubscription();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ receipt: string } | null>(null);

  const sendWhatsApp = (receipt: string) => {
    const url = `https://wa.me/${PAYMENT_WHATSAPP_NUMBER}?text=${encodeURIComponent(receipt)}`;
    window.open(url, '_blank', 'noopener');
  };

  const handleSubmit = async () => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    try {
      setSubmitting(true);
      const result = await submitUpiPayment(cleanPhone.length === 10 ? { payer_phone: cleanPhone } : undefined);
      const receipt = buildReceipt({
        email: result?.email,
        reference: result?.upi_reference ?? '—',
        phone: cleanPhone.length === 10 ? cleanPhone : undefined,
        paymentId: result?.payment_id,
        expiresAt: result?.expires_at,
      });
      setDone({ receipt });
      sendWhatsApp(receipt);
      toast({ title: 'Pro activated 🎉', description: 'Your account is now Pro. The receipt is being sent on WhatsApp.' });
    } catch (error) {
      toast({
        title: 'Could not confirm payment',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setPhone('');
    setDone(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-2 md:inset-4 z-50 flex items-start md:items-center justify-center overflow-y-auto py-4"
          >
            <div className="w-full max-w-md mx-auto">
              <div className="relative glass border border-primary/30 rounded-2xl p-6 md:p-8 shadow-glow bg-background">
                <button
                  onClick={handleClose}
                  aria-label="Close payment dialog"
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
                    <Crown className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {done ? 'Payment Confirmed' : 'Upgrade to Pro'}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {done
                      ? 'Pro is active on your account for the next 30 days.'
                      : feature
                        ? <>Pay <span className="text-primary font-semibold">₹{PLANS.PRO.price}</span> to unlock {feature}</>
                        : <>Scan &amp; pay <span className="text-primary font-semibold">₹{PLANS.PRO.price}</span> / month</>}
                  </p>
                </div>

                {done ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-sm text-foreground">Pro features unlocked instantly</span>
                    </div>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/40 rounded-xl p-4 max-h-48 overflow-y-auto">
                      {done.receipt}
                    </pre>
                    <GlowButton variant="outline" className="w-full" onClick={() => sendWhatsApp(done.receipt)}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Resend receipt on WhatsApp
                    </GlowButton>
                    <GlowButton className="w-full" onClick={handleClose}>
                      Start using Pro
                    </GlowButton>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                      className="mx-auto w-[190px] rounded-2xl bg-white p-2 shadow-glow"
                    >
                      <img
                        src={qrAsset.url}
                        alt="PhonePe UPI QR code to pay ₹199 for GradPrep AI Pro"
                        className="w-full aspect-square object-cover object-center rounded-xl"
                        loading="lazy"
                      />
                    </motion.div>

                    <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Scan the QR with PhonePe, GPay, Paytm or any UPI app.</li>
                      <li>Pay ₹{PLANS.PRO.price} to DARA SUDHARSHAN.</li>
                      <li>Tap the button below — Pro activates instantly.</li>
                    </ol>

                    <div className="space-y-2">
                      <Label htmlFor="wa-phone">WhatsApp number (optional)</Label>
                      <Input
                        id="wa-phone"
                        inputMode="numeric"
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        The receipt is sent from your WhatsApp to +91 73309 76371.
                      </p>
                    </div>

                    <GlowButton className="w-full animate-pulse-glow" onClick={handleSubmit} disabled={submitting}>
                      {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                      {submitting ? 'Activating Pro…' : "Payment done — Activate Pro"}
                    </GlowButton>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
