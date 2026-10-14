import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  UploadCloud,
  FileSearch,
  FolderKanban,
  MessageSquareQuote,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export function ReportExplainerSection() {
  const steps = [
    {
      step: '01',
      title: 'UPLOAD',
      subtitle: 'PDF, text, or test printouts',
      icon: UploadCloud,
      desc: 'Privately upload test reports, discharge summaries, or doctor notes into your isolated vault.',
    },
    {
      step: '02',
      title: 'UNDERSTAND',
      subtitle: 'Demystified language',
      icon: FileSearch,
      desc: 'Complex clinical acronyms, biomarkers, and ranges explained in accessible terms.',
    },
    {
      step: '03',
      title: 'ORGANIZE',
      subtitle: 'Strict human approval',
      icon: FolderKanban,
      desc: 'Extracted milestones only enter your permanent journey after your explicit confirmation.',
    },
    {
      step: '04',
      title: 'ASK',
      subtitle: 'Doctor conversation prep',
      icon: MessageSquareQuote,
      desc: 'Generate targeted, respectful questions to discuss with your healthcare professional.',
    },
  ];

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-[#020617]/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">
            Document Demystification
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
            Turn clinical documents into clear understanding.
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Healthcare reports shouldn&apos;t require a medical degree to interpret. Upload supported documents and understand the context before meeting your doctor.
          </p>
        </div>

        {/* 4-Step Animated Pipeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-2xl glass-panel p-6 border border-white/10 hover:border-cyan-400/40 transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {item.step}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-white font-heading tracking-wide">
                  {item.title}
                </h3>
                <span className="text-[11px] text-cyan-300/80 block mt-0.5 font-medium">
                  {item.subtitle}
                </span>

                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>

                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-600">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Safety Disclaimer Statement */}
        <div className="mt-12 max-w-3xl mx-auto p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start sm:items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-300">Safety Directive:</strong> AI explanations are purely educational and informational. They should always be discussed with a qualified healthcare professional when appropriate. HELIOS never delivers definitive diagnoses.
          </p>
        </div>
      </div>
    </section>
  );
}
