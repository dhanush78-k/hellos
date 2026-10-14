import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  FileText,
  Pill,
  Syringe,
  Stethoscope,
  FlaskConical,
  HeartPulse,
  AlertCircle,
  History,
  Camera,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  Upload,
  ArrowRight,
  Layers,
  Calendar,
  Clock,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { playChime } from '../../lib/audio';
import { EventType, DocumentCategory } from '../../types';

interface AddHealthRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

type TabType =
  | 'report'
  | 'prescription'
  | 'vitals'
  | 'symptom'
  | 'consultation'
  | 'vaccination'
  | 'lab'
  | 'history';

export function AddHealthRecordModal({
  isOpen,
  onClose,
  initialTab = 'prescription',
}: AddHealthRecordModalProps) {
  const {
    addHealthEvent,
    addDocument,
    addMedication,
    batchAddMedications,
    addVitalSign,
    addSymptom,
    addAppointment,
    addMedicalHistory,
  } = useHealthData();

  const [activeTab, setActiveTab] = useState<TabType>('prescription');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // --- Form States ---
  // 1. Prescription & AI Auto-Organize
  const [prescriptionInputMode, setPrescriptionInputMode] = useState<'camera' | 'upload' | 'text'>('camera');
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [prescriptionFileName, setPrescriptionFileName] = useState('');
  const [prescriptionDoctorName, setPrescriptionDoctorName] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');
  const [autoOrganizedMeds, setAutoOrganizedMeds] = useState<any[]>([]);
  const [autoOrganizeNotes, setAutoOrganizeNotes] = useState('');

  // 2. Report Upload
  const [docFile, setDocFile] = useState<{ name: string; type: string; size: number; data?: string } | null>(null);
  const [docCategory, setDocCategory] = useState<DocumentCategory>('Blood Tests');
  const [docNotes, setDocNotes] = useState('');

  // 3. Vitals
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [spo2, setSpo2] = useState('');
  const [vitalNotes, setVitalNotes] = useState('');

  // 4. Symptoms
  const [symptomName, setSymptomName] = useState('');
  const [symptomSeverity, setSymptomSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [symptomDuration, setSymptomDuration] = useState('');
  const [symptomNotes, setSymptomNotes] = useState('');

  // 5. Consultation
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [clinic, setClinic] = useState('');
  const [consultationDate, setConsultationDate] = useState(new Date().toISOString().split('T')[0]);
  const [consultationNotes, setConsultationNotes] = useState('');

  // 6. Vaccination
  const [vaccineName, setVaccineName] = useState('');
  const [doseNumber, setDoseNumber] = useState('Dose 1');
  const [vaccineClinic, setVaccineClinic] = useState('');
  const [vaccineDate, setVaccineDate] = useState(new Date().toISOString().split('T')[0]);

  // 7. Medical History
  const [historyCategory, setHistoryCategory] = useState<'Chronic Condition' | 'Past Surgery' | 'Allergy' | 'Family History'>('Chronic Condition');
  const [historyTitle, setHistoryTitle] = useState('');
  const [historyYear, setHistoryYear] = useState('');
  const [historyNotes, setHistoryNotes] = useState('');

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }
    if (initialTab === 'prescription-camera' || initialTab === 'prescription-scan') {
      setActiveTab('prescription');
      setPrescriptionInputMode('camera');
      setTimeout(() => startCamera(), 120);
    } else if (initialTab === 'prescription-upload') {
      setActiveTab('prescription');
      setPrescriptionInputMode('upload');
    } else if (initialTab) {
      setActiveTab(initialTab as TabType);
    }
  }, [initialTab, isOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (activeTab === 'prescription') {
          setPrescriptionText((prev) => prev + ' ' + transcript);
        } else if (activeTab === 'symptom') {
          setSymptomNotes((prev) => prev + ' ' + transcript);
        } else if (activeTab === 'consultation') {
          setConsultationNotes((prev) => prev + ' ' + transcript);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [activeTab]);

  const toggleVoice = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      playChime(380);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        playChime(580);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Camera Handler
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      setCameraActive(false);
    }
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg');
      setCapturedImage(base64);

      if (activeTab === 'prescription') {
        setPrescriptionImage(base64);
        setPrescriptionFileName(`Doctor_Prescription_${new Date().toISOString().slice(0, 10)}.jpg`);
        playChime(620);
        // Automatically analyze prescription snapshot with AI
        handleAutoOrganizePrescription(base64);
      } else {
        setDocFile({
          name: `Camera_Scan_${new Date().toISOString().slice(0, 10)}.jpg`,
          type: 'image/jpeg',
          size: Math.round(base64.length * 0.75),
          data: base64,
        });
        playChime(620);
      }
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // AI Auto-Organize Execution
  const handleAutoOrganizePrescription = async (imageOverride?: string) => {
    const targetImage = imageOverride || prescriptionImage;
    if (!prescriptionText.trim() && !targetImage) return;

    setLoading(true);
    playChime(540);
    try {
      const res = await fetch('/api/ai/auto-organize-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: prescriptionText,
          imageBase64: targetImage || undefined,
        }),
      });
      const data = await res.json();
      if (data.organized?.medications) {
        setAutoOrganizedMeds(data.organized.medications);
        setAutoOrganizeNotes(data.organized.consultationNotes || data.organized.summary);
        if (data.organized.doctorName) {
          setPrescriptionDoctorName(data.organized.doctorName);
        }
        playChime(740);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Save Handlers
  const handleSavePrescription = async () => {
    setLoading(true);
    try {
      if (autoOrganizedMeds.length > 0) {
        for (const m of autoOrganizedMeds) {
          await addMedication({
            name: m.name,
            dosage: m.dosage || 'Standard dose',
            frequency: m.frequency || 'Daily',
            timing: m.timing || 'Morning',
            duration: m.duration || 'Ongoing',
            notes: m.instructions || autoOrganizeNotes,
            active: true,
          });
        }
      } else if (prescriptionText) {
        // Fallback single entry
        await addMedication({
          name: prescriptionText.slice(0, 30),
          dosage: 'As prescribed',
          frequency: 'Daily',
          timing: 'Morning',
          duration: 'Ongoing',
          notes: prescriptionText,
          active: true,
        });
      }

      // Securely store prescription scan in Vault if provided
      if (prescriptionImage) {
        await addDocument({
          name: prescriptionFileName || `Doctor Prescription (${new Date().toLocaleDateString()})`,
          category: 'Prescriptions',
          type: 'image/jpeg',
          size: Math.round(prescriptionImage.length * 0.75),
          fileData: prescriptionImage,
          extractedSummary: autoOrganizeNotes || `Extracted ${autoOrganizedMeds.length} prescription medications.`,
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'saved',
        });
      }

      // Add to Health Journey Timeline
      await addHealthEvent({
        date: new Date().toISOString().split('T')[0],
        type: 'Prescription',
        title: `Prescription: ${autoOrganizedMeds.map((m) => m.name).join(', ') || 'New Prescribed Medicine'}`,
        notes: autoOrganizeNotes || 'Doctor prescription scanned and processed.',
        documentName: prescriptionFileName || 'Doctor Prescription Scan',
        meta: {
          doctor: prescriptionDoctorName || 'Physician',
          medications: autoOrganizedMeds,
        },
      });

      playChime(680);
      setSuccessMsg('Doctor prescription successfully scanned, organized & recorded!');
      setTimeout(() => {
        onClose();
        resetForms();
      }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVitals = async () => {
    setLoading(true);
    try {
      await addVitalSign({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        systolicBP: systolic ? Number(systolic) : undefined,
        diastolicBP: diastolic ? Number(diastolic) : undefined,
        heartRate: heartRate ? Number(heartRate) : undefined,
        temperature: temperature ? Number(temperature) : undefined,
        spo2: spo2 ? Number(spo2) : undefined,
        notes: vitalNotes,
      });
      playChime(680);
      setSuccessMsg('Vitals saved to personal journey.');
      setTimeout(() => {
        onClose();
        resetForms();
      }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSymptom = async () => {
    if (!symptomName.trim()) return;
    setLoading(true);
    try {
      await addSymptom({
        symptom: symptomName,
        severity: symptomSeverity,
        duration: symptomDuration,
        notes: symptomNotes,
        date: new Date().toISOString().split('T')[0],
      });
      playChime(680);
      setSuccessMsg('Symptom observation recorded.');
      setTimeout(() => {
        onClose();
        resetForms();
      }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConsultation = async () => {
    if (!doctorName.trim()) return;
    setLoading(true);
    try {
      await addAppointment({
        doctorName,
        specialty: specialty || 'Primary Care',
        clinic,
        date: consultationDate,
        notes: consultationNotes,
        status: 'upcoming',
      });
      playChime(680);
      setSuccessMsg('Doctor consultation logged.');
      setTimeout(() => {
        onClose();
        resetForms();
      }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVaccination = async () => {
    if (!vaccineName.trim()) return;
    setLoading(true);
    try {
      await addHealthEvent({
        title: `Vaccination: ${vaccineName} (${doseNumber})`,
        date: vaccineDate,
        type: 'Vaccination',
        notes: `Administered at ${vaccineClinic || 'Clinic'}.`,
      });
      playChime(680);
      setSuccessMsg('Vaccination record preserved.');
      setTimeout(() => {
        onClose();
        resetForms();
      }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMedicalHistory = async () => {
    if (!historyTitle.trim()) return;
    setLoading(true);
    try {
      await addMedicalHistory({
        category: historyCategory,
        title: historyTitle,
        yearOrDate: historyYear || 'Historical',
        notes: historyNotes,
      });
      playChime(680);
      setSuccessMsg('Medical history entry recorded.');
      setTimeout(() => {
        onClose();
        resetForms();
      }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!docFile) return;
    setLoading(true);
    try {
      await addDocument({
        name: docFile.name,
        type: docFile.type,
        category: docCategory,
        size: docFile.size,
        fileData: docFile.data,
        uploadDate: new Date().toISOString().split('T')[0],
        notes: docNotes,
        status: 'pending_review',
      });
      playChime(680);
      setSuccessMsg('Document securely saved to Health Vault.');
      setTimeout(() => {
        onClose();
        resetForms();
      }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setSuccessMsg('');
    setPrescriptionText('');
    setPrescriptionImage(null);
    setPrescriptionFileName('');
    setPrescriptionDoctorName('');
    setAutoOrganizedMeds([]);
    setAutoOrganizeNotes('');
    setDocFile(null);
    setCapturedImage(null);
    setSystolic('');
    setDiastolic('');
    setHeartRate('');
    setTemperature('');
    setSpo2('');
    setSymptomName('');
    setDoctorName('');
    setVaccineName('');
    setHistoryTitle('');
    stopCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl glass-panel border border-cyan-500/30 p-5 sm:p-7 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                Add Health Record
              </h3>
              <p className="text-xs text-slate-400 font-light">
                One unified gateway for your sovereign health journey.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playChime(420);
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills Navigation */}
        <div className="py-3.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-white/[0.06]">
          {[
            { id: 'prescription', label: 'Doctor Prescription (AI Scan)', icon: Camera },
            { id: 'report', label: 'Medical Report', icon: FileText },
            { id: 'vitals', label: 'Vital Signs', icon: HeartPulse },
            { id: 'symptom', label: 'Symptom Note', icon: AlertCircle },
            { id: 'consultation', label: 'Consultation', icon: Stethoscope },
            { id: 'vaccination', label: 'Vaccination', icon: Syringe },
            { id: 'history', label: 'Medical History', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playChime(500);
                  setActiveTab(tab.id as TabType);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSel
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 font-semibold'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="my-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Body content based on active tab */}
        <div className="py-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: Prescription & AI Auto-Organize */}
          {activeTab === 'prescription' && (
            <div className="space-y-4">
              {/* Header Intro Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-cyan-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Camera className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-heading">
                        Doctor Prescription Scanner
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                        AI Vision
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-light mt-0.5">
                      Extracts medicines, dosages, frequencies & timings directly into your schedule.
                    </p>
                  </div>
                </div>

                {/* Mode Selector */}
                <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-white/[0.08] shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      playChime(500);
                      setPrescriptionInputMode('camera');
                      if (!cameraActive && !prescriptionImage) startCamera();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      prescriptionInputMode === 'camera'
                        ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Camera Scan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playChime(500);
                      setPrescriptionInputMode('upload');
                      stopCamera();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      prescriptionInputMode === 'upload'
                        ? 'bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playChime(500);
                      setPrescriptionInputMode('text');
                      stopCamera();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      prescriptionInputMode === 'text'
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Text / Voice</span>
                  </button>
                </div>
              </div>

              {/* MODE 1: Camera Live Scan */}
              {prescriptionInputMode === 'camera' && (
                <div className="space-y-3">
                  {cameraActive ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-black shadow-xl">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                      {/* Scanning frame overlay */}
                      <div className="absolute inset-4 border border-dashed border-emerald-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                        <span className="text-[10px] font-mono text-emerald-300 bg-black/60 px-2 py-0.5 rounded w-max">
                          Rx Targeting Box
                        </span>
                        <span className="text-[10px] text-center text-slate-300 bg-black/60 px-2 py-1 rounded">
                          Hold doctor prescription steady in good lighting
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                        <button
                          type="button"
                          onClick={captureSnapshot}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-2 hover:scale-[1.02] transition-transform"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Capture & Scan Prescription</span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/20 text-slate-300 text-xs font-semibold hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : prescriptionImage ? (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prescriptionImage}
                          alt="Prescription Scan"
                          className="w-20 h-20 rounded-xl object-cover border border-emerald-500/30"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-white">
                              {prescriptionFileName || 'Prescription Image Captured'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Ready for AI clinical extraction
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAutoOrganizePrescription(prescriptionImage)}
                          disabled={loading}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        >
                          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                          <span>{loading ? 'Analyzing...' : 'Scan with AI'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPrescriptionImage(null);
                            startCamera();
                          }}
                          className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold"
                        >
                          Retake
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        playChime(500);
                        startCamera();
                      }}
                      className="border-2 border-dashed border-emerald-500/30 hover:border-emerald-400/60 rounded-2xl p-7 text-center cursor-pointer transition-all bg-emerald-950/10 hover:bg-emerald-950/20"
                    >
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 mb-3 shadow-lg shadow-emerald-500/20">
                        <Camera className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-white block">
                        Start Camera Scanner
                      </span>
                      <span className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1 block font-light">
                        Point camera at your physical doctor prescription. AI automatically transcribes medication names, dosages, and durations.
                      </span>
                      <button
                        type="button"
                        className="mt-3 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Launch Camera</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: File Upload (PDF / Image) */}
              {prescriptionInputMode === 'upload' && (
                <div className="space-y-3">
                  {prescriptionImage ? (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {prescriptionFileName || 'Prescription Document'}
                          </span>
                          <span className="text-[11px] text-emerald-400 font-mono block mt-0.5">
                            File attached · Ready to scan
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAutoOrganizePrescription(prescriptionImage)}
                          disabled={loading}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                        >
                          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                          <span>{loading ? 'Analyzing...' : 'Scan with AI'}</span>
                        </button>
                        <label className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold cursor-pointer">
                          <span>Replace</span>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  const base64 = reader.result as string;
                                  setPrescriptionImage(base64);
                                  setPrescriptionFileName(f.name);
                                  handleAutoOrganizePrescription(base64);
                                };
                                reader.readAsDataURL(f);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/60 rounded-2xl p-7 text-center cursor-pointer transition-all bg-cyan-950/10 hover:bg-cyan-950/20 block">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mb-3 shadow-lg shadow-cyan-500/20">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-white block">
                        Upload Doctor Prescription
                      </span>
                      <span className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1 block font-light">
                        Select a scanned prescription file or photo (PDF, JPG, PNG). AI will extract drug details instantly.
                      </span>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              const base64 = reader.result as string;
                              setPrescriptionImage(base64);
                              setPrescriptionFileName(f.name);
                              playChime(560);
                              handleAutoOrganizePrescription(base64);
                            };
                            reader.readAsDataURL(f);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              )}

              {/* MODE 3: Voice / Text */}
              {prescriptionInputMode === 'text' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-slate-300">
                        Prescription Directives or Doctor Notes
                      </label>
                      <div className="flex items-center gap-2">
                        {speechSupported && (
                          <button
                            type="button"
                            onClick={toggleVoice}
                            className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
                              isListening
                                ? 'bg-rose-500 text-white animate-pulse'
                                : 'bg-white/[0.04] text-slate-300 hover:text-white'
                            }`}
                          >
                            {isListening ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3 text-cyan-400" />}
                            <span>{isListening ? 'Listening...' : 'Voice Dictation'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      value={prescriptionText}
                      onChange={(e) => setPrescriptionText(e.target.value)}
                      placeholder="e.g. Rx: Amoxicillin 500mg, 1 capsule 3 times daily for 10 days after food. Also Atorvastatin 20mg at bedtime."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAutoOrganizePrescription()}
                      disabled={loading || !prescriptionText.trim()}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>Auto-Organize with AI</span>
                    </button>
                  </div>
                </div>
              )}

              {/* AI Processing Status Indicator */}
              {loading && (
                <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center gap-3 animate-pulse">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      HELIOS Clinical Vision In Progress...
                    </span>
                    <span className="text-[11px] text-slate-300 font-light">
                      Deciphering clinician notes, dosages, frequencies, and administration schedule.
                    </span>
                  </div>
                </div>
              )}

              {/* Staged Extracted Medications */}
              {autoOrganizedMeds.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl glass-panel-active border border-emerald-500/40 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300 uppercase font-heading tracking-wider">
                        Extracted Medications ({autoOrganizedMeds.length})
                      </span>
                    </div>
                    {prescriptionDoctorName && (
                      <span className="text-[11px] font-mono text-cyan-300">
                        Prescribed by: {prescriptionDoctorName}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {autoOrganizedMeds.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {m.name}
                            </span>
                            <span className="text-[11px] font-mono px-2 py-0.2 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                              {m.dosage}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-light">
                            {m.frequency} · {m.timing || 'Daily'} · {m.duration || 'Ongoing'}
                            {m.instructions ? ` · ${m.instructions}` : ''}
                          </p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      </div>
                    ))}
                  </div>

                  {autoOrganizeNotes && (
                    <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-slate-300">
                      <strong className="text-cyan-300 font-mono">Doctor Directives:</strong> {autoOrganizeNotes}
                    </div>
                  )}
                </div>
              )}

              {/* Confirm / Save Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSavePrescription}
                  disabled={loading || (!prescriptionText && !prescriptionImage && autoOrganizedMeds.length === 0)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {autoOrganizedMeds.length > 0
                      ? `Confirm & Add ${autoOrganizedMeds.length} Medication${autoOrganizedMeds.length > 1 ? 's' : ''} to Schedule`
                      : 'Confirm & Add to Medications'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Medical Report & Camera Scan */}
          {activeTab === 'report' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Upload box */}
                <label className="border-2 border-dashed border-white/[0.1] hover:border-cyan-400/50 rounded-2xl p-5 text-center cursor-pointer transition-colors block">
                  <Upload className="w-6 h-6 mx-auto text-cyan-400 mb-2" />
                  <span className="text-xs font-semibold text-white block">
                    Upload PDF or Image
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Blood tests, ultrasound, radiology reports
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setDocFile({
                            name: f.name,
                            type: f.type,
                            size: f.size,
                            data: reader.result as string,
                          });
                        };
                        reader.readAsDataURL(f);
                        playChime(520);
                      }
                    }}
                  />
                </label>

                {/* Camera Scan Box */}
                <div
                  onClick={() => {
                    playChime(480);
                    startCamera();
                  }}
                  className="border-2 border-dashed border-white/[0.1] hover:border-indigo-400/50 rounded-2xl p-5 text-center cursor-pointer transition-colors flex flex-col items-center justify-center"
                >
                  <Camera className="w-6 h-6 text-indigo-400 mb-2" />
                  <span className="text-xs font-semibold text-white block">
                    Scan with Camera
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Snap physical prescription or lab paper
                  </span>
                </div>
              </div>

              {/* Camera Live Viewfinder */}
              {cameraActive && (
                <div className="relative rounded-2xl overflow-hidden border border-cyan-400/50 bg-black">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-56 object-cover" />
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={captureSnapshot}
                      className="px-5 py-2 rounded-xl bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/30"
                    >
                      Capture Photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Selected File Card */}
              {docFile && (
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <div>
                      <span className="text-xs font-semibold text-white block">{docFile.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(docFile.size / 1024).toFixed(1)} KB · Staged for Vault
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDocFile(null)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Folder Category
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Blood Tests">Blood Tests</option>
                    <option value="Prescriptions">Prescriptions</option>
                    <option value="X-Rays / Scans">X-Rays / Scans</option>
                    <option value="Vaccinations">Vaccinations</option>
                    <option value="Doctor Notes">Doctor Notes</option>
                    <option value="Medical Bills">Medical Bills</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Notes / Provider
                  </label>
                  <input
                    type="text"
                    value={docNotes}
                    onChange={(e) => setDocNotes(e.target.value)}
                    placeholder="e.g. Annual physical results"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveDocument}
                disabled={loading || !docFile}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 disabled:opacity-50"
              >
                Save Document to Locker
              </button>
            </div>
          )}

          {/* TAB 3: Vital Signs */}
          {activeTab === 'vitals' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <label className="text-[11px] text-slate-400 block mb-1">Blood Pressure</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="Sys"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      className="w-1/2 px-2 py-1.5 bg-slate-900 rounded-lg text-xs text-white text-center focus:outline-none focus:border-cyan-400 border border-white/[0.08]"
                    />
                    <span className="text-slate-400">/</span>
                    <input
                      type="number"
                      placeholder="Dia"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      className="w-1/2 px-2 py-1.5 bg-slate-900 rounded-lg text-xs text-white text-center focus:outline-none focus:border-cyan-400 border border-white/[0.08]"
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 block">mmHg</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <label className="text-[11px] text-slate-400 block mb-1">Heart Rate</label>
                  <input
                    type="number"
                    placeholder="e.g. 72"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 rounded-lg text-xs text-white text-center focus:outline-none focus:border-cyan-400 border border-white/[0.08]"
                  />
                  <span className="text-[9px] text-slate-500 mt-1 block">bpm</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <label className="text-[11px] text-slate-400 block mb-1">SpO₂ Oxygen</label>
                  <input
                    type="number"
                    placeholder="e.g. 98"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 rounded-lg text-xs text-white text-center focus:outline-none focus:border-cyan-400 border border-white/[0.08]"
                  />
                  <span className="text-[9px] text-slate-500 mt-1 block">%</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <label className="text-[11px] text-slate-400 block mb-1">Temperature</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 98.6"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 rounded-lg text-xs text-white text-center focus:outline-none focus:border-cyan-400 border border-white/[0.08]"
                  />
                  <span className="text-[9px] text-slate-500 mt-1 block">°F</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Context / Notes
                </label>
                <input
                  type="text"
                  value={vitalNotes}
                  onChange={(e) => setVitalNotes(e.target.value)}
                  placeholder="e.g. Measured 30 min after morning walk"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveVitals}
                disabled={loading || (!systolic && !heartRate && !spo2 && !temperature)}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 disabled:opacity-50"
              >
                Log Vital Signs Checkpoint
              </button>
            </div>
          )}

          {/* TAB 4: Symptoms */}
          {activeTab === 'symptom' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Symptom Name
                </label>
                <input
                  type="text"
                  value={symptomName}
                  onChange={(e) => setSymptomName(e.target.value)}
                  placeholder="e.g. Tension headache, Mild dry cough, Joint stiffness"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Severity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['mild', 'moderate', 'severe'] as const).map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSymptomSeverity(sev)}
                        className={`py-2 rounded-xl text-xs capitalize transition-all ${
                          symptomSeverity === sev
                            ? sev === 'mild'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold'
                              : sev === 'moderate'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold'
                            : 'bg-white/[0.03] text-slate-400 border border-white/[0.06]'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Duration / Triggers
                  </label>
                  <input
                    type="text"
                    value={symptomDuration}
                    onChange={(e) => setSymptomDuration(e.target.value)}
                    placeholder="e.g. 2 hours after screen time"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Detailed Observations (or speak via microphone)
                </label>
                <textarea
                  rows={3}
                  value={symptomNotes}
                  onChange={(e) => setSymptomNotes(e.target.value)}
                  placeholder="Note any relief factors, medications taken, or patterns."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveSymptom}
                disabled={loading || !symptomName.trim()}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 disabled:opacity-50"
              >
                Save Symptom Entry
              </button>
            </div>
          )}

          {/* TAB 5: Doctor Consultation */}
          {activeTab === 'consultation' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Doctor Name
                  </label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Vance"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Specialty / Department
                  </label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Cardiology, Dermatology"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Clinic / Hospital
                  </label>
                  <input
                    type="text"
                    value={clinic}
                    onChange={(e) => setClinic(e.target.value)}
                    placeholder="e.g. City Health Memorial"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Consultation Date
                  </label>
                  <input
                    type="date"
                    value={consultationDate}
                    onChange={(e) => setConsultationDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Doctor Discussion & Advice Notes
                </label>
                <textarea
                  rows={3}
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  placeholder="Summary of recommendations, tests ordered, or next steps."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveConsultation}
                disabled={loading || !doctorName.trim()}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 disabled:opacity-50"
              >
                Record Consultation Entry
              </button>
            </div>
          )}

          {/* TAB 6: Vaccination */}
          {activeTab === 'vaccination' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Vaccine Name
                  </label>
                  <input
                    type="text"
                    value={vaccineName}
                    onChange={(e) => setVaccineName(e.target.value)}
                    placeholder="e.g. Annual Influenza, Tdap Booster"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Dose / Sequence
                  </label>
                  <input
                    type="text"
                    value={doseNumber}
                    onChange={(e) => setDoseNumber(e.target.value)}
                    placeholder="e.g. Booster, Dose 1 of 2"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Administering Clinic / Pharmacy
                  </label>
                  <input
                    type="text"
                    value={vaccineClinic}
                    onChange={(e) => setVaccineClinic(e.target.value)}
                    placeholder="e.g. Community Health Pharmacy"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Date Administered
                  </label>
                  <input
                    type="date"
                    value={vaccineDate}
                    onChange={(e) => setVaccineDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveVaccination}
                disabled={loading || !vaccineName.trim()}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 disabled:opacity-50"
              >
                Save Vaccination Milestone
              </button>
            </div>
          )}

          {/* TAB 7: Medical History */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    History Category
                  </label>
                  <select
                    value={historyCategory}
                    onChange={(e) => setHistoryCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Chronic Condition">Chronic Condition</option>
                    <option value="Past Surgery">Past Surgery</option>
                    <option value="Allergy">Known Allergy</option>
                    <option value="Family History">Family History</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Title / Condition Name
                  </label>
                  <input
                    type="text"
                    value={historyTitle}
                    onChange={(e) => setHistoryTitle(e.target.value)}
                    placeholder="e.g. Penicillin allergy, Appendectomy"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Year or Approximate Date
                  </label>
                  <input
                    type="text"
                    value={historyYear}
                    onChange={(e) => setHistoryYear(e.target.value)}
                    placeholder="e.g. 2018, Childhood"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Context / Notes
                  </label>
                  <input
                    type="text"
                    value={historyNotes}
                    onChange={(e) => setHistoryNotes(e.target.value)}
                    placeholder="e.g. Confirmed via patch testing"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveMedicalHistory}
                disabled={loading || !historyTitle.trim()}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 disabled:opacity-50"
              >
                Preserve in Medical History
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
