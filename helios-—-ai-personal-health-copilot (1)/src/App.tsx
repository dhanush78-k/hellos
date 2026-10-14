/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HealthDataProvider } from './context/HealthDataContext';
import { Cursor } from './components/common/Cursor';
import { CommandPalette } from './components/common/CommandPalette';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { ScatteredStorySection } from './components/landing/ScatteredStorySection';
import { HowItWorksSection } from './components/landing/HowItWorksSection';
import { InteractiveSimulationSection } from './components/landing/InteractiveSimulationSection';
import { TimelineStorySection } from './components/landing/TimelineStorySection';
import { HealthMemoryOrb } from './components/landing/HealthMemoryOrb';
import { CopilotPreviewSection } from './components/landing/CopilotPreviewSection';
import { ReportExplainerSection } from './components/landing/ReportExplainerSection';
import { VisitPrepSection } from './components/landing/VisitPrepSection';
import { HealthSignalsSection } from './components/landing/HealthSignalsSection';
import { PrivacySection } from './components/landing/PrivacySection';
import { WhyHeliosSection } from './components/landing/WhyHeliosSection';
import { FinalCtaSection } from './components/landing/FinalCtaSection';

import { AppLayout } from './components/app/AppLayout';
import { DashboardView } from './components/app/DashboardView';
import { JourneyView } from './components/app/JourneyView';
import { CopilotView } from './components/app/CopilotView';
import { ReportsView } from './components/app/ReportsView';
import { MedicationsView } from './components/app/MedicationsView';
import { AppointmentsView } from './components/app/AppointmentsView';
import { GoalsView } from './components/app/GoalsView';
import { PersonalExplorerView } from './components/app/PersonalExplorerView';
import { PrivacyCenterView } from './components/app/PrivacyCenterView';

import { AddHealthRecordModal } from './components/app/AddHealthRecordModal';
import { AddEventModal } from './components/app/AddEventModal';
import { AddMedicationModal } from './components/app/AddMedicationModal';
import { AddAppointmentModal } from './components/app/AddAppointmentModal';
import { AddGoalModal } from './components/app/AddGoalModal';
import { UploadReportModal } from './components/app/UploadReportModal';
import { AuthModal } from './components/auth/AuthModal';
import { db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Shield, Clock, Pill, HeartPulse, AlertCircle, FileText, X } from 'lucide-react';

