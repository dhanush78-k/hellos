import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import {
  HealthEvent,
  HealthDocument,
  Medication,
  MedicationAdherenceLog,
  Appointment,
  Goal,
  VitalSign,
  SymptomEntry,
  MedicalHistoryEntry,
  DailyLifestyleLog,
  TemporaryHealthShare,
  HealthSignal,
} from '../types';

interface HealthDataContextType {
  healthEvents: HealthEvent[];
  documents: HealthDocument[];
  medications: Medication[];
  appointments: Appointment[];
  goals: Goal[];
  vitals: VitalSign[];
  symptoms: SymptomEntry[];
  medicalHistory: MedicalHistoryEntry[];
  lifestyleLogs: DailyLifestyleLog[];
  temporaryShares: TemporaryHealthShare[];
  healthSignals: HealthSignal[];
  loading: boolean;

  // CRUD
  addHealthEvent: (event: Omit<HealthEvent, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  deleteHealthEvent: (id: string) => Promise<void>;

  addDocument: (docData: Omit<HealthDocument, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  deleteDocument: (id: string) => Promise<void>;
  updateDocumentStatus: (id: string, status: HealthDocument['status']) => Promise<void>;

  addMedication: (med: Omit<Medication, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  batchAddMedications: (meds: Array<Omit<Medication, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  toggleMedicationActive: (id: string, active: boolean) => Promise<void>;
  toggleMedicationReminder: (id: string, reminderEnabled: boolean) => Promise<void>;
  markMedicationStatus: (id: string, status: 'taken' | 'missed') => Promise<void>;
  recordDoseAction: (medicationId: string, date: string, scheduledTime: string, status: 'taken' | 'skipped' | 'missed') => Promise<void>;
  logMedicationSideEffect: (id: string, sideEffect: { description: string; severity: 'mild' | 'moderate' | 'severe' }) => Promise<void>;

  addAppointment: (apt: Omit<Appointment, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  toggleAppointmentReminder: (id: string, reminderEnabled: boolean, reminderNotice?: Appointment['reminderNotice']) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  updateAppointmentPrep: (id: string, prepNotes: string, questions?: string[]) => Promise<void>;

  addGoal: (goal: Omit<Goal, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  deleteGoal: (id: string) => Promise<void>;
  updateGoalStatus: (id: string, status: Goal['status']) => Promise<void>;
  adjustGoalProgress: (id: string, newProgress: number) => Promise<void>;
  adjustGoalTarget: (id: string, newTarget: string, newTargetTotal?: number) => Promise<void>;

  addVitalSign: (vital: Omit<VitalSign, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  deleteVitalSign: (id: string) => Promise<void>;

  addSymptom: (symptom: Omit<SymptomEntry, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  deleteSymptom: (id: string) => Promise<void>;

  addMedicalHistory: (entry: Omit<MedicalHistoryEntry, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  deleteMedicalHistory: (id: string) => Promise<void>;

  logWater: (amountDelta: number) => Promise<void>;
  logSleep: (hours: number, quality?: 'restful' | 'average' | 'poor') => Promise<void>;
  logActivity: (minutesDelta: number) => Promise<void>;
  getTodayLifestyle: () => DailyLifestyleLog;

  createHealthShare: (sections: TemporaryHealthShare['sections'], doctorNote?: string) => Promise<TemporaryHealthShare>;
  revokeHealthShare: (shareId: string) => Promise<void>;

  clearAllUserData: () => Promise<void>;
  exportAllUserData: () => void;
}

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

const getInitialSampleMedications = (userId: string): Medication[] => [
  {
    id: 'med_amlodipine',
    userId,
    name: 'Amlodipine',
    dosage: '5 mg',
    pillsCount: '1 tablet',
    category: 'Hypertension',
    frequency: 'Daily',
    scheduledTime: '09:00 AM',
    timing: 'Morning',
    foodInstruction: 'After meal',
    notes: 'Prescribed for blood pressure management. Take consistently each morning.',
    instructions: 'Take with full glass of water',
    reminderEnabled: true,
    active: true,
    adherenceLogs: [],
    sideEffects: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med_metformin',
    userId,
    name: 'Metformin',
    dosage: '500 mg',
    pillsCount: '1 tablet',
    category: 'Blood Sugar',
    frequency: 'Daily',
    scheduledTime: '02:00 PM',
    timing: 'Afternoon',
    foodInstruction: 'With food',
    notes: 'Prescribed for glycemic control. Take with afternoon meal.',
    instructions: 'Do not crush or chew',
    reminderEnabled: true,
    active: true,
    adherenceLogs: [],
    sideEffects: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med_atorvastatin',
    userId,
    name: 'Atorvastatin',
    dosage: '20 mg',
    pillsCount: '1 tablet',
    category: 'Cholesterol',
    frequency: 'Daily',
    scheduledTime: '10:00 PM',
    timing: 'Bedtime',
    foodInstruction: 'After meal',
    notes: 'Prescribed for lipid control. Take at bedtime.',
    instructions: 'Avoid grapefruit juice while taking',
    reminderEnabled: true,
    active: true,
    adherenceLogs: [],
    sideEffects: [],
    createdAt: new Date().toISOString(),
  },
];

const getInitialSampleAppointments = (userId: string): Appointment[] => {
  const future = new Date();
  future.setDate(future.getDate() + 2);
  const futureDateStr = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`;

  return [
    {
      id: 'apt_sarah_vance',
      userId,
      doctorName: 'Dr. Sarah Vance',
      specialty: 'Cardiology',
      clinic: 'Metro Medical Pavilion Rm 402',
      date: futureDateStr,
      time: '10:30 AM',
      location: 'Metro Medical Pavilion, 4th Floor',
      notes: 'Cardiology follow-up, BP review, and medication tolerance assessment.',
      status: 'upcoming',
      reminderEnabled: true,
      reminderNotice: '1 day before',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

export function HealthDataProvider({ children }: { children: React.ReactNode }) {
  const { user, guestUser, activeUser } = useAuth();
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryEntry[]>([]);
  const [lifestyleLogs, setLifestyleLogs] = useState<DailyLifestyleLog[]>([]);
  const [temporaryShares, setTemporaryShares] = useState<TemporaryHealthShare[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Sync with Firestore or Guest Storage
  useEffect(() => {
    if (!activeUser) {
      setHealthEvents([]);
      setDocuments([]);
      setMedications([]);
      setAppointments([]);
      setGoals([]);
      setVitals([]);
      setSymptoms([]);
      setMedicalHistory([]);
      setLifestyleLogs([]);
      setTemporaryShares([]);
      setLoading(false);
      return;
    }

    if (user) {
      setLoading(true);
      const uid = user.uid;

      const unsubEvents = onSnapshot(collection(db, `users/${uid}/healthEvents`), (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHealthEvents(list);
        setLoading(false);
      }, (e) => handleFirestoreError(e, OperationType.LIST, `users/${uid}/healthEvents`));

      const unsubDocs = onSnapshot(collection(db, `users/${uid}/documents`), (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setDocuments(list);
      }, (e) => handleFirestoreError(e, OperationType.LIST, `users/${uid}/documents`));

      const unsubMeds = onSnapshot(collection(db, `users/${uid}/medications`), (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setMedications(list);
      }, (e) => handleFirestoreError(e, OperationType.LIST, `users/${uid}/medications`));

      const unsubApts = onSnapshot(collection(db, `users/${uid}/appointments`), (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setAppointments(list);
      }, (e) => handleFirestoreError(e, OperationType.LIST, `users/${uid}/appointments`));

      const unsubGoals = onSnapshot(collection(db, `users/${uid}/goals`), (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setGoals(list);
      }, (e) => handleFirestoreError(e, OperationType.LIST, `users/${uid}/goals`));

      const unsubVitals = onSnapshot(collection(db, `users/${uid}/vitals`), (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setVitals(list);
      }, (e) => handleFirestoreError(e, OperationType.LIST, `users/${uid}/vitals`));

      const unsubSymptoms = onSnapshot(collection(db, `users/${uid}/symptoms`), (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setSymptoms(list);
      }, (e) => handleFirestoreError(e, OperationType.LIST, `users/${uid}/symptoms`));

      const unsubHistory = onSnapshot(collection(db, `users/${uid}/medicalHistory`), (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setMedicalHistory(list);
      }, (e) => handleFirestoreError(e, OperationType.LIST, `users/${uid}/medicalHistory`));

      const unsubLifestyle = onSnapshot(collection(db, `users/${uid}/lifestyle`), (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setLifestyleLogs(list);
      }, (e) => handleFirestoreError(e, OperationType.LIST, `users/${uid}/lifestyle`));

      return () => {
        unsubEvents();
        unsubDocs();
        unsubMeds();
        unsubApts();
        unsubGoals();
        unsubVitals();
        unsubSymptoms();
        unsubHistory();
        unsubLifestyle();
      };
    } else if (guestUser) {
      try {
        const stored = localStorage.getItem(`helios_data_${guestUser.uid}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setHealthEvents(parsed.events || []);
          setDocuments(parsed.documents || []);
          const storedMeds = parsed.medications && parsed.medications.length > 0 ? parsed.medications : getInitialSampleMedications(guestUser.uid);
          setMedications(storedMeds);
          const storedApts = parsed.appointments && parsed.appointments.length > 0 ? parsed.appointments : getInitialSampleAppointments(guestUser.uid);
          setAppointments(storedApts);
          setGoals(parsed.goals || []);
          setVitals(parsed.vitals || []);
          setSymptoms(parsed.symptoms || []);
          setMedicalHistory(parsed.history || []);
          setLifestyleLogs(parsed.lifestyle || []);
          setTemporaryShares(parsed.shares || []);
        } else {
          setHealthEvents([]);
          setDocuments([]);
          setMedications(getInitialSampleMedications(guestUser.uid));
          setAppointments(getInitialSampleAppointments(guestUser.uid));
          setGoals([]);
          setVitals([]);
          setSymptoms([]);
          setMedicalHistory([]);
          setLifestyleLogs([]);
          setTemporaryShares([]);
        }
      } catch (e) {
        console.error('Guest load error:', e);
      }
      setLoading(false);
    }
  }, [user, guestUser, activeUser]);

  const syncGuestData = (override?: Record<string, any>) => {
    if (!guestUser) return;
    const payload = {
      events: override?.events ?? healthEvents,
      documents: override?.docs ?? documents,
      medications: override?.meds ?? medications,
      appointments: override?.apts ?? appointments,
      goals: override?.gls ?? goals,
      vitals: override?.vitals ?? vitals,
      symptoms: override?.symptoms ?? symptoms,
      history: override?.history ?? medicalHistory,
      lifestyle: override?.lifestyle ?? lifestyleLogs,
      shares: override?.shares ?? temporaryShares,
    };
    try {
      localStorage.setItem(`helios_data_${guestUser.uid}`, JSON.stringify(payload));
    } catch (e) {
      console.warn('Storage sync warn', e);
    }
  };

  // --- CRUD: Health Events ---
  const addHealthEvent = async (eventData: Omit<HealthEvent, 'id' | 'userId' | 'createdAt'>) => {
    if (!activeUser) throw new Error('Not authenticated');
    const id = 'evt_' + Math.random().toString(36).substring(2, 11);
    const newEvent: HealthEvent = {
      ...eventData,
      id,
      userId: activeUser.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'healthEvents', id), newEvent);
    } else {
      const updated = [newEvent, ...healthEvents].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setHealthEvents(updated);
      syncGuestData({ events: updated });
    }
    return id;
  };

  const deleteHealthEvent = async (id: string) => {
    if (!activeUser) return;
    if (user) {
      await deleteDoc(doc(db, 'users', user.uid, 'healthEvents', id));
    } else {
      const updated = healthEvents.filter((e) => e.id !== id);
      setHealthEvents(updated);
      syncGuestData({ events: updated });
    }
  };

  // --- CRUD: Documents ---
  const addDocument = async (docData: Omit<HealthDocument, 'id' | 'userId' | 'createdAt'>) => {
    if (!activeUser) throw new Error('Not authenticated');
    const id = 'doc_' + Math.random().toString(36).substring(2, 11);
    const newDoc: HealthDocument = {
      ...docData,
      id,
      userId: activeUser.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'documents', id), newDoc);
    } else {
      const updated = [newDoc, ...documents];
      setDocuments(updated);
      syncGuestData({ docs: updated });
    }

    // Auto-link to Timeline
    await addHealthEvent({
      title: newDoc.name,
      date: newDoc.uploadDate,
      type: newDoc.category === 'Blood Tests' ? 'Lab Test' : 'Check-up',
      documentName: newDoc.name,
      notes: newDoc.notes || `Uploaded file categorized as ${newDoc.category}`,
    });

    return id;
  };

