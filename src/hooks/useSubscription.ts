import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionStatus {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  subscriptionId: string | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
}

export const PLANS = {
  PRO: {
    name: "Pro",
    price: 199,
    currency: "INR",
    priceLabel: "₹199",
  }
};

export const PAYMENT_WHATSAPP_NUMBER = "917330976371";

export interface UpiPaymentResult {
  success: boolean;
  payment_id: string;
  email: string;
  amount: number;
  upi_reference: string;
  starts_at: string;
  expires_at: string;
}

export const useSubscription = () => {
  const { user, session } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    productId: null,
    subscriptionEnd: null,
    subscriptionId: null,
    loading: true,
    error: null,
    isAdmin: false,
  });

  const checkSubscription = useCallback(async () => {
    // Logged out
    if (!user) {
      setStatus(prev => ({
        ...prev,
        subscribed: false,
        productId: null,
        subscriptionEnd: null,
        subscriptionId: null,
        loading: false,
        error: null,
        isAdmin: false,
      }));
      return;
    }

    // Auth is still initializing (user exists but token not ready yet)
    if (!session?.access_token) {
      setStatus(prev => ({ ...prev, loading: true }));
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setStatus({
        subscribed: data.subscribed || false,
        productId: data.product_id || null,
        subscriptionEnd: data.subscription_end || null,
        subscriptionId: data.subscription_id || null,
        loading: false,
        error: null,
        isAdmin: data.is_admin || false,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check subscription',
      }));
    }
  }, [user, session?.access_token]);

  /**
   * Submits a UPI / PhonePe QR payment reference. On success the account is
   * upgraded to Pro immediately for 30 days.
   */
  const submitUpiPayment = async (payload?: { upi_reference?: string; payer_phone?: string }) => {
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('submit-upi-payment', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: {
        upi_reference: payload?.upi_reference ?? null,
        payer_phone: payload?.payer_phone ?? null,
      },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    await checkSubscription();
    return data as UpiPaymentResult;
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setStatus({
        subscribed: false,
        productId: null,
        subscriptionEnd: null,
        subscriptionId: null,
        loading: false,
        error: null,
        isAdmin: false,
      });
    }
  }, [user, checkSubscription]);

  // Auto-refresh every minute
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  return {
    ...status,
    checkSubscription,
    submitUpiPayment,
    // Treat role-based access (admin/moderator) and Stripe subscriptions as Pro.
    isPro: status.isAdmin || status.subscribed,
  };
};
