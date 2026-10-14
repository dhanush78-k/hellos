import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Unlock,
  KeyRound,
  FileCheck2,
  Trash2,
  Download,
  Server,
  EyeOff,
} from 'lucide-react';

export function PrivacySection() {
  const [locks, setLocks] = useState<Record<string, boolean>>({
    documents: true,
    journey: true,
    medications: true,
    appointments: true,
    goals: true,
  });

  const toggleLock = (key: string) => {
    setLocks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const privacyFeatures = [
    {
      title: 'Firebase Authentication',
      desc: 'Industry-standard token verification. Only your verified session can unlock your records.',
      icon: KeyRound,
    },
    {
      title: 'Hardened Security Rules',
      desc: 'Database rules reject any cross-user reads or orphaned queries at the Firestore engine level.',
      icon: Shield,
    },
    {
      title: 'Server-Side AI Isolation',
      desc: 'Calls to Gemini run exclusively via private server proxies. Your records are never broadcast client-side.',
      icon: Server,
    },
    {
      title: 'Export & Wipe Rights',
      desc: 'Download your complete health archive in one click, or purge all stored data permanently from the database.',
      icon: Download,
    },
    {
      title: 'Zero Public Surface',
      desc: 'No shared links, no public directory, and no advertising trackers. Your health data is strictly yours.',
      icon: EyeOff,
    },
    {
      title: 'User Sovereignty',
      desc: 'HELIOS never auto-generates patient history. You decide every item entered into your personal journey.',
      icon: FileCheck2,
    },
  ];

  return (
    <section id="privacy-security" className="relative py-28 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">
            Cryptographic Custody
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
            Your health belongs to you.
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Healthcare data demands uncompromising respect. We combine Firebase Security Rules, private server-side AI processing, and sovereign user custody.
          </p>
        </div>

        {/* Interactive "Your Data, Your Control" Interactive Demo */}
        <div className="rounded-3xl glass-panel p-6 sm:p-10 border border-cyan-500/20 shadow-2xl mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-3">
            <div>
              <span className="text-xs font-semibold text-white uppercase tracking-wider font-heading">
                Interactive Privacy Control Demo
              </span>
              <p className="text-xs text-slate-400">
                Click any category to toggle simulated access authorization.
              </p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              Access Matrix: Encrypted Per-User Path
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-6">
            {[
              { key: 'documents', label: 'Documents' },
              { key: 'journey', label: 'Health Journey' },
              { key: 'medications', label: 'Medications' },
              { key: 'appointments', label: 'Appointments' },
              { key: 'goals', label: 'Goals' },
            ].map((item) => {
              const isLocked = locks[item.key];
              return (
                <button
                  key={item.key}
                  onClick={() => toggleLock(item.key)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isLocked
                      ? 'glass-panel-active border-cyan-400/50 shadow-md shadow-cyan-500/10'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white font-heading">
                      {item.label}
                    </span>
                    {isLocked ? (
                      <Lock className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Unlock className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                      isLocked
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {isLocked ? 'Protected' : 'Editable'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-400 bg-slate-950/60 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
            <span>
              Every record lives under <code className="text-cyan-300">users/&#123;userId&#125;</code> and requires valid token ownership.
            </span>
            <span className="text-[11px] text-emerald-400 hidden sm:inline font-mono">
              Zero Unauthorized Queries
            </span>
          </div>
        </div>

        {/* 6 Feature Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {privacyFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="rounded-2xl glass-panel p-6 border border-white/10 hover:border-cyan-400/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white font-heading">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
