import { describe, expect, test } from 'bun:test';
import { canDeliverScheduleReminder } from './notificationPreferences';

describe('saved notification preferences', () => {
  test('push disabled suppresses all schedule notifications', () => {
    expect(canDeliverScheduleReminder({ notification_push: false, notification_interview_reminders: true }, 'meeting')).toBe(false);
    expect(canDeliverScheduleReminder({ notification_push: false, notification_interview_reminders: true }, 'interview')).toBe(false);
  });
  test('disabled interview reminders suppress interview notifications', () => {
    expect(canDeliverScheduleReminder({ notification_push: true, notification_interview_reminders: false }, 'interview')).toBe(false);
    expect(canDeliverScheduleReminder({ notification_push: true, notification_interview_reminders: false }, 'meeting')).toBe(true);
  });
  test('enabled push and interview reminders allow interview notifications', () => {
    expect(canDeliverScheduleReminder({ notification_push: true, notification_interview_reminders: true }, 'interview')).toBe(true);
  });
  test('unknown preferences never allow notifications', () => {
    expect(canDeliverScheduleReminder(undefined, 'interview')).toBe(false);
  });
});