import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Calendar,
  Pill,
  StickyNote,
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Workflow,
  Split,
} from 'lucide-react';
import { playChime } from '../../lib/audio';

export function ScatteredStorySection() {
  const [mode, setMode] = useState<'scattered' | 'connected'>('connected');

  const fragments = [
    {
      id: 'report',
      label: 'Lab Report',
      scatteredStatus: 'Siloed in Portal PDF',
      connectedStatus: 'Extracted & Timeline Verified',
      meta: 'Metabolic panel results & biomarkers',
      icon: FileText,
      accent: 'cyan',
    },
    {
      id: 'prescription',
      label: 'Prescription',
      scatteredStatus: 'Scribbled on Paper Receipt',
      connectedStatus: 'Active Regimen Audit',
      meta: 'User-entered dosages & timing',
      icon: Pill,
      accent: 'violet',
    },
    {
      id: 'appointment',
      label: 'Specialist Visit',
      scatteredStatus: 'Note on Calendar',
      connectedStatus: 'Linked 1-Minute Prep Brief',
      meta: 'Dr. Vance • Cardiology consultation',
      icon: Calendar,
      accent: 'amber',
    },
    {
      id: 'notes',
      label: 'Doctor Notes',
      scatteredStatus: 'Lost in Phone Notes',
      connectedStatus: 'Chronological Consultation Log',
      meta: 'Questions asked & symptom reflections',
      icon: StickyNote,
      accent: 'emerald',
    },
    {
      id: 'goals',
      label: 'Wellness Goal',
      scatteredStatus: 'Forgotten in Health App',
      connectedStatus: 'Sustained Daily Habit',
      meta: 'Hydration & sleep schedule tracking',
      icon: Target,
      accent: 'sky',
    },
  ];

  const handleToggle = (newMode: 'scattered' | 'connected') => {
    setMode(newMode);
    playChime(newMode === 'connected' ? 640 : 420, 'sine', 0.35);
  };

  return (
    <section
      id="what-is-helios"
      className="relative py-24 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] overflow-hidden bg-radial-mesh"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 block mb-3">
            The Fragmented Reality
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-white tracking-tight leading-[1.1] [text-wrap:balance]">
            Healthcare shouldn&apos;t feel scattered.
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed font-light [text-wrap:balance]">
            Lab tests in one hospital portal. Prescriptions on paper. Questions forgotten in the exam room. HELIOS unifies your disjointed records into a single continuous journey.
          </p>

          {/* Interactive Mode Switcher with Clean Segmented Control */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl glass-panel border border-white/[0.1] shadow-xl">
            <button
              onClick={() => handleToggle('scattered')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                mode === 'scattered'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Split className="w-4 h-4" />
              <span>Before: Disconnected Silos</span>
            </button>
            <button
              onClick={() => handleToggle('connected')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                mode === 'connected'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>With HELIOS: One Journey</span>
            </button>
          </div>
        </div>

        {/* Transformation Showcase Stage */}
        <div className="rounded-3xl glass-panel p-6 sm:p-10 border border-white/[0.08] shadow-2xl relative overflow-hidden">
          {/* Subtle Stage Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  mode === 'connected' ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-rose-400'
                }`}
              />
              <span className="text-xs font-bold text-white uppercase font-heading tracking-wider">
                {mode === 'connected'
                  ? 'Unified Chronological Pipeline'
                  : 'Disjointed Information Fragments'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              {mode === 'connected' ? 'Connected in Chronological Flow' : 'Isolated Records Without Context'}
            </span>
          </div>

          {/* Cards Pipeline Container with Smooth Layout Transitions */}
          <div className="relative">
            {/* Luminous Connecting Thread (Desktop when Connected) */}
            {mode === 'connected' && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="hidden lg:block absolute top-[52px] left-6 right-6 h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 shadow-[0_0_15px_rgba(34,211,238,0.7)] origin-left z-0"
              />
            )}

            {/* Pipeline Cards Grid */}
            <motion.div
              layout
              className={`grid gap-4 relative z-10 transition-all ${
                mode === 'connected'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              <AnimatePresence mode="popLayout">
                {fragments.map((frag, idx) => {
                  const Icon = frag.icon;
                  const isConnected = mode === 'connected';
                  return (
                    <motion.div
                      layout
                      key={frag.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35, delay: idx * 0.05 }}
                      className={`rounded-2xl p-4 sm:p-5 transition-all border flex flex-col justify-between ${
                        isConnected
                          ? 'glass-panel-active border-cyan-400/40 shadow-xl shadow-cyan-500/10'
                          : 'bg-rose-950/[0.1] border-rose-500/25 shadow-md'
                      }`}
                    >
                      <div>
                        {/* Top Node Indicator & Status */}
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.07] mb-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              isConnected
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : 'bg-rose-500/15 text-rose-300'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          {isConnected ? (
                            <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-1 font-bold">
                              <span>0{idx + 1}</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1 font-semibold">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Isolated</span>
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h4 className="text-sm font-bold text-white font-heading">
                          {frag.label}
                        </h4>
                        <p className="text-xs text-slate-400 font-light mt-1 leading-relaxed">
                          {frag.meta}
                        </p>
                      </div>

                      {/* Bottom State Label */}
                      <div className="mt-4 pt-3 border-t border-white/[0.06]">
                        <span
                          className={`block text-[11px] font-medium leading-tight ${
                            isConnected ? 'text-cyan-300 font-mono' : 'text-rose-300/90'
                          }`}
                        >
                          {isConnected ? frag.connectedStatus : frag.scatteredStatus}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Bottom Narrative Banner */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
            <p className="text-base sm:text-xl font-bold font-heading text-white">
              {mode === 'connected' ? (
                <span>&ldquo;HELIOS turns scattered health information into one understandable journey.&rdquo;</span>
              ) : (
                <span className="text-rose-200/90">
                  Without HELIOS, records live in isolated silos and critical questions are forgotten.
                </span>
              )}
            </p>
            <p className="text-xs text-slate-400 mt-1.5 font-light">
              {mode === 'connected'
                ? 'Chronological milestones connect clinical reports, active prescriptions, and appointments in unified context.'
                : 'Click "With HELIOS: One Journey" above to observe the unified transformation.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
