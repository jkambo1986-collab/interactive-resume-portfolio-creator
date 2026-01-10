
/**
 * @file PortfolioFullScreenModal.tsx
 * Modal for high-fidelity full-screen preview and PDF export of the portfolio.
 */

import React, { useState, useCallback } from 'react';
import { PrinterIcon } from './icons/PrinterIcon';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';
import LoadingSpinner from './LoadingSpinner';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

interface PortfolioFullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  userName: string;
}

const PortfolioFullScreenModal: React.FC<PortfolioFullScreenModalProps> = ({ isOpen, onClose, htmlContent, userName }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = useCallback(async () => {
    if (!htmlContent || !window.jspdf || !window.html2canvas) return;
    setIsDownloading(true);

    const wrapperId = 'portfolio-pdf-render-wrapper';
    let wrapper = document.getElementById(wrapperId);
    if (wrapper) wrapper.remove();

    try {
      wrapper = document.createElement('div');
      wrapper.id = wrapperId;
      wrapper.style.position = 'fixed';
      wrapper.style.left = '0';
      wrapper.style.top = '0';
      wrapper.style.zIndex = '-9999';
      wrapper.style.width = '1200px'; // Desktop-width capture
      wrapper.style.backgroundColor = 'white';
      
      // Inject the portfolio HTML and ensure tailwind/fonts load
      wrapper.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Roboto:wght@400;700&family=Source+Sans+Pro:wght@400;700&display=swap');
          html, body { height: auto !important; overflow: visible !important; }
        </style>
        <script src="https://cdn.tailwindcss.com"></script>
        <div id="capture-root">${htmlContent}</div>
      `;
      
      document.body.appendChild(wrapper);

      // Give extra time for Tailwind CDN to process and images to load
      await new Promise(resolve => setTimeout(resolve, 1500));

      const captureTarget = wrapper.querySelector('#capture-root') as HTMLElement;
      const canvas = await window.html2canvas(captureTarget, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${userName.replace(/\s+/g, '_')}_Portfolio.pdf`);
    } catch (error) {
      console.error('PDF Generation failed', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
      if (wrapper) wrapper.remove();
    }
  }, [htmlContent, userName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-fade-in" role="dialog" aria-modal="true">
      <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-white font-bold tracking-tight">Portfolio Live Preview</h2>
          <span className="text-slate-400 text-xs uppercase tracking-widest font-bold hidden sm:inline">Desktop View</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownloadPdf} 
            disabled={isDownloading}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md text-sm font-bold transition-all disabled:opacity-50"
          >
            {isDownloading ? <LoadingSpinner className="h-4 w-4 text-white" /> : <DocumentArrowDownIcon />}
            {isDownloading ? 'Capturing...' : 'Download PDF'}
          </button>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-2 text-2xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>
      </header>
      
      <main className="flex-grow bg-slate-200 overflow-hidden flex items-center justify-center p-4 sm:p-8">
        <div className="w-full h-full max-w-6xl bg-white shadow-2xl rounded-lg overflow-hidden border border-slate-300">
          <iframe 
            srcDoc={htmlContent} 
            title="Portfolio Full Screen" 
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </main>

      <footer className="h-10 bg-slate-800 text-slate-400 text-[10px] flex items-center justify-center gap-4 px-6 uppercase tracking-[0.2em] font-black">
        <span>Interactive Mode Active</span>
        <span className="h-1 w-1 bg-green-500 rounded-full animate-pulse"></span>
        <span>A4 Optimized Export</span>
      </footer>
    </div>
  );
};

export default PortfolioFullScreenModal;
