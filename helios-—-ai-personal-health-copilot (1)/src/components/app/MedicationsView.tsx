import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Pill,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  Sparkles,
  Calendar,
  AlertTriangle,
  FileText,
  X,
  Loader2,
  Bell,
  BellOff,
  ChevronLeft,
  ChevronRight,
  Check,
  Edit3,
  RotateCcw,
  Volume2,
  Info,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { playChime, playReminderAlertSound } from '../../lib/audio';
import {
  getNotificationPermission,
  requestNotificationPermission,
  triggerTestReminderNotification,
  hasBeenNotifiedToday,
  markAsNotifiedToday,
  fireMedicationNotification,
  getMedicationDosesForDate,
  ScheduledDoseItem,
  DoseStatus,
  formatMinutesTo12Hour,
} from '../../lib/medicationReminderService';
import { EditMedicationModal } from './EditMedicationModal';
import { Medication } from '../../types';

interface MedicationsViewProps {
  onOpenAddModal: () => void;
}

export function MedicationsView({ onOpenAddModal: _onOpenAddModal }: MedicationsViewProps) {
  const {
    medications,
    deleteMedication,
    toggleMedicationActive,
    toggleMedicationReminder,
    recordDoseAction,
    logMedicationSideEffect,
  } = useHealthData();

  // Selected date for schedule
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMedToEdit, setSelectedMedToEdit] = useState<Medication | null>(null);

  // Fallback in-app alert when a dose is due
  const [inAppAlertDose, setInAppAlertDose] = useState<ScheduledDoseItem | null>(null);

  // Notification permission state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [testNotifNotice, setTestNotifNotice] = useState<string | null>(null);

  // Sub-tabs: 'schedule' (primary) vs 'all-medications' vs 'side-effects'
  const [activeTab, setActiveTab] = useState<'schedule' | 'all-medications' | 'side-effects'>('schedule');

  // Side effect modal state
  const [sideEffectModalMed, setSideEffectModalMed] = useState<Medication | null>(null);
  const [sideEffectDesc, setSideEffectDesc] = useState('');
  const [sideEffectSeverity, setSideEffectSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [doctorSummary, setDoctorSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Selected dose card highlight
  const [highlightedDoseId, setHighlightedDoseId] = useState<string | null>(null);

  // Current local today string
  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }, []);

  const selectedDateStr = useMemo(() => {
    return `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  }, [selectedDate]);

  const isTodaySelected = selectedDateStr === todayStr;

  // Sync notification permission on mount
  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  // Request browser notification permission
  const handleEnableNotifications = async () => {
    playChime(580);
    const result = await requestNotificationPermission();
    setNotificationPermission(result);
    if (result === 'granted') {
      setTestNotifNotice('Browser notifications activated! You will receive audible alerts when doses are due.');
      setTimeout(() => setTestNotifNotice(null), 6000);
    }
  };

  // Test Notification
  const handleTestNotification = async () => {
    const res = await triggerTestReminderNotification((dose) => {
      setInAppAlertDose(dose);
    });
    setNotificationPermission(getNotificationPermission());
    setTestNotifNotice(res.message);
    setTimeout(() => setTestNotifNotice(null), 6000);
  };

  // Generate 7-day horizontal week strip centered on selected date
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    // Show 7 days centered around selected date
    const start = new Date(selectedDate);
    start.setDate(selectedDate.getDate() - 3);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  // Compute scheduled doses for the selected date
  const scheduledDoses = useMemo(() => {
    const allDoses: ScheduledDoseItem[] = [];
    const now = new Date();

    for (const med of medications) {
      if (!med.active) continue;
      const doses = getMedicationDosesForDate(med, selectedDate, now);
      allDoses.push(...doses);
    }

    // Sort chronologically by scheduled time
    allDoses.sort((a, b) => {
      const minsA = parseInt(a.scheduledTime.split(':')[0], 10) * 60 + parseInt(a.scheduledTime.split(':')[1], 10);
      const isPmA = a.scheduledTime.includes('PM');
      const normalizedA = (isPmA && a.scheduledTime.split(':')[0] !== '12' ? minsA + 720 : minsA);

      const minsB = parseInt(b.scheduledTime.split(':')[0], 10) * 60 + parseInt(b.scheduledTime.split(':')[1], 10);
      const isPmB = b.scheduledTime.includes('PM');
      const normalizedB = (isPmB && b.scheduledTime.split(':')[0] !== '12' ? minsB + 720 : minsB);

      return normalizedA - normalizedB;
    });

    return allDoses;
  }, [medications, selectedDate]);

  // Daily Progress Statistics
  const progressStats = useMemo(() => {
    const total = scheduledDoses.length;
    const taken = scheduledDoses.filter((d) => d.status === 'Dose Taken').length;
    const skipped = scheduledDoses.filter((d) => d.status === 'Skipped').length;
    const dueNow = scheduledDoses.filter((d) => d.status === 'Due now').length;
    const missed = scheduledDoses.filter((d) => d.status === 'Missed').length;
    const upcoming = scheduledDoses.filter((d) => d.status === 'Upcoming').length;
    const percent = total > 0 ? Math.round((taken / total) * 100) : 0;

    return { total, taken, skipped, dueNow, missed, upcoming, percent };
  }, [scheduledDoses]);

  // Find next scheduled dose for today or selected day
  const nextScheduledDose = useMemo(() => {
    if (!isTodaySelected) return null;
    // Look for first "Due now" dose, then first "Upcoming" dose
    const due = scheduledDoses.find((d) => d.status === 'Due now');
    if (due) return due;
    return scheduledDoses.find((d) => d.status === 'Upcoming') || null;
  }, [scheduledDoses, isTodaySelected]);

  // Automatic Background Reminder Checker (runs every 15s)
  const medicationsRef = useRef(medications);
  medicationsRef.current = medications;

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTodayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      for (const med of medicationsRef.current) {
        if (!med.active || med.reminderEnabled === false) continue;
        const doses = getMedicationDosesForDate(med, now, now);

        for (const dose of doses) {
          if (dose.status === 'Due now') {
            const alreadyNotified = hasBeenNotifiedToday(med.id, currentTodayStr, dose.scheduledTime);
            if (!alreadyNotified) {
              markAsNotifiedToday(med.id, currentTodayStr, dose.scheduledTime);
              fireMedicationNotification(med, dose.scheduledTime, (d) => {
                setInAppAlertDose(d);
              });
            }
          }
        }
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, []);

  // Dose Action: Mark Taken
  const handleMarkDoseTaken = async (dose: ScheduledDoseItem) => {
    playChime(660);
    await recordDoseAction(dose.medication.id, selectedDateStr, dose.scheduledTime, 'taken');
    if (inAppAlertDose && inAppAlertDose.medication.id === dose.medication.id) {
      setInAppAlertDose(null);
    }
  };

  // Dose Action: Mark Skipped
  const handleMarkDoseSkipped = async (dose: ScheduledDoseItem) => {
    playChime(420);
    await recordDoseAction(dose.medication.id, selectedDateStr, dose.scheduledTime, 'skipped');
    if (inAppAlertDose && inAppAlertDose.medication.id === dose.medication.id) {
      setInAppAlertDose(null);
    }
  };

  // Toggle reminder for a specific medication
  const handleToggleReminder = async (med: Medication, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = med.reminderEnabled !== false;
    playChime(current ? 360 : 540);
    await toggleMedicationReminder(med.id, !current);
  };

  // Date selection helper
  const handleSelectDate = (date: Date) => {
    playChime(520);
    setSelectedDate(date);
  };

  const handleGoToToday = () => {
    playChime(560);
    setSelectedDate(new Date());
  };

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  // Side Effect Handlers
  const handleSaveSideEffect = async () => {
    if (!sideEffectModalMed || !sideEffectDesc.trim()) return;
    playChime(620);
    await logMedicationSideEffect(sideEffectModalMed.id, {
      description: sideEffectDesc.trim(),
      severity: sideEffectSeverity,
    });
    setSideEffectDesc('');
  };

  const handleGenerateSideEffectSummary = async () => {
    if (!sideEffectModalMed) return;
    setSummaryLoading(true);
    playChime(540);
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `The user is taking ${sideEffectModalMed.name} (${sideEffectModalMed.dosage}) and recorded the following side effects: ${JSON.stringify(
            sideEffectModalMed.sideEffects || []
          )}. Generate a constructive, concise bullet summary for the user to discuss with their prescribing physician at their next visit. Remind them not to stop abruptly without speaking to their doctor.`,
          userContext: {
            medications: [sideEffectModalMed],
          },
        }),
      });
      const data = await res.json();
      setDoctorSummary(data.reply || 'Summary ready for clinician review.');
      playChime(680);
    } catch (e) {
      console.error(e);
      setDoctorSummary('Could not generate clinician discussion brief.');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Format full date header
  const formattedFullDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* IN-APP DUE REMINDER BANNER (Fallback & Instant Alert) */}
      {inAppAlertDose && (
        <div className="relative p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 text-white shadow-2xl shadow-sky-500/30 border border-sky-400/40 animate-bounce duration-1000">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
                <Bell className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                  <span>Dose Due Now</span>
                  <span>•</span>
                  <span>{inAppAlertDose.scheduledTime}</span>
                </div>
                <h4 className="text-base sm:text-lg font-extrabold font-heading">
                  Time for {inAppAlertDose.medication.name} – {inAppAlertDose.medication.dosage}
                </h4>
                <p className="text-xs text-sky-100 font-light mt-0.5">
                  {inAppAlertDose.medication.pillsCount || '1 tablet'} • {inAppAlertDose.medication.foodInstruction || 'Take with water'}
                  {inAppAlertDose.medication.instructions ? ` • ${inAppAlertDose.medication.instructions}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
              <button
                onClick={() => handleMarkDoseSkipped(inAppAlertDose)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-colors"
              >
                Skip Dose
              </button>
              <button
                onClick={() => handleMarkDoseTaken(inAppAlertDose)}
                className="px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>Dose Taken</span>
              </button>
              <button
                onClick={() => setInAppAlertDose(null)}
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-mono mb-2">
            <Pill className="w-3.5 h-3.5 text-sky-400" />
            <span>Smart Medication Reminder System</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            Medication Schedule & Reminders
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Timeline-based prescription management with automated reminders and adherence tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => {
              playChime(580);
              setSelectedMedToEdit(null);
              setEditModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Prescribed Medicine</span>
          </button>
        </div>
      </div>

      {/* BROWSER NOTIFICATION SETTINGS & TEST BANNER */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-sky-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${notificationPermission === 'granted' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-sky-500/20 text-sky-300'}`}>
            {notificationPermission === 'granted' ? <Bell className="w-4 h-4 text-emerald-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </div>
          <div className="text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">
                {notificationPermission === 'granted'
                  ? 'Browser Reminders Active'
                  : notificationPermission === 'denied'
                  ? 'Browser Notifications Blocked'
                  : 'Enable Smart Reminders'}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  notificationPermission === 'granted'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                }`}
              >
                {notificationPermission === 'granted' ? 'Push & Sound Enabled' : 'In-App Active'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              {notificationPermission === 'granted'
                ? 'Desktop popups and audio chimes trigger when medicines are due while your browser is running.'
                : 'Turn on native browser alerts so you never miss a dose, or rely on active in-app chimes.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          {notificationPermission !== 'granted' && (
            <button
              onClick={handleEnableNotifications}
              className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Enable Notifications
            </button>
          )}
          <button
            onClick={handleTestNotification}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Test reminder sound and browser notification"
          >
            <Bell className="w-3.5 h-3.5 text-sky-400" />
            <span>Test Reminder</span>
          </button>
        </div>
      </div>

      {testNotifNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{testNotifNotice}</span>
        </div>
      )}

      {/* HORIZONTAL DATE SELECTOR (DAYS OF THE WEEK) */}
      <div className="rounded-3xl bg-slate-900/90 border border-sky-500/20 p-4 sm:p-5 shadow-xl space-y-4">
        {/* Full Date Heading & Navigation Controls */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white font-heading">
                {formattedFullDate}
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">
                {isTodaySelected ? "Today's Prescribed Schedule" : 'Viewing Past/Future Schedule'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isTodaySelected && (
              <button
                onClick={handleGoToToday}
                className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-semibold transition-colors"
              >
                Today
              </button>
            )}
            <div className="flex items-center bg-slate-950 rounded-xl p-0.5 border border-white/10">
              <button
                onClick={handlePrevDay}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextDay}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 7-Day Week Strip */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekDays.map((d) => {
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const isSelected = dateStr === selectedDateStr;
            const isToday = dateStr === todayStr;
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNumber = d.getDate();

            // Calculate if there are scheduled doses on this day
            const hasDoses = medications.some((m) => {
              if (!m.active) return false;
              return getMedicationDosesForDate(m, d, new Date()).length > 0;
            });

            return (
              <button
                key={dateStr}
                onClick={() => handleSelectDate(d)}
                className={`py-3 sm:py-3.5 px-1 sm:px-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-sky-500 to-blue-600 text-white font-bold shadow-lg shadow-sky-500/30 scale-[1.03] border border-sky-300/40'
                    : isToday
                    ? 'bg-sky-950/40 border border-sky-500/40 text-sky-200 hover:bg-sky-900/30'
                    : 'bg-slate-950/60 border border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <span className={`text-[11px] sm:text-xs uppercase font-medium ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                  {dayName}
                </span>
                <span className="text-base sm:text-xl font-bold font-heading mt-0.5">
                  {dayNumber}
                </span>
                {hasDoses && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                      isSelected ? 'bg-white' : isToday ? 'bg-sky-400' : 'bg-slate-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUMMARY BANNER: NEXT SCHEDULED DOSE & DAILY PROGRESS */}
      {medications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Progress */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-sky-500/25 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-sky-300 tracking-wider">
                  Daily Progress
                </span>
                <span className="text-xs font-mono font-bold text-sky-400">
                  {progressStats.percent}%
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white font-heading mt-1">
                {progressStats.taken} of {progressStats.total} doses completed
              </h3>
              <p className="text-xs text-slate-400 font-light mt-1">
                Keep prescribed timing synced for maximum therapeutic benefit.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 space-y-2">
              <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressStats.percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span className="text-emerald-400 font-semibold">✓ {progressStats.taken} Taken</span>
                {progressStats.skipped > 0 && <span className="text-amber-400 font-semibold">⤼ {progressStats.skipped} Skipped</span>}
                {progressStats.dueNow > 0 && <span className="text-sky-300 font-semibold animate-pulse">● {progressStats.dueNow} Due</span>}
                <span>{progressStats.upcoming} Upcoming</span>
              </div>
            </div>
          </div>

          {/* Next Scheduled Dose Highlight Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-sky-950/50 via-slate-900 to-blue-950/30 border border-sky-500/30 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next Scheduled Dose</span>
                </div>
                {nextScheduledDose && (
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                      nextScheduledDose.status === 'Due now'
                        ? 'bg-sky-500 text-white animate-pulse'
                        : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    }`}
                  >
                    {nextScheduledDose.status}
                  </span>
                )}
              </div>

              {nextScheduledDose ? (
                <div className="mt-2">
                  <h4 className="text-lg sm:text-xl font-extrabold text-white font-heading">
                    {nextScheduledDose.medication.name} – {nextScheduledDose.medication.dosage}
                  </h4>
                  <p className="text-xs text-sky-200/80 font-light mt-0.5">
                    {nextScheduledDose.scheduledTime} • {nextScheduledDose.medication.foodInstruction || 'After meal'} • {nextScheduledDose.medication.pillsCount || '1 tablet'}
                  </p>
                </div>
              ) : (
                <div className="mt-3">
                  <h4 className="text-base font-bold text-white font-heading">
                    All doses for this day logged
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    No further upcoming medicines scheduled for this date.
                  </p>
                </div>
              )}
            </div>

            {nextScheduledDose && (
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {nextScheduledDose.timeCategory} regimen
                </span>
                <button
                  onClick={() => handleMarkDoseTaken(nextScheduledDose)}
                  className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Take Dose</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW TABS: Schedule (Primary) | All Regimens | Side Effect Logs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'schedule'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Daily Timeline Schedule
        </button>
        <button
          onClick={() => setActiveTab('all-medications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all-medications'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Manage All Prescriptions ({medications.length})
        </button>
        <button
          onClick={() => setActiveTab('side-effects')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'side-effects'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Side Effect Logs & Clinician Brief
        </button>
      </div>

      {/* TAB 1: SCHEDULE VIEW (PRIMARY TIMELINE) */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {/* Heading: "Your Schedule" */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading tracking-tight">
                Your Schedule
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Timeline cards organized by dose time. Mark doses taken or skipped.
              </p>
            </div>
            <span className="text-xs font-mono text-sky-300 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20">
              {scheduledDoses.length} {scheduledDoses.length === 1 ? 'dose' : 'doses'} scheduled
            </span>
          </div>

          {/* EMPTY STATE */}
          {scheduledDoses.length === 0 ? (
            <div className="rounded-3xl bg-slate-900 p-10 sm:p-14 text-center border border-sky-500/20 shadow-xl max-w-lg mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto border border-sky-500/20">
                <Pill className="w-7 h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-heading text-white">
                No medications scheduled for this date
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add a prescribed medicine to automatically generate your morning, afternoon, and night reminder schedule.
              </p>
              <button
                onClick={() => {
                  setSelectedMedToEdit(null);
                  setEditModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
              >
                + Add Prescribed Medicine
              </button>
            </div>
          ) : (
            /* VERTICAL TIMELINE WITH TIME LABELS ON THE LEFT AND CARDS ON THE RIGHT */
            <div className="relative pl-0 sm:pl-4 space-y-6">
              {/* Central vertical connecting line */}
              <div className="hidden sm:block absolute left-[120px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-sky-500/40 via-blue-500/20 to-slate-800" />

              {scheduledDoses.map((dose) => {
                const isTaken = dose.status === 'Dose Taken';
                const isSkipped = dose.status === 'Skipped';
                const isDueNow = dose.status === 'Due now';
                const isMissed = dose.status === 'Missed';
                const isReminderActive = dose.medication.reminderEnabled !== false;

                // Card styling:
                // - Blue highlighted card for active or due medication
                // - Subtle green accent for completed dose
                // - Subtle amber for skipped
                // - Light/slate background for other cards
                let cardContainerStyle = 'bg-slate-900/90 border-white/10 hover:border-white/20';
                if (isDueNow) {
                  cardContainerStyle = 'bg-gradient-to-r from-blue-950/80 via-slate-900 to-sky-950/60 border-sky-400 shadow-xl shadow-sky-500/15 ring-1 ring-sky-400/50';
                } else if (isTaken) {
                  cardContainerStyle = 'bg-emerald-950/20 border-emerald-500/30';
                } else if (isSkipped) {
                  cardContainerStyle = 'bg-amber-950/15 border-amber-500/20 opacity-80';
                } else if (isMissed) {
                  cardContainerStyle = 'bg-rose-950/20 border-rose-500/30';
                }

                return (
                  <div
                    key={dose.id}
                    onClick={() => setHighlightedDoseId(dose.id)}
                    className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-8 relative group"
                  >
                    {/* Time Label on Left */}
                    <div className="sm:w-[100px] shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 pt-1">
                      <span className="text-sm sm:text-base font-extrabold font-mono text-white tracking-tight">
                        {dose.scheduledTime}
                      </span>
                      <span className="text-[11px] text-sky-400 font-mono">
                        {dose.timeCategory}
                      </span>
                    </div>

                    {/* Timeline Node Dot (on desktop) */}
                    <div className="hidden sm:flex absolute left-[113px] top-4 w-4 h-4 rounded-full items-center justify-center bg-slate-950 border-2 z-10 transition-transform group-hover:scale-125"
                      style={{
                        borderColor: isDueNow ? '#38bdf8' : isTaken ? '#34d399' : isSkipped ? '#f59e0b' : '#64748b',
                      }}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isDueNow
                            ? 'bg-sky-400 animate-ping'
                            : isTaken
                            ? 'bg-emerald-400'
                            : isSkipped
                            ? 'bg-amber-400'
                            : 'bg-slate-500'
                        }`}
                      />
                    </div>

                    {/* Medication Card on Right */}
                    <div
                      className={`flex-1 rounded-3xl p-5 border transition-all duration-200 shadow-lg ${cardContainerStyle}`}
                    >
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Medication Name & Dosage */}
                            <h3 className="text-base sm:text-xl font-extrabold text-white font-heading">
                              {dose.medication.name} – {dose.medication.dosage}
                            </h3>

                            {/* Prescribed Category/Condition */}
                            {dose.medication.category && (
                              <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                                {dose.medication.category}
                              </span>
                            )}
                          </div>

                          {/* Instructions row */}
                          <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap pt-0.5">
                            {/* Number of pills / dose instructions */}
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-300">
                              <Pill className="w-3.5 h-3.5 text-sky-400" />
                              <span>{dose.medication.pillsCount || '1 tablet'}</span>
                            </span>

                            <span>•</span>

                            {/* Before/After meal instructions */}
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-200 font-medium">
                              {dose.medication.foodInstruction || 'After meal'}
                            </span>

                            {dose.medication.instructions && (
                              <>
                                <span>•</span>
                                <span className="text-slate-400 text-[11px] italic">
                                  {dose.medication.instructions}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Reminder Bell & Status Badge */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Reminder Notification Bell Icon with Toggle */}
                          <button
                            onClick={(e) => handleToggleReminder(dose.medication, e)}
                            className={`p-1.5 rounded-xl border transition-colors ${
                              isReminderActive
                                ? 'bg-sky-500/20 text-sky-400 border-sky-500/30 hover:bg-sky-500/30'
                                : 'bg-slate-800 text-slate-500 border-white/5 hover:text-slate-400'
                            }`}
                            title={isReminderActive ? 'Reminder active (Click to mute)' : 'Reminder muted (Click to enable)'}
                          >
                            {isReminderActive ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                          </button>

                          {/* Status Badge */}
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
                              isTaken
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : isDueNow
                                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 animate-pulse'
                                : isSkipped
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : isMissed
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-slate-800 text-slate-300 border border-white/10'
                            }`}
                          >
                            {isTaken && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                            <span>{dose.status}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body: Additional user notes if any */}
                      {dose.medication.notes && (
                        <p className="text-xs text-slate-400 font-light mt-2.5">
                          {dose.medication.notes}
                        </p>
                      )}

                      {/* Card Footer: Action Buttons (Dose Taken, Skip, Edit) */}
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
                        {/* Time log record info */}
                        <div className="text-[11px] font-mono text-slate-400">
                          {dose.adherenceLog ? (
                            <span>
                              {dose.adherenceLog.status === 'taken' ? '✓ Taken' : '⤼ Skipped'} at{' '}
                              <strong className="text-white">{dose.adherenceLog.time}</strong>
                            </span>
                          ) : isDueNow ? (
                            <span className="text-sky-300 font-semibold animate-pulse">
                              Scheduled for now ({dose.scheduledTime})
                            </span>
                          ) : (
                            <span>Scheduled: {dose.scheduledTime}</span>
                          )}
                        </div>

                        {/* Action Buttons: "Skip" & "Dose Taken" */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMarkDoseSkipped(dose)}
                            disabled={isSkipped}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              isSkipped
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-default'
                                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white'
                            }`}
                            title="Mark this scheduled dose as skipped"
                          >
                            <span>{isSkipped ? 'Skipped' : 'Skip'}</span>
                          </button>

                          <button
                            onClick={() => handleMarkDoseTaken(dose)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                              isTaken
                                ? 'bg-emerald-500 text-white shadow-emerald-500/25 ring-1 ring-emerald-300/40'
                                : isDueNow
                                ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/30'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                            title="Mark scheduled dose as taken"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{isTaken ? 'Dose Taken ✓' : 'Dose Taken'}</span>
                          </button>

                          {/* Quick Edit */}
                          <button
                            onClick={() => {
                              setSelectedMedToEdit(dose.medication);
                              setEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Edit prescribed medicine"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANAGE ALL PRESCRIPTIONS */}
      {activeTab === 'all-medications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-heading">
              Prescribed Medicines Registry ({medications.length})
            </h2>
            <button
              onClick={() => {
                setSelectedMedToEdit(null);
                setEditModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Add Medicine</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map((med) => (
              <div
                key={med.id}
                className="p-5 rounded-3xl bg-slate-900 border border-white/10 hover:border-sky-500/40 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-white/10">
                    <div>
                      <span className="text-base font-bold text-white block">
                        {med.name} – {med.dosage}
                      </span>
                      <span className="text-xs text-sky-400 font-mono">
                        {med.scheduledTime || '09:00 AM'} • {med.frequency}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleReminder(med, e)}
                        className={`p-1.5 rounded-xl border ${
                          med.reminderEnabled !== false
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                            : 'bg-slate-800 text-slate-500 border-white/5'
                        }`}
                        title="Toggle smart reminder"
                      >
                        {med.reminderEnabled !== false ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedMedToEdit(med);
                          setEditModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                        title="Edit medicine"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono text-[11px]">Category:</span>
                      <span className="font-medium text-slate-200">{med.category || 'General Care'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono text-[11px]">Meal Timing:</span>
                      <span className="font-medium text-slate-200">{med.foodInstruction || 'After meal'}</span>
                    </div>
                    {med.notes && (
                      <p className="text-slate-400 text-[11px] pt-1 italic">{med.notes}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      playChime(500);
                      setSideEffectModalMed(med);
                    }}
                    className="text-sky-300 hover:text-sky-200 flex items-center gap-1 hover:underline text-[11px]"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-sky-400" />
                    <span>Record Side Effect ({med.sideEffects?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => toggleMedicationActive(med.id, !med.active)}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5"
                  >
                    {med.active ? 'Archive' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SIDE EFFECT LOGS & CLINICIAN BRIEF */}
      {activeTab === 'side-effects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-heading">
              Prescription Side Effect Log & Doctor Prep
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map((med) => {
              const reactions = med.sideEffects || [];
              return (
                <div key={med.id} className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div>
                      <h4 className="text-sm font-bold text-white">{med.name}</h4>
                      <span className="text-xs text-slate-400 font-mono">{med.dosage}</span>
                    </div>
                    <button
                      onClick={() => setSideEffectModalMed(med)}
                      className="px-3 py-1 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-semibold"
                    >
                      + Log Symptom
                    </button>
                  </div>

                  {reactions.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No adverse reactions or side effects reported.</p>
                  ) : (
                    <div className="space-y-2">
                      {reactions.map((r, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
                          <span className="text-slate-200">{r.description}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">
                            {r.severity} • {r.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SAFETY NOTICE FOOTER */}
      <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/20 flex items-center gap-3 text-xs text-sky-200/90 shadow-sm">
        <ShieldAlert className="w-4 h-4 text-sky-400 shrink-0" />
        <span>
          Important Safety Notice: Reminders follow schedule and dosage instructions entered by you or your healthcare provider. This tool does not alter prescriptions or provide clinical dosage recommendations. Always consult your prescribing physician.
        </span>
      </div>

      {/* EDIT / ADD MEDICATION MODAL */}
      <EditMedicationModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedMedToEdit(null);
        }}
        medicationToEdit={selectedMedToEdit}
      />

      {/* SIDE EFFECT MODAL / DRAWER */}
      {sideEffectModalMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-sky-500/40 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Log Reaction: {sideEffectModalMed.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {sideEffectModalMed.dosage} • {sideEffectModalMed.frequency}
                </span>
              </div>
              <button
                onClick={() => {
                  setSideEffectModalMed(null);
                  setDoctorSummary(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                Symptom or Reaction Observed
              </label>
              <input
                type="text"
                value={sideEffectDesc}
                onChange={(e) => setSideEffectDesc(e.target.value)}
                placeholder="e.g. Mild headache 30 mins after dose, Dizziness, Nausea"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                Severity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['mild', 'moderate', 'severe'] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSideEffectSeverity(sev)}
                    className={`py-1.5 rounded-xl text-xs capitalize border ${
                      sideEffectSeverity === sev
                        ? 'bg-sky-500/20 text-sky-300 border-sky-400 font-bold'
                        : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveSideEffect}
                disabled={!sideEffectDesc.trim()}
                className="flex-1 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs disabled:opacity-50"
              >
                Save Reaction to Log
              </button>

              <button
                onClick={handleGenerateSideEffectSummary}
                disabled={summaryLoading}
                className="px-4 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Doctor Brief</span>
              </button>
            </div>

            {/* Previously logged */}
            {sideEffectModalMed.sideEffects && sideEffectModalMed.sideEffects.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                  Previously Logged Reactions ({sideEffectModalMed.sideEffects.length})
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {sideEffectModalMed.sideEffects.map((se, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs flex items-center justify-between"
                    >
                      <span className="text-slate-200">{se.description}</span>
                      <span className="text-[10px] font-mono text-amber-300 px-2 py-0.5 rounded bg-amber-500/10">
                        {se.severity} • {se.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated Doctor Summary Box */}
            {doctorSummary && (
              <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-400/40 text-xs text-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-sky-300 font-bold font-heading">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Clinician Discussion Brief</span>
                </div>
                <div className="whitespace-pre-wrap font-light">{doctorSummary}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
