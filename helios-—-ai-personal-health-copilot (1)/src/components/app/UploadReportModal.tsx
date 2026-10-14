import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';

interface UploadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
}

export function UploadReportModal({
  isOpen,
  onClose,
  onEventCreated,
}: UploadReportModalProps) {
  const { addDocument, addHealthEvent } = useHealthData();
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('Lab Report');
  const [fileContent, setFileContent] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    suggestedTitle: string;
    suggestedDate: string;
    suggestedType: string;
    summary: string;
    keyObservations: string[];
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    // If text or markdown or json or csv, read contents
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text || `Uploaded file: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    };
    reader.readAsText(file);
  };

  const handleAnalyzeWithAI = async () => {
    if (!fileName || !fileContent) {
      setError('Please select a file or paste document text first.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      const res = await fetch('/api/ai/extract-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileText: fileContent.slice(0, 4000),
        }),
      });

      if (!res.ok) {
        throw new Error('Analysis request failed');
      }

      const data = await res.json();
      setExtractedData(data.extracted);
    } catch (err: any) {
      console.error(err);
      setError('Could not run AI extraction preview. You can still save the document manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 1: Save document into Vault
  const handleSaveDocumentOnly = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await addDocument({
        name: fileName || 'Health_Document.pdf',
        type: fileType,
        category: 'Blood Tests',
        size: fileContent.length || 1024,
        fileData: fileContent.slice(0, 50000),
        notes: userNotes,
        uploadDate: new Date().toISOString().split('T')[0],
        extractedSummary: extractedData?.summary,
        status: extractedData ? 'reviewed' : 'pending_review',
      });
      onClose();
    } catch (err: any) {
      setError('Failed to save document.');
    } finally {
      setIsSaving(false);
    }
  };

  // Step 2: User explicitly confirms adding the extracted event to their Health Journey
  const handleConfirmAndAddToJourney = async () => {
    if (!extractedData) return;
    try {
      setIsSaving(true);
      setError(null);

      // Save document
      const docId = await addDocument({
        name: fileName || 'Health_Document.pdf',
        type: fileType,
        category: 'Blood Tests',
        size: fileContent.length || 1024,
        fileData: fileContent.slice(0, 50000),
        notes: userNotes,
        uploadDate: new Date().toISOString().split('T')[0],
        extractedSummary: extractedData.summary,
        status: 'saved',
      });

      // Add to timeline with user confirmation
      await addHealthEvent({
        title: extractedData.suggestedTitle,
        date: extractedData.suggestedDate,
        type: extractedData.suggestedType,
        notes: `${extractedData.summary}\n\nKey Points:\n${extractedData.keyObservations.join('\n')}`,
        documentName: fileName,
      });

      if (onEventCreated) onEventCreated();
      onClose();
    } catch (err: any) {
      setError('Failed to confirm and add to journey.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl glass-panel p-6 shadow-2xl border border-cyan-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white font-heading flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-cyan-400" />
              Upload & Understand Health Document
            </h3>
            <p className="text-xs text-slate-400">
              User-controlled upload. Nothing is added to your permanent timeline without your explicit confirmation.
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

        <div className="mt-5 space-y-4">
          {/* File Picker / Drag area */}
          <div className="relative border-2 border-dashed border-white/15 hover:border-cyan-400/50 rounded-2xl p-6 text-center transition-colors bg-white/[0.02]">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.txt,.csv,.json,.doc,.docx,image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-8 h-8 text-cyan-400/80" />
              <div className="text-sm font-medium text-slate-200">
                {fileName ? (
                  <span className="text-cyan-300">{fileName}</span>
                ) : (
                  <span>Click to select file or drag & drop</span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Supports lab reports, discharge summaries, imaging notes, clinical text
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Document Name / Title
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. Metabolic_Panel_Results.pdf"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              >
                <option value="Lab Report">Lab Report</option>
                <option value="Prescription">Prescription</option>
                <option value="Imaging / Radiology">Imaging / Radiology</option>
                <option value="Doctor Visit Summary">Doctor Visit Summary</option>
                <option value="Pathology">Pathology</option>
                <option value="Other Record">Other Record</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Document Text / Notes / Lab Excerpt
            </label>
            <textarea
              rows={3}
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              placeholder="Paste lab text, doctor notes, or key values to analyze..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none font-mono text-xs"
            />
          </div>

          {/* AI Extraction trigger */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-cyan-300">Extract Timeline Preview</span>
                <p className="text-slate-400">
                  AI generates suggested title, date & summary for your review.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAnalyzeWithAI}
              disabled={isAnalyzing || !fileName}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-xs font-medium border border-cyan-500/30 transition-all disabled:opacity-40 shrink-0"
            >
              {isAnalyzing ? 'Extracting...' : 'Review with AI'}
            </button>
          </div>

          {/* AI Extracted Confirmation Panel */}
          {extractedData && (
            <div className="p-4 rounded-xl glass-panel-active border border-cyan-400/40 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>AI Suggested Timeline Entry (Pending Your Approval)</span>
              </div>

              <div className="space-y-2 text-xs text-slate-200 bg-slate-950/60 p-3 rounded-lg border border-white/5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400">Suggested Title:</span>{' '}
                    <span className="font-semibold text-white">
                      {extractedData.suggestedTitle}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Suggested Date:</span>{' '}
                    <span className="font-semibold text-white">
                      {extractedData.suggestedDate}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Type:</span>{' '}
                  <span className="text-cyan-300">{extractedData.suggestedType}</span>
                </div>
                <div>
                  <span className="text-slate-400">Summary:</span>
                  <p className="mt-1 text-slate-300 italic">{extractedData.summary}</p>
                </div>
                {extractedData.keyObservations?.length > 0 && (
                  <div>
                    <span className="text-slate-400">Key Points:</span>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-300">
                      {extractedData.keyObservations.map((obs, i) => (
                        <li key={i}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-amber-300/90 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Safety Gate: This information will only become a timeline event if you confirm below.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveDocumentOnly}
                  disabled={isSaving}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white transition-colors"
                >
                  Save in Vault Only
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndAddToJourney}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/25 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm & Add to Health Journey</span>
                </button>
              </div>
            </div>
          )}

          {!extractedData && (
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDocumentOnly}
                disabled={isSaving || !fileName}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save to Documents'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
