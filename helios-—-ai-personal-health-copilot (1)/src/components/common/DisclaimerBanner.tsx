import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-indigo-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <p>
            <span className="font-semibold text-amber-300">Important Safety Notice:</span>{' '}
            HELIOS provides educational information and healthcare organization support. It does not replace a qualified healthcare professional.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:text-white text-slate-400 transition-colors"
          aria-label="Dismiss notice"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
