import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  PlusCircle,
  Compass,
  Sparkles,
  Stethoscope,
  BellRing,
  ChevronRight,
} from 'lucide-react';
import { playChime } from '../../lib/audio';

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Create your private space',
      description:
        'Create an account and securely enter your personal health workspace. Zero public exposure, zero third-party data brokers.',
      icon: ShieldCheck,
      details: [
        'Private authenticated user partition',
        'Strict Firestore security rules enforcement',
        'Direct sovereign data custody',
      ],
      tag: 'Security & Custody',
    },
    {
      num: '02',
      title: 'Add what matters',
      description:
        'Manually add health events, reports, medications, appointments, goals, and notes. HELIOS will never invent or auto-fabricate health information.',
      icon: PlusCircle,
      details: [
        'Zero synthetic or fake patient data',
        'User decides every piece of information recorded',
        'Full editing, export, and deletion rights',
      ],
      tag: 'User Sovereignty',
    },
    {
      num: '03',
      title: 'Build your Health Journey',
      description:
        'Your records assemble into a chronological visual timeline — from broad multi-year wellness arcs down to individual consultation notes.',
      icon: Compass,
      details: [
        'Dynamic timeline rendering from live data',
        'Visual milestone markers and date indexing',
        'Color-coded event classification',
      ],
      tag: 'Visual Chronology',
    },
    {
      num: '04',
      title: 'Understand',
      description:
        'Ask HELIOS Copilot to explain medical terms, lab biomarkers, and reference ranges in accessible, empowering language.',
      icon: Sparkles,
      details: [
        'Plain-English medical translations',
        'Encourages physician consultation',
        'Grounded strictly in records you provided',
      ],
      tag: 'Educational AI',
    },
    {
      num: '05',
      title: 'Prepare',
      description:
        'Before an appointment, HELIOS synthesizes your recent health events, active medications, and questions into a 1-minute doctor briefing.',
      icon: Stethoscope,
      details: [
        '1-Minute executive visit brief',
        'Prioritized questions for your physician',
        'Active medication audit and allergy checklist',
      ],
      tag: 'Clinical Preparation',
    },
    {
      num: '06',
      title: 'Stay organized',
      description:
        'Organizational Health Signals help you notice upcoming appointments, documents awaiting review, or medication schedules.',
      icon: BellRing,
      details: [
        'Purely organizational care alerts',
        'No speculative disease scoring',
        'Focus on logistics and adherence',
      ],
      tag: 'Health Signals',
    },
  ];

  const handleStepClick = (idx: number) => {
    setActiveStep(idx);
    playChime(460 + idx * 40, 'sine', 0.25);
  };

  return (
    <section
      id="how-it-works"
      className="relative py-28 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] bg-[#020617]/60"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">
            Guided Architecture
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-[1.08]">
            How HELIOS works
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base font-light">
            From empty canvas to sovereign clarity in six user-empowered steps.
          </p>
        </div>

        {/* Responsive Step Navigation Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = index === activeStep;
            return (
              <button
                key={s.num}
                onClick={() => handleStepClick(index)}
                className={`p-3.5 rounded-2xl text-left transition-all border flex flex-col justify-between min-h-[56px] ${
                  isActive
                    ? 'glass-panel-active border-cyan-400/50 shadow-xl shadow-cyan-500/20 scale-[1.02]'
                    : 'glass-panel-subtle hover:bg-white/[0.05] border-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isActive ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                  >
                    {s.num}
                  </span>
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-cyan-300' : 'text-slate-500'
                    }`}
                  />
                </div>
                <div className="mt-3">
                  <span
                    className={`block text-xs font-semibold truncate ${
                      isActive ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Feature Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl glass-panel p-6 sm:p-10 lg:p-12 border border-cyan-500/20 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="text-xs font-mono text-cyan-300 flex items-center gap-2">
                  <span>STAGE {steps[activeStep].num}</span>
                  <span>·</span>
                  <span className="text-slate-400">{steps[activeStep].tag}</span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-extrabold font-heading text-white">
                  {steps[activeStep].title}
                </h3>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
                  {steps[activeStep].description}
                </p>

                <div className="pt-2 space-y-2">
                  {steps[activeStep].details.map((detail, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    onClick={() => handleStepClick((activeStep + 1) % steps.length)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-semibold transition-all min-h-[44px]"
                  >
                    <span>Next: Stage {steps[(activeStep + 1) % steps.length].num}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Graphic visual card for the step */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-slate-950/80 p-6 border border-white/[0.08] shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <span className="text-xs font-mono text-cyan-400">
                      Methodology Principle
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      Verified
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                    <span className="text-xs font-bold text-white block">
                      Autonomous Healthcare Custody
                    </span>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      &ldquo;Every entry in HELIOS is sovereign. AI explains, extracts, and connects — but the human author decides.&rdquo;
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-400 font-light">
                    Guaranteed: Zero Synthetic Drift • No Auto-Populated Mock Patients
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
