import React from 'react';
import { Calendar, FileText, HelpCircle, FileCheck, ArrowRight, Stethoscope } from 'lucide-react';

export function VisitPrepSection() {
  const prepSteps = [
    {
      label: 'Scheduled Appointment',
      detail: 'Dr. Sarah Vance • Cardiology',
      icon: Calendar,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Relevant Records',
      detail: 'Last 60 days events & active meds',
      icon: FileText,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      label: 'Prioritized Questions',
      detail: '3 focused topics to ask physician',
      icon: HelpCircle,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    },
    {
      label: '1-Minute Summary Brief',
      detail: 'Crisp, structured exam-room brief',
      icon: FileCheck,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">
            Clinical Readiness
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
            Walk into your next appointment prepared.
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            The average patient has less than fifteen minutes with their doctor. HELIOS organizes your existing records so you never forget a symptom, question, or medication change.
          </p>
        </div>

        {/* Visual Workflow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {prepSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className="rounded-2xl glass-panel p-6 border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-4 ${step.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    STAGE 0{idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1 font-heading">
                    {step.label}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">{step.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Mock Brief Card */}
        <div className="mt-8 rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/20 shadow-xl max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white font-heading">
                Example 1-Minute Physician Visit Brief
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              Generated On Demand
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
              <span className="text-slate-400 font-semibold block text-[11px]">
                1. Context & Recent Milestones:
              </span>
              <p>
                Follow-up on blood pressure trend noted in October; routine lipid check scheduled.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
              <span className="text-slate-400 font-semibold block text-[11px]">
                2. Active Prescriptions & Dosages:
              </span>
              <p>
                User records verify active regimen; zero modifications made without physician.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
              <span className="text-slate-400 font-semibold block text-[11px]">
                3. Questions for Dr. Vance:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                <li>Are current energy patterns aligned with recent lab values?</li>
                <li>Should timing of morning supplements be adjusted relative to breakfast?</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
