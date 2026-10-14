import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  PlusCircle,
  Stethoscope,
  Trash2,
  Clock,
  MapPin,
  Sparkles,
  Loader2,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  FileText,
  AlertCircle,
  Pill,
  Printer,
  Copy,
  Bell,
  BellOff,
  Edit3,
  Volume2,
  X,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { Appointment } from '../../types';
import { playChime, playReminderAlertSound } from '../../lib/audio';
import {
  formatAppointmentCountdown,
  checkUpcomingAppointments,
  DueAppointmentReminder,
  triggerTestAppointmentReminder,
  getAppointmentDateTime,
} from '../../lib/appointmentReminderService';
import { getNotificationPermission, requestNotificationPermission } from '../../lib/medicationReminderService';
import { AddAppointmentModal } from './AddAppointmentModal';

interface AppointmentsViewProps {
  onOpenAddModal: () => void;
}

export function AppointmentsView({ onOpenAddModal }: AppointmentsViewProps) {
  const {
    appointments,
    deleteAppointment,
    updateAppointment,
    toggleAppointmentReminder,
    updateAppointmentPrep,
    healthEvents,
    medications,
    goals,
    symptoms,
    documents,
  } = useHealthData();

  const [generatingForId, setGeneratingForId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);

  // In-app alert fallback when a reminder triggers
  const [inAppAlertReminder, setInAppAlertReminder] = useState<DueAppointmentReminder | null>(null);

  // Notification permission
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [testNotice, setTestNotice] = useState<string | null>(null);

  // Changing reminder timing dropdown inline
  const [openTimingMenuId, setOpenTimingMenuId] = useState<string | null>(null);

  const upcomingApts = appointments.filter((a) => a.status === 'upcoming');
  const pastApts = appointments.filter((a) => a.status !== 'upcoming');

  // Check notifications on mount and set permissions
  useEffect(() => {
    setNotifPermission(getNotificationPermission());
  }, []);

  // Background reminder checker for appointments
  const appointmentsRef = useRef(appointments);
  appointmentsRef.current = appointments;

  useEffect(() => {
    const check = () => {
      checkUpcomingAppointments(appointmentsRef.current, (reminder) => {
        setInAppAlertReminder(reminder);
      });
    };

    check();
    const timer = setInterval(check, 20000);
    return () => clearInterval(timer);
  }, []);

  const handleEnableNotifications = async () => {
    playChime(580);
    const res = await requestNotificationPermission();
    setNotifPermission(res);
    if (res === 'granted') {
      setTestNotice('Browser notifications activated for upcoming appointments!');
      setTimeout(() => setTestNotice(null), 5000);
    }
  };

  const handleTestReminder = async () => {
    const res = await triggerTestAppointmentReminder((rem) => {
      setInAppAlertReminder(rem);
    });
    setNotifPermission(getNotificationPermission());
    setTestNotice(res.message);
    setTimeout(() => setTestNotice(null), 6000);
  };

  const handleToggleReminder = async (apt: Appointment) => {
    const current = apt.reminderEnabled !== false;
    playChime(current ? 360 : 540);
    await toggleAppointmentReminder(apt.id, !current);
  };

  const handleSelectReminderNotice = async (apt: Appointment, notice: Appointment['reminderNotice']) => {
    playChime(520);
    await toggleAppointmentReminder(apt.id, true, notice);
    setOpenTimingMenuId(null);
  };

  const handleMarkCompleted = async (apt: Appointment) => {
    playChime(660);
    await updateAppointment(apt.id, { status: 'completed' });
  };

  const handleGeneratePrep = async (apt: Appointment) => {
    try {
      playChime(540);
      setGeneratingForId(apt.id);
      const res = await fetch('/api/ai/visit-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment: {
            doctorName: apt.doctorName,
            specialty: apt.specialty,
            date: apt.date,
            notes: apt.notes,
          },
          relevantEvents: healthEvents.slice(0, 5),
          currentMedications: medications.filter((m) => m.active),
          goals: goals.filter((g) => g.status === 'active'),
          symptoms: symptoms.slice(0, 5),
        }),
      });

      if (!res.ok) throw new Error('Visit prep error');
      const data = await res.json();
      const defaultQuestions = [
        'Should I repeat this lab test?',
        'How long should I continue the current medication?',
        'What specific symptom changes should I monitor at home?',
      ];
      await updateAppointmentPrep(apt.id, data.prep, defaultQuestions);
      playChime(680);
    } catch (err: any) {
      console.error(err);
    } finally {
      setGeneratingForId(null);
    }
  };

  const handleCopyBrief = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playChime(620);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const nextAppointment = upcomingApts[0] || null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* IN-APP DUE APPOINTMENT REMINDER BANNER (Fallback alert) */}
      {inAppAlertReminder && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white shadow-2xl shadow-amber-500/30 border border-amber-300/40 animate-bounce duration-1000">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
                <Bell className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                  <span>Upcoming Consultation Reminder</span>
                  <span>•</span>
                  <span>{inAppAlertReminder.noticeLabel}</span>
                </div>
                <h4 className="text-base sm:text-lg font-extrabold font-heading">
                  Visit with {inAppAlertReminder.appointment.doctorName}
                </h4>
                <p className="text-xs text-amber-100 font-light mt-0.5">
                  {inAppAlertReminder.appointment.specialty} • {inAppAlertReminder.appointment.date}
                  {inAppAlertReminder.appointment.time ? ` at ${inAppAlertReminder.appointment.time}` : ''}
                  {inAppAlertReminder.appointment.location ? ` (${inAppAlertReminder.appointment.location})` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
              <button
                onClick={() => setInAppAlertReminder(null)}
                className="px-4 py-2 rounded-xl bg-white text-amber-800 hover:bg-amber-50 text-xs font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>Acknowledge Reminder</span>
              </button>
              <button
                onClick={() => setInAppAlertReminder(null)}
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Care Consultations & Visit Reminders</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            Appointments & Reminders
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize upcoming consultations, configure automated reminders, and generate 1-minute doctor briefing summaries.
          </p>
        </div>

        <button
          onClick={() => {
            playChime(580);
            setEditingAppointment(null);
            setIsAddEditModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold shadow-lg shadow-amber-500/25 transition-all self-start sm:self-auto active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Consultation</span>
        </button>
      </div>

      {/* APPOINTMENT REMINDER BANNER & TEST CONTROLS */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${notifPermission === 'granted' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
            {notifPermission === 'granted' ? <Bell className="w-4 h-4 text-emerald-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </div>
          <div className="text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">
                {notifPermission === 'granted'
                  ? 'Appointment Reminders Active'
                  : 'Enable Consultation Reminders'}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  notifPermission === 'granted'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                }`}
              >
                {notifPermission === 'granted' ? 'Push & Sound Enabled' : 'In-App Active'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Receive notifications 1 day or hours before your appointments with doctor briefings and directions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          {notifPermission !== 'granted' && (
            <button
              onClick={handleEnableNotifications}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold transition-colors"
            >
              Enable Notifications
            </button>
          )}
          <button
            onClick={handleTestReminder}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Test reminder sound and browser notification"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Reminder</span>
          </button>
        </div>
      </div>

      {testNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{testNotice}</span>
        </div>
      )}

      {/* NEXT UPCOMING APPOINTMENT REMINDER WIDGET */}
      {nextAppointment && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-orange-950/30 border border-amber-500/30 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_#f59e0b]" />
              <span className="text-xs font-bold text-white uppercase font-heading tracking-wider">
                Next Scheduled Consultation
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                {formatAppointmentCountdown(nextAppointment)}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {nextAppointment.date} {nextAppointment.time ? `· ${nextAppointment.time}` : ''}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-extrabold text-white font-heading">
                {nextAppointment.doctorName}
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-2">
                <span className="font-semibold text-amber-300">{nextAppointment.specialty}</span>
                {nextAppointment.clinic && (
                  <>
                    <span>•</span>
                    <span className="text-slate-400">{nextAppointment.clinic}</span>
                  </>
                )}
              </p>
              {nextAppointment.location && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{nextAppointment.location}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Reminder toggle on highlight card */}
              <button
                onClick={() => handleToggleReminder(nextAppointment)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                  nextAppointment.reminderEnabled !== false
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-white/5 text-slate-400 border-white/10'
                }`}
              >
                {nextAppointment.reminderEnabled !== false ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                <span>
                  {nextAppointment.reminderEnabled !== false
                    ? `Reminder: ${nextAppointment.reminderNotice || '1 day before'}`
                    : 'Reminders Muted'}
                </span>
              </button>

              <button
                onClick={() => {
                  setEditingAppointment(nextAppointment);
                  setIsAddEditModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200"
              >
                Edit Details
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
              <span className="text-lg font-bold font-mono text-amber-400 block">
                {symptoms.length}
              </span>
              <span className="text-[11px] text-slate-400 font-light">Recent Symptoms</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
              <span className="text-lg font-bold font-mono text-violet-400 block">
                {medications.filter((m) => m.active).length}
              </span>
              <span className="text-[11px] text-slate-400 font-light">Current Medications</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
              <span className="text-lg font-bold font-mono text-cyan-400 block">
                {documents.length}
              </span>
              <span className="text-[11px] text-slate-400 font-light">Recent Reports</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
              <span className="text-lg font-bold font-mono text-emerald-400 block">
                {healthEvents.length > 0 ? 'Active' : 'Baseline'}
              </span>
              <span className="text-[11px] text-slate-400 font-light">Timeline Index</span>
            </div>
          </div>
        </div>
      )}

      {/* APPOINTMENTS LIST */}
      {appointments.length === 0 ? (
        <div className="rounded-3xl glass-panel p-12 text-center border border-amber-500/20 shadow-xl max-w-lg mx-auto space-y-4">
          <Calendar className="w-12 h-12 mx-auto text-amber-400/60 animate-pulse" />
          <h3 className="text-xl font-bold font-heading text-white">
            No upcoming appointments scheduled.
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-light">
            Record upcoming doctor consultations to configure automated reminder alerts and synthesize 1-minute doctor briefing summaries.
          </p>
          <button
            onClick={() => {
              playChime(580);
              setEditingAppointment(null);
              setIsAddEditModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            + Add First Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-heading">
              Upcoming Consultations ({upcomingApts.length})
            </h2>
          </div>

          {upcomingApts.map((apt) => {
            const isReminderActive = apt.reminderEnabled !== false;
            const countdownText = formatAppointmentCountdown(apt);

            return (
              <div
                key={apt.id}
                className="rounded-3xl bg-slate-900 border border-white/10 hover:border-amber-400/40 transition-all p-5 sm:p-6 space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                          {apt.doctorName}
                        </h3>
                        <span className="text-[11px] font-mono font-bold text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                          {countdownText}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-light">
                        {apt.specialty} {apt.clinic ? `· ${apt.clinic}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
                    {/* Time badge */}
                    <span className="text-xs font-mono text-amber-300 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/25">
                      {apt.date} {apt.time ? `· ${apt.time}` : ''}
                    </span>

                    {/* Quick Edit */}
                    <button
                      onClick={() => {
                        setEditingAppointment(apt);
                        setIsAddEditModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                      title="Edit consultation"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        playChime(380);
                        deleteAppointment(apt.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/5"
                      title="Delete appointment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Location & Reason */}
                {(apt.location || apt.notes) && (
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {apt.location && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{apt.location}</span>
                      </div>
                    )}
                    {apt.notes && (
                      <p className="text-slate-300 font-light leading-relaxed">
                        <strong className="text-slate-200">Visit Goals:</strong> {apt.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* REMINDER STRIP ON APPOINTMENT CARD */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleToggleReminder(apt)}
                      className={`p-1.5 rounded-xl border transition-colors ${
                        isReminderActive
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30'
                          : 'bg-slate-800 text-slate-500 border-white/5 hover:text-slate-400'
                      }`}
                      title={isReminderActive ? 'Reminder active (Click to mute)' : 'Reminder muted (Click to enable)'}
                    >
                      {isReminderActive ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>

                    <div className="text-xs">
                      <span className="font-semibold text-white block">
                        {isReminderActive ? 'Reminder Alert Scheduled' : 'Reminder Muted'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {isReminderActive
                          ? `Alert configured: ${apt.reminderNotice || '1 day before visit'}`
                          : 'No notification will be triggered'}
                      </span>
                    </div>
                  </div>

                  {isReminderActive && (
                    <div className="relative">
                      <button
                        onClick={() => setOpenTimingMenuId(openTimingMenuId === apt.id ? null : apt.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-amber-300 border border-amber-500/20 flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Change Timing ({apt.reminderNotice || '1 day before'})</span>
                      </button>

                      {openTimingMenuId === apt.id && (
                        <div className="absolute right-0 bottom-full mb-1.5 w-48 rounded-xl bg-slate-900 border border-amber-500/30 p-1.5 shadow-2xl z-20 space-y-1">
                          {(['1 day before', '2 hours before', '1 hour before', '15 minutes before', 'At appointment time'] as const).map(
                            (notice) => (
                              <button
                                key={notice}
                                onClick={() => handleSelectReminderNotice(apt, notice)}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                  apt.reminderNotice === notice
                                    ? 'bg-amber-500 text-white font-bold'
                                    : 'text-slate-300 hover:bg-white/5'
                                }`}
                              >
                                {notice}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 1-Minute Prep Brief Drawer */}
                {apt.prepNotes ? (
                  <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase font-heading">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>Synthesized 1-Minute Doctor Visit Brief</span>
                      </div>

                      <button
                        onClick={() => handleCopyBrief(apt.prepNotes || '', apt.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-cyan-300 transition-colors"
                      >
                        {copiedId === apt.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === apt.id ? 'Copied' : 'Copy Brief'}</span>
                      </button>
                    </div>

                    <div className="text-xs text-slate-200 font-light whitespace-pre-wrap leading-relaxed">
                      {apt.prepNotes}
                    </div>
                  </div>
                ) : (
                  <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
                    <button
                      onClick={() => handleGeneratePrep(apt)}
                      disabled={generatingForId === apt.id}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
                    >
                      {generatingForId === apt.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                      )}
                      <span>Generate 1-Minute Doctor Visit Brief</span>
                    </button>

                    <button
                      onClick={() => handleMarkCompleted(apt)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 hover:text-white"
                    >
                      Mark Attended
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PAST APPOINTMENTS */}
      {pastApts.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-white/10 opacity-75">
          <h3 className="text-sm font-bold text-slate-400 uppercase font-heading tracking-wider">
            Past Consultations ({pastApts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pastApts.map((apt) => (
              <div key={apt.id} className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{apt.doctorName}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {apt.specialty} • {apt.date}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                    Completed
                  </span>
                  <button
                    onClick={() => deleteAppointment(apt.id)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD / EDIT APPOINTMENT MODAL */}
      <AddAppointmentModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingAppointment(null);
        }}
        appointmentToEdit={editingAppointment}
      />
    </div>
  );
}