function HeliosAppContent() {
  const { activeUser } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | string>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Active Modals
  const [healthRecordModalOpen, setHealthRecordModalOpen] = useState(false);
  const [healthRecordInitialTab, setHealthRecordInitialTab] = useState('prescription');

  const [activeModal, setActiveModal] = useState<
    'event' | 'medication' | 'appointment' | 'goal' | 'report' | null
  >(null);

  // Prefill state for AddEvent modal from reports
  const [eventPrefill, setEventPrefill] = useState<{
    title: string;
    notes: string;
    docName: string;
  } | null>(null);

  // Doctor Share Viewer State
  const [doctorShareData, setDoctorShareData] = useState<any | null>(null);
  const [doctorShareLoading, setDoctorShareLoading] = useState(false);

  // Handle URL hash, direct routing, or doctor share link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');
    if (shareId) {
      setDoctorShareLoading(true);
      getDoc(doc(db, 'healthShares', shareId))
        .then((snap) => {
          if (snap.exists()) {
            setDoctorShareData(snap.data());
          }
        })
        .catch(console.warn)
        .finally(() => setDoctorShareLoading(false));
    }

    const handlePopState = () => {
      const path = window.location.pathname.replace('/', '') || 'landing';
      if (
        [
          'dashboard',
          'journey',
          'copilot',
          'reports',
          'medications',
          'appointments',
          'goals',
          'explorer',
          'privacy',
        ].includes(path)
      ) {
        if (activeUser) {
          setCurrentView(path);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeUser]);

  const handleEnterHelios = () => {
    if (activeUser) {
      setCurrentView('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setAuthInitialMode('signup');
      setAuthModalOpen(true);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleNavigate = (view: string) => {
    const cleaned = view.replace('/', '');
    if (cleaned === 'landing') {
      setCurrentView('landing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!activeUser) {
      setAuthInitialMode('login');
      setAuthModalOpen(true);
      return;
    }
    setCurrentView(cleaned);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenMasterAddRecord = (tab: string = 'prescription') => {
    if (!activeUser) {
      setAuthInitialMode('login');
      setAuthModalOpen(true);
      return;
    }
    setHealthRecordInitialTab(tab);
    setHealthRecordModalOpen(true);
  };

  const handleOpenAddModal = (type?: string) => {
    if (!activeUser) {
      setAuthInitialMode('login');
      setAuthModalOpen(true);
      return;
    }
    if (
      type === 'event' ||
      type === 'medication' ||
      type === 'vitals' ||
      type === 'symptom' ||
      type === 'prescription' ||
      type === 'prescription-scan' ||
      type === 'prescription-camera' ||
      type === 'prescription-upload'
    ) {
      handleOpenMasterAddRecord(type);
    } else if (type === 'report') {
      handleOpenMasterAddRecord('report');
    } else if (type === 'appointment') {
      setActiveModal('appointment');
    } else if (type === 'goal') {
      setActiveModal('goal');
    } else {
      handleOpenMasterAddRecord('prescription');
    }
  };

  const handleActionFromCommand = (action: string) => {
    if (action === 'add-event') handleOpenMasterAddRecord('prescription');
    if (action === 'upload-report') handleOpenMasterAddRecord('report');
    if (action === 'add-medication') handleOpenMasterAddRecord('prescription');
    if (action === 'add-appointment') setActiveModal('appointment');
    if (action === 'create-goal') setActiveModal('goal');
  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Desktop Custom Precision Cursor */}
      <Cursor />

      {/* Global Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
        onAction={handleActionFromCommand}
      />

      {/* VIEW A: Launch Site / Marketing Experience */}
      {currentView === 'landing' ? (
        <div className="flex flex-col min-h-screen">
          <Navbar
            onOpenAuth={handleOpenAuth}
            onNavigateTab={handleNavigate}
            currentView="landing"
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          />

          <main className="flex-1">
            <HeroSection
              onEnter={handleEnterHelios}
              onExplore={() => {
                const el = document.getElementById('what-is-helios');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <ScatteredStorySection />
            <HowItWorksSection />
            <InteractiveSimulationSection />
            <TimelineStorySection />
            <HealthMemoryOrb />
            <CopilotPreviewSection />
            <ReportExplainerSection />
            <VisitPrepSection />
            <HealthSignalsSection />
            <PrivacySection />
            <WhyHeliosSection />
            <FinalCtaSection
              onEnter={handleEnterHelios}
              onExplore={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </main>

          <Footer
            onNavigateTab={handleNavigate}
            onOpenPrivacy={() => handleNavigate('privacy')}
          />
        </div>
      ) : (
        /* VIEW B: Authenticated Personal Health App Experience */
        <AppLayout
          currentTab={currentView}
          onSelectTab={handleNavigate}
          onOpenAddModal={handleOpenAddModal}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        >
          {currentView === 'dashboard' && (
            <DashboardView
              onSelectTab={handleNavigate}
              onOpenAddModal={handleOpenAddModal}
            />
          )}

          {currentView === 'journey' && (
            <JourneyView onOpenAddEvent={() => handleOpenMasterAddRecord('prescription')} />
          )}

          {currentView === 'copilot' && <CopilotView />}

          {currentView === 'reports' && (
            <ReportsView
              onOpenUploadModal={() => handleOpenMasterAddRecord('report')}
              onOpenAddEventModal={(prefill) => {
                setEventPrefill(prefill);
                setActiveModal('event');
              }}
            />
          )}

          {currentView === 'medications' && (
            <MedicationsView onOpenAddModal={() => handleOpenMasterAddRecord('prescription')} />
          )}

          {currentView === 'appointments' && (
            <AppointmentsView onOpenAddModal={() => setActiveModal('appointment')} />
          )}

          {currentView === 'goals' && (
            <GoalsView onOpenAddModal={() => setActiveModal('goal')} />
          )}

          {currentView === 'explorer' && <PersonalExplorerView />}

          {currentView === 'privacy' && <PrivacyCenterView />}
        </AppLayout>
      )}

      {/* MASTER UNIFIED ADD HEALTH RECORD MODAL */}
      <AddHealthRecordModal
        isOpen={healthRecordModalOpen}
        onClose={() => setHealthRecordModalOpen(false)}
        initialTab={healthRecordInitialTab}
      />

      {/* Additional Sub-Modals */}
      <AddEventModal
        isOpen={activeModal === 'event'}
        onClose={() => {
          setActiveModal(null);
          setEventPrefill(null);
        }}
        defaultTitle={eventPrefill?.title || ''}
        defaultNotes={eventPrefill?.notes || ''}
      />

      <AddMedicationModal
        isOpen={activeModal === 'medication'}
        onClose={() => setActiveModal(null)}
      />

      <AddAppointmentModal
        isOpen={activeModal === 'appointment'}
        onClose={() => setActiveModal(null)}
      />

      <AddGoalModal
        isOpen={activeModal === 'goal'}
        onClose={() => setActiveModal(null)}
      />

      <UploadReportModal
        isOpen={activeModal === 'report'}
        onClose={() => setActiveModal(null)}
      />

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authInitialMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setCurrentView('dashboard');
        }}
      />

      {/* DOCTOR 24-HOUR READ-ONLY SHARE VIEWER MODAL */}
      {doctorShareData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl glass-panel border border-cyan-400/50 p-6 sm:p-8 shadow-2xl space-y-5 my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <Shield className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                    HELIOS Doctor Health Share
                  </h3>
                  <span className="text-xs text-emerald-400 font-mono">
                    24-Hour Verified Pass · Read-Only Access
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDoctorShareData(null)}
                className="p-1.5 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {doctorShareData.doctorNote && (
              <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-200">
                <strong>Patient Note for Physician:</strong> {doctorShareData.doctorNote}
              </div>
            )}

            {/* Approved snapshot sections */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {/* Medications Snapshot */}
              {doctorShareData.snapshot?.medications?.length > 0 && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <div className="flex items-center gap-2 text-violet-400 text-xs font-bold font-mono">
                    <Pill className="w-4 h-4" />
                    <span>Active Medications ({doctorShareData.snapshot.medications.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {doctorShareData.snapshot.medications.map((m: any, i: number) => (
                      <div key={i} className="text-xs text-slate-200 flex justify-between">
                        <span>{m.name} ({m.dosage})</span>
                        <span className="text-slate-400 font-light">{m.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Symptoms Snapshot */}
              {doctorShareData.snapshot?.symptoms?.length > 0 && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono">
                    <AlertCircle className="w-4 h-4" />
                    <span>Recent Symptoms ({doctorShareData.snapshot.symptoms.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {doctorShareData.snapshot.symptoms.map((s: any, i: number) => (
                      <div key={i} className="text-xs text-slate-200 flex justify-between">
                        <span>{s.symptom}</span>
                        <span className="text-amber-300 font-mono text-[10px]">{s.severity} · {s.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vitals Snapshot */}
              {doctorShareData.snapshot?.vitals?.length > 0 && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold font-mono">
                    <HeartPulse className="w-4 h-4" />
                    <span>Recent Vitals Readings ({doctorShareData.snapshot.vitals.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {doctorShareData.snapshot.vitals.map((v: any, i: number) => (
                      <div key={i} className="text-xs text-slate-200 flex justify-between">
                        <span>BP: {v.systolicBP || '--'}/{v.diastolicBP || '--'} · HR: {v.heartRate || '--'} bpm</span>
                        <span className="text-slate-400 font-mono text-[10px]">{v.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reports Snapshot */}
              {doctorShareData.snapshot?.reports?.length > 0 && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold font-mono">
                    <FileText className="w-4 h-4" />
                    <span>Shared Documents ({doctorShareData.snapshot.reports.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {doctorShareData.snapshot.reports.map((r: any, i: number) => (
                      <div key={i} className="text-xs text-slate-200 flex justify-between">
                        <span>{r.name}</span>
                        <span className="text-cyan-300 font-mono text-[10px]">{r.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400">
              <span>Expires 24 hours after creation · Sovereign user custody</span>
              <button
                onClick={() => setDoctorShareData(null)}
                className="px-4 py-1.5 rounded-xl bg-cyan-500 text-white font-semibold text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HealthDataProvider>
        <HeliosAppContent />
      </HealthDataProvider>
    </AuthProvider>
  );
}
