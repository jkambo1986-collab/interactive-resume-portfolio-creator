
/**
 * @file ResumePreview.tsx
 * Display and interact with AI-generated content.
 */

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
    htmlToDocx: any;
    axe: any;
  }
}

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { SparklesIcon } from './icons/SparklesIcon';
import { SendIcon } from './icons/SendIcon';
import { CodeBracketIcon } from './icons/CodeBracketIcon';
import { refineResumeLayout } from '../services/geminiService';
import WebSearch from './WebSearch';
import OutreachKitPreview from './OutreachKitPreview';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { SearchIcon } from './icons/SearchIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';
import { DocumentWordIcon } from './icons/DocumentWordIcon';
import { useAppContext } from '../context/AppContext';
import LoadingState from './LoadingState';
import FeedbackCollector from './FeedbackCollector';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { AccessibilityIcon } from './icons/AccessibilityIcon';
import AccessibilityChecker from './AccessibilityChecker';
import { PrinterIcon } from './icons/PrinterIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import InterviewSimulator from './InterviewSimulator';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { ExpandIcon } from './icons/ExpandIcon';
import PortfolioFullScreenModal from './PortfolioFullScreenModal';

const ResumePreview: React.FC = () => {
  const {
    layouts,
    portfolioHtml,
    outreachKit,
    resumeData,
    loadingContext,
    feedback,
    handleFeedbackSubmit,
    view,
    setView,
    updateResumeDataByPath,
    setSuccessMessage,
    tier,
    triggerUpgrade,
    interviewState,
    setInterviewState,
    interviewQuestions,
    interviewFeedback,
    handleAnalyzeInterview,
    handleGenerateOutreachKit,
    handleGeneratePortfolio,
    handlePrepareInterview
  } = useAppContext();

  const [selectedLayout, setSelectedLayout] = useState(0);
  const [refinementRequest, setRefinementRequest] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refinementError, setRefinementError] = useState<string | null>(null);
  const [refinedLayouts, setRefinedLayouts] = useState<string[]>([]);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(75);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);

  const tabs = [
    { name: 'Resumes', view: 'resumes', icon: DocumentTextIcon, colors: { active: 'bg-sky-600 text-white shadow', inactive: 'text-sky-700 hover:bg-sky-100' } },
    { name: 'Portfolio', view: 'portfolio', icon: GlobeIcon, colors: { active: 'bg-violet-600 text-white shadow', inactive: 'text-violet-700 hover:bg-violet-100' } },
    { name: 'Accessibility', view: 'accessibility', icon: AccessibilityIcon, colors: { active: 'bg-indigo-600 text-white shadow', inactive: 'text-indigo-700 hover:bg-indigo-100' } },
    { name: 'Cover Letter', view: 'outreach', icon: EnvelopeIcon, colors: { active: 'bg-teal-600 text-white shadow', inactive: 'text-teal-700 hover:bg-teal-100' } },
    { name: 'Interview', view: 'interview', icon: MicrophoneIcon, colors: { active: 'bg-rose-600 text-white shadow', inactive: 'text-rose-700 hover:bg-rose-100' } },
    { name: 'Research', view: 'research', icon: SearchIcon, colors: { active: 'bg-amber-600 text-white shadow', inactive: 'text-amber-700 hover:bg-amber-100' } },
  ] as const;

  const rawHtml = useMemo(() => refinedLayouts[selectedLayout] || layouts[selectedLayout] || '', [layouts, refinedLayouts, selectedLayout]);

  const interactiveHtml = useMemo(() => {
    if (!rawHtml || !isInteractiveMode) return rawHtml;
    const injection = `
      <style>
        [data-editable] { transition: all 0.2s; cursor: pointer; border-radius: 2px; }
        [data-editable]:hover { outline: 2px dashed #0ea5e9; background-color: rgba(14, 165, 233, 0.1); }
        [data-editable]:focus { outline: 2px solid #0ea5e9; background-color: white; cursor: text; }
        html, body { height: auto !important; min-height: 100%; overflow: visible !important; }
      </style>
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const editables = document.querySelectorAll('[data-editable]');
          editables.forEach(el => {
            el.setAttribute('contenteditable', 'true');
            el.addEventListener('blur', (e) => {
               const path = el.getAttribute('data-editable');
               const value = el.innerText;
               window.parent.postMessage({ type: 'RESUME_UPDATE', path, value }, '*');
            });
          });
        });
      </script>
    `;
    return rawHtml.includes('</head>') ? rawHtml.replace('</head>', `${injection}</head>`) : `<html><head>${injection}</head>${rawHtml}</html>`;
  }, [rawHtml, isInteractiveMode]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'RESUME_UPDATE') {
        updateResumeDataByPath(event.data.path, event.data.value);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [updateResumeDataByPath]);

  useEffect(() => {
    if (!rawHtml) { setTotalPages(1); setCurrentPage(1); return; }
    const m = document.createElement('div');
    m.style.position = 'fixed'; m.style.left = '-9999px'; m.style.width = '210mm';
    m.innerHTML = `<style>html, body { height: auto !important; overflow: visible !important; }</style>` + rawHtml;
    document.body.appendChild(m);
    const timer = setTimeout(() => {
      try {
        const h = (m.offsetWidth / 210) * 297;
        setTotalPages(Math.ceil(m.scrollHeight / h) || 1);
        setCurrentPage(1);
      } finally { document.body.removeChild(m); }
    }, 150);
    return () => clearTimeout(timer);
  }, [rawHtml]);

  const paginatedHtml = useMemo(() => {
    const h = isInteractiveMode ? interactiveHtml : rawHtml;
    if (!h || isInteractiveMode) return h;
    const off = (currentPage - 1) * 297;
    const s = `<style>html,body{height:auto!important;overflow:visible!important;}body>*:first-child{position:relative!important;top:-${off}mm!important;}</style>`;
    return h.includes('</head>') ? h.replace('</head>', `${s}</head>`) : `<html><head>${s}</head>${h}</html>`;
  }, [rawHtml, interactiveHtml, currentPage, isInteractiveMode]);

  const handleRefineLayout = async () => {
    if (!refinementRequest.trim()) return;
    setIsRefining(true);
    try {
      const n = await refineResumeLayout(rawHtml, refinementRequest);
      const r = [...refinedLayouts]; r[selectedLayout] = n;
      setRefinedLayouts(r); setRefinementRequest(''); setSuccessMessage("Refined!");
    } catch (e: any) { setRefinementError(e.message); }
    finally { setIsRefining(false); }
  };

  const handleDownloadPdf = async () => {
    if (!rawHtml || !window.jspdf || !window.html2canvas) return;
    setIsDownloadingPdf(true);
    const w = document.createElement('div');
    w.style.position = 'fixed'; w.style.left = '0'; w.style.top = '0'; w.style.zIndex = '-9999'; w.style.width = '210mm';
    w.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Roboto:wght@400;700&family=Source+Sans+Pro:wght@400;700&display=swap');html,body{height:auto!important;overflow:visible!important;}</style><div id="pc">${rawHtml}</div>`;
    document.body.appendChild(w);
    try {
      await new Promise(res => setTimeout(res, 500));
      const c = await window.html2canvas(w.querySelector('#pc'), { scale: 1.5, useCORS: true, backgroundColor: '#ffffff' });
      const img = c.toDataURL('image/jpeg', 0.95);
      const pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pw = pdf.internal.pageSize.getWidth(); const ph = pdf.internal.pageSize.getHeight();
      const ih = (c.height * pw) / c.width;
      let hl = ih; let pos = 0;
      pdf.addImage(img, 'JPEG', 0, pos, pw, ih); hl -= ph;
      while (hl > 0) { pos -= ph; pdf.addPage(); pdf.addImage(img, 'JPEG', 0, pos, pw, ih); hl -= ph; }
      pdf.save('resume.pdf');
    } finally { setIsDownloadingPdf(false); document.body.removeChild(w); }
  };

  const renderContent = () => {
    if (loadingContext.target === 'preview') return <LoadingState title={loadingContext.title} messages={loadingContext.messages} />;

    switch (view) {
      case 'resumes':
        if (layouts.length > 0) {
          return (
            <div className="h-full flex flex-col">
              <div className="p-2 bg-slate-100 border-b flex justify-between items-center overflow-x-auto gap-2">
                <nav className="flex space-x-2">
                  {layouts.map((_, i) => (
                    <button key={i} onClick={() => (tier === 'free' && i > 0) ? triggerUpgrade() : setSelectedLayout(i)} className={`py-1 px-3 rounded text-xs font-bold ${selectedLayout === i ? 'bg-white text-sky-600 shadow' : 'text-slate-600'}`}>
                      L{i + 1} {(tier === 'free' && i > 0) && '🔒'}
                    </button>
                  ))}
                </nav>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsInteractiveMode(!isInteractiveMode)} className={`text-xs px-2 py-1 rounded font-bold ${isInteractiveMode ? 'bg-sky-600 text-white' : 'bg-white text-slate-700 border'}`}>Edit Mode</button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-1 disabled:opacity-30"><ChevronLeftIcon /></button>
                    <span className="text-xs">{currentPage}/{totalPages}</span>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-1 disabled:opacity-30"><ChevronRightIcon /></button>
                  </div>
                </div>
              </div>
              <div className="flex-grow bg-slate-200 overflow-auto p-4 flex justify-center">
                <div style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}>
                  <iframe srcDoc={paginatedHtml} title="Resume" className="w-[210mm] h-[297mm] border-none bg-white shadow-xl" sandbox="allow-same-origin allow-scripts" />
                </div>
              </div>
              <div className="p-4 bg-white border-t space-y-3">
                <div className="flex gap-2 justify-end">
                  <button onClick={() => window.print()} className="flex items-center gap-1 text-xs font-bold text-slate-700 border p-2 rounded"><PrinterIcon /> Print</button>
                  <button onClick={handleDownloadPdf} disabled={isDownloadingPdf} className="flex items-center gap-1 text-xs font-bold text-white bg-green-600 p-2 rounded">{isDownloadingPdf ? '...' : <DocumentArrowDownIcon />} PDF</button>
                </div>
                <div className="flex gap-1">
                  <input type="text" value={refinementRequest} onChange={e => setRefinementRequest(e.target.value)} placeholder="Refine layout..." className="flex-grow text-xs border p-2 rounded" />
                  <button onClick={handleRefineLayout} disabled={isRefining} className="bg-slate-800 text-white p-2 rounded"><SendIcon /></button>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 glass-morphism rounded-xl m-4">
            <DocumentTextIcon className="h-12 w-12 text-sky-200" />
            <h3 className="text-lg font-bold text-slate-800">No Resume Generated</h3>
            <p className="text-sm text-slate-500 max-w-xs">Fill out the form on the left and click "Generate" to see your professional resumes.</p>
          </div>
        );

      case 'portfolio':
        if (portfolioHtml) {
          return (
            <div className="h-full flex flex-col">
              <div className="p-2 bg-slate-100 border-b flex justify-end">
                <button
                  onClick={() => setIsPortfolioModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1 bg-white text-slate-700 border border-slate-300 rounded text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  <ExpandIcon /> Full Screen
                </button>
              </div>
              <iframe srcDoc={portfolioHtml} className="flex-grow w-full border-none" sandbox="allow-scripts allow-same-origin" />
              <div className="p-4"><FeedbackCollector id="p" onSubmit={(r, c) => handleFeedbackSubmit('portfolio', null, r, c)} /></div>

              <PortfolioFullScreenModal
                isOpen={isPortfolioModalOpen}
                onClose={() => setIsPortfolioModalOpen(false)}
                htmlContent={portfolioHtml}
                userName={resumeData.personalInfo.name}
              />
            </div>
          );
        }
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 glass-morphism rounded-xl m-4">
            <GlobeIcon className="h-12 w-12 text-violet-200" />
            <h3 className="text-lg font-bold text-slate-800">No Portfolio Site Found</h3>
            <p className="text-sm text-slate-500 max-w-xs">Create a stunning, single-page professional website to showcase your skills online.</p>
            <button onClick={handleGeneratePortfolio} className="bg-violet-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-violet-700 transition-transform active:scale-95">Generate Portfolio</button>
          </div>
        );

      case 'outreach':
        if (outreachKit) return < OutreachKitPreview kit={outreachKit} personalInfo={resumeData.personalInfo} />;
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 glass-morphism rounded-xl m-4">
            <EnvelopeIcon className="h-12 w-12 text-teal-200" />
            <h3 className="text-lg font-bold text-slate-800">No Cover Letter Found</h3>
            <p className="text-sm text-slate-500 max-w-xs">Generate a tailored cover letter and LinkedIn outreach messages based on your target job.</p>
            <button onClick={handleGenerateOutreachKit} className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-teal-700 transition-transform active:scale-95">Generate Now</button>
          </div>
        );

      case 'interview':
        if (interviewState !== 'idle') {
          return (
            <div className="h-full p-4 overflow-y-auto">
              <InterviewSimulator state={interviewState} questions={interviewQuestions} feedback={interviewFeedback} onAnalysis={handleAnalyzeInterview} setState={setInterviewState} />
            </div>
          );
        }
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 glass-morphism rounded-xl m-4">
            <MicrophoneIcon className="h-12 w-12 text-rose-200" />
            <h3 className="text-lg font-bold text-slate-800">Mock Interview Practice</h3>
            <p className="text-sm text-slate-500 max-w-xs">Prepare for the real thing with an AI-driven interview simulation tailored to your profile.</p>
            <button onClick={handlePrepareInterview} className="bg-rose-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-rose-700 transition-transform active:scale-95">Start Prep Session</button>
          </div>
        );

      case 'research':
        return <WebSearch />;
      case 'accessibility':
        return <AccessibilityChecker htmlContent={rawHtml} />;
      default:
        return (
          <div className="h-full flex items-center justify-center p-8 text-center text-slate-400">
            Select an asset tab to preview content
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col overflow-hidden">
      <div className="p-2 bg-slate-50 border-b flex space-x-1 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon; const isActive = view === t.view;
          return (
            <button key={t.view} onClick={() => setView(t.view)} className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition-colors ${isActive ? t.colors.active : t.colors.inactive}`}>
              <Icon className="h-3.5 w-3.5" /> {t.name}
            </button>
          );
        })}
      </div>
      <div className="flex-grow overflow-hidden">{renderContent()}</div>
    </div>
  );
};

export default ResumePreview;