  const deleteDocument = async (id: string) => {
    if (!activeUser) return;
    if (user) {
      await deleteDoc(doc(db, 'users', user.uid, 'documents', id));
    } else {
      const updated = documents.filter((d) => d.id !== id);
      setDocuments(updated);
      syncGuestData({ docs: updated });
    }
  };

  const updateDocumentStatus = async (id: string, status: HealthDocument['status']) => {
    if (!activeUser) return;
    if (user) {
      await setDoc(
        doc(db, 'users', user.uid, 'documents', id),
        { status, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } else {
      const updated = documents.map((d) => (d.id === id ? { ...d, status } : d));
      setDocuments(updated);
      syncGuestData({ docs: updated });
    }
  };

  // --- CRUD: Medications ---
  const addMedication = async (medData: Omit<Medication, 'id' | 'userId' | 'createdAt'>) => {
    if (!activeUser) throw new Error('Not authenticated');
    const id = 'med_' + Math.random().toString(36).substring(2, 11);
    const newMed: Medication = {
      ...medData,
      id,
      userId: activeUser.uid,
      adherenceLogs: [],
      sideEffects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'medications', id), newMed);
    } else {
      const updated = [newMed, ...medications];
      setMedications(updated);
      syncGuestData({ meds: updated });
    }

    // Add to timeline
    await addHealthEvent({
      title: `Medication Started: ${newMed.name} (${newMed.dosage})`,
      date: newMed.startDate || todayStr,
      type: 'Prescription',
      notes: `${newMed.frequency} · ${newMed.notes || ''}`,
    });

    return id;
  };

