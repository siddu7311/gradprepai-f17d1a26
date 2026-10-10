export interface NotificationPreferences {
  notification_push: boolean | null;
  notification_interview_reminders: boolean | null;
}

export function canDeliverScheduleReminder(
  preferences: NotificationPreferences | null | undefined,
  eventType: string,
) {
  // Wait for saved preferences instead of assuming permission to send.
  if (!preferences || preferences.notification_push !== true) return false;
  return eventType !== 'interview' || preferences.notification_interview_reminders === true;
}