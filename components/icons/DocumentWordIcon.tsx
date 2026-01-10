/**
 * @file DocumentWordIcon.tsx
 * A stateless functional component that renders a document with a "W" symbol,
 * representing a Word document. Used for the "Download DOCX" action.
 */

import React from 'react';

export const DocumentWordIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    {/* This path creates a stylized 'W' inside the document shape */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 15.5l1.5-3 1.5 3 1.5-3 1.5 3" />
  </svg>
);
