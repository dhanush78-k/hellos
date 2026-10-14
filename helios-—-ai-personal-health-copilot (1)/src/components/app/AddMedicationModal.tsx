import React, { useState } from 'react';
import { X, Pill, CheckCircle2, Clock, Bell } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { playChime } from '../../lib/audio';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_CATEGORIES = [
  'Hypertension',
  'Cardiovascular',
  'Blood Sugar',
  'Cholesterol',
  'Pain Relief',
  'Antibiotic',
  'Thyroid',
  'Vitamin / Supplement',
  'Allergy',
  'General Care',
];

export function AddMedicationModal({ isOpen, onClose }: AddMedicationModalProps) {
  const { addMedication } = useHealthData();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [pillsCount, setPillsCount] = useState('1 tablet');
  const [category, setCategory] = useState('Hypertension');
  const [scheduledTime, setScheduledTime] = useState('09:00 AM');
  const [frequency, setFrequency] = useState('Daily');
  const [foodInstruction, setFoodInstruction] = useState<'Before meal' | 'After meal' | 'With food' | 'No specific food instruction'>('After meal');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) {
      setError('Medication name and dosage are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await addMedication({
        name: name.trim(),
        dosage: dosage.trim(),
        pillsCount: pillsCount.trim() || '1 tablet',
        category,
        scheduledTime,
        frequency: frequency.trim() || 'Daily',
        foodInstruction,
        startDate,
        endDate: endDate || undefined,
        instructions: instructions.trim() || undefined,
        notes: notes.trim() || undefined,
        reminderEnabled,
        active: true,
      });
      playChime(660);
      setName('');
      setDosage('');
      setPillsCount('1 tablet');
      setInstructions('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError('We could not save that yet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 p-6 shadow-2xl border border-sky-500/30 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                Add Prescribed Medication
              </h3>
              <p className="text-xs text-slate-400">
                Configure timing schedule and smart medication reminder
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Medication Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amlodipine"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Dosage & Strength *
              </label>
              <input
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 5 mg"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pills / Dose
              </label>
              <input
                type="text"
                value={pillsCount}
                onChange={(e) => setPillsCount(e.target.value)}
                placeholder="e.g. 1 tablet"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category / Condition
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-none focus:border-sky-400"
              >
                {COMMON_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Scheduled Time
              </label>
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-none focus:border-sky-400"
              >
                <option value="09:00 AM">09:00 AM (Morning)</option>
                <option value="02:00 PM">02:00 PM (Afternoon)</option>
                <option value="07:00 PM">07:00 PM (Evening)</option>
                <option value="10:00 PM">10:00 PM (Night)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Meal Instruction
              </label>
              <select
                value={foodInstruction}
                onChange={(e) => setFoodInstruction(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-none focus:border-sky-400"
              >
                <option value="After meal">After meal</option>
                <option value="Before meal">Before meal</option>
                <option value="With food">With food</option>
                <option value="No specific food instruction">Anytime</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Additional Instructions (Optional)
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Take with a full glass of water"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Reminder Switch */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-semibold text-slate-200">
                Enable Smart Medication Reminder
              </span>
            </div>
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="rounded text-sky-500 focus:ring-0 w-4 h-4"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Add Prescribed Medicine'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
