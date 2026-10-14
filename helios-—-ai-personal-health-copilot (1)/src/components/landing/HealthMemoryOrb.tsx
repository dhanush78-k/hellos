import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  FileText,
  Calendar,
  Pill,
  Clock,
  StickyNote,
} from 'lucide-react';
import { playChime } from '../../lib/audio';

export function HealthMemoryOrb() {
  const [selectedNode, setSelectedNode] = useState<string>('documents');

  const nodes = [
    {
      id: 'documents',
      name: 'Documents',
      icon: FileText,
      description: 'Uploaded reports, clinical letters, and biomarker analyses securely indexed.',
      color: 'from-cyan-400 to-blue-500',
      freq: 460,
    },
    {
      id: 'events',
      name: 'Events',
      icon: Clock,
      description: 'Consultations, screenings, and surgical milestones in chronological order.',
      color: 'from-indigo-400 to-purple-500',
      freq: 540,
    },
    {
      id: 'medications',
      name: 'Medications',
      icon: Pill,
      description: 'Active prescriptions and supplements tracked with user-verified dosages.',
      color: 'from-violet-400 to-fuchsia-500',
      freq: 620,
    },
    {
      id: 'appointments',
      name: 'Appointments',
      icon: Calendar,
      description: 'Upcoming consultations with linked 1-minute doctor briefing notes.',
      color: 'from-emerald-400 to-teal-500',
      freq: 700,
    },
    {
      id: 'notes',
      name: 'Notes & Reflections',
      icon: StickyNote,
      description: 'Personal symptom observations and questions logged in your own words.',
      color: 'from-amber-400 to-orange-500',
      freq: 780,
    },
  ];

  const handleNodeClick = (node: typeof nodes[0]) => {
    setSelectedNode(node.id);
    playChime(node.freq, 'sine', 0.25);
  };

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] bg-[#020617]/70 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">
            Cognitive Repository
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-[1.08]">
            HELIOS remembers what you choose to organize.
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed font-light">
            A unified Health Memory sphere that clusters your manually added records into an accessible, queryable knowledge repository.
          </p>
        </div>

        {/* Floating Orb & Interactive Orbit */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Visual Memory Sphere */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[380px]">
            {/* Ambient pulse halos */}
            <div className="absolute w-64 sm:w-80 h-64 sm:h-80 rounded-full border border-cyan-500/20 animate-pulse-halo pointer-events-none" />
            <div className="absolute w-80 sm:w-96 h-80 sm:h-96 rounded-full border border-indigo-500/10 pointer-events-none" />

            {/* Glowing Central Memory Sphere */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => playChime(660)}
              className="relative w-44 sm:w-52 h-44 sm:h-52 rounded-full bg-gradient-to-tr from-cyan-500 via-sky-600 to-indigo-700 flex flex-col items-center justify-center p-1 shadow-[0_0_90px_rgba(6,182,212,0.45)] cursor-pointer group transition-transform duration-500"
            >
              <div className="w-full h-full rounded-full bg-slate-950/85 backdrop-blur-xl flex flex-col items-center justify-center text-center p-4">
                <Sparkles className="w-8 h-8 text-cyan-300 animate-pulse mb-2" />
                <span className="text-sm font-bold text-white font-heading tracking-wide">
                  Health Memory
                </span>
                <span className="text-[11px] text-cyan-300 font-mono mt-1 font-light">
                  Sovereign Repository
                </span>
              </div>
            </motion.div>

            <p className="mt-8 text-xs text-slate-400 font-light">
              Tap any category node to inspect its structural role
            </p>
          </div>

          {/* Interactive Information Node Cards */}
          <div className="lg:col-span-6 space-y-3">
            {nodes.map((node) => {
              const Icon = node.icon;
              const isSelected = selectedNode === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border min-h-[52px] ${
                    isSelected
                      ? 'glass-panel-active border-cyan-400/50 shadow-xl shadow-cyan-500/20 scale-[1.01]'
                      : 'glass-panel-subtle hover:bg-white/[0.05] border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${node.color} flex items-center justify-center text-white shadow-md shrink-0`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-heading">
                          {node.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 font-light">
                          {node.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-white/[0.08] text-[11px] text-cyan-300 flex items-center justify-between"
                    >
                      <span className="font-light">Awaiting your manual entry • No synthetic records</span>
                      <span className="font-mono text-[10px] uppercase">Active</span>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
