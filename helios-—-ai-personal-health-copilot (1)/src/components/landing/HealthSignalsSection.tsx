import React from 'react';
import { Calendar, FileClock, Pill, Target, BellRing, ShieldCheck } from 'lucide-react';

export function HealthSignalsSection() {
  const signalTypes = [
    {
      type: 'Care Timing',
      title: 'Upcoming Appointment',
      desc: 'Reminds you when a consultation is 7 days away so you can generate your visit questions.',
      icon: Calendar,
      badge: 'Schedule Signal',
      color: 'border-amber-500/30 text-amber-300',
    },
    {
      type: 'Custody Review',
      title: 'Document Awaiting Review',
      desc: 'Highlights uploaded files that haven&apos;t been confirmed into your timeline yet.',
      icon: FileClock,
      badge: 'Action Signal',
      color: 'border-cyan-500/30 text-cyan-300',
    },
    {
      type: 'Adherence',
      title: 'Medication Schedule Sync',
      desc: 'Prompts you to verify your recorded dosages before your next physician check-in.',
      icon: Pill,
      badge: 'Routine Signal',
      color: 'border-violet-500/30 text-violet-300',
    },
    {
      type: 'Wellness Habit',
      title: 'Inactive Personal Goal',
      desc: 'A gentle reminder if a chosen health intention has been dormant for several weeks.',
      icon: Target,
      badge: 'Pacing Signal',
      color: 'border-emerald-500/30 text-emerald-300',
    },
  ];

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-[#020617]/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">
            Care Coordination
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
            Notice what needs your attention.
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            HELIOS Health Signals are purely organizational. We never make speculative medical disease predictions. Instead, we alert you to tasks, upcoming appointments, and personal reminders.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {signalTypes.map((sig) => {
            const Icon = sig.icon;
            return (
              <div
                key={sig.title}
                className={`rounded-2xl glass-panel p-6 border ${sig.color} hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
                    {sig.badge}
                  </span>
                  <Icon className="w-5 h-5 opacity-90" />
                </div>
                <h3 className="text-sm font-bold text-white font-heading">
                  {sig.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {sig.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 max-w-2xl mx-auto text-center text-xs text-slate-500 font-mono flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400/80" />
          <span>Strict Organizational Signals • No Disease Scoring • Zero Diagnostic AI Speculation</span>
        </div>
      </div>
    </section>
  );
}
