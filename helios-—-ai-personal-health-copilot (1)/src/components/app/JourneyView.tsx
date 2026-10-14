import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  PlusCircle,
  Calendar,
  FileText,
  Filter,
  Trash2,
  Tag,
  Clock,
  Sparkles,
  ChevronDown,
  Pill,
  HeartPulse,
  Syringe,
  Stethoscope,
  FlaskConical,
  AlertCircle,
  TrendingUp,
  History,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { playChime } from '../../lib/audio';

interface JourneyViewProps {
  onOpenAddEvent: () => void;
}

export function JourneyView({ onOpenAddEvent }: JourneyViewProps) {
  const { healthEvents, deleteHealthEvent, vitals, symptoms, medications } = useHealthData();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI Journey Summary State
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [journeySummary, setJourneySummary] = useState<string | null>(null);

  const types = [
    'All',
    'Lab Test',
    'Consultation',
    'Prescription',
    'Symptom Note',
    'Vital Signs',
    'Vaccination',
    'Check-up',
    'Medical History',
  ];

  const filteredEvents = healthEvents.filter((e) => {
    const matchesType = selectedFilter === 'All' || e.type === selectedFilter;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.documentName && e.documentName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Lab Test':
        return FlaskConical;
      case 'Consultation':
      case 'Check-up':
      case 'Care':
        return Stethoscope;
      case 'Prescription':
        return Pill;
      case 'Vital Signs':
        return HeartPulse;
      case 'Symptom Note':
        return AlertCircle;
      case 'Vaccination':
        return Syringe;
      default:
        return FileText;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'Lab Test':
        return 'from-cyan-400 to-blue-500 text-cyan-400 border-cyan-500/30';
      case 'Consultation':
      case 'Check-up':
        return 'from-emerald-400 to-teal-500 text-emerald-400 border-emerald-500/30';
      case 'Prescription':
        return 'from-violet-400 to-purple-500 text-violet-400 border-violet-500/30';
      case 'Vital Signs':
        return 'from-rose-400 to-pink-500 text-rose-400 border-rose-500/30';
      case 'Symptom Note':
        return 'from-amber-400 to-orange-500 text-amber-400 border-amber-500/30';
      case 'Vaccination':
        return 'from-sky-400 to-indigo-500 text-sky-400 border-sky-500/30';
      default:
        return 'from-slate-400 to-slate-500 text-slate-300 border-white/10';
    }
  };

  const handleGenerateJourneySummary = async () => {
    setSummaryLoading(true);
    playChime(560);
    try {
      const res = await fetch('/api/ai/journey-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            events: healthEvents,
            vitals,
            symptoms,
            medications,
          },
        }),
      });
      const data = await res.json();
      setJourneySummary(data.summary || 'Summary unavailable.');
      playChime(680);
    } catch (e) {
      console.error(e);
      setJourneySummary('Could not generate journey comparison at this time.');
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Personal Health Journey</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            Your Health Journey
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dynamic chronological timeline assembled from records you personally provide.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {healthEvents.length > 0 && (
            <button
              onClick={handleGenerateJourneySummary}
              disabled={summaryLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 text-xs font-semibold transition-all shadow-md"
            >
              {summaryLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
              <span>What changed in my health?</span>
            </button>
          )}

          <button
            onClick={() => {
              playChime(580);
              onOpenAddEvent();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Record</span>
          </button>
        </div>
      </div>

      {/* AI JOURNEY SUMMARY DRAWER/CARD */}
      {journeySummary && (
        <div className="p-6 rounded-3xl glass-panel-active border border-cyan-400/40 shadow-2xl relative animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white font-heading uppercase tracking-wider">
                AI Journey Analysis — What Changed
              </span>
            </div>
            <button
              onClick={() => setJourneySummary(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-200 leading-relaxed font-light whitespace-pre-wrap max-h-72 overflow-y-auto pr-2">
            {journeySummary}
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400">
            <span>Educational comparison only · Discuss changes with your clinician</span>
            <span className="font-mono text-cyan-400">HELIOS Engine</span>
          </div>
        </div>
      )}

      {/* Filters and search toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search timeline records, tests, symptoms..."
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 sm:w-64"
        />

        {/* Type pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => {
                playChime(480);
                setSelectedFilter(t);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                selectedFilter === t
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm font-semibold'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* TIMELINE LIST OR EMPTY STATE */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-3xl glass-panel p-10 sm:p-14 text-center border border-white/10 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/20">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold font-heading text-white">
            Your Health Journey is waiting for its first entry.
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto font-light leading-relaxed">
            Every step in your healthcare story is created by you. Add a lab result, prescription, doctor visit, or symptom note to begin your personal chronology.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => {
                playChime(580);
                onOpenAddEvent();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add First Health Record</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-cyan-400 before:via-sky-500 before:to-indigo-600">
          {filteredEvents.map((event, index) => {
            const Icon = getEventIcon(event.type);
            const colorClass = getEventColor(event.type);
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="relative group"
              >
                {/* Node Milestone Dot */}
                <div className="absolute -left-6 sm:-left-10 top-1.5 w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-[#030712] border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] flex items-center justify-center text-white z-10 transition-transform group-hover:scale-110">
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-300" />
                </div>

                {/* Event Card */}
                <div className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-cyan-400/40 transition-all shadow-xl group-hover:shadow-cyan-950/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border bg-gradient-to-r ${colorClass}`}>
                        {event.type}
                      </span>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{event.date}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        playChime(380);
                        deleteHealthEvent(event.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/[0.04] self-end sm:self-auto"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm sm:text-base font-bold text-white font-heading">
                      {event.title}
                    </h4>

                    {event.notes && (
                      <p className="mt-1.5 text-xs text-slate-300 font-light leading-relaxed">
                        {event.notes}
                      </p>
                    )}

                    {event.documentName && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[11px] text-cyan-300 font-mono">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Linked file: {event.documentName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Downward indicator between events */}
                {index < filteredEvents.length - 1 && (
                  <div className="flex justify-center -mb-2 mt-2">
                    <span className="text-[10px] font-mono text-slate-600">↓</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
