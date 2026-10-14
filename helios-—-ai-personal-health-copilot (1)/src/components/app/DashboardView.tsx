import React, { useState } from 'react';
import {
  Compass,
  PlusCircle,
  FileText,
  Calendar,
  Pill,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers,
  ChevronRight,
  BellRing,
  HeartPulse,
  AlertCircle,
  Droplets,
  Moon,
  Activity,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { playChime } from '../../lib/audio';

interface DashboardViewProps {
  onSelectTab: (tab: string) => void;
  onOpenAddModal: (type?: string) => void;
}

export function DashboardView({ onSelectTab, onOpenAddModal }: DashboardViewProps) {
  const { activeUser } = useAuth();
  const {
    healthEvents,
    documents,
    medications,
    appointments,
    goals,
    vitals,
    symptoms,
    lifestyleLogs,
    healthSignals,
    markMedicationStatus,
    logWater,
    logSleep,
    logActivity,
    getTodayLifestyle,
  } = useHealthData();

  // Date Strip & Selected Date State
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const today = new Date();
  const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const isSelectedDateToday = todayDateStr === selectedDateStr;

  // Generate 7-day week window centered or aligned around today (3 days before, today, 3 days ahead)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - 3 + i);
    return d;
  });

  const fullDateFormatted = selectedDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }); // e.g. "Monday, 12 October 2026"

  const todayStr = todayDateStr;
  const todayLifestyle = getTodayLifestyle();

  const hasAnyData =
    healthEvents.length > 0 ||
    documents.length > 0 ||
    medications.length > 0 ||
    appointments.length > 0 ||
    goals.length > 0 ||
    vitals.length > 0 ||
    symptoms.length > 0;

  const nextAppointment = appointments.find((a) => a.status === 'upcoming');
  const activeMeds = medications.filter((m) => m.active);
  const latestVital = vitals[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HELIOS Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            Welcome back, {activeUser?.displayName?.split(' ')[0] || 'Voyager'}.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {hasAnyData
              ? 'Your private health workspace is synchronized and active.'
              : 'Your health journey is ready for its first real entry.'}
          </p>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              playChime(500);
              onSelectTab('copilot');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Consult Copilot</span>
          </button>
          <button
            onClick={() => {
              playChime(620);
              onOpenAddModal();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-3.5 h-3.5 text-white" />
            <span>+ Add Health Record</span>
          </button>
        </div>
      </div>

      {/* DATE AND DAY HEADER COMPONENT */}
      <div className="rounded-3xl glass-panel border border-white/[0.08] p-5 sm:p-6 shadow-xl relative overflow-hidden bg-gradient-to-b from-white/[0.04] to-transparent">
        {/* Full Date Heading with Calendar Icon */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400/90 font-medium block mb-1">
              {isSelectedDateToday ? 'Today · Schedule & Checkpoints' : 'Selected Schedule Date'}
            </span>
            <h2 className="text-lg sm:text-2xl font-bold font-heading text-white tracking-tight flex items-center gap-2">
              <span>{fullDateFormatted}</span>
              {isSelectedDateToday && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium hidden sm:inline-block">
                  Today
                </span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!isSelectedDateToday && (
              <button
                onClick={() => {
                  playChime(500);
                  setSelectedDate(new Date());
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors"
                title="Jump to today"
              >
                Reset to Today
              </button>
            )}
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 shadow-inner">
              <Calendar className="w-5 h-5 text-teal-300" />
            </div>
          </div>
        </div>

        {/* Horizontal Row of 7 Days */}
        <div className="pt-4">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
            {weekDays.map((d) => {
              const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              const isToday = dStr === todayDateStr;
              const isSelected = dStr === selectedDateStr;
              const dayAbbr = d.toLocaleDateString('en-US', { weekday: 'short' });
              const dateNumber = d.getDate();

              return (
                <button
                  key={dStr}
                  type="button"
                  onClick={() => {
                    playChime(isSelected ? 520 : 600);
                    setSelectedDate(new Date(d));
                  }}
                  className={`group relative flex flex-col items-center justify-center py-3 px-1 sm:px-2.5 rounded-2xl transition-all duration-200 cursor-pointer select-none text-center ${
                    isSelected
                      ? 'bg-gradient-to-b from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25 scale-[1.02] ring-2 ring-teal-400/40'
                      : isToday
                      ? 'bg-teal-500/20 border border-teal-500/40 text-teal-200 hover:bg-teal-500/30'
                      : 'bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span
                    className={`text-[11px] sm:text-xs font-semibold uppercase tracking-wider block transition-colors ${
                      isSelected
                        ? 'text-teal-100'
                        : isToday
                        ? 'text-teal-300 font-bold'
                        : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {dayAbbr}
                  </span>
                  <span
                    className={`text-base sm:text-xl font-bold font-heading mt-0.5 block transition-colors ${
                      isSelected
                        ? 'text-white'
                        : isToday
                        ? 'text-white'
                        : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {dateNumber}
                  </span>
                  {/* Subtle indicator dot for today when not selected */}
                  {isToday && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1 shadow-sm shadow-teal-400" />
                  )}
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white mt-1 shadow-sm shadow-white" />
                  )}
                  {!isToday && !isSelected && (
                    <span className="w-1.5 h-1.5 mt-1 opacity-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TODAY'S HEALTH COMMAND CENTER */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h3 className="text-base sm:text-lg font-bold text-white font-heading">
              {isSelectedDateToday ? "Today's Health" : `Health Overview (${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Grid of Command Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Medicines Due */}
          <div className="rounded-3xl glass-panel p-5 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                <div className="flex items-center gap-2 text-violet-400">
                  <Pill className="w-4 h-4" />
                  <span className="text-xs font-bold font-heading uppercase">Medicines Due</span>
                </div>
                <button
                  onClick={() => onSelectTab('medications')}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  View All
                </button>
              </div>

              {activeMeds.length === 0 ? (
                <div className="py-6 text-center space-y-2">
                  <p className="text-xs text-slate-400 font-light">No medications tracked yet.</p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        playChime(620);
                        onOpenAddModal('medication');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Medication</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {activeMeds.slice(0, 3).map((med) => {
                    const isTakenToday = (med.adherenceLogs || []).some(
                      (l) => l.date === todayStr && l.status === 'taken'
                    );
                    return (
                      <div
                        key={med.id}
                        className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">{med.name}</span>
                          <span className="text-[10px] text-slate-400 font-light">
                            {med.dosage} · {med.frequency}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            playChime(isTakenToday ? 360 : 660);
                            markMedicationStatus(med.id, isTakenToday ? 'missed' : 'taken');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            isTakenToday
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300'
                          }`}
                        >
                          {isTakenToday ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Taken</span>
                            </>
                          ) : (
                            <span>Mark Taken</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
              <span>Scheduled Reminders</span>
              <span className="font-mono text-cyan-400">Active</span>
            </div>
          </div>

          {/* Card 2: Upcoming Appointment */}
          <div className="rounded-3xl glass-panel p-5 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-bold font-heading uppercase">Upcoming Appointment</span>
                </div>
                <button
                  onClick={() => onSelectTab('appointments')}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Manage
                </button>
              </div>

              {nextAppointment ? (
                <div className="p-3.5 rounded-2xl bg-amber-950/15 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-heading">
                      {nextAppointment.doctorName}
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/20">
                      {nextAppointment.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-light">
                    {nextAppointment.specialty} {nextAppointment.clinic ? '· ' + nextAppointment.clinic : ''}
                  </p>
                  <button
                    onClick={() => onSelectTab('appointments')}
                    className="w-full mt-2 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>View 1-Minute Prep Brief</span>
                  </button>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-xs text-slate-400 font-light">No appointments scheduled.</p>
                  <button
                    onClick={() => onOpenAddModal('consultation')}
                    className="mt-2 text-xs text-cyan-400 hover:underline font-semibold"
                  >
                    + Schedule Doctor Visit
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
              <span>Appointment Prep Alert</span>
              <span className="font-mono text-cyan-400">24h Engine Ready</span>
            </div>
          </div>

          {/* Card 3: Vitals Overview */}
          <div className="rounded-3xl glass-panel p-5 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                <div className="flex items-center gap-2 text-rose-400">
                  <HeartPulse className="w-4 h-4" />
                  <span className="text-xs font-bold font-heading uppercase">Vital Signs</span>
                </div>
                <button
                  onClick={() => onOpenAddModal('vitals')}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  + Log Reading
                </button>
              </div>

              {latestVital ? (
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                    <span className="text-sm font-bold text-white block mt-0.5 font-mono">
                      {latestVital.systolicBP || '--'}/{latestVital.diastolicBP || '--'}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">mmHg</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 block">Heart Rate</span>
                    <span className="text-sm font-bold text-white block mt-0.5 font-mono">
                      {latestVital.heartRate || '--'}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">bpm</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 block">Oxygen SpO₂</span>
                    <span className="text-sm font-bold text-white block mt-0.5 font-mono">
                      {latestVital.spo2 ? `${latestVital.spo2}%` : '--'}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">Oxygen saturation</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 block">Temperature</span>
                    <span className="text-sm font-bold text-white block mt-0.5 font-mono">
                      {latestVital.temperature ? `${latestVital.temperature}°F` : '--'}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">Body temp</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-xs text-slate-400 font-light">No vitals logged yet.</p>
                  <button
                    onClick={() => onOpenAddModal('vitals')}
                    className="mt-2 text-xs text-cyan-400 hover:underline font-semibold"
                  >
                    + Log First Vitals Checkpoint
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
              <span>Last Logged</span>
              <span className="font-mono text-slate-300">{latestVital?.date || 'None'}</span>
            </div>
          </div>

          {/* Card 4: Daily Hydration Tracker */}
          <div className="rounded-3xl glass-panel p-5 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                <div className="flex items-center gap-2 text-sky-400">
                  <Droplets className="w-4 h-4" />
                  <span className="text-xs font-bold font-heading uppercase">Water Tracker</span>
                </div>
                <span className="text-xs font-mono text-cyan-300 font-bold">
                  {todayLifestyle.waterGlasses} / 8 glasses
                </span>
              </div>

              <div className="w-full bg-slate-900 rounded-full h-2.5 mb-4 overflow-hidden border border-white/[0.06]">
                <div
                  className="bg-gradient-to-r from-sky-400 to-cyan-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (todayLifestyle.waterGlasses / 8) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    playChime(420);
                    logWater(-1);
                  }}
                  className="w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-lg flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-xl font-bold font-mono text-white">
                  {todayLifestyle.waterGlasses} <span className="text-xs text-slate-400">glasses</span>
                </span>
                <button
                  onClick={() => {
                    playChime(640);
                    logWater(1);
                  }}
                  className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-cyan-500/25"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.06] text-center text-[11px] text-slate-400 font-light">
              Tap + after drinking a glass of water
            </div>
          </div>

          {/* Card 5: Sleep Tracker */}
          <div className="rounded-3xl glass-panel p-5 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Moon className="w-4 h-4" />
                  <span className="text-xs font-bold font-heading uppercase">Sleep Routine</span>
                </div>
                <span className="text-xs font-mono text-indigo-300">
                  {todayLifestyle.sleepHours ? `${todayLifestyle.sleepHours} hrs logged` : 'Not logged'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-light">Log last night&apos;s rest:</span>
                  <div className="flex items-center gap-1.5">
                    {[6, 7, 8, 9].map((hrs) => (
                      <button
                        key={hrs}
                        onClick={() => {
                          playChime(560);
                          logSleep(hrs, hrs >= 7 ? 'restful' : 'average');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                          todayLifestyle.sleepHours === hrs
                            ? 'bg-indigo-500 text-white font-bold'
                            : 'bg-white/[0.04] text-slate-400 hover:text-white'
                        }`}
                      >
                        {hrs}h
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-300 font-light">Quality:</span>
                  <span className="text-xs font-medium text-emerald-400 capitalize">
                    {todayLifestyle.sleepQuality || 'Restful'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.06] text-center text-[11px] text-slate-400 font-light">
              Consistent sleep correlates with improved vitals stability
            </div>
          </div>

          {/* Card 6: Symptoms & Activity */}
          <div className="rounded-3xl glass-panel p-5 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-bold font-heading uppercase">Activity & Symptoms</span>
                </div>
                <button
                  onClick={() => onOpenAddModal('symptom')}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  + Log Symptom
                </button>
              </div>

              {/* Activity quick add */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-bold text-white block">Daily Activity</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {todayLifestyle.activityMinutes} minutes logged
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      playChime(540);
                      logActivity(15);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono font-bold"
                  >
                    +15m
                  </button>
                  <button
                    onClick={() => {
                      playChime(600);
                      logActivity(30);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono font-bold"
                  >
                    +30m
                  </button>
                </div>
              </div>

              {/* Recent Symptoms chip list */}
              {symptoms.length > 0 ? (
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-mono">
                    Recent Symptom Notes ({symptoms.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {symptoms.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                          s.severity === 'mild'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : s.severity === 'moderate'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {s.symptom}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-light text-center py-2">
                  No active symptoms recorded.
                </p>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
              <span>Timeline Integration</span>
              <span className="font-mono text-cyan-400">Synchronized</span>
            </div>
          </div>
        </div>
      </div>

      {/* EMPTY STATE BANNER IF TOTALLY EMPTY */}
      {!hasAnyData && (
        <div className="rounded-3xl glass-panel p-8 sm:p-12 text-center border border-cyan-500/30 shadow-2xl space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-xl shadow-cyan-500/20">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
            Your health journey starts here.
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto font-light leading-relaxed">
            HELIOS does not inject synthetic records. Your private timeline begins when you add your first prescription, lab report, vital sign, or consultation.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                playChime(620);
                onOpenAddModal();
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-xl shadow-cyan-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>+ Add Health Record</span>
            </button>
            <button
              onClick={() => {
                playChime(500);
                onSelectTab('copilot');
              }}
              className="px-6 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Consult Copilot</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
