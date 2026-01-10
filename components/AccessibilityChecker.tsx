import React, { useState, useCallback } from 'react';
import type { AccessibilityReport, AccessibilityViolation } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface AccessibilityCheckerProps {
    htmlContent: string;
}

const ImpactBadge: React.FC<{ impact: AccessibilityViolation['impact'] }> = ({ impact }) => {
    const baseClasses = "text-xs font-semibold px-2 py-0.5 rounded-full capitalize";
    const colors = {
        minor: "bg-blue-100 text-blue-800",
        moderate: "bg-yellow-100 text-yellow-800",
        serious: "bg-orange-100 text-orange-800",
        critical: "bg-red-100 text-red-800",
    };
    return <span className={`${baseClasses} ${colors[impact]}`}>{impact}</span>;
};

const ViolationCard: React.FC<{ violation: AccessibilityViolation }> = ({ violation }) => {
    const wcagTags = violation.tags.filter(tag => tag.startsWith('wcag') || tag.startsWith('best-practice'));

    return (
        <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex justify-between items-start gap-4">
                <h5 className="font-semibold text-slate-800">{violation.help}</h5>
                <ImpactBadge impact={violation.impact} />
            </div>
            <p className="text-sm text-slate-600 mt-2">{violation.description}</p>
            
            {wcagTags.length > 0 && (
                 <div className="mt-4">
                    <h6 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conformance</h6>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {wcagTags.map(tag => (
                            <span key={tag} className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="mt-4 pt-4 border-t">
                <h6 className="text-sm font-semibold text-slate-700 mb-2">Affected Elements ({violation.nodes.length})</h6>
                <div className="space-y-3">
                    {violation.nodes.slice(0, 3).map((node, i) => {
                        const failureMessages = [...node.all, ...node.none]
                            .map(check => check.message)
                            .filter(Boolean);
                        
                        return (
                            <div key={i} className="p-3 border rounded-md bg-slate-50/70">
                                <p className="text-xs font-semibold text-red-700">How to fix:</p>
                                <ul className="list-disc list-inside text-xs text-slate-800 mt-1 space-y-1">
                                    {failureMessages.length > 0 ? failureMessages.map((msg, idx) => <li key={idx}>{msg}</li>) : <li>Review the element against accessibility best practices.</li>}
                                </ul>

                                <p className="text-xs font-semibold text-slate-600 mt-3">Code Snippet:</p>
                                <pre className="text-xs text-slate-900 bg-slate-200 p-2 mt-1 rounded-md block whitespace-pre-wrap overflow-x-auto">
                                    <code>{node.html}</code>
                                </pre>
                            </div>
                        );
                    })}
                     {violation.nodes.length > 3 && (
                        <p className="text-xs text-slate-500 italic mt-2">...and {violation.nodes.length - 3} more elements.</p>
                    )}
                </div>
            </div>

            <a href={violation.helpUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-600 hover:underline mt-4 inline-block font-medium">
                Learn more at Deque University &rarr;
            </a>
        </div>
    );
};


const AccessibilityChecker: React.FC<AccessibilityCheckerProps> = ({ htmlContent }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<AccessibilityReport | null>(null);

    const handleRunCheck = useCallback(async () => {
        if (!window.axe) {
            setError("Accessibility checking library (axe-core) is not loaded. Please try refreshing the page.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setReport(null);

        const wrapperId = 'a11y-render-wrapper';
        let wrapper = document.getElementById(wrapperId);
        if (wrapper) wrapper.remove();

        try {
            wrapper = document.createElement('div');
            wrapper.id = wrapperId;
            wrapper.style.position = 'fixed';
            wrapper.style.left = '-9999px';
            wrapper.style.top = '0';
            wrapper.innerHTML = htmlContent;
            document.body.appendChild(wrapper);
            
            // Wait a bit for render
            await new Promise(resolve => setTimeout(resolve, 200));

            const results = await window.axe.run(wrapper);
            setReport(results);

        } catch (e: any) {
            console.error("Accessibility Check Error:", e);
            setError(e.message || "An unknown error occurred while running the accessibility check.");
        } finally {
            setIsLoading(false);
            if (wrapper) {
                document.body.removeChild(wrapper);
            }
        }
    }, [htmlContent]);

    return (
        <div className="p-4 md:p-6 bg-slate-50 h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-bold text-slate-800">Accessibility Checker</h3>
                <p className="text-sm text-slate-600 mt-1">
                    Check your resume for common accessibility issues to ensure it's readable by everyone, including people using screen readers.
                </p>

                <div className="mt-6 text-center">
                    <button
                        onClick={handleRunCheck}
                        disabled={isLoading || !htmlContent}
                        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                        title={!htmlContent ? "Generate a resume layout first" : "Run accessibility scan"}
                    >
                        {isLoading ? "Scanning..." : "Run Accessibility Scan"}
                    </button>
                </div>
                
                {isLoading && (
                    <div className="mt-6 flex flex-col items-center justify-center">
                        <LoadingSpinner />
                        <p className="mt-2 text-slate-600">Analyzing layout for issues...</p>
                    </div>
                )}
                
                {error && (
                    <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                        <p className="font-semibold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                {report && !isLoading && (
                    <div className="mt-8 animate-fade-in-up">
                        {report.violations.length === 0 ? (
                            <div className="p-6 bg-green-50 text-green-800 border border-green-200 rounded-lg text-center">
                                <h4 className="font-bold text-lg">Great news!</h4>
                                <p>No automatic accessibility issues were detected. This is a great start!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-4 bg-white border rounded-lg">
                                    <h4 className="text-lg font-bold text-slate-800">Scan Summary</h4>
                                    <p className="text-slate-600">Found {report.violations.length} type{report.violations.length > 1 ? 's' : ''} of issues.</p>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Use the "Refine this layout" feature in the "Resumes" tab to ask the AI to fix these issues. For example: "Fix the color contrast for all text."
                                    </p>
                                </div>
                                {report.violations.map((violation, index) => (
                                    <ViolationCard key={violation.id + index} violation={violation} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccessibilityChecker;