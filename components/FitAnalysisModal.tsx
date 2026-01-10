
/**
 * @file FitAnalysisModal.tsx
 * This component displays the results of the resume-to-job-fit analysis in a large, dashboard-style modal.
 */

import React, { memo } from 'react';
import type { FitAnalysisResult } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { TargetIcon } from './icons/TargetIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

const AtsProgressCircle: React.FC<{ score: number }> = ({ score }) => {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    let colorClass = 'text-red-500';
    if (score >= 80) colorClass = 'text-green-500';
    else if (score >= 60) colorClass = 'text-yellow-500';

    return (
        <div className="relative h-32 w-32 sm:h-48 sm:w-48 flex-shrink-0">
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} strokeWidth="10" stroke="currentColor" className="text-slate-100" fill="transparent" />
                <circle
                    cx="60" cy="60" r={radius} strokeWidth="10" stroke="currentColor"
                    className={`transition-all duration-1000 ease-in-out ${colorClass}`}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl sm:text-5xl font-black ${colorClass}`}>{score}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Alignment</span>
            </div>
        </div>
    );
};

interface FitAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: FitAnalysisResult | null;
  isLoading: boolean;
}

const FitAnalysisModalComponent: React.FC<FitAnalysisModalProps> = ({ isOpen, onClose, result, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-6" role="dialog" aria-modal="true">
        <div className="bg-white rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-bounce-in border border-slate-200">
            <header className="flex justify-between items-center px-8 py-6 border-b bg-slate-50 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-sky-600 text-white rounded-2xl shadow-xl shadow-sky-200/50">
                        <TargetIcon className="h-7 w-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Job Fit Intelligence</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">ATS Benchmarking & Strategic Analysis</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 text-4xl leading-none transition-colors">&times;</button>
            </header>

            <main className="p-8 sm:p-10 space-y-10 overflow-y-auto flex-grow bg-white">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                        <LoadingSpinner className="h-20 w-20 text-sky-600 animate-spin" />
                        <div className="mt-8 text-center">
                            <p className="text-slate-800 font-black uppercase text-sm tracking-[0.4em] animate-pulse">Running Comparative Algorithms</p>
                            <p className="text-xs text-slate-500 mt-2">Simulating hiring manager review...</p>
                        </div>
                    </div>
                )}
                
                {result && !isLoading && (
                    <div className="space-y-12 animate-fade-in-up">
                        {/* Hero Section: Score & Summary */}
                        <div className="flex flex-col lg:flex-row items-center lg:items-center gap-10 p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <AtsProgressCircle score={result.fitScore} />
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] mb-4">Strategic Overview</h3>
                                    <p className="text-lg text-slate-700 leading-relaxed font-medium">{result.overallSummary}</p>
                                </div>
                                <div className="flex flex-wrap gap-6 pt-2">
                                    <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Keywords Matched</span>
                                        <span className="text-2xl font-black text-green-600">{result.keywordAnalysis.matchingKeywords.length}</span>
                                    </div>
                                    <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Critical Gaps</span>
                                        <span className="text-2xl font-black text-red-500">{result.keywordAnalysis.missingKeywords.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Keywords Breakdown */}
                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                                        <CheckCircleIcon className="h-5 w-5 text-green-500" /> Competency Alignment
                                    </h3>
                                    <div className="flex flex-wrap gap-2.5">
                                        {result.keywordAnalysis.matchingKeywords.map(kw => (
                                            <span key={kw} className="bg-green-50 text-green-700 text-[11px] font-black px-4 py-2 rounded-xl border border-green-100 shadow-sm">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                                <section>
                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 bg-red-400 rounded-full"></div> Target Gaps to Fix
                                    </h3>
                                    <div className="flex flex-wrap gap-2.5">
                                        {result.keywordAnalysis.missingKeywords.map(kw => (
                                            <span key={kw} className="bg-red-50 text-red-600 text-[11px] font-black px-4 py-2 rounded-xl border border-red-100 shadow-sm">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Experience Gap Analysis */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-4">Strategic Impact Suggestions</h3>
                                <div className="space-y-4">
                                    {result.experienceGapAnalysis.map((gap, i) => (
                                        <div key={i} className="p-5 bg-white border border-slate-200 rounded-[1.25rem] hover:border-sky-300 transition-all shadow-sm hover:shadow-md group">
                                            <h4 className="text-sm font-black text-slate-800 flex items-center gap-3">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-[10px] font-black text-sky-700 group-hover:bg-sky-600 group-hover:text-white transition-colors">{i + 1}</span>
                                                {gap.area}
                                            </h4>
                                            <p className="text-sm text-slate-600 mt-3 leading-relaxed font-medium">{gap.suggestion}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Skill Prioritization */}
                        {result.skillPrioritization && result.skillPrioritization.length > 0 && (
                            <div className="pt-10 border-t border-slate-100">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-8">Executive Placement Recommendations</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {result.skillPrioritization.map((rec, i) => (
                                        <div key={i} className="flex gap-4 p-5 bg-indigo-50/70 border border-indigo-100 rounded-2xl shadow-sm">
                                            <div className="flex-shrink-0 text-indigo-500 mt-1">
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs font-bold text-indigo-900 leading-relaxed">{rec.recommendation}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <footer className="px-8 py-6 border-t bg-slate-50 flex-shrink-0 flex justify-between items-center">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Comparative Algorithm v4.2.1 • Gemini Pro</p>
                <button onClick={onClose} className="px-10 py-3.5 text-sm font-black text-white bg-slate-800 rounded-2xl hover:bg-slate-900 shadow-xl shadow-slate-200 transition-all active:scale-95 uppercase tracking-widest">
                    Return to Builder
                </button>
            </footer>
        </div>
        <style>{`
            @keyframes bounce-in {
                0% { opacity: 0; transform: scale(0.95); }
                70% { transform: scale(1.02); }
                100% { opacity: 1; transform: scale(1); }
            }
            .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        `}</style>
    </div>
  );
};

export default memo(FitAnalysisModalComponent);
