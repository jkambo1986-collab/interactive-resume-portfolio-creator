/**
 * @file DocumentArrowUpIcon.tsx
 * A stateless functional component that renders a document with an upward arrow SVG icon.
 * Used for file upload prompts.
 */

import React from 'react';

export const DocumentArrowUpIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11V3m0 8l-3-3m3 3l3-3" />
    </svg>
);
