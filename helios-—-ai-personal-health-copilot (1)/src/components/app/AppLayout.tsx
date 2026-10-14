import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  FileText,
  Pill,
  Calendar,
  Target,
  Shield,
  Plus,
  LogOut,
  Search,
  UserCircle,
  Activity,
  PlusCircle,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { playChime } from '../../lib/audio';

interface AppLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAddModal: (type?: string) => void;
  onOpenCommandPalette: () => void;
  children: React.ReactNode;
}

export function AppLayout({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  onOpenCommandPalette,
  children,
}: AppLayoutProps) {
  const { activeUser, signOut } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journey', label: 'Health Journey', icon: Compass },
    { id: 'copilot', label: 'AI Copilot', icon: Sparkles },
    { id: 'reports', label: 'Reports & Vault', icon: FileText },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'goals', label: 'Wellness Goals', icon: Target },
    { id: 'explorer', label: 'Personal Explorer', icon: Activity },
    { id: 'privacy', label: 'Privacy Center', icon: Shield },
  ];

  const handleTabSwitch = (id: string) => {
    playChime(500);
    onSelectTab(id);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col md:flex-row bg-film-grain">
      {/* Desktop & Laptop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 border-r border-white/[0.08] bg-[#070d1a]/80 backdrop-blur-2xl p-5 sticky top-0 h-screen z-30 shrink-0">
        <div>
          {/* Brand header */}
          <button
            onClick={() => onSelectTab('landing')}
            className="flex items-center gap-2.5 mb-6 text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#030712] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
            </div>
            <div>
              <span className="font-heading font-extrabold text-base tracking-tight text-white block">
                HELIOS
              </span>
              <span className="text-[10px] text-slate-400 -mt-1 font-mono block">
                Personal Health Copilot
              </span>
            </div>
          </button>

          {/* Search / Command palette launcher */}
          <button
            onClick={() => {
              playChime(560);
              onOpenCommandPalette();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-300 hover:text-white transition-colors mb-4 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Search / Actions</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Master + Add Record CTA */}
          <div className="mb-5">
            <button
              onClick={() => {
                playChime(620);
                onOpenAddModal('prescription');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Health Record</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSwitch(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile and Sign Out */}
        <div className="pt-4 border-t border-white/[0.08]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 text-xs font-bold font-mono">
                {activeUser?.displayName ? activeUser.displayName[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <span className="text-xs font-semibold text-white block truncate">
                  {activeUser?.displayName || 'User'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block truncate">
                  {activeUser?.email || 'Authenticated'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playChime(380);
                signOut();
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onSelectTab('landing')}
            className="w-full text-center text-[10px] text-cyan-400/80 hover:text-cyan-300 font-mono transition-colors"
          >
            ← Public Launch Site
          </button>
        </div>
      </aside>

      {/* Mobile Top App Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-[#070d1a]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => onSelectTab('landing')}
          className="flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-600 p-[1px]">
            <div className="w-full h-full bg-[#030712] rounded-[7px] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            </div>
          </div>
          <span className="font-heading font-bold text-sm text-white">HELIOS</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAddModal('prescription')}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>

          <button
            onClick={() => onSelectTab('privacy')}
            className="p-1.5 rounded-lg bg-white/[0.05] text-slate-300"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Tabs */}
      <div className="md:hidden sticky top-[53px] z-30 bg-[#030712]/95 backdrop-blur-md border-b border-white/[0.06] px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabSwitch(item.id)}
              className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
