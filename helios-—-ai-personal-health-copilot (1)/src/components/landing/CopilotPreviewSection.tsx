import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Send, ShieldCheck, ArrowRight, Bot, User } from 'lucide-react';

export function CopilotPreviewSection() {
  const exampleQuestions = [
    {
      q: 'Explain this report in simpler language.',
      a: 'I can explain standard references, biomarkers, and test terminology in straightforward, everyday language — so you can ask informed questions at your next consultation.',
    },
    {
      q: 'What should I ask at my next appointment?',
      a: 'Based on the events and questions you choose to record, I synthesize a 1-minute brief with targeted questions to discuss with your doctor.',
    },
    {
      q: 'Summarize the information I added recently.',
      a: 'I provide an objective chronological overview strictly drawn from your saved records — never inventing missing data.',
    },
    {
      q: 'Show me my upcoming care moments.',
      a: 'I compile your scheduled appointments and active prescriptions into an organized timeline checklist.',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="ai-copilot" className="relative py-28 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">
            Intelligent Copilot
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
            Ask your health information a better question.
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Move beyond generic search engines. Converse with an AI copilot grounded exclusively in your own stored records.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Your Copilot works with information you choose to provide.</span>
          </div>
        </div>

        {/* Cinematic Copilot Mockup Window */}
        <div className="max-w-4xl mx-auto rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  HELIOS Copilot
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Context-Aware Assistant
                </span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 uppercase font-mono">
              Live Simulation
            </span>
          </div>

          {/* Interactive Prompt Pills */}
          <div className="py-4 flex flex-wrap gap-2 border-b border-white/10">
            {exampleQuestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs transition-all border ${
                  activeIndex === idx
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                &ldquo;{item.q}&rdquo;
              </button>
            ))}
          </div>

          {/* Chat Exchange Display */}
          <div className="py-6 space-y-4 min-h-[220px]">
            {/* User message */}
            <div className="flex items-start gap-3 justify-end">
              <div className="max-w-md p-3.5 rounded-2xl rounded-tr-none bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs leading-relaxed shadow-lg">
                {exampleQuestions[activeIndex].q}
              </div>
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-300 shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Copilot response */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-500/30">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="max-w-xl p-4 rounded-2xl rounded-tl-none glass-panel border border-white/10 text-xs text-slate-200 leading-relaxed space-y-2">
                <p>{exampleQuestions[activeIndex].a}</p>
                <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-amber-300/80">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Educational copilot statement • Consult your healthcare provider.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Input Bar Display */}
          <div className="pt-4 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={exampleQuestions[activeIndex].q}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-300 focus:outline-none"
            />
            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % exampleQuestions.length)}
              className="p-3 rounded-xl bg-cyan-500 text-white hover:bg-cyan-400 transition-colors shrink-0"
              title="Next question"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
