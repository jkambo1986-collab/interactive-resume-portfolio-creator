
/**
 * @file MetricMinerModal.tsx
 * A modal wizard that guides the user through "Metric Opportunities" found in their resume.
 */

import React, { useState, useCallback, memo } from 'react';
import type { MetricOpportunity } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { AutoFixIcon } from './icons/AutoFixIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface MetricMinerModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunities: MetricOpportunity[];
  onApplyMetric: (index: number, originalText: string, userMetric: string) => Promise<void>;
}

const MetricMinerModal: React.FC<MetricMinerModalProps> = ({ isOpen, onClose, opportunities, onApplyMetric }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  if (opportunities.length === 0) {
     return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 text-center animate-fade-in-up">
                 <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900">Maximum Impact!</h3>
                 <p className="mt-2 text-sm text-slate-500">Your resume is already data-driven. No metric gaps were found.</p>
                 <div className="mt-6">
                    <button onClick={onClose} className="w-full py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700">Close</button>
                 </div>
             </div>
        </div>
     )
  }

  const currentOpp = opportunities[currentIndex];
  const isLast = currentIndex === opportunities.length - 1;

  const handleNext = () => {
    if (currentIndex < opportunities.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setUserInput('');
    } else {
        onClose();
    }
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) return;
    setIsApplying(true);
    try {
        await onApplyMetric(currentOpp.index, currentOpp.originalText, userInput);
        handleNext();
    } catch (error) {
        console.error("Failed to apply metric", error);
    } finally {
        setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4" role="dialog" aria-modal="true">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
            
            <div className="px-6 py-4 border-b bg-gradient-to-r from-violet-600 to-indigo-600 flex-shrink-0">
                <div className="flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <AutoFixIcon />
                        <h2 className="text-lg font-bold">Metric Miner</h2>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">&times;</button>
                </div>
                <p className="text-violet-100 text-xs mt-1">Boost your impact with numbers and hard data.</p>
            </div>

            <div className="w-full bg-slate-200 h-1 flex-shrink-0">
                <div className="bg-violet-600 h-1 transition-all duration-300" style={{ width: `${((currentIndex + 1) / opportunities.length) * 100}%` }}></div>
            </div>

            <div className="p-6 flex-grow overflow-y-auto">
                <div className="space-y-5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Opportunity {currentIndex + 1} of {opportunities.length}
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 italic">
                        "{currentOpp.originalText}"
                    </div>

                    <div className="space-y-3">
                        <label className="block text-base font-bold text-slate-800">
                            {currentOpp.question}
                        </label>
                        <textarea
                            rows={3}
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="e.g. 'Reduced churn by 12%', 'Saved $40k annually'..."
                            className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-violet-500 focus:border-violet-500 text-sm"
                            autoFocus
                        />
                        <p className="text-[11px] text-slate-500 leading-tight">
                            <strong>Why?</strong> {currentOpp.reasoning}
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t flex justify-between items-center flex-shrink-0">
                <button onClick={handleNext} disabled={isApplying} className="text-slate-400 hover:text-slate-600 font-bold text-xs uppercase">Skip</button>
                <button
                    onClick={handleSubmit}
                    disabled={!userInput.trim() || isApplying}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-bold rounded-md shadow-md text-white bg-violet-600 hover:bg-violet-700 disabled:bg-slate-400"
                >
                    {isApplying ? <LoadingSpinner className="h-4 w-4 text-white mr-2" /> : null}
                    {isApplying ? 'Applying...' : isLast ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default memo(MetricMinerModal);
