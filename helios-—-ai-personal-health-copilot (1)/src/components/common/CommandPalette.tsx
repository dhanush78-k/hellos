import React, { useState, useEffect } from 'react';
import {
  Search,
  PlusCircle,
  FileText,
  Pill,
  Calendar,
  Target,
  Compass,
  Sparkles,
  Shield,
  X,
  HeartPulse,
  AlertCircle,
  Activity,
  Share2,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onAction: (action: string) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onAction,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const items = [
    {
      id: 'add-record',
      title: 'Add Health Record (Unified)',
      category: 'Record',
      icon: PlusCircle,
      action: () => {
        onAction('add-event');
        onClose();
      },
    },
    {
      id: 'auto-organize',
      title: 'Auto-Organize Prescription with AI',
      category: 'AI Auto-Organize',
      icon: Sparkles,
      action: () => {
        onAction('add-medication');
        onClose();
      },
    },
    {
      id: 'upload-report',
      title: 'Upload medical report to Vault',
      category: 'Document',
      icon: FileText,
      action: () => {
        onAction('upload-report');
        onClose();
      },
    },
    {
      id: 'open-journey',
      title: 'Open Health Journey Timeline',
      category: 'Navigate',
      icon: Compass,
      action: () => {
        onNavigate('/journey');
        onClose();
      },
    },
    {
      id: 'open-copilot',
      title: 'Ask AI Copilot',
      category: 'Copilot',
      icon: Sparkles,
      action: () => {
        onNavigate('/copilot');
        onClose();
      },
    },
    {
      id: 'open-explorer',
      title: 'Personal Explorer (Pattern Detection)',
      category: 'Insights',
      icon: Activity,
      action: () => {
        onNavigate('/explorer');
        onClose();
      },
    },
    {
      id: 'doctor-share',
      title: 'Generate 24-Hour Doctor Share Link',
      category: 'Privacy',
      icon: Share2,
      action: () => {
        onNavigate('/privacy');
        onClose();
      },
    },
    {
      id: 'open-privacy',
      title: 'Privacy Center & Data Export',
      category: 'Privacy',
      icon: Shield,
      action: () => {
        onNavigate('/privacy');
        onClose();
      },
    },
  ];

  const filteredItems = items.filter(
    (i) =>
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      i.category.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl glass-panel border border-cyan-500/30 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search action..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action items list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching actions found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs transition-colors text-left ${
                    isSelected
                      ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-cyan-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold block text-white">{item.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">↵ Select</span>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-white/[0.08] bg-black/40 flex items-center justify-between text-[11px] text-slate-500">
          <span>Use arrows to navigate</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
