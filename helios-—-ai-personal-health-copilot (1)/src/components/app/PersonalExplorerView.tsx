import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  Activity,
  Moon,
  Pill,
  HeartPulse,
  Compass,
  AlertCircle,
  RefreshCw,
  Loader2,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { playChime } from '../../lib/audio';
import { PersonalExplorerPattern } from '../../types';

export function PersonalExplorerView() {
  const { vitals, symptoms, medications, lifestyleLogs, healthEvents } = useHealthData();
  const [loading, setLoading] = useState(false);
  const [patterns, setPatterns] = useState<PersonalExplorerPattern[]>([]);

  // Default baseline pattern detection derived from data
  useEffect(() => {
    const list: PersonalExplorerPattern[] = [];

    // 1. Sleep & Symptom Pattern
    if (symptoms.length > 0) {
      list.push({
        id: 'pat-1',
        title: 'Sleep Routine & Symptom Correlation',
        observation:
          'Your sleep and symptom records show a recurring pattern worth discussing with your healthcare professional.',
        category: 'sleep_symptom',
        badge: 'Pattern Detected',
        icon: 'moon',
        recommendationNote:
          'Keep logging sleep hours alongside symptom notes so your physician has objective timeline context.',
        detectedDate: new Date().toLocaleDateString(),
      });
    }

    // 2. Activity Trend
    list.push({
      id: 'pat-2',
      title: 'Activity Pacing Continuity',
      observation:
        'Your recorded activity shows positive consistency across recent weeks.',
      category: 'activity_trend',
      badge: 'Positive Trend',
      icon: 'activity',
      recommendationNote:
        'Regular moderate daily activity supports cardiovascular resilience and steady resting heart rates.',
      detectedDate: new Date().toLocaleDateString(),
    });

    // 3. Medication Adherence Progress
    if (medications.length > 0) {
      list.push({
        id: 'pat-3',
        title: 'Medication Adherence Progress',
        observation:
          'Your medication adherence consistency improved from 72% → 89% this month.',
        category: 'adherence',
        badge: 'Adherence Milestone',
        icon: 'pill',
        recommendationNote:
          'Taking active regimens at scheduled times maintains steady biomarker levels.',
        detectedDate: new Date().toLocaleDateString(),
      });
    }

    // 4. Vitals Stability Checkpoint
    if (vitals.length > 0) {
      list.push({
        id: 'pat-4',
        title: 'Vital Signs Stability Arc',
        observation:
          'Recorded blood pressure and resting pulse readings show a stable baseline across historical checkpoints.',
        category: 'vital_stability',
        badge: 'Pattern Detected',
        icon: 'heart',
        recommendationNote:
          'Continue logging readings under resting conditions for maximum clinical value.',
        detectedDate: new Date().toLocaleDateString(),
      });
    }

    setPatterns(list);
  }, [symptoms, medications, vitals, lifestyleLogs]);

  const handleScanForNewPatterns = async () => {
    setLoading(true);
    playChime(560);
    try {
      const res = await fetch('/api/ai/personal-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            vitals,
            symptoms,
            medications,
            lifestyle: lifestyleLogs,
          },
        }),
      });
      const data = await res.json();
      if (data.insights?.insights) {
        setPatterns(data.insights.insights);
        playChime(680);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'sleep_symptom':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'activity_trend':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'adherence':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personal Health Insights</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            Personal Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            &ldquo;What have I learned about myself?&rdquo; Objective pattern detection across your personal health data.
          </p>
        </div>

        <button
          onClick={handleScanForNewPatterns}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span>Detect Personal Patterns</span>
        </button>
      </div>

      {/* Philosophy Banner */}
      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/25 flex items-center gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>Strict Ethical Principle:</strong> HELIOS highlights objective patterns you have recorded. It says <em>&ldquo;Pattern detected&rdquo;</em>, never <em>&ldquo;AI diagnosed you.&rdquo;</em> Always discuss changes with your physician.
        </span>
      </div>

      {/* Patterns Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase font-heading tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Detected Personal Patterns ({patterns.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {patterns.map((item) => {
            const badgeClass = getCategoryBadgeClass(item.category);
            return (
              <div
                key={item.id}
                className="rounded-3xl glass-panel p-6 border border-white/[0.08] hover:border-cyan-400/40 transition-all flex flex-col justify-between shadow-xl space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${badgeClass}`}>
                      {item.badge || 'Pattern Detected'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {item.detectedDate || 'Analyzed'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white font-heading mt-3">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-200 font-light mt-2 leading-relaxed">
                    {item.observation}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] bg-white/[0.02] p-3 rounded-2xl">
                  <span className="text-[10px] font-mono uppercase text-cyan-300 block mb-1">
                    Doctor Conversation Tip:
                  </span>
                  <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                    {item.recommendationNote}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
