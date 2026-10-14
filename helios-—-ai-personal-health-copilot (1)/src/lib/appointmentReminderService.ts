import { Appointment } from '../types';
import { playReminderAlertSound } from './audio';
import { getNotificationPermission, requestNotificationPermission } from './medicationReminderService';

export interface DueAppointmentReminder {
  appointment: Appointment;
  noticeLabel: string;
  isToday: boolean;
  isTomorrow: boolean;
  timeRemainingText: string;
}

// Parse date and time into a Date object
export function getAppointmentDateTime(dateStr: string, timeStr?: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const target = new Date(year, (month || 1) - 1, day || 1);

  if (timeStr) {
    const clean = timeStr.trim().toUpperCase();
    const is12Hour = clean.includes('AM') || clean.includes('PM');
    if (is12Hour) {
      const isPM = clean.includes('PM');
      const isAM = clean.includes('AM');
      const without = clean.replace(/AM|PM/g, '').trim();
      const [hStr, mStr] = without.split(':');
      let hours = parseInt(hStr, 10) || 0;
      const minutes = parseInt(mStr, 10) || 0;
      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;
      target.setHours(hours, minutes, 0, 0);
    } else {
      const [hStr, mStr] = clean.split(':');
      target.setHours(parseInt(hStr, 10) || 9, parseInt(mStr, 10) || 0, 0, 0);
    }
  } else {
    // Default to 9:00 AM if no time specified
    target.setHours(9, 0, 0, 0);
  }

  return target;
}

// Calculate reminder target time based on notice option
export function getReminderTriggerTime(appointment: Appointment): Date {
  const aptTime = getAppointmentDateTime(appointment.date, appointment.time);
  const notice = appointment.reminderNotice || '1 day before';

  const trigger = new Date(aptTime);
  switch (notice) {
    case '1 day before':
      trigger.setDate(trigger.getDate() - 1);
      break;
    case '2 hours before':
      trigger.setHours(trigger.getHours() - 2);
      break;
    case '1 hour before':
      trigger.setHours(trigger.getHours() - 1);
      break;
    case '15 minutes before':
      trigger.setMinutes(trigger.getMinutes() - 15);
      break;
    case 'At appointment time':
    default:
      break;
  }
  return trigger;
}

