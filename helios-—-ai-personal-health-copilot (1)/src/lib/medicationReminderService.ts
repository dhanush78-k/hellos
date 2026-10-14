import { Medication, MedicationAdherenceLog } from '../types';
import { playReminderAlertSound } from './audio';

export type DoseStatus = 'Upcoming' | 'Due now' | 'Dose Taken' | 'Skipped' | 'Missed';

export interface ScheduledDoseItem {
  id: string; // unique key e.g. `${med.id}_${doseTime}`
  medication: Medication;
  scheduledTime: string; // e.g. "09:00 AM"
  timeCategory: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  status: DoseStatus;
  adherenceLog?: MedicationAdherenceLog;
  isDueNow: boolean;
  minutesDiff: number; // minutes from now
}

// Convert "09:00 AM", "9:00 AM", "14:30", "2:00 PM" to minutes from midnight
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 540; // default 9:00 AM
  const clean = timeStr.trim().toUpperCase();

  const is12Hour = clean.includes('AM') || clean.includes('PM');
  if (is12Hour) {
    const isPM = clean.includes('PM');
    const isAM = clean.includes('AM');
    const withoutPeriod = clean.replace(/AM|PM/g, '').trim();
    const [hStr, mStr] = withoutPeriod.split(':');
    let hours = parseInt(hStr, 10) || 0;
    const minutes = parseInt(mStr, 10) || 0;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // 24 hour "HH:MM"
  const [hStr, mStr] = clean.split(':');
  const hours = parseInt(hStr, 10) || 0;
  const minutes = parseInt(mStr, 10) || 0;
  return hours * 60 + minutes;
}

// Format minutes from midnight to "09:00 AM"
export function formatMinutesTo12Hour(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h24 = Math.floor(normalized / 60);
  const m = normalized % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

// Classify time category
export function getTimeCategory(minutes: number): 'Morning' | 'Afternoon' | 'Evening' | 'Night' {
  if (minutes >= 300 && minutes < 720) return 'Morning'; // 5:00 AM - 11:59 AM
  if (minutes >= 720 && minutes < 1020) return 'Afternoon'; // 12:00 PM - 4:59 PM
  if (minutes >= 1020 && minutes < 1260) return 'Evening'; // 5:00 PM - 8:59 PM
  return 'Night'; // 9:00 PM - 4:59 AM
}

// Day of week abbreviation: 'Mon', 'Tue', etc.
export function getDayOfWeekAbbr(date: Date): string {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
}

// Check if a medication is scheduled on a specific date (YYYY-MM-DD)
export function isMedicationScheduledOnDate(med: Medication, targetDate: Date): boolean {
  if (!med.active) return false;
  const targetDateStr = targetDate.toISOString().split('T')[0];

  if (med.startDate && med.startDate > targetDateStr) {
    return false;
  }
  if (med.endDate && med.endDate < targetDateStr) {
    return false;
  }

  const freq = (med.frequency || '').toLowerCase();
  if (freq === 'daily' || freq === 'once daily' || freq === 'twice daily' || !freq) {
    return true;
  }

  if (freq === 'selected days' || (med.selectedDays && med.selectedDays.length > 0)) {
    const dayAbbr = getDayOfWeekAbbr(targetDate);
    if (med.selectedDays && med.selectedDays.length > 0) {
      return med.selectedDays.includes(dayAbbr);
    }
  }

  return true;
}

// Get all scheduled doses for a medication on a given date
export function getMedicationDosesForDate(
  med: Medication,
  targetDate: Date,
  now: Date = new Date()
): ScheduledDoseItem[] {
  if (!isMedicationScheduledOnDate(med, targetDate)) return [];

  const targetDateStr = targetDate.toISOString().split('T')[0];
  const todayStr = now.toISOString().split('T')[0];
  const isTargetToday = targetDateStr === todayStr;
  const isTargetPast = targetDateStr < todayStr;
  const isTargetFuture = targetDateStr > todayStr;

  const currentMinutesNow = now.getHours() * 60 + now.getMinutes();

  // Determine times list
  const times: string[] = [];
  if (med.scheduledTimes && med.scheduledTimes.length > 0) {
    times.push(...med.scheduledTimes);
  } else if (med.scheduledTime) {
    times.push(med.scheduledTime);
  } else {
    // Fallback based on timing enum
    if (med.timing === 'Morning') times.push('09:00 AM');
    else if (med.timing === 'Afternoon') times.push('02:00 PM');
    else if (med.timing === 'Evening') times.push('07:00 PM');
    else if (med.timing === 'Bedtime') times.push('10:00 PM');
    else times.push('09:00 AM');
  }

  const results: ScheduledDoseItem[] = [];

  for (const timeStr of times) {
    const doseMinutes = parseTimeToMinutes(timeStr);
    const standardTimeStr = formatMinutesTo12Hour(doseMinutes);
    const category = getTimeCategory(doseMinutes);

    // Find adherence log matching this date and time
    const logs = med.adherenceLogs || [];
    const log = logs.find((l) => {
      if (l.date !== targetDateStr) return false;
      if (l.scheduledTime) {
        return parseTimeToMinutes(l.scheduledTime) === doseMinutes;
      }
      return true; // backwards compatibility if single dose per day
    });

    let status: DoseStatus = 'Upcoming';
    let isDueNow = false;
    let minutesDiff = doseMinutes - currentMinutesNow;

    if (log) {
      if (log.status === 'taken') {
        status = 'Dose Taken';
      } else if (log.status === 'skipped') {
        status = 'Skipped';
      } else if (log.status === 'missed') {
        status = 'Missed';
      }
    } else {
      if (isTargetPast) {
        status = 'Missed';
      } else if (isTargetFuture) {
        status = 'Upcoming';
      } else if (isTargetToday) {
        // Due window: 30 minutes before scheduled time until 90 minutes after scheduled time
        const diff = currentMinutesNow - doseMinutes;
        if (diff >= -30 && diff <= 90) {
          status = 'Due now';
          isDueNow = true;
        } else if (diff > 90) {
          status = 'Missed';
        } else {
          status = 'Upcoming';
        }
      }
    }

    results.push({
      id: `${med.id}_${standardTimeStr.replace(/\s+/g, '_')}`,
      medication: med,
      scheduledTime: standardTimeStr,
      timeCategory: category,
      status,
      adherenceLog: log,
      isDueNow,
      minutesDiff,
    });
  }

  return results;
}

// Notification Permissions
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.error('Notification permission request error:', e);
    return Notification.permission;
  }
}

