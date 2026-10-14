import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  FileText,
  Calendar,
  Pill,
  Target,
  Trash2,
  Layers,
  CheckCircle2,
  X,
} from 'lucide-react';
import { playChime } from '../../lib/audio';

export function InteractiveSimulationSection() {
  const [simulatedEvents, setSimulatedEvents] = useState<
    Array<{ id: string; type: string; title: string; meta: string }>
  >([]);

  const handleSimulateAdd = (type: string) => {
    let sample = { id: String(Date.now()), type, title: '', meta: '' };
    if (type === 'Report') {
      sample.title = 'Comprehensive Metabolic Test';
      sample.meta = 'Biomarkers & lab values staged for timeline preview';
      playChime(500);
    } else if (type === 'Appointment') {
      sample.title = 'Cardiology Consultation';
      sample.meta = 'Dr. Vance • 1-Minute Prep Brief drafted';
      playChime(580);
    } else if (type === 'Medication') {
      sample.title = 'Daily CoQ10 & Electrolytes';
      sample.meta = '100mg • Once daily with breakfast';
      playChime(640);
    } else if (type === 'Health Goal') {
      sample.title = '30-Minute Morning Walk';
      sample.meta = '5 days/week • Cardiovascular focus';
      playChime(720);
    }

    setSimulatedEvents((prev) => [sample, ...prev]);
  };

  const handleRemoveItem = (id: string) => {
    setSimulatedEvents((prev) => prev.filter((i) => i.id !== id));
    playChime(350);
  };

  const handleClear = () => {
    setSimulatedEvents([]);
    playChime(320);
  };

  return (
    <section
      id="interactive-preview"
      className="relative py-28 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">
            Interactive Product Preview
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-[1.08]">
            See the idea in motion.
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base font-light leading-relaxed">
            Test how user-provided entries instantly transform into an understandable chronology without writing to the cloud database.
          </p>
        </div>

        {/* Simulation Sandbox Box */}
        <div className="rounded-3xl glass-panel p-6 sm:p-10 border border-cyan-500/25 shadow-2xl relative overflow-hidden">
          {/* Header toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/[0.08] gap-4">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                Interactive Preview Canvas
              </span>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Click any health entity below to observe the timeline stage in real-time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {simulatedEvents.length > 0 && (
                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white text-xs flex items-center gap-1.5 transition-colors border border-white/[0.08]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset Preview</span>
                </button>
              )}
            </div>
          </div>

          {/* Add buttons */}
          <div className="my-6">
            <span className="block text-xs font-medium text-slate-400 mb-3 font-mono">
              STAGE 01 — SELECT TEST COMPONENT:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleSimulateAdd('Report')}
                className="p-4 rounded-2xl glass-panel-subtle hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all text-left group border border-white/[0.06] min-h-[52px]"
              >
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 w-fit mb-2 group-hover:scale-110 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white block font-heading">
                  Add Report
                </span>
                <span className="text-[11px] text-slate-400 font-light">
                  Lab & Document
                </span>
              </button>

              <button
                onClick={() => handleSimulateAdd('Appointment')}
                className="p-4 rounded-2xl glass-panel-subtle hover:border-amber-400/50 hover:bg-amber-500/10 transition-all text-left group border border-white/[0.06] min-h-[52px]"
              >
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 w-fit mb-2 group-hover:scale-110 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white block font-heading">
                  Add Appointment
                </span>
                <span className="text-[11px] text-slate-400 font-light">
                  Doctor Consultation
                </span>
              </button>

              <button
                onClick={() => handleSimulateAdd('Medication')}
                className="p-4 rounded-2xl glass-panel-subtle hover:border-violet-400/50 hover:bg-violet-500/10 transition-all text-left group border border-white/[0.06] min-h-[52px]"
              >
                <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300 w-fit mb-2 group-hover:scale-110 transition-transform">
                  <Pill className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white block font-heading">
                  Add Medication
                </span>
                <span className="text-[11px] text-slate-400 font-light">
                  Prescription Track
                </span>
              </button>

              <button
                onClick={() => handleSimulateAdd('Health Goal')}
                className="p-4 rounded-2xl glass-panel-subtle hover:border-emerald-400/50 hover:bg-emerald-500/10 transition-all text-left group border border-white/[0.06] min-h-[52px]"
              >
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 w-fit mb-2 group-hover:scale-110 transition-transform">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white block font-heading">
                  Add Health Goal
                </span>
                <span className="text-[11px] text-slate-400 font-light">
                  Wellness Target
                </span>
              </button>
            </div>
          </div>

          {/* Simulated Journey Timeline */}
          <div className="rounded-2xl bg-slate-950/80 p-5 sm:p-6 border border-white/[0.08] min-h-[220px]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-300 font-heading">
                Timeline Preview Stage
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                {simulatedEvents.length} items staged
              </span>
            </div>

            {simulatedEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <Layers className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                <p className="text-sm font-semibold text-slate-400 font-heading">
                  Your health journey starts here.
                </p>
                <p className="text-xs text-slate-500 font-light">
                  Click any option above to see how HELIOS structures your entries.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {simulatedEvents.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="p-4 rounded-xl glass-panel-subtle border border-cyan-500/30 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                        <div>
                          <span className="text-xs font-bold text-white block font-heading">
                            {item.title}
                          </span>
                          <p className="text-[11px] text-slate-400 font-light mt-0.5">
                            {item.meta}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {item.type}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-slate-500 hover:text-white transition-colors"
                          title="Remove item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
