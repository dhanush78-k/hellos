import React, { useState } from 'react';
import { X, Calendar, PlusCircle, CheckCircle2 } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultTitle?: string;
  defaultType?: string;
  defaultNotes?: string;
}

export function AddEventModal({
  isOpen,
  onClose,
  defaultDate = new Date().toISOString().split('T')[0],
  defaultTitle = '',
  defaultType = 'Check-up',
  defaultNotes = '',
}: AddEventModalProps) {
  const { addHealthEvent } = useHealthData();
  const [title, setTitle] = useState(defaultTitle);
  const [date, setDate] = useState(defaultDate);
  const [type, setType] = useState(defaultType);
  const [notes, setNotes] = useState(defaultNotes);
  const [documentName, setDocumentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      setError('Please provide at least a title and date.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await addHealthEvent({
        title: title.trim(),
        date,
        type,
        notes: notes.trim(),
        documentName: documentName.trim() || undefined,
      });
      // reset
      setTitle('');
      setNotes('');
      setDocumentName('');
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
        className="relative w-full max-w-lg rounded-2xl glass-panel p-6 shadow-2xl border border-cyan-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white font-heading">
              Add Health Event to Journey
            </h3>
            <p className="text-xs text-slate-400">
              Manually log a milestone, consultation, or health moment
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual Cardiology Check-up, Routine Bloodwork"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Event Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              >
                <option value="Check-up">Check-up</option>
                <option value="Lab Test">Lab Test</option>
                <option value="Prescription">Prescription</option>
                <option value="Care">Care</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Surgery">Surgery</option>
                <option value="Vaccination">Vaccination</option>
                <option value="Consultation">Consultation</option>
                <option value="Symptom Note">Symptom Note</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Notes & Observations (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add key highlights, doctor instructions, or personal thoughts..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Attached Document Name (Optional)
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g. Lipid_Panel_Results_Oct.pdf"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save to Journey</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
