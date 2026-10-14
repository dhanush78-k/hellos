import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X, ArrowRight, Compass, Volume2, VolumeX, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toggleSound, isSoundActive, playChime } from '../../lib/audio';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onNavigateTab: (tab: string) => void;
  currentView?: string;
  onOpenCommandPalette: () => void;
}

export function Navbar({
  onOpenAuth,
  onNavigateTab,
  currentView = 'landing',
  onOpenCommandPalette,
}: NavbarProps) {
  const { activeUser, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (height > 0) {
        setScrollProgress((winScroll / height) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSoundToggle = () => {
    const active = toggleSound();
    setSoundOn(active);
    if (active) {
      playChime(660, 'sine', 0.5);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#030712]/80 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl shadow-cyan-950/20 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        {/* Scroll Progress Line */}
        <div
          className="absolute bottom-0 left-0 h-[1.5px] bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 transition-all duration-75 pointer-events-none"
          style={{ width: `${scrollProgress}%` }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => {
              playChime(440);
              onNavigateTab('landing');
            }}
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-600 p-[1.5px] transition-transform duration-300 group-hover:scale-105 shadow-lg shadow-cyan-500/25">
              <div className="w-full h-full bg-[#030712] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg tracking-tight text-white">
                  HELIOS
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400/80">
                  Copilot
                </span>
              </div>
              <span className="block text-[11px] text-slate-400 -mt-0.5 tracking-tight font-light">
                Your health, understood.
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 px-6 py-2 rounded-full glass-panel-subtle border border-white/[0.08]">
            <a
              href="#what-is-helios"
              onClick={() => playChime(480)}
              className="text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors"
            >
              Concept
            </a>
            <a
              href="#how-it-works"
              onClick={() => playChime(520)}
              className="text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors"
            >
              Method
            </a>
            <a
              href="#interactive-preview"
              onClick={() => playChime(560)}
              className="text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors"
            >
              Simulation
            </a>
            <a
              href="#timeline-story"
              onClick={() => playChime(600)}
              className="text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors"
            >
              Timeline
            </a>
            <a
              href="#ai-copilot"
              onClick={() => playChime(640)}
              className="text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors"
            >
              Copilot
            </a>
            <a
              href="#privacy-security"
              onClick={() => playChime(680)}
              className="text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors"
            >
              Privacy
            </a>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {/* Ambient Audio Tactile Toggle */}
            <button
              onClick={handleSoundToggle}
              className={`p-2 rounded-xl transition-all border ${
                soundOn
                  ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300'
                  : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
              }`}
              title={soundOn ? 'Mute ambient tactile chime' : 'Enable ambient tactile chimes'}
              aria-label="Toggle ambient chimes"
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Quick command palette trigger */}
            <button
              onClick={() => {
                playChime(580);
                onOpenCommandPalette();
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-300 hover:text-white transition-colors"
              title="Open command palette (Ctrl+K / Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-[11px] text-slate-400">⌘K</span>
            </button>

            {activeUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playChime(520);
                    onNavigateTab('dashboard');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 transition-all"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Workspace</span>
                </button>
                <button
                  onClick={() => signOut()}
                  className="hidden sm:block px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playChime(440);
                    onOpenAuth('login');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    playChime(600);
                    onOpenAuth('signup');
                  }}
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Connect with HELIOS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl bg-white/[0.04] border border-white/[0.08] min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 px-4 pt-3 pb-6 glass-panel border-b border-white/[0.08] space-y-3 animate-in slide-in-from-top-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="#what-is-helios"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] text-slate-300 hover:text-cyan-300 flex items-center"
              >
                Concept
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] text-slate-300 hover:text-cyan-300 flex items-center"
              >
                Method
              </a>
              <a
                href="#interactive-preview"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] text-slate-300 hover:text-cyan-300 flex items-center"
              >
                Simulation
              </a>
              <a
                href="#timeline-story"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] text-slate-300 hover:text-cyan-300 flex items-center"
              >
                Timeline
              </a>
              <a
                href="#ai-copilot"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] text-slate-300 hover:text-cyan-300 flex items-center"
              >
                Copilot
              </a>
              <a
                href="#privacy-security"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] text-slate-300 hover:text-cyan-300 flex items-center"
              >
                Privacy
              </a>
            </div>

            {activeUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateTab('dashboard');
                }}
                className="w-full py-3 rounded-xl bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25"
              >
                Go to Workspace Dashboard
              </button>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full py-3 rounded-xl bg-white/[0.06] text-white text-xs font-medium border border-white/[0.08]"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-transform"
                >
                  Connect with HELIOS
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