  const batchAddMedications = async (meds: Array<Omit<Medication, 'id' | 'userId' | 'createdAt'>>) => {
    for (const med of meds) {
      await addMedication(med);
    }
  };

  const deleteMedication = async (id: string) => {
    if (!activeUser) return;
    if (user) {
      await deleteDoc(doc(db, 'users', user.uid, 'medications', id));
    } else {
      const updated = medications.filter((m) => m.id !== id);
      setMedications(updated);
      syncGuestData({ meds: updated });
    }
  };

  const updateMedication = async (id: string, updates: Partial<Medication>) => {
    if (!activeUser) return;
    const updatedAt = new Date().toISOString();
    if (user) {
      await setDoc(
        doc(db, 'users', user.uid, 'medications', id),
        { ...updates, updatedAt },
        { merge: true }
      );
    } else {
      const updated = medications.map((m) => (m.id === id ? { ...m, ...updates, updatedAt } : m));
      setMedications(updated);
      syncGuestData({ meds: updated });
    }
  };

  const toggleMedicationActive = async (id: string, active: boolean) => {
    if (!activeUser) return;
    await updateMedication(id, { active });
  };

  const toggleMedicationReminder = async (id: string, reminderEnabled: boolean) => {
    if (!activeUser) return;
    await updateMedication(id, { reminderEnabled });
  };

