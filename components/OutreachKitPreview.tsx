/**
 * @file OutreachKitPreview.tsx
 * This component displays the generated outreach kit, which includes a cover letter
 * and several outreach messages with different tones. It provides functionality to
 * copy the text to the clipboard and download the cover letter as a formatted PDF.
 */

import React, { useState, useCallback, memo } from 'react';
import type { OutreachKit, PersonalInfo } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';

// Inform TypeScript about the global libraries from the CDN.
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

/**
 * A custom hook for handling copy-to-clipboard functionality.
 */
const useCopyToClipboard = (): [boolean, (text: string) => void] => {
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, []);

  return [isCopied, copy];
};

const CopyButton: React.FC<{ textToCopy: string }> = memo(({ textToCopy }) => {
    const [isCopied, copy] = useCopyToClipboard();

    return (
         <button
            onClick={() => copy(textToCopy)}
            className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
        >
            {isCopied ? <><CheckIcon /> Copied!</> : <><ClipboardIcon /> Copy</>}
        </button>
    );
});

interface OutreachKitPreviewComponentProps {
  kit: OutreachKit;
  personalInfo: PersonalInfo;
}

const OutreachKitPreviewComponent: React.FC<OutreachKitPreviewComponentProps> = ({ kit, personalInfo }) => {
    const [selectedMessage, setSelectedMessage] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    /**
     * Handles the generation and download of the cover letter as a PDF.
     * Uses html2canvas to capture a styled "Letterhead" view, ensuring consistent layout and formatting.
     */
    const handleDownloadPdf = useCallback(async () => {
        if (!kit.coverLetter) return;

        setIsDownloading(true);
        setDownloadError(null);

        const wrapperId = 'cl-pdf-wrapper';
        let wrapper = document.getElementById(wrapperId);
        if (wrapper) wrapper.remove();

        try {
            // Create a temporary container for PDF generation that mimics a real A4 letter
            wrapper = document.createElement('div');
            wrapper.id = wrapperId;
            wrapper.style.position = 'fixed';
            wrapper.style.left = '-9999px';
            wrapper.style.top = '0';
            wrapper.style.width = '210mm'; // A4 width
            wrapper.style.minHeight = '297mm'; // A4 height
            wrapper.style.backgroundColor = 'white';
            wrapper.style.padding = '25mm'; // Standard formal margins
            wrapper.style.boxSizing = 'border-box';
            
            // Construct the Professional Letter Layout
            // This injects the user's header and the formatted body text
            wrapper.innerHTML = `
                <div style="font-family: 'Times New Roman', Times, serif; color: #111; line-height: 1.6;">
                    <!-- Header -->
                    <div style="border-bottom: 1px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
                        <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">${personalInfo.name}</h1>
                        <div style="font-size: 11pt; color: #444;">
                            ${personalInfo.email} 
                            ${personalInfo.phone ? ` • ${personalInfo.phone}` : ''}
                            ${personalInfo.linkedin ? ` • ${personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}` : ''}
                            ${personalInfo.portfolio ? ` • ${personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '')}` : ''}
                        </div>
                    </div>
                    
                    <!-- Body -->
                    <div style="font-size: 12pt; white-space: pre-wrap; text-align: justify;">${kit.coverLetter}</div>
                </div>
            `;
            
            document.body.appendChild(wrapper);
            
            // Wait for render (fonts, layout)
            await new Promise(resolve => setTimeout(resolve, 500));

            // Capture the layout
            const canvas = await window.html2canvas(wrapper, {
                scale: 2, // High resolution for print
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            
            // Handle pagination if the letter is longer than one page
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

            const fileName = `cover_letter_${personalInfo.name.replace(/ /g, '_')}.pdf`;
            pdf.save(fileName);

        } catch (error: any) {
            console.error('Failed to generate cover letter PDF:', error);
            setDownloadError(`An error occurred while generating the PDF. Details: ${error.message}`);
        } finally {
            if (wrapper) wrapper.remove();
            setIsDownloading(false);
        }
    }, [kit.coverLetter, personalInfo]);

    if (!kit) return null;

    const hasMessages = kit.outreachMessages && kit.outreachMessages.length > 0;
    
    return (
        <div className="space-y-6 p-1" style={{ height: 'calc(100vh - 220px)', overflowY: 'auto' }}>
            {/* Cover Letter Section */}
            {kit.coverLetter && (
              <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Generated Cover Letter</h3>
                  <div className="relative p-8 bg-white rounded-md border shadow-sm prose prose-slate max-w-none">
                      <div className="absolute top-2 right-2 flex items-center gap-2 no-print">
                        <button
                            onClick={handleDownloadPdf}
                            disabled={isDownloading}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-700 rounded-md hover:bg-slate-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed shadow-sm"
                            title="Download as Formatted PDF"
                        >
                            <DocumentArrowDownIcon />
                            {isDownloading ? 'Generating...' : 'Download PDF'}
                        </button>
                        <CopyButton textToCopy={kit.coverLetter} />
                      </div>
                      
                      {/* Visual Preview of the Letter Layout */}
                      <div className="font-serif text-slate-900">
                           <div className="border-b-2 border-slate-800 pb-4 mb-6">
                                <h1 className="text-2xl font-bold uppercase tracking-wide m-0">{personalInfo.name}</h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    {personalInfo.email} • {personalInfo.phone}
                                </p>
                           </div>
                           <div style={{ whiteSpace: 'pre-wrap' }}>{kit.coverLetter}</div>
                      </div>

                      {downloadError && <p className="text-xs text-red-600 mt-4 bg-red-50 p-2 rounded">{downloadError}</p>}
                  </div>
              </div>
            )}
            
            {/* Outreach Messages Section */}
            {hasMessages && (
              <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Outreach Messages</h3>
                  <div className="border-b border-slate-200">
                      <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                          {kit.outreachMessages.map((msg, index) => (
                              <button
                                  key={index}
                                  onClick={() => setSelectedMessage(index)}
                                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                                      selectedMessage === index
                                          ? 'border-sky-500 text-sky-600'
                                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                  }`}
                              >
                                  {msg.tone}
                              </button>
                          ))}
                      </nav>
                  </div>
                   <div className="mt-4 relative p-4 bg-slate-50 rounded-md border prose prose-sm max-w-none">
                      <div className="absolute top-2 right-2">
                         <CopyButton textToCopy={kit.outreachMessages[selectedMessage].message} />
                      </div>
                       <p style={{ whiteSpace: 'pre-wrap' }}>{kit.outreachMessages[selectedMessage].message}</p>
                  </div>
              </div>
            )}
        </div>
    );
};

export default memo(OutreachKitPreviewComponent);
