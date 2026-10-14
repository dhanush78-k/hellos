import React, { useState } from 'react';
import {
  Shield,
  Download,
  Trash2,
  KeyRound,
  Database,
  Lock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  Pill,
  Calendar,
  Target,
  QrCode,
  Share2,
  Copy,
  ExternalLink,
  X,
  HeartPulse,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { playChime } from '../../lib/audio';

export function PrivacyCenterView() {
  const { activeUser } = useAuth();
  const {
    healthEvents,
    documents,
    medications,
    appointments,
    goals,
    vitals,
    symptoms,
    temporaryShares,
    createHealthShare,
    revokeHealthShare,
    exportAllUserData,
    clearAllUserData,
  } = useHealthData();

  const [confirmWipeOpen, setConfirmWipeOpen] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [wipedSuccess, setWipedSuccess] = useState(false);

  // Temporary Share Builder State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareReports, setShareReports] = useState(true);
  const [shareMeds, setShareMeds] = useState(true);
  const [shareSymptoms, setShareSymptoms] = useState(true);
  const [shareVitals, setShareVitals] = useState(true);
  const [shareOldRecords, setShareOldRecords] = useState(false);
  const [doctorNote, setDoctorNote] = useState('');
  const [createdShare, setCreatedShare] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // AI Boundary Toggle states
  const [aiUseReports, setAiUseReports] = useState(true);
  const [aiUseMeds, setAiUseMeds] = useState(true);
  const [aiUseSymptoms, setAiUseSymptoms] = useState(true);

  const handleCreateShare = async () => {
    playChime(640);
    const newShare = await createHealthShare(
      {
        reports: shareReports,
        medications: shareMeds,
        symptoms: shareSymptoms,
        vitals: shareVitals,
        oldRecords: shareOldRecords,
      },
      doctorNote
    );
    setCreatedShare(newShare);
  };

  const handleCopyShareLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    playChime(600);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWipe = async () => {
    try {
      setWiping(true);
      await clearAllUserData();
      setConfirmWipeOpen(false);
      setWipedSuccess(true);
      playChime(350);
      setTimeout(() => setWipedSuccess(false), 4000);
    } catch (err) {
      alert('Could not wipe data. Please try again.');
    } finally {
      setWiping(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono mb-2">
          <Shield className="w-3.5 h-3.5" />
          <span>Sovereign Data Custody</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
          Privacy Center & Custody Controls
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Full cryptographic autonomy over what you store, who can view it, and what AI can access.
        </p>
      </div>

      {wipedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>All workspace records have been permanently expunged from the database.</span>
        </div>
      )}

      {/* YOUR DATA INVENTORY COUNTERS */}
      <div>
        <h2 className="text-sm font-bold text-slate-300 uppercase font-heading tracking-wider mb-3">
          Your Stored Data Inventory
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl glass-panel border border-white/10">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono uppercase">Reports</span>
            </div>
            <span className="text-2xl font-bold text-white block font-heading">
              {documents.length}
            </span>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-white/10">
            <div className="flex items-center gap-2 text-violet-400 mb-1">
              <Pill className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono uppercase">Medications</span>
            </div>
            <span className="text-2xl font-bold text-white block font-heading">
              {medications.length}
            </span>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-white/10">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono uppercase">Consultations</span>
            </div>
            <span className="text-2xl font-bold text-white block font-heading">
              {appointments.length}
            </span>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-white/10">
            <div className="flex items-center gap-2 text-rose-400 mb-1">
              <HeartPulse className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono uppercase">Vital Signs</span>
            </div>
            <span className="text-2xl font-bold text-white block font-heading">
              {vitals.length}
            </span>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-white/10">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono uppercase">Symptoms</span>
            </div>
            <span className="text-2xl font-bold text-white block font-heading">
              {symptoms.length}
            </span>
          </div>
        </div>
      </div>

      {/* TEMPORARY HEALTH SHARE SECTION (24-Hour Doctor Share) */}
      <div className="p-6 rounded-3xl glass-panel-active border border-cyan-500/35 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                Temporary Health Share (24-Hour Doctor Pass)
              </h3>
              <p className="text-xs text-slate-400 font-light">
                Generate an encrypted 24-hour pass with only the records you explicitly approve.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playChime(540);
              setShareModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 self-start sm:self-auto"
          >
            Create 24-Hour Share Pass
          </button>
        </div>

        {/* Active shares list */}
        {temporaryShares.length > 0 ? (
          <div className="space-y-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              Active Doctor Passes ({temporaryShares.length}):
            </span>
            {temporaryShares.map((share) => (
              <div
                key={share.id}
                className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono">
                      Passcode: {share.token}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/10">
                      Active (24h Window)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-light block mt-0.5">
                    Included: {share.sections.reports ? 'Reports · ' : ''}
                    {share.sections.medications ? 'Medications · ' : ''}
                    {share.sections.symptoms ? 'Symptoms · ' : ''}
                    {share.sections.vitals ? 'Vitals' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleCopyShareLink(
                        `${window.location.origin}?share=${share.id}#token=${share.token}`
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-cyan-300 flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </button>

                  <button
                    onClick={() => {
                      playChime(380);
                      revokeHealthShare(share.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-xs text-rose-300 flex items-center gap-1.5"
                  >
                    <span>Revoke Pass</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-light">
            No active temporary shares. When visiting a specialist, generate a pass rather than exposing your entire account.
          </p>
        )}
      </div>

      {/* SHARE BUILDER MODAL */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl glass-panel border border-cyan-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-cyan-300 font-bold font-heading">
                <QrCode className="w-5 h-5" />
                <span>Create 24-Hour Doctor Share</span>
              </div>
              <button
                onClick={() => {
                  setShareModalOpen(false);
                  setCreatedShare(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!createdShare ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 font-light">
                  Choose exactly which categories to include in this read-only 24-hour doctor preview:
                </p>

                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareReports}
                      onChange={(e) => setShareReports(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    <span>Reports & Lab Tests ({documents.length})</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareMeds}
                      onChange={(e) => setShareMeds(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    <span>Current Active Medications ({medications.filter((m) => m.active).length})</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareSymptoms}
                      onChange={(e) => setShareSymptoms(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    <span>Recent Symptoms ({symptoms.length})</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareVitals}
                      onChange={(e) => setShareVitals(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    <span>Vital Signs Readings ({vitals.length})</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareOldRecords}
                      onChange={(e) => setShareOldRecords(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    <span>Entire Historical Timeline Archive ({healthEvents.length})</span>
                  </label>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    Note for Doctor / Specialist (Optional)
                  </label>
                  <input
                    type="text"
                    value={doctorNote}
                    onChange={(e) => setDoctorNote(e.target.value)}
                    placeholder="e.g. Prepared for cardiology consultation with Dr. Vance"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  onClick={handleCreateShare}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25"
                >
                  Generate 24-Hour Secure Link & QR
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center py-2">
                <div className="w-32 h-32 mx-auto rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-xl">
                  {/* Visual QR Code Representation */}
                  <div className="w-full h-full border-2 border-black flex flex-col items-center justify-center p-1 bg-white">
                    <QrCode className="w-20 h-20 text-black" />
                    <span className="text-[8px] font-mono text-black font-bold">
                      {createdShare.token}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-mono text-emerald-400 font-bold block">
                    Access Passcode: {createdShare.token}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Valid for exactly 24 hours. Auto-expires {new Date(createdShare.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleCopyShareLink(
                        `${window.location.origin}?share=${createdShare.id}#token=${createdShare.token}`
                      )
                    }
                    className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                  >
                    {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Link Copied' : 'Copy Doctor Link'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShareModalOpen(false);
                      setCreatedShare(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.05] text-slate-300 text-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRIVACY CONTROLS */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase font-heading tracking-wider">
          Privacy Controls & AI Data Boundaries
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-3xl glass-panel p-5 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Lock className="w-4 h-4" />
              <h3 className="text-xs font-bold font-heading uppercase text-white">
                Who can access my records?
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Only you. Every query is scoped to your personal user identifier under strict Firestore security rules. No third-party brokers, no cross-account tracking.
            </p>
          </div>

          <div className="rounded-3xl glass-panel p-5 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-xs font-bold font-heading uppercase text-white">
                What information can AI use?
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              HELIOS uses records strictly in-memory during active requests. No health records are ever used to train underlying commercial LLM models.
            </p>
          </div>
        </div>
      </div>

      {/* EXPORT AND PURGE ACTIONS */}
      <div className="rounded-3xl glass-panel p-6 border border-white/10 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white font-heading">
            Data Portability & Sovereignty
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-light">
            Download an unencrypted, complete JSON backup of all timeline events, vitals, prescriptions, and reports.
          </p>
          <button
            onClick={() => {
              playChime(600);
              exportAllUserData();
            }}
            className="mt-4 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Download My Health Archive (JSON)</span>
          </button>
        </div>

        <div className="pt-6 border-t border-white/10">
          <h3 className="text-sm font-bold text-rose-300 font-heading">
            Permanent Data Erasure
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-light">
            Irrevocably expunge all health records, vitals, symptoms, and documents from the cloud database.
          </p>
          <button
            onClick={() => {
              playChime(420);
              setConfirmWipeOpen(true);
            }}
            className="mt-4 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge All Health Records</span>
          </button>
        </div>
      </div>

      {/* Wipe Confirmation Dialog */}
      {confirmWipeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-rose-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Confirm Irreversible Erasure</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Are you sure? This action immediately deletes all timeline events, uploaded files, vitals, and prescription records. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmWipeOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleWipe}
                disabled={wiping}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                {wiping ? 'Expunging...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