  const recordDoseAction = async (
    medicationId: string,
    date: string,
    scheduledTime: string,
    status: 'taken' | 'skipped' | 'missed'
  ) => {
    if (!activeUser) return;
    const med = medications.find((m) => m.id === medicationId);
    if (!med) return;

    const existingLogs = med.adherenceLogs || [];
    // Remove existing log for this date and scheduled dose to prevent duplicate recording
    const filtered = existingLogs.filter((l) => {
      if (l.date !== date) return true;
      if (l.scheduledTime && l.scheduledTime === scheduledTime) return false;
      if (!l.scheduledTime && (med.scheduledTime === scheduledTime || !med.scheduledTime)) return false;
      return true;
    });

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const newLog: MedicationAdherenceLog = {
      date,
      scheduledTime,
      status,
      time: timeFormatted,
      recordedAt: now.toISOString(),
    };

    const newLogs = [...filtered, newLog];
    await updateMedication(medicationId, { adherenceLogs: newLogs });
  };

  const markMedicationStatus = async (id: string, status: 'taken' | 'missed') => {
    if (!activeUser) return;
    const med = medications.find((m) => m.id === id);
    if (!med) return;

    const existingLogs = med.adherenceLogs || [];
    const filtered = existingLogs.filter((l) => l.date !== todayStr);
    const newLogs = [...filtered, {
      date: todayStr,
      scheduledTime: med.scheduledTime || '09:00 AM',
      status,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recordedAt: new Date().toISOString(),
    }];

    await updateMedication(id, { adherenceLogs: newLogs });
  };

  const logMedicationSideEffect = async (
    id: string,
    sideEffect: { description: string; severity: 'mild' | 'moderate' | 'severe' }
  ) => {
    if (!activeUser) return;
    const med = medications.find((m) => m.id === id);
    if (!med) return;

    const entry = {
      date: todayStr,
      description: sideEffect.description,
      severity: sideEffect.severity,
    };
    const updatedSideEffects = [...(med.sideEffects || []), entry];

    if (user) {
      await setDoc(
        doc(db, 'users', user.uid, 'medications', id),
        { sideEffects: updatedSideEffects, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } else {
      const updated = medications.map((m) => (m.id === id ? { ...m, sideEffects: updatedSideEffects } : m));
      setMedications(updated);
      syncGuestData({ meds: updated });
    }

    // Also add to symptom log
    await addSymptom({
      symptom: `Side effect: ${sideEffect.description}`,
      severity: sideEffect.severity,
      date: todayStr,
      linkedMedicationId: id,
      notes: `Observed while taking ${med.name}`,
    });
  };

  // --- CRUD: Appointments ---
  const addAppointment = async (aptData: Omit<Appointment, 'id' | 'userId' | 'createdAt'>) => {
    if (!activeUser) throw new Error('Not authenticated');
    const id = 'apt_' + Math.random().toString(36).substring(2, 11);
    const newApt: Appointment = {
      ...aptData,
      id,
      userId: activeUser.uid,
      status: aptData.status || 'upcoming',
      reminderEnabled: aptData.reminderEnabled !== undefined ? aptData.reminderEnabled : true,
      reminderNotice: aptData.reminderNotice || '1 day before',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'appointments', id), newApt);
    } else {
      const updated = [newApt, ...appointments].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setAppointments(updated);
      syncGuestData({ apts: updated });
    }

    // Add to timeline
    await addHealthEvent({
      title: `Scheduled Consultation with ${newApt.doctorName}`,
      date: newApt.date,
      type: 'Consultation',
      notes: `${newApt.specialty} ${newApt.clinic ? '· ' + newApt.clinic : ''} · ${newApt.reason || 'Consultation'}`,
    });

    return id;
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    if (!activeUser) return;
    const updatedAt = new Date().toISOString();
    if (user) {
      await setDoc(
        doc(db, 'users', user.uid, 'appointments', id),
        { ...updates, updatedAt },
        { merge: true }
      );
    } else {
      const updated = appointments.map((a) => (a.id === id ? { ...a, ...updates, updatedAt } : a)).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setAppointments(updated);
      syncGuestData({ apts: updated });
    }
  };

