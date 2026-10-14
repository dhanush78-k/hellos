import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  Shield,
  FileText,
  HeartPulse,
  Pill,
  Calendar,
  Target,
  Compass,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { playChime } from '../../lib/audio';

interface HeroSectionProps {
  onEnter: () => void;
  onExplore: () => void;
}

export function HeroSection({ onEnter, onExplore }: HeroSectionProps) {
  const [activeNode, setActiveNode] = useState<number>(0);
  const [isDesktop, setIsDesktop] = useState(false);

  // Smooth, jitter-free Parallax for desktop
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 100 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const ambientBloomX = useTransform(smoothX, [-500, 500], [-15, 15]);
  const ambientBloomY = useTransform(smoothY, [-300, 300], [-10, 10]);

  useEffect(() => {
    const checkViewport = () => setIsDesktop(window.innerWidth >= 1024);
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDesktop) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const nodes = [
    {
      id: 'records',
      title: 'Records',
      subtitle: 'Laboratory & Imaging',
      desc: 'Blood tests, metabolic panels, and pathology notes securely stored in your private vault.',
      icon: FileText,
      color: 'from-cyan-400 to-blue-500',
      activeBorder: 'border-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(34,211,238,0.5)]',
      cx: 140,
      cy: 230,
      freq: 440,
    },
    {
      id: 'care',
      title: 'Care',
      subtitle: 'Clinical Consultations',
      desc: 'Chronological timeline entries recording doctor discussions and care instructions.',
      icon: HeartPulse,
      color: 'from-emerald-400 to-teal-500',
      activeBorder: 'border-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(52,211,153,0.5)]',
      cx: 370,
      cy: 140,
      freq: 520,
    },
    {
      id: 'medication',
      title: 'Medication',
      subtitle: 'Prescription Regimen',
      desc: 'Active medications, dosages, and schedules manually entered and tracked without modification.',
      icon: Pill,
      color: 'from-violet-400 to-purple-500',
      activeBorder: 'border-violet-400',
      glow: 'shadow-[0_0_20px_rgba(167,139,250,0.5)]',
      cx: 600,
      cy: 220,
      freq: 600,
    },
    {
      id: 'appointments',
      title: 'Appointments',
      subtitle: 'Visit Prep Briefs',
      desc: 'Upcoming care appointments with on-demand 1-minute doctor briefs and prioritized questions.',
      icon: Calendar,
      color: 'from-amber-400 to-orange-500',
      activeBorder: 'border-amber-400',
      glow: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]',
      cx: 830,
      cy: 130,
      freq: 680,
    },
    {
      id: 'goals',
      title: 'Goals',
      subtitle: 'Wellness Intentions',
      desc: 'Sustainable, non-judgmental habits focused on rest, hydration, and daily movement.',
      icon: Target,
      color: 'from-sky-400 to-cyan-500',
      activeBorder: 'border-sky-400',
      glow: 'shadow-[0_0_20px_rgba(56,189,248,0.5)]',
      cx: 1040,
      cy: 210,
      freq: 760,
    },
  ];

  const handleSelectNode = (index: number) => {
    setActiveNode(index);
    playChime(nodes[index].freq, 'sine', 0.25);
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex flex-col items-center justify-start pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-radial-mesh bg-film-grain"
    >
      {/* Luminous Background Bloom */}
      <motion.div
        style={{ x: ambientBloomX, y: ambientBloomY }}
        className="absolute top-20 left-1/2 -translate-x-1/2 w-[320px] sm:w-[700px] lg:w-[900px] h-[300px] sm:h-[450px] bg-gradient-to-tr from-cyan-500/18 via-sky-500/12 to-indigo-600/18 rounded-full blur-[140px] pointer-events-none"
      />

      {/* TOP TIER: Master Editorial Typography & Headings */}
      <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
        {/* Editorial Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-cyan-300 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider mb-3.5 shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>A Sovereign Category of Personal Health Software</span>
        </motion.div>

        {/* Small, Refined Editorial Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl sm:text-2xl md:text-3xl lg:text-[2.25rem] font-bold tracking-tight font-heading leading-snug text-white max-w-2xl [text-wrap:balance]"
        >
          Your health is a journey.{' '}
          <span className="text-gradient-helios block mt-1 sm:mt-1.5 font-extrabold">
            Meet the intelligence that helps you navigate it.
          </span>
        </motion.h1>

        {/* Supporting Editorial Copy (Small, Crisp, Restrained) */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-3 sm:mt-4 max-w-lg text-xs sm:text-sm text-slate-300/90 font-normal leading-relaxed [text-wrap:balance]"
        >
          HELIOS brings your records, clinical care, medications, and goals into one intelligent personal journey. Manually curated. Sovereignly kept.
        </motion.p>

        {/* Main Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 sm:mt-7 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
        >
          <button
            onClick={() => {
              playChime(660);
              onEnter();
            }}
            className="group w-full sm:w-auto relative px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.015] active:scale-[0.985] flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
          >
            <span>Connect with HELIOS</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => {
              playChime(480);
              onExplore();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl glass-panel-subtle hover:bg-white/[0.08] border border-white/[0.1] text-slate-200 text-xs sm:text-sm font-medium transition-all duration-200 hover:border-cyan-400/40 flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Discover how it works</span>
          </button>
        </motion.div>

        {/* Elegant Micro Down Hint: Smooth & Non-Jumping */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-5 flex items-center gap-2 text-[11px] font-mono text-slate-400/80"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 animate-pulse" />
          <span>Explore personal journey flow below</span>
        </motion.div>
      </div>

      {/* TIER 2: Anchored Interactive Health Journey Showcase Console */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="relative z-10 w-full max-w-5xl mx-auto mt-10 sm:mt-14"
      >
        <div className="rounded-3xl glass-panel p-5 sm:p-8 border border-white/[0.09] shadow-2xl overflow-hidden relative">
          {/* Header of showcase console */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/[0.07] gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
              <span className="text-xs font-bold text-white uppercase font-heading tracking-wider">
                Autonomous Journey Constellation
              </span>
            </div>
            <span className="text-[11px] font-mono text-cyan-300/80">
              Interactive Architectural Architecture · 5 Sovereign Milestones
            </span>
          </div>

          {/* Canvas Viewport: Scaled and Responsive */}
          <div className="relative w-full py-4 sm:py-6 overflow-hidden">
            {/* SVG Organic Path Canvas (viewBox calibrated strictly for 1200 x 340) */}
            <div className="relative w-full aspect-[12/3.8] max-h-[340px] min-h-[180px] sm:min-h-[220px]">
              <svg
                viewBox="0 0 1200 340"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="xMidYMid meet"
                fill="none"
              >
                {/* Background Track with Flowing Dash Glow */}
                <path
                  d="M 40 240 C 240 120, 280 280, 500 170 C 720 70, 800 270, 960 160 C 1040 100, 1100 240, 1160 190"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="3"
                />
                <path
                  d="M 40 240 C 240 120, 280 280, 500 170 C 720 70, 800 270, 960 160 C 1040 100, 1100 240, 1160 190"
                  stroke="url(#heroOrganicGlow)"
                  strokeWidth="3.5"
                  strokeDasharray="12 18"
                  className="animate-path-flow"
                />
                <defs>
                  <linearGradient id="heroOrganicGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                    <stop offset="30%" stopColor="#22d3ee" stopOpacity="0.9" />
                    <stop offset="65%" stopColor="#818cf8" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Conceptual Nodes Anchored Accurately on the SVG Path */}
                {nodes.map((node, i) => {
                  const isSelected = activeNode === i;
                  return (
                    <g
                      key={node.id}
                      onClick={() => handleSelectNode(i)}
                      className="cursor-pointer group"
                    >
                      {/* Pulse halo if selected */}
                      {isSelected && (
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r="25"
                          fill="none"
                          stroke="#22d3ee"
                          strokeWidth="1.5"
                          strokeOpacity="0.5"
                          className="animate-pulse"
                        />
                      )}
                      {/* Outer touch ring */}
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r="20"
                        fill="#0b1221"
                        stroke={isSelected ? '#22d3ee' : 'rgba(255, 255, 255, 0.16)'}
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                        className="transition-colors duration-200 group-hover:stroke-cyan-400"
                      />
                      {/* Inner luminous core */}
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r={isSelected ? '8' : '5'}
                        fill={isSelected ? '#22d3ee' : '#94a3b8'}
                        className="transition-all duration-200"
                      />
                      {/* Node Label Text */}
                      <text
                        x={node.cx}
                        y={node.cy - 30}
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : '#94a3b8'}
                        fontSize="13"
                        fontFamily="Syne, sans-serif"
                        fontWeight="700"
                        className="transition-colors duration-200 select-none"
                      >
                        {node.title}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Active Node Detail Card below canvas */}
            <div className="mt-4 p-4 sm:p-5 rounded-2xl glass-panel-subtle border border-cyan-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {(() => {
                  const CurrentIcon = nodes[activeNode].icon;
                  return (
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${nodes[activeNode].color} flex items-center justify-center text-white shadow-md shrink-0`}
                    >
                      <CurrentIcon className="w-5 h-5" />
                    </div>
                  );
                })()}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-heading">
                      {nodes[activeNode].title}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider">
                      · {nodes[activeNode].subtitle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-light mt-0.5">
                    {nodes[activeNode].desc}
                  </p>
                </div>
              </div>

              {/* Quick Node Navigator Buttons */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                {nodes.map((n, idx) => (
                  <button
                    key={n.id}
                    onClick={() => handleSelectNode(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all min-h-[38px] ${
                      activeNode === idx
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold'
                        : 'text-slate-400 hover:text-white bg-white/[0.03]'
                    }`}
                  >
                    0{idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Safety Disclaimer Statement */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 font-light text-center">
          <Shield className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />
          <span>
            HELIOS provides educational organization support. It does not replace a qualified healthcare professional.
          </span>
        </div>
      </motion.div>
    </section>
  );
}
