export type EventType =
  | 'Check-up'
  | 'Lab Test'
  | 'Prescription'
  | 'Care'
  | 'Follow-up'
  | 'Surgery'
  | 'Vaccination'
  | 'Symptom Note'
  | 'Consultation'
  | 'Vital Signs'
  | 'Medical History';

export interface HealthEvent {
  id: string;
  userId: string;
  title: string;
  date: string;
  type: EventType | string;
  notes?: string;
  documentName?: string;
  meta?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export type DocumentCategory =
  | 'Blood Tests'
  | 'Prescriptions'
  | 'X-Rays / Scans'
  | 'Vaccinations'
  | 'Doctor Notes'
  | 'Medical Bills'
  | 'General';

export interface Biomarker {
  test: string;
  result: string;
  unit?: string;
  referenceRange: string;
  status: 'Within reference range' | 'Review with clinician' | 'Pending';
}

export interface HealthDocument {
  id: string;
  userId: string;
  name: string;
  type: string;
  category: DocumentCategory;
  size: number;
  fileData?: string;
  notes?: string;
  uploadDate: string;
  extractedSummary?: string;
  extractedBiomarkers?: Biomarker[];
  status: 'pending_review' | 'reviewed' | 'saved';
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicationAdherenceLog {
  date: string; // YYYY-MM-DD
  status: 'taken' | 'skipped' | 'missed';
  time?: string;
  scheduledTime?: string;
  recordedAt?: string;
}

export interface MedicationSideEffect {
  date: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  pillsCount?: string; // e.g. '1 tablet', '2 capsules'
  category?: string; // Prescribed condition or category, e.g. 'Hypertension', 'Cardiovascular'
  frequency: string; // 'Daily' | 'Selected days'
  selectedDays?: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  scheduledTime?: string; // e.g. '09:00 AM'
  scheduledTimes?: string[]; // e.g. ['09:00 AM', '10:00 PM']
  foodInstruction?: 'Before meal' | 'After meal' | 'With food' | 'No specific food instruction';
  timing?: 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Bedtime' | 'As needed';
  duration?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  instructions?: string;
  reminderEnabled?: boolean;
  active: boolean;
  adherenceLogs?: MedicationAdherenceLog[];
  sideEffects?: MedicationSideEffect[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Appointment {
  id: string;
  userId: string;
  doctorName: string;
  specialty: string;
  clinic?: string;
  date: string;
  time?: string;
  location?: string;
  reason?: string;
  notes?: string;
  relatedReportIds?: string[];
  status: 'upcoming' | 'completed' | 'cancelled';
  prepNotes?: string;
  questions?: string[];
  reminderEnabled?: boolean;
  reminderNotice?: '1 day before' | '2 hours before' | '1 hour before' | '15 minutes before' | 'At appointment time';
  reminderCustomMinutes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  category?: 'activity' | 'hydration' | 'sleep' | 'nutrition' | 'mindfulness' | 'general';
  description?: string;
  target?: string;
  currentProgress?: number; // e.g. 4
  targetTotal?: number; // e.g. 5
  unit?: string; // e.g. 'days/week', 'glasses/day', 'hours/night'
  adaptiveSuggestion?: string;
  startDate?: string;
  reminder?: string;
  status: 'active' | 'completed' | 'paused';
  createdAt?: string;
  updatedAt?: string;
}

export interface VitalSign {
  id: string;
  userId: string;
  date: string;
  time?: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  temperature?: number;
  tempUnit?: 'F' | 'C';
  spo2?: number;
  bloodGlucose?: number;
  notes?: string;
  createdAt?: string;
}

export interface SymptomEntry {
  id: string;
  userId: string;
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  date: string;
  time?: string;
  duration?: string;
  notes?: string;
  triggers?: string;
  linkedMedicationId?: string;
  createdAt?: string;
}

export interface MedicalHistoryEntry {
  id: string;
  userId: string;
  category: 'Chronic Condition' | 'Past Surgery' | 'Allergy' | 'Family History';
  title: string;
  yearOrDate: string;
  notes?: string;
  createdAt?: string;
}

export interface DailyLifestyleLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  waterGlasses: number;
  sleepHours: number;
  sleepQuality?: 'restful' | 'average' | 'poor';
  activityMinutes: number;
  notes?: string;
  createdAt?: string;
}

export interface TemporaryHealthShare {
  id: string;
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string; // 24 hours later
  active: boolean;
  sections: {
    reports: boolean;
    medications: boolean;
    symptoms: boolean;
    vitals: boolean;
    oldRecords: boolean;
  };
  accessCode?: string;
  accessCount: number;
  doctorNote?: string;
}

export interface PersonalExplorerPattern {
  id: string;
  title: string;
  observation: string;
  category: 'sleep_symptom' | 'activity_trend' | 'adherence' | 'vital_stability';
  badge: string;
  icon: string;
  recommendationNote: string;
  detectedDate: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  mode?: 'ask' | 'compare' | 'summarize' | 'prep' | 'safety';
  timestamp: string;
}

export interface HealthSignal {
  id: string;
  userId: string;
  type: 'upcoming_appointment' | 'document_review' | 'medication_reminder' | 'inactive_goal' | 'vital_alert';
  title: string;
  description: string;
  status: 'active' | 'dismissed';
  createdAt: string;
  linkRoute?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt?: string;
}
