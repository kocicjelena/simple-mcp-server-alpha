'use client';

import { useState } from 'react';
import { commitPatchAction, rollbackPatchAction } from '@/app/actions/patchFile';

interface ProposalData {
  hasError: boolean;
  filePath: string;
  explanation: string;
  originalCode: string;
  patchedCode: string;
}

export default function PatchReviewCard({ initialProposal }: { initialProposal: ProposalData }) {
  const [proposal, setProposal] = useState<ProposalData>(initialProposal);
  const [status, setStatus] = useState<'idle' | 'loading' | 'patched' | 'rolledback' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 1. APPROVE & APPLY
  async function handleApprove() {
    setStatus('loading');
    const result = await commitPatchAction({
      filePath: proposal.filePath,
      originalCode: proposal.originalCode,
      patchedCode: proposal.patchedCode,
    });

    if (result.success) {
      setStatus('patched');
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Failed to apply code change.');
    }
  }

  // 2. EMERGENCY ROLLBACK
  async function handleRollback() {
    setStatus('loading');
    const result = await rollbackPatchAction(proposal.filePath);
    if (result.success) {
      setStatus('rolledback');
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Rollback execution failed.');
    }
  }

  // 3. REJECT & RE-GENERATE ALTERNATIVE FIX
  async function handleRejectAndRetry() {
    if (!feedback.trim()) {
      alert('Please provide specific feedback context before asking Claude to retry.');
      return;
    }
    
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback, previousCode: proposal.patchedCode })
      });
      
      const newProposal = await res.json();
      setProposal(newProposal);
      setFeedback(''); // clear text box input
      setStatus('idle');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage('Failed re-generating patch.');
    }
  }

  return (
    <div className="border border-zinc-800 bg-black rounded-xl overflow-hidden shadow-2xl max-w-2xl w-full">
      <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
        <span className="font-mono text-sm text-yellow-500 font-semibold">⚠️ App Diagnostic Patch</span>
        <span className="text-xs font-mono text-zinc-500">{proposal.filePath}</span>
      </div>

      <div className="p-4 bg-zinc-950 border-b border-zinc-800 space-y-2">
        <p className="text-sm text-zinc-300 leading-relaxed">{proposal.explanation}</p>
      </div>

      {/* Code Visual Code Diff Viewer block */}
      <div className="font-mono text-xs overflow-x-auto divide-y divide-zinc-900 max-h-64">
        <div className="bg-red-950/30 p-4 text-red-200">
          <span className="text-red-500 block font-bold mb-1">- Original Code:</span>
          <pre className="whitespace-pre">{proposal.originalCode}</pre>
        </div>
        <div className="bg-emerald-950/30 p-4 text-emerald-200">
          <span className="text-emerald-500 block font-bold mb-1">+ Suggested Fix Patch:</span>
          <pre className="whitespace-pre">{proposal.patchedCode}</pre>
        </div>
      </div>

      {/* Rejection Feed Loop Input Section */}
      {status === 'idle' && (
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex gap-2">
          <input 
            type="text"
            placeholder="Why reject this patch? (e.g., 'Wrong variable name', 'Use standard array filter')"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
          <button 
            onClick={handleRejectAndRetry}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition"
          >
            Reject & Retry
          </button>
        </div>
      )}

      {/* Action Footer Bar Interface */}
      <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex items-center justify-end gap-3">
        {status === 'error' && <p className="text-xs text-red-400 mr-auto">{errorMessage}</p>}
        {status === 'patched' && <p className="text-xs text-emerald-400 mr-auto">✓ Patch active on workspace environment.</p>}
        {status === 'rolledback' && <p className="text-xs text-yellow-500 mr-auto">↩ File successfully restored to original condition.</p>}

        {status === 'idle' && (
          <button onClick={handleApprove} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition">
            Approve & Patch
          </button>
        )}

        {status === 'patched' && (
          <button onClick={handleRollback} className="px-4 py-2 bg-red-950 text-red-400 border border-red-900 hover:bg-red-900/50 font-medium text-sm rounded-lg transition">
            Rollback Code Changes
          </button>
        )}
      </div>
    </div>
  );
}
