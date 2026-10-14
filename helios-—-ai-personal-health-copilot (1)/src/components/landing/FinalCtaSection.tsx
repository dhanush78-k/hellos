import React from 'react';
import { ArrowRight, Compass } from 'lucide-react';
import { playChime } from '../../lib/audio';

interface FinalCtaSectionProps {
  onEnter: () => void;
  onExplore: () => void;
}

export function FinalCtaSection({ onEnter, onExplore }: FinalCtaSectionProps) {
  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[800px] h-[300px] sm:h-[450px] bg-gradient-to-tr from-cyan-500/20 via-sky-500/15 to-indigo-600/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 block mb-4">
          Begin Your Health Memory
        </span>

        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-heading text-white tracking-tight leading-[1.06] [text-wrap:balance]">
          Your health has a story.{' '}
          <span className="text-gradient-helios block mt-2 sm:mt-3">
            Make it easier to understand.
          </span>
        </h2>

        <p className="mt-6 sm:mt-8 max-w-xl mx-auto text-base sm:text-lg text-slate-300 font-light leading-relaxed [text-wrap:balance]">
          No automated fake records. No commercial advertising trackers. Just pure clarity, total privacy, and an intelligent copilot for your lifelong care.
        </p>

        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              playChime(660);
              onEnter();
            }}
            className="group w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 min-h-[48px] cursor-pointer"
          >
            <span>Connect with HELIOS</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => {
              playChime(480);
              onExplore();
            }}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl glass-panel-subtle hover:bg-white/[0.07] border border-white/[0.1] text-slate-200 text-sm font-semibold transition-all hover:border-cyan-400/40 flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>See how it works</span>
          </button>
        </div>
      </div>
    </section>
  );
}