  const toggleAppointmentReminder = async (
    id: string,
    reminderEnabled: boolean,
    reminderNotice?: Appointment['reminderNotice']
  ) => {
    const payload: Partial<Appointment> = { reminderEnabled };
    if (reminderNotice) {
      payload.reminderNotice = reminderNotice;
    }
    await updateAppointment(id, payload);
  };

  const deleteAppointment = async (id: string) => {
    if (!activeUser) return;
    if (user) {
      await deleteDoc(doc(db, 'users', user.uid, 'appointments', id));
    } else {
      const updated = appointments.filter((a) => a.id !== id);
      setAppointments(updated);
      syncGuestData({ apts: updated });
    }
  };

  const updateAppointmentPrep = async (id: string, prepNotes: string, questions?: string[]) => {
    if (!activeUser) return;
    if (user) {
      await setDoc(
        doc(db, 'users', user.uid, 'appointments', id),
        { prepNotes, questions: questions || [], updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } else {
      const updated = appointments.map((a) =>
        a.id === id ? { ...a, prepNotes, questions: questions || a.questions } : a
      );
      setAppointments(updated);
      syncGuestData({ apts: updated });
    }
  };

  // --- CRUD: Goals ---
  const addGoal = async (goalData: Omit<Goal, 'id' | 'userId' | 'createdAt'>) => {
    if (!activeUser) throw new Error('Not authenticated');
    const id = 'goal_' + Math.random().toString(36).substring(2, 11);
    const newGoal: Goal = {
      ...goalData,
      id,
      userId: activeUser.uid,
      currentProgress: goalData.currentProgress ?? 0,
      targetTotal: goalData.targetTotal ?? 5,
      unit: goalData.unit ?? 'days/week',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'goals', id), newGoal);
    } else {
      const updated = [newGoal, ...goals];
      setGoals(updated);
      syncGuestData({ gls: updated });
    }
    return id;
  };

  const deleteGoal = async (id: string) => {
    if (!activeUser) return;
    if (user) {
      await deleteDoc(doc(db, 'users', user.uid, 'goals', id));
    } else {
      const updated = goals.filter((g) => g.id !== id);
      setGoals(updated);
      syncGuestData({ gls: updated });
    }
  };

