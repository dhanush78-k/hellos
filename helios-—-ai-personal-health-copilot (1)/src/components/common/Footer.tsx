import React from 'react';
import { Sparkles, Shield, Heart } from 'lucide-react';

interface FooterProps {
  onNavigateTab: (tab: string) => void;
  onOpenPrivacy: () => void;
}

export function Footer({ onNavigateTab, onOpenPrivacy }: FooterProps) {
  return (
    <footer className="relative border-t border-white/5 bg-[#010409] py-14 px-4 sm:px-6 lg:px-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-heading font-extrabold text-base tracking-wider text-white">
              HELIOS
            </span>
          </div>
          <p className="mt-2 text-slate-400 max-w-sm text-xs leading-relaxed">
            Your personal AI health copilot. Built for lifelong care organization, clinical appointment prep, and sovereign record custody.
          </p>
        </div>

        <div className="flex flex-wrap gap-8 text-xs">
          <div>
            <span className="font-semibold text-slate-200 block mb-2 font-heading">
              Product
            </span>
            <ul className="space-y-1.5">
              <li>
                <a href="#what-is-helios" className="hover:text-cyan-300 transition-colors">
                  Concept
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-cyan-300 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#timeline-story" className="hover:text-cyan-300 transition-colors">
                  Health Journey
                </a>
              </li>
              <li>
                <a href="#ai-copilot" className="hover:text-cyan-300 transition-colors">
                  Copilot
                </a>
              </li>
            </ul>
          </div>

          <div>
            <span className="font-semibold text-slate-200 block mb-2 font-heading">
              Safety & Rights
            </span>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-cyan-300 transition-colors text-left"
                >
                  Privacy Center
                </button>
              </li>
              <li>
                <a href="#privacy-security" className="hover:text-cyan-300 transition-colors">
                  Security Rules
                </a>
              </li>
              <li>
                <span className="text-slate-500">Zero Synthetic Health Data</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <p>
          &copy; {new Date().getFullYear()} HELIOS. Educational and healthcare organization support. Does not replace a qualified physician.
        </p>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span>Crafted with</span>
          <Heart className="w-3 h-3 text-cyan-400 fill-cyan-400/20" />
          <span>for patient autonomy</span>
        </div>
      </div>
    </footer>
  );
}
