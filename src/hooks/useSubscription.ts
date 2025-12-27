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
    price_id: "price_1Sj0054VE76aSwNJFdx4JAfm",
    product_id: "prod_TgMj9QgQPxh7aY",
    name: "Pro",
    price: 19,
  }
};

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
    if (!user || !session?.access_token) {
      setStatus(prev => ({ ...prev, loading: false, isAdmin: false }));
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

  const createCheckout = async () => {
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    if (data?.url) {
      window.open(data.url, '_blank');
    }
    return data;
  };

  const openCustomerPortal = async () => {
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('customer-portal', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    if (data?.url) {
      window.open(data.url, '_blank');
    }
    return data;
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
    createCheckout,
    openCustomerPortal,
    isPro: status.subscribed && (status.productId === PLANS.PRO.product_id || status.isAdmin),
  };
};
