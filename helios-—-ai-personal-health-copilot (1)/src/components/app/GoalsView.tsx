import React, { useState } from 'react';
import {
  Target,
  PlusCircle,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Trash2,
  Calendar,
  Sparkles,
  Heart,
  Droplets,
  Moon,
  Activity,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { Goal } from '../../types';
import { playChime } from '../../lib/audio';

interface GoalsViewProps {
  onOpenAddModal: () => void;
}

export function GoalsView({ onOpenAddModal }: GoalsViewProps) {
  const {
    goals,
    deleteGoal,
    updateGoalStatus,
    adjustGoalProgress,
    adjustGoalTarget,
  } = useHealthData();

  const [activeCoachGoal, setActiveCoachGoal] = useState<Goal | null>(null);

  const activeGoals = goals.filter((g) => g.status === 'active');
  const otherGoals = goals.filter((g) => g.status !== 'active');

  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case 'hydration':
        return Droplets;
      case 'sleep':
        return Moon;
      case 'activity':
        return Activity;
      default:
        return Target;
    }
  };

  const handleAdjustTarget = async (goal: Goal, newDays: number) => {
    playChime(640);
    await adjustGoalTarget(goal.id, `${newDays} days/week`, newDays);
    setActiveCoachGoal(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono mb-2">
            <Target className="w-3.5 h-3.5" />
            <span>Personalized Pacing & Adaptive Goals</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            Adaptive Wellness Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personalized, flexible wellness pacing with AI coaching that adapts targets when life gets busy.
          </p>
        </div>

        <button
          onClick={() => {
            playChime(580);
            onOpenAddModal();
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/25 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Adaptive Goal</span>
        </button>
      </div>

      {/* AI GOAL COACH ADAPTIVE BANNER */}
      {activeGoals.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl glass-panel-active border border-emerald-500/35 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase font-heading tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>AI Goal Coach — Adaptive Pacing</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/15">
              Active Evaluation
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 font-light leading-relaxed">
            &ldquo;You haven&apos;t met your activity target twice this week. Rather than feeling discouraged, would you like to adaptively adjust your target to build sustainable momentum?&rdquo;
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {activeGoals.map((g) => (
              <button
                key={g.id}
                onClick={() => handleAdjustTarget(g, Math.max(2, (g.targetTotal || 5) - 1))}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-emerald-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Adapt {g.title} Target ({Math.max(2, (g.targetTotal || 5) - 1)} days/week)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      {goals.length === 0 ? (
        <div className="rounded-3xl glass-panel p-12 text-center border border-cyan-500/20 shadow-xl max-w-lg mx-auto space-y-4">
          <Target className="w-12 h-12 mx-auto text-emerald-400/60 animate-pulse" />
          <h3 className="text-xl font-bold font-heading text-white">
            No wellness goals created yet.
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-light">
            Set gentle personal habits — such as 🏃 Activity (4/5 days), 💧 Hydration (5/7 days), or 😴 Sleep routine (6/7 days) — and adapt them as your lifestyle evolves.
          </p>
          <button
            onClick={() => {
              playChime(580);
              onOpenAddModal();
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20"
          >
            Create first adaptive goal
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const isActive = goal.status === 'active';
              const isCompleted = goal.status === 'completed';
              const Icon = getCategoryIcon(goal.category);
              const cur = goal.currentProgress ?? 0;
              const total = goal.targetTotal || 5;
              const pct = Math.min(100, Math.round((cur / total) * 100));

              return (
                <div
                  key={goal.id}
                  className={`rounded-3xl glass-panel p-5 border transition-all flex flex-col justify-between shadow-xl ${
                    isActive
                      ? 'border-emerald-500/35 hover:border-emerald-400/60'
                      : isCompleted
                      ? 'border-cyan-500/20 opacity-80'
                      : 'border-white/5 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-mono uppercase text-slate-300 font-bold">
                          {goal.target || `${total} ${goal.unit || 'days/week'}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            playChime(500);
                            updateGoalStatus(
                              goal.id,
                              isActive ? 'paused' : 'active'
                            );
                          }}
                          className="p-1 text-slate-400 hover:text-white"
                          title={isActive ? 'Pause goal' : 'Resume goal'}
                        >
                          {isActive ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => {
                            playChime(380);
                            deleteGoal(goal.id);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400"
                          title="Delete goal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white font-heading mt-3">
                      {goal.title}
                    </h3>

                    {goal.description && (
                      <p className="text-xs text-slate-400 font-light mt-1">
                        {goal.description}
                      </p>
                    )}

                    {/* Progress Bar & Interactive Counter */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">This week&apos;s progress:</span>
                        <span className="text-emerald-300 font-bold">
                          {cur} / {total} {goal.unit || 'days'} ({pct}%)
                        </span>
                      </div>

                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/[0.06]">
                        <div
                          className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-500 font-mono">Adaptive pacing active</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              playChime(420);
                              adjustGoalProgress(goal.id, Math.max(0, cur - 1));
                            }}
                            className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-slate-300"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => {
                              playChime(660);
                              adjustGoalProgress(goal.id, cur + 1);
                            }}
                            className="px-2.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono font-bold"
                          >
                            +1 Log Day
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
