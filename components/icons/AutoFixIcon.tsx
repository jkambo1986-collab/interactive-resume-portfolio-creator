/**
 * @file AutoFixIcon.tsx
 * A stateless functional component that renders a magic wand or "auto fix" SVG icon.
 * Used for AI enhancement features.
 */

import React from 'react';

// Added className prop support to fix type errors when used with custom sizing
export const AutoFixIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.293 2.293a1 1 0 00-1.414 0l-1 1-1.586-1.586a1 1 0 00-1.414 1.414L13.586 5 9.293 9.293a1 1 0 000 1.414l5 5a1 1 0 001.414 0l4.293-4.293 1.707 1.707a1 1 0 001.414-1.414l-1.586-1.586 1-1a1 1 0 000-1.414l-3-3zM2 12a1 1 0 011-1h5a1 1 0 010 2H3a1 1 0 01-1-1zm1-4a1 1 0 011-1h9a1 1 0 010 2H4a1 1 0 01-1-1zm-1-4a1 1 0 011-1h12a1 1 0 010 2H3a1 1 0 01-1-1z" />
    </svg>
);
