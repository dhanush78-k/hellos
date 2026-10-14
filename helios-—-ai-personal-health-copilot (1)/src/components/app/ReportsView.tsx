import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  Sparkles,
  Trash2,
  FileCheck2,
  ExternalLink,
  Search,
  CheckCircle2,
  X,
  FileSearch,
  Loader2,
  Folder,
  FolderOpen,
  FlaskConical,
  Pill,
  Syringe,
  Stethoscope,
  Receipt,
  Layers,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { HealthDocument, DocumentCategory, Biomarker } from '../../types';
import { playChime } from '../../lib/audio';

interface ReportsViewProps {
  onOpenUploadModal: () => void;
  onOpenAddEventModal: (prefill: { title: string; notes: string; docName: string }) => void;
}

export function ReportsView({ onOpenUploadModal, onOpenAddEventModal }: ReportsViewProps) {
  const { documents, deleteDocument, updateDocumentStatus } = useHealthData();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDoc, setSelectedDoc] = useState<HealthDocument | null>(null);

  // AI Biomarker Scanner State
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    reportTitle?: string;
    summary?: string;
    biomarkers: Biomarker[];
  } | null>(null);

  const categories = [
    'All',
    'Blood Tests',
    'Prescriptions',
    'X-Rays / Scans',
    'Vaccinations',
    'Doctor Notes',
    'Medical Bills',
  ];

  const filteredDocs = documents.filter((d) => {
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.notes && d.notes.toLowerCase().includes(search.toLowerCase())) ||
      (d.category && d.category.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleScanWithAi = async (docItem: HealthDocument) => {
    setSelectedDoc(docItem);
    setScanning(true);
    setScanResult(null);
    playChime(560);

    try {
      const res = await fetch('/api/ai/scan-report-biomarkers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: docItem.name,
          text: docItem.fileData || docItem.notes || 'Laboratory report values',
        }),
      });

      if (!res.ok) throw new Error('Scan failed');
      const data = await res.json();
      setScanResult(data.scanned);
      playChime(680);
    } catch (err: any) {
      console.error(err);
      setScanResult({
        reportTitle: docItem.name,
        summary: 'Unable to scan document biomarkers at this time.',
        biomarkers: [],
      });
    } finally {
      setScanning(false);
    }
  };

  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case 'Blood Tests':
        return FlaskConical;
      case 'Prescriptions':
        return Pill;
      case 'Vaccinations':
        return Syringe;
      case 'Doctor Notes':
        return Stethoscope;
      case 'Medical Bills':
        return Receipt;
      default:
        return FileText;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Digital Health Locker</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            Reports & Health Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organized digital locker with AI biomarker scanning and plain-language reference ranges.
          </p>
        </div>

        <button
          onClick={() => {
            playChime(580);
            onOpenUploadModal();
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 transition-all self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Record</span>
        </button>
      </div>

      {/* Category Folders Toolbar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-white/[0.06]">
        {categories.map((cat) => {
          const isSel = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                playChime(480);
                setSelectedCategory(cat);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isSel
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold shadow-sm'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/[0.06]'
              }`}
            >
              {isSel ? <FolderOpen className="w-3.5 h-3.5 text-cyan-400" /> : <Folder className="w-3.5 h-3.5" />}
              <span>{cat}</span>
              <span className="text-[10px] font-mono opacity-70">
                ({cat === 'All' ? documents.length : documents.filter((d) => d.category === cat).length})
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports by filename or notes..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* AI REPORT SCANNER MODAL / DRAWER */}
      {selectedDoc && (
        <div className="p-6 rounded-3xl glass-panel-active border border-cyan-400/40 shadow-2xl relative animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <FileSearch className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white font-heading">
                  AI Report Scanner: {selectedDoc.name}
                </h3>
                <span className="text-[11px] text-cyan-300 font-mono">
                  {selectedDoc.category || 'Laboratory'} · Uploaded {selectedDoc.uploadDate}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedDoc(null);
                setScanResult(null);
              }}
              className="p-1.5 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {scanning ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs text-cyan-300 font-mono">
                Extracting test values, biomarkers, and reference ranges...
              </p>
            </div>
          ) : scanResult ? (
            <div className="space-y-4">
              {scanResult.summary && (
                <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-slate-200 font-light leading-relaxed">
                  <strong>Overview:</strong> {scanResult.summary}
                </div>
              )}

              {/* Biomarker Table */}
              <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
                <div className="grid grid-cols-12 bg-white/[0.04] px-4 py-2.5 text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  <div className="col-span-4 sm:col-span-4">Test / Biomarker</div>
                  <div className="col-span-3 sm:col-span-3">Recorded Result</div>
                  <div className="col-span-5 sm:col-span-5">Reference Range & Status</div>
                </div>

                <div className="divide-y divide-white/[0.06]">
                  {scanResult.biomarkers && scanResult.biomarkers.length > 0 ? (
                    scanResult.biomarkers.map((b, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 px-4 py-3 text-xs items-center hover:bg-white/[0.02]"
                      >
                        <div className="col-span-4 sm:col-span-4 font-semibold text-white font-heading">
                          {b.test}
                        </div>
                        <div className="col-span-3 sm:col-span-3 font-mono text-cyan-300">
                          {b.result} {b.unit || ''}
                        </div>
                        <div className="col-span-5 sm:col-span-5 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400 font-light">
                            {b.referenceRange}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap ${
                              b.status === 'Within reference range'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No discrete numerical biomarkers detected in this text document.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 flex items-center justify-between">
                <span>Educational extraction only. Never replaces physician diagnostic evaluation.</span>
                <button
                  onClick={() => {
                    updateDocumentStatus(selectedDoc.id, 'reviewed');
                    playChime(640);
                  }}
                  className="px-3 py-1 rounded-lg bg-cyan-500 text-white font-semibold text-xs"
                >
                  Mark as Reviewed
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Documents Grid or Empty State */}
      {filteredDocs.length === 0 ? (
        <div className="rounded-3xl glass-panel p-10 sm:p-14 text-center border border-white/10 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/20">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold font-heading text-white">
            Nothing in your Health Locker yet.
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto font-light leading-relaxed">
            Your Health Locker holds blood panels, doctor notes, radiology scans, and prescriptions. Upload your first document to extract biomarkers.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => {
                playChime(580);
                onOpenUploadModal();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload First Document</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => {
            const Icon = getCategoryIcon(doc.category);
            return (
              <div
                key={doc.id}
                className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-cyan-400/40 transition-all flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        {doc.category || 'Document'}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        doc.status === 'reviewed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {doc.status === 'reviewed' ? 'Reviewed' : 'Pending Scan'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white font-heading truncate" title={doc.name}>
                    {doc.name}
                  </h4>

                  {doc.notes && (
                    <p className="text-xs text-slate-400 font-light mt-1 line-clamp-2">
                      {doc.notes}
                    </p>
                  )}

                  <span className="text-[11px] text-slate-500 font-mono mt-2 block">
                    Uploaded on {doc.uploadDate}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <button
                    onClick={() => handleScanWithAi(doc)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200 text-xs font-semibold transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Scan Biomarkers</span>
                  </button>

                  <button
                    onClick={() => {
                      playChime(380);
                      deleteDocument(doc.id);
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/[0.04]"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