// Storage key to prevent duplicate notifications for a specific dose on a day
function getNotificationKey(medId: string, dateStr: string, scheduledTime: string): string {
  return `helios_notified_${medId}_${dateStr}_${scheduledTime.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

export function hasBeenNotifiedToday(medId: string, dateStr: string, scheduledTime: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean(localStorage.getItem(getNotificationKey(medId, dateStr, scheduledTime)));
  } catch {
    return false;
  }
}

export function markAsNotifiedToday(medId: string, dateStr: string, scheduledTime: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getNotificationKey(medId, dateStr, scheduledTime), new Date().toISOString());
  } catch {
    // Ignore storage quota
  }
}

// Trigger browser notification and sound
export function fireMedicationNotification(
  med: Medication,
  scheduledTime: string,
  onInAppAlert?: (dose: ScheduledDoseItem) => void
): boolean {
  playReminderAlertSound();

  const bodyText = `${med.dosage}${med.pillsCount ? ` (${med.pillsCount})` : ''} • ${med.foodInstruction || 'Take with water'}${
    med.instructions ? ` • ${med.instructions}` : ''
  }`;

  let nativeNotificationSent = false;

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(`Time to take: ${med.name}`, {
        body: bodyText,
        icon: '/favicon.ico',
        tag: `med_${med.id}_${scheduledTime}`,
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
      nativeNotificationSent = true;
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }

  if (onInAppAlert) {
    const fakeDose: ScheduledDoseItem = {
      id: `${med.id}_${scheduledTime}`,
      medication: med,
      scheduledTime,
      timeCategory: getTimeCategory(parseTimeToMinutes(scheduledTime)),
      status: 'Due now',
      isDueNow: true,
      minutesDiff: 0,
    };
    onInAppAlert(fakeDose);
  }

  return nativeNotificationSent;
}

// Test trigger for immediate feedback in settings/UI
export async function triggerTestReminderNotification(
  onInAppAlert?: (dose: ScheduledDoseItem) => void
): Promise<{ success: boolean; nativeSent: boolean; message: string }> {
  let permission = getNotificationPermission();

  if (permission === 'default') {
    permission = await requestNotificationPermission();
  }

  playReminderAlertSound();

  let nativeSent = false;
  if (permission === 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const testNotif = new Notification('Test Reminder: Amlodipine – 5 mg', {
        body: '1 tablet • After meal • Scheduled 09:00 AM (Helios Smart Reminder)',
        icon: '/favicon.ico',
      });
      testNotif.onclick = () => {
        window.focus();
        testNotif.close();
      };
      nativeSent = true;
    } catch (e) {
      console.warn('Test notification send error:', e);
    }
  }

  if (onInAppAlert) {
    onInAppAlert({
      id: 'test_demo_dose',
      medication: {
        id: 'test_demo_dose',
        userId: 'demo',
        name: 'Amlodipine',
        dosage: '5 mg',
        pillsCount: '1 tablet',
        category: 'Hypertension',
        frequency: 'Daily',
        foodInstruction: 'After meal',
        scheduledTime: '09:00 AM',
        active: true,
      },
      scheduledTime: '09:00 AM',
      timeCategory: 'Morning',
      status: 'Due now',
      isDueNow: true,
      minutesDiff: 0,
    });
  }

  return {
    success: true,
    nativeSent,
    message: nativeSent
      ? 'Test reminder notification delivered successfully with audible chime!'
      : 'In-app reminder alert triggered with chime (Browser notification permission not granted or unsupported).',
  };
}
