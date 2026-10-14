import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, ZoomIn, Calendar, CheckCircle2 } from 'lucide-react';
import { playChime } from '../../lib/audio';

export function TimelineStorySection() {
  const [zoomLevel, setZoomLevel] = useState<'year' | 'month' | 'event'>('month');

  const handleZoomChange = (level: 'year' | 'month' | 'event') => {
    setZoomLevel(level);
    playChime(level === 'year' ? 440 : level === 'month' ? 560 : 680, 'sine', 0.3);
  };

  return (
    <section
      id="timeline-story"
      className="relative py-28 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] bg-[#030712] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">
            Spatial Navigation
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-[1.08]">
            Your health has a timeline.
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed font-light">
            Navigate through your health trajectory like a digital map — from multi-year wellness arcs down to a single consultation.
          </p>

          {/* Interactive Zoom Level Switcher */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
            {(['year', 'month', 'event'] as const).map((level) => (
              <button
                key={level}
                onClick={() => handleZoomChange(level)}
                className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold capitalize transition-all min-h-[44px] ${
                  zoomLevel === level
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {level === 'year'
                  ? 'Year View'
                  : level === 'month'
                  ? 'Month View'
                  : 'Event View'}
              </button>
            ))}
          </div>
        </div>

        {/* Cinematic Zoomable Timeline Canvas */}
        <div className="relative min-h-[440px] rounded-3xl glass-panel p-6 sm:p-10 border border-cyan-500/20 shadow-2xl overflow-hidden flex flex-col justify-center">
          {/* Subtle coordinate grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b14_1px,transparent_1px),linear-gradient(to_bottom,#1e293b14_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

          {/* Glowing central track */}
          <div className="relative z-10 w-full">
            <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-gradient-to-r from-cyan-500/10 via-cyan-400 to-indigo-500/20 shadow-[0_0_15px_rgba(6,182,212,0.4)] hidden sm:block" />

            <AnimatePresence mode="wait">
              {zoomLevel === 'year' && (
                <motion.div
                  key="year"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.08 }}
                  transition={{ duration: 0.35 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 py-6 sm:py-12"
                >
                  {[
                    { year: '2024', label: 'Baseline Archive', count: 'Year Milestone' },
                    { year: '2025', label: 'Care Plan Arc', count: 'Year Milestone' },
                    { year: '2026', label: 'Active Journey', count: 'Current Arc' },
                    { year: '2027', label: 'Long-term Goals', count: 'Future Pacing' },
                  ].map((item) => (
                    <div
                      key={item.year}
                      className="rounded-2xl glass-panel p-6 border border-white/[0.08] text-center hover:border-cyan-400/50 transition-all hover:scale-105"
                    >
                      <div className="w-4 h-4 mx-auto rounded-full bg-cyan-400 mb-3 shadow-[0_0_12px_#22d3ee]" />
                      <span className="text-lg font-bold text-white block font-heading">
                        {item.year}
                      </span>
                      <span className="text-xs text-cyan-300 font-medium mt-1 block">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}

              {zoomLevel === 'month' && (
                <motion.div
                  key="month"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.35 }}
                  className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 relative z-10 py-6"
                >
                  {[
                    { label: 'Check-up', month: 'OCTOBER', date: 'Oct 04' },
                    { label: 'Report', month: 'OCTOBER', date: 'Oct 11' },
                    { label: 'Care Care', month: 'OCTOBER', date: 'Oct 18' },
                    { label: 'Follow-up', month: 'OCTOBER', date: 'Oct 25' },
                    { label: 'Wellness Goal', month: 'NOVEMBER', date: 'Nov 02' },
                  ].map((node, i) => (
                    <div
                      key={i}
                      className="rounded-2xl glass-panel p-5 border border-white/[0.08] text-left hover:border-cyan-400/50 transition-all hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 mb-2">
                        <span>{node.month}</span>
                        <span>{node.date}</span>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 mb-2 shadow-[0_0_8px_#22d3ee]" />
                      <span className="text-xs font-bold text-white block font-heading">
                        {node.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-light mt-0.5">
                        Conceptual visual node
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}

              {zoomLevel === 'event' && (
                <motion.div
                  key="event"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.35 }}
                  className="max-w-xl mx-auto rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-400/50 shadow-2xl relative z-10 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      OCTOBER 11 // MICRO RECORD INSPECTION
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Inspection Stage
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white font-heading">
                    Comprehensive Health Record Inspection
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    When you inspect any timeline milestone, you view its attached lab panels, prescriptions active on that date, and questions addressed with your physician.
                  </p>
                  <div className="text-[11px] text-slate-400 italic pt-1 border-t border-white/[0.05]">
                    Safety Note: In HELIOS, every event is sovereignly created by the user. Zero synthetic mock patients.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="text-center pt-6 text-xs text-slate-400 font-light relative z-10 border-t border-white/[0.06] mt-6">
            Click zoom controls to explore spatial perspectives across your timeline.
          </div>
        </div>
      </div>
    </section>
  );
}