// Formats human-friendly countdown: e.g. "Tomorrow at 10:00 AM", "In 3 hours", "In 2 days"
export function formatAppointmentCountdown(appointment: Appointment, now: Date = new Date()): string {
  const aptTime = getAppointmentDateTime(appointment.date, appointment.time);
  const diffMs = aptTime.getTime() - now.getTime();

  if (diffMs < 0) {
    const pastMinutes = Math.abs(Math.floor(diffMs / (1000 * 60)));
    if (pastMinutes < 60) return `${pastMinutes}m ago`;
    const pastHours = Math.floor(pastMinutes / 60);
    if (pastHours < 24) return `${pastHours}h ago`;
    return 'Past appointment';
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 60) return `In ${diffMinutes} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `In ${diffHours} hr${diffHours > 1 ? 's' : ''}`;
  const diffDays = Math.ceil(diffHours / 24);
  if (diffDays === 1) return 'Tomorrow';
  return `In ${diffDays} days`;
}

// Storage key to prevent duplicate notifications
function getAppointmentNotifiedKey(aptId: string, notice: string): string {
  return `helios_apt_notified_${aptId}_${notice.replace(/\s+/g, '_')}`;
}

export function hasAppointmentBeenNotified(aptId: string, notice: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean(localStorage.getItem(getAppointmentNotifiedKey(aptId, notice)));
  } catch {
    return false;
  }
}

export function markAppointmentAsNotified(aptId: string, notice: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getAppointmentNotifiedKey(aptId, notice), new Date().toISOString());
  } catch {
    // Ignore storage issues
  }
}

// Check and trigger notifications for upcoming appointments
export function checkUpcomingAppointments(
  appointments: Appointment[],
  onInAppAlert?: (reminder: DueAppointmentReminder) => void
): void {
  const now = new Date();

  for (const apt of appointments) {
    if (apt.status !== 'upcoming' || apt.reminderEnabled === false) continue;

    const aptTime = getAppointmentDateTime(apt.date, apt.time);
    const triggerTime = getReminderTriggerTime(apt);
    const notice = apt.reminderNotice || '1 day before';

    // Within window: triggerTime has passed, but appointment is still in the future (or less than 15 mins past)
    const timeSinceTrigger = now.getTime() - triggerTime.getTime();
    const timeUntilApt = aptTime.getTime() - now.getTime();

    // Trigger window: between trigger time and up to 4 hours past trigger time, while appointment is still in future
    if (timeSinceTrigger >= 0 && timeUntilApt >= -15 * 60 * 1000) {
      if (!hasAppointmentBeenNotified(apt.id, notice)) {
        markAppointmentAsNotified(apt.id, notice);
        fireAppointmentNotification(apt, onInAppAlert);
      }
    }
  }
}

// Fire browser notification & audio chime
export function fireAppointmentNotification(
  apt: Appointment,
  onInAppAlert?: (reminder: DueAppointmentReminder) => void
): boolean {
  playReminderAlertSound();

  const title = `Consultation Reminder: ${apt.doctorName}`;
  const notice = apt.reminderNotice || 'Upcoming appointment';
  const timeDesc = apt.time ? ` at ${apt.time}` : '';
  const body = `${apt.specialty}${apt.clinic ? ` • ${apt.clinic}` : ''}\nScheduled for ${apt.date}${timeDesc} (${notice})`;

  let sentNative = false;
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: `apt_${apt.id}`,
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
      sentNative = true;
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }

  if (onInAppAlert) {
    const aptTime = getAppointmentDateTime(apt.date, apt.time);
    const now = new Date();
    const isToday = aptTime.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = aptTime.toDateString() === tomorrow.toDateString();

    onInAppAlert({
      appointment: apt,
      noticeLabel: notice,
      isToday,
      isTomorrow,
      timeRemainingText: formatAppointmentCountdown(apt, now),
    });
  }

  return sentNative;
}

// Test trigger for Appointments
export async function triggerTestAppointmentReminder(
  onInAppAlert?: (reminder: DueAppointmentReminder) => void
): Promise<{ success: boolean; nativeSent: boolean; message: string }> {
  let permission = getNotificationPermission();
  if (permission === 'default') {
    permission = await requestNotificationPermission();
  }

  playReminderAlertSound();

  let nativeSent = false;
  if (permission === 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const test = new Notification('Test Reminder: Dr. Sarah Vance (Cardiology)', {
        body: 'Upcoming consultation scheduled for tomorrow at 10:30 AM • Metro Medical Clinic',
        icon: '/favicon.ico',
      });
      test.onclick = () => {
        window.focus();
        test.close();
      };
      nativeSent = true;
    } catch (e) {
      console.warn('Test appointment notification failed:', e);
    }
  }

  if (onInAppAlert) {
    onInAppAlert({
      appointment: {
        id: 'test_demo_apt',
        userId: 'demo',
        doctorName: 'Dr. Sarah Vance',
        specialty: 'Cardiology',
        clinic: 'Metro Medical Center Rm 402',
        date: new Date().toISOString().split('T')[0],
        time: '10:30 AM',
        notes: 'Annual cardiology follow-up and blood pressure check',
        status: 'upcoming',
        reminderEnabled: true,
        reminderNotice: '1 day before',
      },
      noticeLabel: '1 day before',
      isToday: true,
      isTomorrow: false,
      timeRemainingText: 'Today at 10:30 AM',
    });
  }

  return {
    success: true,
    nativeSent,
    message: nativeSent
      ? 'Appointment reminder delivered with audible notification chime!'
      : 'In-app consultation reminder banner displayed with chime.',
  };
}
