import React from 'react';

export const AccessibilityIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 12a4 4 0 00-4 4v1a1 1 0 001 1h6a1 1 0 001-1v-1a4 4 0 00-4-4z" />
      <path fillRule="evenodd" d="M10.623 8.362a.75.75 0 010 1.06l-1.18 1.18a.75.75 0 01-1.06-1.06l1.18-1.18a.75.75 0 011.06 0zM14.97 1.03a.75.75 0 010 1.06l-2.121 2.121a.75.75 0 11-1.06-1.06L13.91 1.03a.75.75 0 011.06 0zM3.97 1.03a.75.75 0 011.06 0l2.121 2.121a.75.75 0 11-1.06 1.06L3.97 2.09a.75.75 0 010-1.06zM2.25 10a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM17 10a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0V10a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
);