  const updateGoalStatus = async (id: string, status: Goal['status']) => {
    if (!activeUser) return;
    if (user) {
      await setDoc(
        doc(db, 'users', user.uid, 'goals', id),
        { status, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } else {
      const updated = goals.map((g) => (g.id === id ? { ...g, status } : g));
      setGoals(updated);
      syncGuestData({ gls: updated });
    }
  };

  const adjustGoalProgress = async (id: string, newProgress: number) => {
    if (!activeUser) return;
    if (user) {
      await setDoc(
        doc(db, 'users', user.uid, 'goals', id),
        { currentProgress: newProgress, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } else {
      const updated = goals.map((g) => (g.id === id ? { ...g, currentProgress: newProgress } : g));
      setGoals(updated);
      syncGuestData({ gls: updated });
    }
  };

  const adjustGoalTarget = async (id: string, newTarget: string, newTargetTotal?: number) => {
    if (!activeUser) return;
    const payload: Partial<Goal> = {
      target: newTarget,
      updatedAt: new Date().toISOString(),
    };
    if (newTargetTotal !== undefined) payload.targetTotal = newTargetTotal;

    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'goals', id), payload, { merge: true });
    } else {
      const updated = goals.map((g) => (g.id === id ? { ...g, ...payload } : g));
      setGoals(updated);
      syncGuestData({ gls: updated });
    }
  };

  // --- CRUD: Vitals ---
  const addVitalSign = async (vitalData: Omit<VitalSign, 'id' | 'userId' | 'createdAt'>) => {
    if (!activeUser) throw new Error('Not authenticated');
    const id = 'vit_' + Math.random().toString(36).substring(2, 11);
    const newVital: VitalSign = {
      ...vitalData,
      id,
      userId: activeUser.uid,
      createdAt: new Date().toISOString(),
    };

    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'vitals', id), newVital);
    } else {
      const updated = [newVital, ...vitals].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setVitals(updated);
      syncGuestData({ vitals: updated });
    }

    // Add to timeline as vital checkpoint
    const labelParts = [];
    if (newVital.systolicBP && newVital.diastolicBP) labelParts.push(`BP ${newVital.systolicBP}/${newVital.diastolicBP}`);
    if (newVital.heartRate) labelParts.push(`HR ${newVital.heartRate} bpm`);
    if (newVital.spo2) labelParts.push(`SpO₂ ${newVital.spo2}%`);

    await addHealthEvent({
      title: `Vitals Logged: ${labelParts.join(' · ') || 'Recorded'}`,
      date: newVital.date,
      type: 'Vital Signs',
      notes: newVital.notes || 'Recorded vital metrics checkpoint',
    });

    return id;
  };

  const deleteVitalSign = async (id: string) => {
    if (!activeUser) return;
    if (user) {
      await deleteDoc(doc(db, 'users', user.uid, 'vitals', id));
    } else {
      const updated = vitals.filter((v) => v.id !== id);
      setVitals(updated);
      syncGuestData({ vitals: updated });
    }
  };

  // --- CRUD: Symptoms ---
  const addSymptom = async (symptomData: Omit<SymptomEntry, 'id' | 'userId' | 'createdAt'>) => {
    if (!activeUser) throw new Error('Not authenticated');
    const id = 'sym_' + Math.random().toString(36).substring(2, 11);
    const newSymptom: SymptomEntry = {
      ...symptomData,
      id,
      userId: activeUser.uid,
      createdAt: new Date().toISOString(),
    };

    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'symptoms', id), newSymptom);
    } else {
      const updated = [newSymptom, ...symptoms].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setSymptoms(updated);
      syncGuestData({ symptoms: updated });
    }

    // Add to timeline
    await addHealthEvent({
      title: `Symptom Reported: ${newSymptom.symptom} (${newSymptom.severity})`,
      date: newSymptom.date,
      type: 'Symptom Note',
      notes: `${newSymptom.duration ? 'Duration: ' + newSymptom.duration + '. ' : ''}${newSymptom.notes || ''}`,
    });

    return id;
  };

  const deleteSymptom = async (id: string) => {
    if (!activeUser) return;
    if (user) {
      await deleteDoc(doc(db, 'users', user.uid, 'symptoms', id));
    } else {
      const updated = symptoms.filter((s) => s.id !== id);
      setSymptoms(updated);
      syncGuestData({ symptoms: updated });
    }
  };

  // --- CRUD: Medical History ---
  const addMedicalHistory = async (entry: Omit<MedicalHistoryEntry, 'id' | 'userId' | 'createdAt'>) => {
    if (!activeUser) throw new Error('Not authenticated');
    const id = 'his_' + Math.random().toString(36).substring(2, 11);
    const newEntry: MedicalHistoryEntry = {
      ...entry,
      id,
      userId: activeUser.uid,
      createdAt: new Date().toISOString(),
    };

    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'medicalHistory', id), newEntry);
    } else {
      const updated = [newEntry, ...medicalHistory];
      setMedicalHistory(updated);
      syncGuestData({ history: updated });
    }

    await addHealthEvent({
      title: `${newEntry.category}: ${newEntry.title}`,
      date: newEntry.yearOrDate || todayStr,
      type: 'Medical History',
      notes: newEntry.notes || 'Documented in personal medical background',
    });

    return id;
  };

  const deleteMedicalHistory = async (id: string) => {
    if (!activeUser) return;
    if (user) {
      await deleteDoc(doc(db, 'users', user.uid, 'medicalHistory', id));
    } else {
      const updated = medicalHistory.filter((h) => h.id !== id);
      setMedicalHistory(updated);
      syncGuestData({ history: updated });
    }
  };

  // --- Lifestyle Loggers (Water, Sleep, Activity) ---
  const getTodayLifestyle = (): DailyLifestyleLog => {
    const found = lifestyleLogs.find((l) => l.date === todayStr);
    return (
      found || {
        id: 'life_' + todayStr,
        userId: activeUser?.uid || 'guest',
        date: todayStr,
        waterGlasses: 0,
        sleepHours: 0,
        activityMinutes: 0,
      }
    );
  };

  const logWater = async (amountDelta: number) => {
    if (!activeUser) return;
    const current = getTodayLifestyle();
    const updatedValue = Math.max(0, (current.waterGlasses || 0) + amountDelta);
    const updatedLog: DailyLifestyleLog = {
      ...current,
      waterGlasses: updatedValue,
    };

    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'lifestyle', current.id), updatedLog);
    } else {
      const others = lifestyleLogs.filter((l) => l.date !== todayStr);
      const updated = [...others, updatedLog];
      setLifestyleLogs(updated);
      syncGuestData({ lifestyle: updated });
    }
  };

  const logSleep = async (hours: number, quality?: 'restful' | 'average' | 'poor') => {
    if (!activeUser) return;
    const current = getTodayLifestyle();
    const updatedLog: DailyLifestyleLog = {
      ...current,
      sleepHours: hours,
      sleepQuality: quality || current.sleepQuality,
    };

    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'lifestyle', current.id), updatedLog);
    } else {
      const others = lifestyleLogs.filter((l) => l.date !== todayStr);
      const updated = [...others, updatedLog];
      setLifestyleLogs(updated);
      syncGuestData({ lifestyle: updated });
    }
  };

  const logActivity = async (minutesDelta: number) => {
    if (!activeUser) return;
    const current = getTodayLifestyle();
    const updatedLog: DailyLifestyleLog = {
      ...current,
      activityMinutes: Math.max(0, (current.activityMinutes || 0) + minutesDelta),
    };

    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'lifestyle', current.id), updatedLog);
    } else {
      const others = lifestyleLogs.filter((l) => l.date !== todayStr);
      const updated = [...others, updatedLog];
      setLifestyleLogs(updated);
      syncGuestData({ lifestyle: updated });
    }
  };

  // --- Temporary Health Share (24-Hour Doctor Share) ---
  const createHealthShare = async (
    sections: TemporaryHealthShare['sections'],
    doctorNote?: string
  ): Promise<TemporaryHealthShare> => {
    if (!activeUser) throw new Error('Not authenticated');
    const shareId = 'shr_' + Math.random().toString(36).substring(2, 11);
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const newShare: TemporaryHealthShare = {
      id: shareId,
      userId: activeUser.uid,
      token,
      createdAt: now.toISOString(),
      expiresAt,
      active: true,
      sections,
      accessCount: 0,
      doctorNote,
    };

    // Store in global healthShares collection for doctor access
    await setDoc(doc(db, 'healthShares', shareId), {
      ...newShare,
      snapshot: {
        reports: sections.reports ? documents.slice(0, 10) : [],
        medications: sections.medications ? medications.filter((m) => m.active) : [],
        symptoms: sections.symptoms ? symptoms.slice(0, 5) : [],
        vitals: sections.vitals ? vitals.slice(0, 5) : [],
        events: sections.oldRecords ? healthEvents.slice(0, 10) : [],
      },
    });

    const updated = [newShare, ...temporaryShares];
    setTemporaryShares(updated);
    syncGuestData({ shares: updated });
    return newShare;
  };

  const revokeHealthShare = async (shareId: string) => {
    if (!activeUser) return;
    try {
      await deleteDoc(doc(db, 'healthShares', shareId));
    } catch (e) {
      console.warn('Share delete warn', e);
    }
    const updated = temporaryShares.filter((s) => s.id !== shareId);
    setTemporaryShares(updated);
    syncGuestData({ shares: updated });
  };

  // --- Signals & AI Alerts ---
  const healthSignals = useMemo<HealthSignal[]>(() => {
    const list: HealthSignal[] = [];

    // 1. Upcoming appointment within 48h
    const upcomingApt = appointments.find((a) => {
      if (a.status !== 'upcoming') return false;
      const aptTime = new Date(a.date).getTime();
      const diffHours = (aptTime - Date.now()) / (1000 * 60 * 60);
      return diffHours > -12 && diffHours < 48;
    });
    if (upcomingApt) {
      list.push({
        id: 'sig_apt_' + upcomingApt.id,
        userId: activeUser?.uid || '',
        type: 'upcoming_appointment',
        title: `Appointment with ${upcomingApt.doctorName}`,
        description: `Scheduled for ${upcomingApt.date}${upcomingApt.time ? ' at ' + upcomingApt.time : ''}. HELIOS has a 1-minute doctor briefing ready.`,
        status: 'active',
        createdAt: new Date().toISOString(),
        linkRoute: 'appointments',
      });
    }

    // 2. Pending Document review
    const pendingDoc = documents.find((d) => d.status === 'pending_review');
    if (pendingDoc) {
      list.push({
        id: 'sig_doc_' + pendingDoc.id,
        userId: activeUser?.uid || '',
        type: 'document_review',
        title: `Document Awaiting Review: ${pendingDoc.name}`,
        description: 'You uploaded a document. Copilot can scan and extract key biomarkers in plain language.',
        status: 'active',
        createdAt: new Date().toISOString(),
        linkRoute: 'reports',
      });
    }

    // 3. Active medications reminder
    const activeMeds = medications.filter((m) => m.active);
    if (activeMeds.length > 0) {
      const todayUntaken = activeMeds.filter(
        (m) => !(m.adherenceLogs || []).some((l) => l.date === todayStr && l.status === 'taken')
      );
      if (todayUntaken.length > 0) {
        list.push({
          id: 'sig_meds_due',
          userId: activeUser?.uid || '',
          type: 'medication_reminder',
          title: `${todayUntaken.length} Scheduled Medication${todayUntaken.length > 1 ? 's' : ''} Due Today`,
          description: `Includes ${todayUntaken.map((m) => m.name).slice(0, 2).join(', ')}. Tap to mark taken.`,
          status: 'active',
          createdAt: new Date().toISOString(),
          linkRoute: 'medications',
        });
      }
    }

    // 4. Inactive goals check
    const strugglingGoal = goals.find(
      (g) => g.status === 'active' && (g.currentProgress ?? 0) === 0
    );
    if (strugglingGoal) {
      list.push({
        id: 'sig_goal_' + strugglingGoal.id,
        userId: activeUser?.uid || '',
        type: 'inactive_goal',
        title: `Adaptive Goal Recommendation: ${strugglingGoal.title}`,
        description: 'You haven\'t logged progress this week. Would you like to adjust the target?',
        status: 'active',
        createdAt: new Date().toISOString(),
        linkRoute: 'goals',
      });
    }

    return list;
  }, [appointments, documents, medications, goals, todayStr, activeUser]);

  // --- Clear / Wipe Account Data ---
  const clearAllUserData = async () => {
    if (!activeUser) return;
    if (user) {
      for (const e of healthEvents) await deleteDoc(doc(db, 'users', user.uid, 'healthEvents', e.id)).catch(() => {});
      for (const d of documents) await deleteDoc(doc(db, 'users', user.uid, 'documents', d.id)).catch(() => {});
      for (const m of medications) await deleteDoc(doc(db, 'users', user.uid, 'medications', m.id)).catch(() => {});
      for (const a of appointments) await deleteDoc(doc(db, 'users', user.uid, 'appointments', a.id)).catch(() => {});
      for (const g of goals) await deleteDoc(doc(db, 'users', user.uid, 'goals', g.id)).catch(() => {});
      for (const v of vitals) await deleteDoc(doc(db, 'users', user.uid, 'vitals', v.id)).catch(() => {});
      for (const s of symptoms) await deleteDoc(doc(db, 'users', user.uid, 'symptoms', s.id)).catch(() => {});
      for (const h of medicalHistory) await deleteDoc(doc(db, 'users', user.uid, 'medicalHistory', h.id)).catch(() => {});
      for (const l of lifestyleLogs) await deleteDoc(doc(db, 'users', user.uid, 'lifestyle', l.id)).catch(() => {});
    }
    setHealthEvents([]);
    setDocuments([]);
    setMedications([]);
    setAppointments([]);
    setGoals([]);
    setVitals([]);
    setSymptoms([]);
    setMedicalHistory([]);
    setLifestyleLogs([]);
    setTemporaryShares([]);
    if (guestUser) {
      localStorage.removeItem(`helios_data_${guestUser.uid}`);
    }
  };

  // --- Export Data ---
  const exportAllUserData = () => {
    const payload = {
      exportDate: new Date().toISOString(),
      user: { uid: activeUser?.uid, email: activeUser?.email },
      disclaimer: 'HELIOS personal export. Educational healthcare custody.',
      healthEvents,
      documents: documents.map((d) => ({ ...d, fileData: d.fileData ? '[base64 attached]' : undefined })),
      medications,
      appointments,
      goals,
      vitals,
      symptoms,
      medicalHistory,
      lifestyleLogs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `helios_health_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <HealthDataContext.Provider
      value={{
        healthEvents,
        documents,
        medications,
        appointments,
        goals,
        vitals,
        symptoms,
        medicalHistory,
        lifestyleLogs,
        temporaryShares,
        healthSignals,
        loading,
        addHealthEvent,
        deleteHealthEvent,
        addDocument,
        deleteDocument,
        updateDocumentStatus,
        addMedication,
        updateMedication,
        batchAddMedications,
        deleteMedication,
        toggleMedicationActive,
        toggleMedicationReminder,
        markMedicationStatus,
        recordDoseAction,
        logMedicationSideEffect,
        addAppointment,
        updateAppointment,
        toggleAppointmentReminder,
        deleteAppointment,
        updateAppointmentPrep,
        addGoal,
        deleteGoal,
        updateGoalStatus,
        adjustGoalProgress,
        adjustGoalTarget,
        addVitalSign,
        deleteVitalSign,
        addSymptom,
        deleteSymptom,
        addMedicalHistory,
        deleteMedicalHistory,
        logWater,
        logSleep,
        logActivity,
        getTodayLifestyle,
        createHealthShare,
        revokeHealthShare,
        clearAllUserData,
        exportAllUserData,
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
}

export function useHealthData() {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
}
