
/**
 * @file ABTestModal.tsx
 * This component provides a modal interface for A/B testing different versions of resume text.
 * It has been enhanced to allow selection from multiple AI-generated alternatives.
 */

import React, { useState, useEffect, memo } from 'react';
import type { ABTestResult, ABTestAnalysis } from '../types';
import { generateAlternativeText, analyzeABTest, optimizeTextWithKeywords } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { AutoFixIcon } from './icons/AutoFixIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface ABTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (newText: string) => void;
    originalText: string;
    fieldName: string;
    jobDescription: string;
}

const AtsProgressCircle: React.FC<{ score: number }> = ({ score }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    let colorClass = 'text-red-500';
    if (score >= 75) colorClass = 'text-green-500';
    else if (score >= 50) colorClass = 'text-yellow-500';

    return (
        <div className="relative h-16 w-16">
            <svg className="transform -rotate-90" width="64" height="64" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={radius} strokeWidth="8" stroke="currentColor" className="text-slate-200" fill="transparent" />
                <circle
                    cx="40" cy="40" r={radius} strokeWidth="8" stroke="currentColor"
                    className={`transition-all duration-1000 ease-in-out ${colorClass}`}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${colorClass}`}>{score}</span>
        </div>
    );
};

const ResultCard = ({ title, score, analysis, result, isWinner, onSelect, onOptimize, isOptimizing }: any) => {
    const isGood = score >= 80;
    const isMedium = score >= 60 && score < 80;

    return (
        <div className={`group p-6 rounded-[32px] border transition-all duration-500 relative flex flex-col h-full ${isWinner ? 'border-sky-400/50 bg-white/40 shadow-[0_20px_50px_rgba(14,165,233,0.15)] ring-1 ring-sky-200/50 scale-[1.02] z-10' : 'border-white/20 bg-white/20 hover:bg-white/30 shadow-sm'}`}>
            {isWinner && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white px-6 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl animate-bounce-subtle flex items-center gap-2">
                    <span className="text-sm">🏆</span> Optimal Strategy
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h4 className="font-black text-slate-900 text-base tracking-tight leading-tight">{title}</h4>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{isWinner ? 'Validated Best Fit' : 'Neural Suggestion'}</span>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black ring-1 ${isGood ? 'bg-emerald-50 text-emerald-600 ring-emerald-200' : isMedium ? 'bg-amber-50 text-amber-600 ring-amber-200' : 'bg-rose-50 text-rose-600 ring-rose-200'}`}>
                    {score}%
                    <span className="text-[10px] opacity-60 font-medium">ATS</span>
                </div>
            </div>

            <div className="space-y-5 text-xs leading-relaxed flex-grow">
                <div className="bg-white/30 p-4 rounded-2xl border border-white/40 shadow-inner">
                    <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div> Executive Synthesis
                    </span>
                    <p className="text-slate-700 font-medium leading-relaxed italic">"{analysis.feedback}"</p>
                </div>

                <div className="px-1">
                    <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-sky-500"></div> Competitive Edge
                    </span>
                    <p className="text-slate-800 font-semibold">{analysis.humanImpact}</p>
                </div>

                {analysis.missingKeywords?.length > 0 && (
                    <div className="px-1">
                        <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Target Keywords Found</span>
                        <div className="flex flex-wrap gap-1.5">
                            {analysis.missingKeywords.slice(0, 5).map((kw: string) => (
                                <span key={kw} className="px-2.5 py-1 bg-white/50 text-slate-600 rounded-lg text-[9px] font-bold border border-white/60 shadow-sm transition-all hover:scale-105">{kw}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-900/10">
                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Refined Output</span>
                <div className="p-4 bg-slate-950/5 rounded-2xl font-medium text-[12px] text-slate-900 leading-relaxed border border-slate-950/10 whitespace-pre-wrap mb-6 max-h-[150px] overflow-y-auto">
                    {result}
                </div>

                <div className="flex flex-col gap-3">
                    {onOptimize && (
                        <button onClick={onOptimize} disabled={isOptimizing} className="w-full py-3 bg-white text-indigo-600 border-2 border-indigo-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md">
                            {isOptimizing ? <LoadingSpinner className="h-4 w-4 text-indigo-600" /> : <AutoFixIcon className="h-4 w-4" />}
                            Reinforce with Keywords
                        </button>
                    )}
                    <button onClick={onSelect} className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-lg ${isWinner ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:opacity-90 shadow-sky-200' : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'}`}>
                        Execute Selection
                    </button>
                </div>
            </div>
        </div>
    );
};

const ATSScoreDot = ({ color }: { color: string }) => (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="4" cy="4" r="4" fill={color} />
    </svg>
);

const ABTestModalComponent: React.FC<ABTestModalProps> = ({ isOpen, onClose, onUpdate, originalText, fieldName, jobDescription }) => {
    const [versionA, setVersionA] = useState(originalText);
    const [alternatives, setAlternatives] = useState<string[]>([]);
    const [selectedAltIndex, setSelectedAltIndex] = useState<number | null>(null);
    const [analysisResult, setAnalysisResult] = useState<ABTestResult | null>(null); // Renamed from 'result'
    const [isLoading, setIsLoading] = useState(false);
    const [optimizingVersion, setOptimizingVersion] = useState<'A' | number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setVersionA(originalText);
        setAlternatives([]);
        setSelectedAltIndex(null);
        setAnalysisResult(null); // Updated
        setError(null);
    }, [isOpen, originalText]);

    if (!isOpen) return null;

    const handleGenerateAlternatives = async () => {
        setIsLoading(true); setError(null);
        try {
            const alts = await generateAlternativeText(versionA, fieldName);
            setAlternatives(alts);
            setSelectedAltIndex(0); // Auto-select first alt
            setAnalysisResult(null); // Updated
        } catch (e: any) { setError(`Failed: ${e.message}`); }
        finally { setIsLoading(false); }
    };

    const handleAnalyze = async () => {
        if (!jobDescription) { setError("Job description required in Step 1."); return; }
        const targetText = selectedAltIndex !== null ? alternatives[selectedAltIndex] : '';
        if (!versionA.trim() || !targetText.trim()) { setError("Generate alternatives first."); return; }
        setIsLoading(true); setError(null);
        try {
            const res = await analyzeABTest(versionA, targetText, jobDescription, fieldName);
            setAnalysisResult(res); // Updated
        } catch (e: any) { setError(`Analysis failed: ${e.message}`); }
        finally { setIsLoading(false); }
    };

    const handleOptimize = async (target: 'A' | number, keywords: string[]) => {
        setOptimizingVersion(target); setError(null);
        try {
            const text = target === 'A' ? versionA : alternatives[target as number];
            const opt = await optimizeTextWithKeywords(text, keywords, fieldName);
            if (target === 'A') setVersionA(opt);
            else {
                const newAlts = [...alternatives];
                newAlts[target as number] = opt;
                setAlternatives(newAlts);
            }
            setAnalysisResult(null); // Updated
        } catch (e: any) { setError(`Optimization failed: ${e.message}`); }
        finally { setOptimizingVersion(null); }
    };

    const currentComparisonText = selectedAltIndex !== null ? alternatives[selectedAltIndex] : '';

    const winner = analysisResult
        ? (analysisResult.versionA.atsScore >= analysisResult.versionB.atsScore ? 'A' : 'B')
        : null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-morphism w-full max-w-5xl max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-pop-in">
                {/* Header */}
                <div className="px-8 py-6 border-b border-white/20 flex items-center justify-between bg-white/40">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Executive A/B Comparison</h2>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-0.5">Optimizing: {fieldName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 text-3xl leading-none transition-colors">&times;</button>
                </div>

                <main className="p-6 space-y-6 overflow-y-auto flex-grow relative">
                    <>
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center">
                                <LoadingSpinner />
                                <p className="mt-4 text-slate-700 font-bold uppercase text-xs tracking-widest animate-pulse">Running Neural Benchmarks...</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left: Original Version */}
                            <div className="lg:col-span-5 flex flex-col">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Version A (Current)</label>
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">Source</span>
                                </div>
                                <div className="relative flex-grow min-h-[300px]">
                                    <textarea
                                        value={versionA}
                                        onChange={e => setVersionA(e.target.value)}
                                        className="block w-full h-full p-4 bg-white border border-slate-300 rounded-lg text-sm shadow-inner focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none"
                                    />
                                    {optimizingVersion === 'A' && <div className="absolute inset-0 bg-white/75 flex items-center justify-center rounded-lg"><LoadingSpinner className="h-8 w-8 text-violet-600" /></div>}
                                </div>
                            </div>

                            {/* Right: AI Selection Mechanism */}
                            <div className="lg:col-span-7 flex flex-col">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Version B (AI Suggestions)</label>
                                    <button onClick={handleGenerateAlternatives} disabled={isLoading} className="text-[10px] text-violet-600 font-bold uppercase hover:underline flex items-center gap-1">
                                        <AutoFixIcon className="h-3 w-3" /> Refresh Options
                                    </button>
                                </div>

                                {!alternatives.length && !error && !isLoading && (
                                    <div className="flex flex-col items-center justify-center py-20 bg-white/30 rounded-[32px] border border-white/20">
                                        <div className="p-4 bg-sky-500/10 text-sky-600 rounded-full mb-4">
                                            <AutoFixIcon className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Optimize</h3>
                                        <p className="text-sm text-slate-500 mb-8 max-w-sm text-center">Our AI will rewrite your {fieldName} using executive-level, high-impact language.</p>
                                        <button onClick={handleGenerateAlternatives} className="bg-slate-900 text-white font-bold py-4 px-10 rounded-2xl hover:bg-black transition-all transform active:scale-95 shadow-xl text-sm pulse-glow">
                                            Generate Optimized Version
                                        </button>
                                    </div>
                                )}

                                {alternatives.length > 0 && (
                                    <div className="animate-fade-in-up">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-[0.2em]">AI Suggestions</h3>
                                            <button onClick={handleGenerateAlternatives} className="text-[10px] font-bold text-sky-600 uppercase tracking-widest hover:text-sky-700 flex items-center gap-1.5 transition-colors">
                                                <AutoFixIcon className="h-3 w-3" /> Refresh Optimized Version
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            {alternatives.map((alt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => { setSelectedAltIndex(idx); setAnalysisResult(null); }}
                                                    className={`text-left p-6 rounded-[32px] border-2 transition-all min-h-[200px] overflow-y-auto ${selectedAltIndex === idx ? 'bg-white border-sky-500 shadow-[0_20px_40px_rgba(14,165,233,0.1)] ring-4 ring-sky-50' : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'}`}
                                                >
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[9px] font-bold uppercase text-sky-600 tracking-widest">Proposed Optimization</span>
                                                        <div className="h-2 w-2 bg-sky-500 rounded-full animate-pulse"></div>
                                                    </div>
                                                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">{alt}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}

                        {alternatives.length > 0 && (
                            <div className="pt-6 border-t mt-4">
                                {!analysisResult ? ( // Updated
                                    <div className="text-center">
                                        <button onClick={handleAnalyze} disabled={isLoading || !jobDescription} className="bg-slate-800 text-white font-bold py-3 px-12 rounded-xl hover:bg-slate-900 transition-all transform active:scale-95 shadow-xl text-sm disabled:bg-slate-400">
                                            Compare Selected Option vs Original
                                        </button>
                                        {!jobDescription && <p className="text-[10px] text-red-500 mt-2 font-bold uppercase tracking-widest animate-bounce">Enter Job Description in Step 1 to unlock ATS scoring</p>}
                                    </div>
                                ) : (
                                    <div className="animate-fade-in-up">
                                        <h3 className="text-xs font-bold text-center mb-6 text-slate-400 uppercase tracking-[0.3em]">Neural Performance Comparison</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                                            <ResultCard
                                                title="Version A (Original)"
                                                score={analysisResult.versionA.atsScore}
                                                analysis={analysisResult.versionA}
                                                result={versionA}
                                                isWinner={winner === 'A'}
                                                onSelect={() => { onUpdate(versionA); onClose(); }}
                                                onOptimize={() => handleOptimize('A', analysisResult.versionA.missingKeywords)}
                                                isOptimizing={optimizingVersion === 'A'}
                                            />
                                            <ResultCard
                                                title="Version B (AI Optimized)"
                                                score={analysisResult.versionB.atsScore}
                                                analysis={analysisResult.versionB}
                                                result={currentComparisonText}
                                                isWinner={winner === 'B'}
                                                onSelect={() => { onUpdate(currentComparisonText); onClose(); }}
                                                onOptimize={() => handleOptimize(selectedAltIndex!, analysisResult.versionB.missingKeywords)}
                                                isOptimizing={optimizingVersion === selectedAltIndex}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                </main>
                <footer className="p-4 bg-slate-50 border-t flex justify-between items-center flex-shrink-0">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Review the optimized version and run Neural Benchmarks to measure ATS impact.</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Powered by Gemini 3.0 Pro</p>
                </footer>
            </div>
        </div>
    );
};

export default memo(ABTestModalComponent);
