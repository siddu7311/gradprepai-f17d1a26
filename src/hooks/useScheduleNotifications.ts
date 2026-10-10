import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';
import { canDeliverScheduleReminder } from '@/lib/notificationPreferences';

interface ScheduleRow {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  reminder_minutes: number;
  notified: boolean;
  event_type: string;
}

const SW_URL = '/notify-sw.js';

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker
      .register(SW_URL)
      .then(async (reg) => {
        await navigator.serviceWorker.ready.catch(() => undefined);
        return reg;
      })
      .catch((err) => {
        console.warn('Notification worker registration failed:', err);
        return null;
      });
  }
  return registrationPromise;
}

/** Shows an OS-level notification that also appears while the tab is in the background. */
export async function showScheduleNotification(title: string, body: string, tag: string) {
  const supported = typeof window !== 'undefined' && 'Notification' in window;
  if (!supported || Notification.permission !== 'granted') return false;

  const registration = await getRegistration();
  if (registration) {
    try {
      await registration.showNotification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag,
        requireInteraction: true,
        data: { url: '/dashboard' },
      } as NotificationOptions);
      return true;
    } catch (err) {
      console.warn('showNotification failed, falling back:', err);
    }
  }

  try {
    new Notification(title, { body, icon: '/favicon.ico', tag });
    return true;
  } catch {
    return false;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  await getRegistration();
  if (Notification.permission === 'default') {
    return Notification.requestPermission();
  }
  return Notification.permission;
}

/**
 * App-wide schedule reminder watcher. Runs on every page (not just when the
 * Schedule Manager panel is open) so reminders fire while the user is on
 * another tab or another app, as long as this website remains open.
 */
export function useScheduleNotifications() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const preferencesRef = useRef(profile);
  preferencesRef.current = profile;
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied',
  );
  const firedRef = useRef<Set<string>>(new Set());

  const enableNotifications = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      toast.success('Reminders enabled — you will be notified even on other tabs.');
    } else if (result === 'denied') {
      toast.error('Notifications are blocked. Enable them in your browser site settings.');
    }
    return result;
  }, []);

  useEffect(() => {
    firedRef.current.clear();
  }, [user?.id]);

  useEffect(() => {
    if (!user || !profile?.notification_push) return;
    let cancelled = false;

    getRegistration();

    const check = async () => {
      const nowMs = Date.now();
      const { data, error } = await supabase
        .from('schedules')
        .select('id, title, description, scheduled_at, reminder_minutes, notified, event_type')
        .eq('user_id', user.id)
        .eq('notified', false);

      if (cancelled || error || !data) return;

      for (const schedule of data as ScheduleRow[]) {
        if (cancelled || !canDeliverScheduleReminder(preferencesRef.current, schedule.event_type)) continue;
        const eventMs = new Date(schedule.scheduled_at).getTime();
        const leadMs = (schedule.reminder_minutes || 0) * 60_000;
        const dueAt = eventMs - leadMs;

        // Fire once the reminder window is reached, and skip stale events (> 1 day past).
        if (nowMs < dueAt || nowMs > eventMs + 86_400_000) continue;
        if (firedRef.current.has(schedule.id)) continue;

        const minutesUntil = Math.max(0, Math.round((eventMs - nowMs) / 60_000));
        const body =
          minutesUntil > 0
            ? `Starting in ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}${schedule.description ? ` — ${schedule.description}` : ''}`
            : `Starting now${schedule.description ? ` — ${schedule.description}` : ''}`;

        const shown = await showScheduleNotification(`Upcoming: ${schedule.title}`, body, schedule.id);
        if (cancelled || !canDeliverScheduleReminder(preferencesRef.current, schedule.event_type)) continue;
        if (!shown && document.visibilityState === 'visible') {
          toast.info(`Upcoming: ${schedule.title}`, { description: body, duration: 10000 });
        }
        if (!shown && document.visibilityState !== 'visible') continue;
        firedRef.current.add(schedule.id);

        await supabase.from('schedules').update({ notified: true }).eq('id', schedule.id);
      }
    };

    check();
    // 20s cadence; background tabs throttle timers to ~1/min which is still
    // well inside the minute-level reminder windows.
    const interval = setInterval(check, 20_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisible);

    const channel = supabase
      .channel('schedules-reminders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, () => check())
      .subscribe();

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      supabase.removeChannel(channel);
    };
  }, [user?.id, profile?.notification_push, profile?.notification_interview_reminders]);

  return { permission, enableNotifications };
}
