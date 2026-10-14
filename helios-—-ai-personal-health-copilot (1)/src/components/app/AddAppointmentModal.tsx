import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle2, Bell, BellOff, Clock, Trash2, MapPin } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { Appointment } from '../../types';
import { playChime } from '../../lib/audio';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentToEdit?: Appointment | null;
}

const REMINDER_OPTIONS: Array<{ label: string; value: Appointment['reminderNotice'] }> = [
  { label: '1 day before visit (Recommended)', value: '1 day before' },
  { label: '2 hours before visit', value: '2 hours before' },
  { label: '1 hour before visit', value: '1 hour before' },
  { label: '15 minutes before visit', value: '15 minutes before' },
  { label: 'At appointment time', value: 'At appointment time' },
];

export function AddAppointmentModal({ isOpen, onClose, appointmentToEdit }: AddAppointmentModalProps) {
  const { addAppointment, updateAppointment, deleteAppointment } = useHealthData();
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderNotice, setReminderNotice] = useState<Appointment['reminderNotice']>('1 day before');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (appointmentToEdit) {
      setDoctorName(appointmentToEdit.doctorName || '');
      setSpecialty(appointmentToEdit.specialty || '');
      setDate(appointmentToEdit.date || new Date().toISOString().split('T')[0]);
      setTime(appointmentToEdit.time || '10:00 AM');
      setLocation(appointmentToEdit.location || '');
      setNotes(appointmentToEdit.notes || '');
      setReminderEnabled(appointmentToEdit.reminderEnabled !== false);
      setReminderNotice(appointmentToEdit.reminderNotice || '1 day before');
    } else {
      setDoctorName('');
      setSpecialty('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime('10:00 AM');
      setLocation('');
      setNotes('');
      setReminderEnabled(true);
      setReminderNotice('1 day before');
    }
    setError(null);
  }, [isOpen, appointmentToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim() || !date) {
      setError('Doctor name and date are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        doctorName: doctorName.trim(),
        specialty: specialty.trim() || 'General Practice',
        date,
        time: time.trim() || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        status: 'upcoming' as const,
        reminderEnabled,
        reminderNotice,
      };

      if (appointmentToEdit) {
        await updateAppointment(appointmentToEdit.id, payload);
        playChime(660);
      } else {
        await addAppointment(payload);
        playChime(720);
      }

      onClose();
    } catch (err: any) {
      setError('We could not save the appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!appointmentToEdit) return;
    try {
      setIsSubmitting(true);
      await deleteAppointment(appointmentToEdit.id);
      playChime(380);
      onClose();
    } catch (e) {
      setError('Could not delete appointment.');
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
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-amber-500/30 p-6 sm:p-7 shadow-2xl text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                {appointmentToEdit ? 'Edit Consultation & Reminders' : 'Schedule Care Consultation'}
              </h3>
              <p className="text-xs text-slate-400">
                Set doctor details, timing, and automated reminder alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Doctor / Clinician Name *
              </label>
              <input
                type="text"
                required
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. Sarah Vance"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Specialty / Department
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. Cardiology, Endocrinology"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Appointment Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Appointment Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 10:30 AM or 14:00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Clinic Location or Telehealth Link
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. St. Jude Medical Pavilion Rm 302 or Zoom / Meet link"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Visit Reason / Symptoms to Discuss
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Review blood pressure readings, medication checkup, ask about morning dizziness"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
            />
          </div>

          {/* APPOINTMENT REMINDER CONFIGURATION */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-xl ${reminderEnabled ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'}`}>
                  {reminderEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Appointment Reminder Notification
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Receive timely alert with chime before your visit
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  reminderEnabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    reminderEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {reminderEnabled && (
              <div className="pt-2 border-t border-white/10">
                <label className="block text-[11px] font-semibold text-amber-300 mb-1.5">
                  When should we remind you?
                </label>
                <select
                  value={reminderNotice}
                  onChange={(e) => setReminderNotice(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {REMINDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pt-3 flex items-center justify-between gap-3 border-t border-white/10">
            {appointmentToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{appointmentToEdit ? 'Save Changes' : 'Schedule Appointment'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
