
/**
 * @file IntelligenceBriefingModal.tsx
 * This component displays the intelligence briefing result.
 */

import React, { memo } from 'react';
import type { IntelligenceBriefing } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface IntelligenceBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  briefing: IntelligenceBriefing | null;
  isLoading: boolean;
}

const IntelligenceBriefingModalComponent: React.FC<IntelligenceBriefingModalProps> = ({ isOpen, onClose, briefing, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
        <header className="flex justify-between items-center p-4 border-b bg-slate-50 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-800">Intelligence Briefing</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </header>

        <main className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-grow">
          {isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <LoadingSpinner />
              <p className="mt-4 text-slate-600 font-medium uppercase text-xs tracking-widest">Researching Company & Culture...</p>
            </div>
          )}

          {briefing && !isLoading && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 border-b pb-1">Company & Role Overview</h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{briefing.companyOverview}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 border-b pb-1">Talking Points for Success</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
                  {briefing.keyTalkingPoints.map((point, i) => <li key={i}>{point}</li>)}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                    <h3 className="text-xs font-bold text-indigo-800 uppercase mb-2">Culture & Values</h3>
                    <p className="text-xs text-indigo-900 leading-relaxed">{briefing.cultureAnalysis}</p>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                    <h3 className="text-xs font-bold text-amber-800 uppercase mb-2">Likely Interview Questions</h3>
                    <ul className="list-decimal list-inside space-y-1 text-xs text-amber-900">
                      {briefing.potentialInterviewQuestions.slice(0, 5).map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                </div>
              </div>

              {briefing.sources.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Verification Sources</h3>
                  <div className="flex flex-wrap gap-2">
                    {briefing.sources.map((source, index) => (
                      <a key={index} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded hover:bg-sky-100 border border-sky-100">
                        {source.title || 'Source'}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="p-4 border-t bg-slate-50 text-right flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-white bg-slate-800 rounded-md hover:bg-slate-900">Close</button>
        </footer>
      </div>
    </div>
  );
};

export default memo(IntelligenceBriefingModalComponent);
