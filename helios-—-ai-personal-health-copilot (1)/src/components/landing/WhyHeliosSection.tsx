import React from 'react';
import { XCircle, CheckCircle2, HeartHandshake, UserCheck, Stethoscope, Sparkles } from 'lucide-react';

export function WhyHeliosSection() {
  const personas = [
    {
      title: 'Managing Personal Health',
      desc: 'Keeping decades of physical tests, immunizations, and annual physicals unified in one timeline.',
      category: 'Lifelong Care',
    },
    {
      title: 'Preparing for Doctor Visits',
      desc: 'Walking into fifteen-minute specialist appointments with a concise 1-minute brief and focused questions.',
      category: 'Appointment Prep',
    },
    {
      title: 'Understanding Lab Reports',
      desc: 'Translating confusing blood panels, lipid ratios, and medical acronyms into plain, empowering English.',
      category: 'Report Clarity',
    },
    {
      title: 'Organizing Medications',
      desc: 'Maintaining an accurate list of active dosages and supplements without trusting third-party pill trackers.',
      category: 'Medication Regimen',
    },
    {
      title: 'Tracking Wellness Goals',
      desc: 'Sustaining positive sleep, walking, or hydration intentions with gentle, non-judgmental reminders.',
      category: 'Holistic Habits',
    },
  ];

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-[#020617]/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">
            The Paradigm Shift
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
            Why HELIOS?
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Healthcare communication has fractured into siloed patient portals and lost paperwork. HELIOS brings human coherence back to your health.
          </p>
        </div>

        {/* Before vs With HELIOS Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {/* Before */}
          <div className="rounded-3xl glass-panel p-8 border border-rose-500/20 shadow-xl relative overflow-hidden bg-rose-950/[0.08]">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-xs uppercase tracking-wider mb-6">
              <XCircle className="w-4 h-4" />
              <span>Before HELIOS — Scattered & Forgetful</span>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="font-semibold text-rose-300 block text-xs">
                  Disconnected Records
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Report here in an email attachment, prescription on paper, appointments in a separate portal.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="font-semibold text-rose-300 block text-xs">
                  Exam Room Anxiety
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  You sit down with the doctor, and the questions you spent days thinking about suddenly vanish.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="font-semibold text-rose-300 block text-xs">
                  Opaque Jargon
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Lab values produce anxiety because standard medical references provide zero relatable context.
                </p>
              </div>
            </div>
          </div>

          {/* With HELIOS */}
          <div className="rounded-3xl glass-panel p-8 border border-cyan-500/30 shadow-2xl relative overflow-hidden bg-cyan-950/[0.12]">
            <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-6">
              <CheckCircle2 className="w-4 h-4" />
              <span>With HELIOS — One Continuous Journey</span>
            </div>

            <div className="space-y-4 text-sm text-slate-200">
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <span className="font-semibold text-cyan-300 block text-xs">
                  Unified Chronological Timeline
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  Reports, medications, appointments, and personal notes arranged in a fluid, zoomable visual path.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <span className="font-semibold text-cyan-300 block text-xs">
                  1-Minute Doctor Visit Briefs
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  Instant executive briefings synthesize recent events and prioritized questions before each visit.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <span className="font-semibold text-cyan-300 block text-xs">
                  Clear Educational Demystification
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  Copilot breaks down test results in empowering terms while encouraging professional physician review.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Designed for Real People Scenarios */}
        <div className="mt-8">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Designed for real people.
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Conceptual scenarios that demonstrate the versatility of your personal health workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {personas.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl glass-panel p-5 border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-2">
                    {p.category}
                  </span>
                  <h4 className="text-xs font-bold text-white font-heading">
                    {p.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
