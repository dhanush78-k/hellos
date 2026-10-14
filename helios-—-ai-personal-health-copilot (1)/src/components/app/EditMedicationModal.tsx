import React, { useState, useEffect } from 'react';
import {
  X,
  Pill,
  Clock,
  Calendar,
  Bell,
  BellOff,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Medication } from '../../types';
import { useHealthData } from '../../context/HealthDataContext';
import { playChime } from '../../lib/audio';
import { getTimeCategory, parseTimeToMinutes, formatMinutesTo12Hour } from '../../lib/medicationReminderService';

interface EditMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicationToEdit?: Medication | null;
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
  'Mental Health',
  'General Care',
];

const QUICK_TIMES = [
  { label: 'Morning (09:00 AM)', time: '09:00 AM', desc: 'Breakfast / start of day' },
  { label: 'Afternoon (02:00 PM)', time: '02:00 PM', desc: 'Lunch / mid-day' },
  { label: 'Evening (07:00 PM)', time: '07:00 PM', desc: 'Dinner time' },
  { label: 'Night (10:00 PM)', time: '10:00 PM', desc: 'Before bed' },
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function EditMedicationModal({
  isOpen,
  onClose,
  medicationToEdit,
}: EditMedicationModalProps) {
  const { addMedication, updateMedication, deleteMedication } = useHealthData();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [pillsCount, setPillsCount] = useState('1 tablet');
  const [category, setCategory] = useState('Hypertension');
  const [customCategory, setCustomCategory] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00 AM');
  const [customTimeInput, setCustomTimeInput] = useState('09:00');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [frequency, setFrequency] = useState<'Daily' | 'Selected days'>('Daily');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [foodInstruction, setFoodInstruction] = useState<'Before meal' | 'After meal' | 'With food' | 'No specific food instruction'>('After meal');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (medicationToEdit) {
      setName(medicationToEdit.name || '');
      setDosage(medicationToEdit.dosage || '');
      setPillsCount(medicationToEdit.pillsCount || '1 tablet');
      
      const cat = medicationToEdit.category || '';
      if (COMMON_CATEGORIES.includes(cat)) {
        setCategory(cat);
        setCustomCategory('');
      } else if (cat) {
        setCategory('Other');
        setCustomCategory(cat);
      } else {
        setCategory('General Care');
      }

      const time = medicationToEdit.scheduledTime || '09:00 AM';
      setScheduledTime(time);
      const isPreset = QUICK_TIMES.some((q) => q.time === time);
      if (!isPreset) {
        setUseCustomTime(true);
        // format to HH:MM for input type="time"
        const mins = parseTimeToMinutes(time);
        const h = String(Math.floor(mins / 60)).padStart(2, '0');
        const m = String(mins % 60).padStart(2, '0');
        setCustomTimeInput(`${h}:${m}`);
      } else {
        setUseCustomTime(false);
      }

      setFrequency((medicationToEdit.frequency === 'Selected days' ? 'Selected days' : 'Daily'));
      setSelectedDays(medicationToEdit.selectedDays && medicationToEdit.selectedDays.length > 0 ? medicationToEdit.selectedDays : DAYS_OF_WEEK);
      setFoodInstruction(medicationToEdit.foodInstruction || 'After meal');
      setStartDate(medicationToEdit.startDate || new Date().toISOString().split('T')[0]);
      setEndDate(medicationToEdit.endDate || '');
      setInstructions(medicationToEdit.instructions || '');
      setNotes(medicationToEdit.notes || '');
      setReminderEnabled(medicationToEdit.reminderEnabled !== false);
      setShowDeleteConfirm(false);
    } else {
      // Default new medication state
      setName('');
      setDosage('');
      setPillsCount('1 tablet');
      setCategory('Hypertension');
      setCustomCategory('');
      setScheduledTime('09:00 AM');
      setUseCustomTime(false);
      setCustomTimeInput('09:00');
      setFrequency('Daily');
      setSelectedDays(DAYS_OF_WEEK);
      setFoodInstruction('After meal');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setInstructions('');
      setNotes('');
      setReminderEnabled(true);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, medicationToEdit]);

  if (!isOpen) return null;

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomTimeInput(val);
    if (val) {
      const [hStr, mStr] = val.split(':');
      const mins = (parseInt(hStr, 10) || 0) * 60 + (parseInt(mStr, 10) || 0);
      setScheduledTime(formatMinutesTo12Hour(mins));
    }
  };

  const handleToggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return; // keep at least one
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Medication name is required.');
      return;
    }
    if (!dosage.trim()) {
      setError('Dosage and strength are required (e.g., 5 mg, 500 mg).');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const resolvedCategory = category === 'Other' ? (customCategory.trim() || 'General Care') : category;
      const resolvedMinutes = parseTimeToMinutes(scheduledTime);
      const standardTime = formatMinutesTo12Hour(resolvedMinutes);
      const timingCategory = getTimeCategory(resolvedMinutes);

      const payload = {
        name: name.trim(),
        dosage: dosage.trim(),
        pillsCount: pillsCount.trim() || '1 tablet',
        category: resolvedCategory,
        scheduledTime: standardTime,
        timing: timingCategory,
        frequency,
        selectedDays: frequency === 'Selected days' ? selectedDays : DAYS_OF_WEEK,
        foodInstruction,
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate.trim() || undefined,
        instructions: instructions.trim() || undefined,
        notes: notes.trim() || undefined,
        reminderEnabled,
        active: true,
      };

      if (medicationToEdit) {
        await updateMedication(medicationToEdit.id, payload);
        playChime(660);
      } else {
        await addMedication(payload);
        playChime(720);
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Failed to save medication details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!medicationToEdit) return;
    try {
      setIsSubmitting(true);
      await deleteMedication(medicationToEdit.id);
      playChime(380);
      onClose();
    } catch (err) {
      setError('Could not delete medication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-sky-500/30 p-5 sm:p-7 shadow-2xl text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 shadow-inner">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white font-heading">
                {medicationToEdit ? 'Edit Prescribed Medicine' : 'Add Prescribed Medicine'}
              </h3>
              <p className="text-xs text-slate-400">
                Configure dosage, timing schedule, and smart reminder alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Medicine Name & Dosage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Medicine Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amlodipine, Metformin, Atorvastatin"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
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
                placeholder="e.g. 5 mg, 500 mg, 20 mg"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>
          </div>

          {/* Number of Pills & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Number of Pills / Dose Instruction
              </label>
              <input
                type="text"
                value={pillsCount}
                onChange={(e) => setPillsCount(e.target.value)}
                placeholder="e.g. 1 tablet, 2 capsules, 5 ml"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Prescribed Category or Condition
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-none focus:border-sky-400 transition-colors"
              >
                {COMMON_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="Other">Other (Custom)</option>
              </select>
              {category === 'Other' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Specify condition..."
                  className="mt-2 w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              )}
            </div>
          </div>

          {/* Scheduled Time Section */}
          <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Scheduled Time & Routine</span>
              </label>
              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/30">
                {scheduledTime}
              </span>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {QUICK_TIMES.map((qt) => {
                const isSelected = !useCustomTime && scheduledTime === qt.time;
                return (
                  <button
                    key={qt.time}
                    type="button"
                    onClick={() => {
                      setUseCustomTime(false);
                      setScheduledTime(qt.time);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-sky-500/25 border-sky-400 text-white font-bold shadow-md shadow-sky-500/10'
                        : 'bg-slate-950/70 border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <span className="block text-xs font-semibold">{qt.time}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5 line-clamp-1">{qt.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Time Option */}
            <div className="pt-1 flex items-center gap-3">
              <label className="text-xs text-slate-400 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomTime}
                  onChange={(e) => setUseCustomTime(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-0 bg-slate-900 border-white/20"
                />
                <span>Custom time</span>
              </label>
              {useCustomTime && (
                <input
                  type="time"
                  value={customTimeInput}
                  onChange={handleCustomTimeChange}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-sky-500/40 text-xs text-white focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Food Instruction */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Meal Timing Instruction
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { label: 'After meal', val: 'After meal' },
                  { label: 'Before meal', val: 'Before meal' },
                  { label: 'With food', val: 'With food' },
                  { label: 'Anytime / No req.', val: 'No specific food instruction' },
                ] as const
              ).map((f) => (
                <button
                  key={f.val}
                  type="button"
                  onClick={() => setFoodInstruction(f.val)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                    foodInstruction === f.val
                      ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-bold'
                      : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency & Days */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Frequency
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setFrequency('Daily')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  frequency === 'Daily'
                    ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                    : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                Every Day (Daily)
              </button>
              <button
                type="button"
                onClick={() => setFrequency('Selected days')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  frequency === 'Selected days'
                    ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                    : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                Selected Days of the Week
              </button>
            </div>

            {frequency === 'Selected days' && (
              <div className="flex items-center justify-between gap-1 p-2 rounded-xl bg-slate-950 border border-white/10">
                {DAYS_OF_WEEK.map((day) => {
                  const isChecked = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleDay(day)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isChecked
                          ? 'bg-sky-500 text-white shadow-sm'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dates: Start & Optional End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

          {/* Additional Instructions & Notes */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Dosage Instructions / Special Directions
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Take with a full glass of water, do not chew"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Personal Notes or Prescribing Doctor (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Dr. Roberts recommended checking BP 30 mins after dose"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Reminder Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${reminderEnabled ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-500'}`}>
                {reminderEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Smart Medication Reminder
                </span>
                <span className="text-[11px] text-slate-400">
                  Trigger desktop push notifications & audio chimes at {scheduledTime}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReminderEnabled(!reminderEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                reminderEnabled ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  reminderEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/10">
            {medicationToEdit ? (
              showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-300">Delete this medication?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-1.5 rounded-lg bg-white/5 text-slate-400 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{medicationToEdit ? 'Save Changes' : 'Save Prescribed Medicine'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
