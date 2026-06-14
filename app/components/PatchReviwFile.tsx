'use client';

import { useState } from 'react';
import { commitPatchAction } from '@/app/actions/patchFile';

interface PatchProps {
  proposal: {
    hasError: boolean;
    filePath: string;
    explanation: string;
    originalCode: string;
    patchedCode: string;
  };
  onSuccess: () => void;
}

export default function PatchReviewCard({ proposal, onSuccess }: PatchProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!proposal.hasError) {
    return <div className="p-4 bg-zinc-900 text-zinc-400 rounded-lg">No active app errors detected.</div>;
  }

  async function handleApprove() {
    setStatus('loading');
    const result = await commitPatchAction({
      filePath: proposal.filePath,
      originalCode: proposal.originalCode,
      patchedCode: proposal.patchedCode,
    });

    if (result.success) {
      setStatus('success');
      onSuccess();
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Failed to apply patch.');
    }
  }

  return (
    <div className="border border-zinc-800 bg-black rounded-xl overflow-hidden shadow-2xl max-w-2xl w-full">
      {/* Header Banner */}
      <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
        <span className="font-mono text-sm text-yellow-500 font-semibold">⚠️ Proposed Code Modification</span>
        <span className="text-xs font-mono text-zinc-500">{proposal.filePath}</span>
      </div>

      {/* Explanation Text block */}
      <div className="p-4 bg-zinc-950 border-b border-zinc-800">
        <p className="text-sm text-zinc-300 leading-relaxed font-sans">{proposal.explanation}</p>
      </div>

      {/* Simple Diff Visualizer rendering */}
      <div className="font-mono text-xs overflow-x-auto divide-y divide-zinc-900 max-h-72">
        <div className="bg-red-950/40 p-4 text-red-200">
          <span className="text-red-500 block font-bold mb-1">- Current Buggy Code Block:</span>
          <pre className="whitespace-pre">{proposal.originalCode}</pre>
        </div>
        <div className="bg-emerald-950/40 p-4 text-emerald-200">
          <span className="text-emerald-500 block font-bold mb-1">+ Suggested Fix Block:</span>
          <pre className="whitespace-pre">{proposal.patchedCode}</pre>
        </div>
      </div>

      {/* Action Footer controls */}
      <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex items-center justify-end gap-3">
        {status === 'error' && <p className="text-xs text-red-400 mr-auto">{errorMessage}</p>}
        {status === 'success' && <p className="text-xs text-emerald-400 mr-auto">✓ Patch deployed successfully!</p>}
        
        <button 
          disabled={status === 'loading' || status === 'success'}
          onClick={handleApprove}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white font-medium text-sm transition-colors duration-200"
        >
          {status === 'loading' ? 'Modifying...' : 'Approve & Patch File'}
        </button>
      </div>
    </div>
  );
}
