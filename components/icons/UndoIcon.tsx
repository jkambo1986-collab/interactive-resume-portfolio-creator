/**
 * @file UndoIcon.tsx
 * A stateless functional component that renders an undo (go back) SVG icon.
 */

import React from 'react';

export const UndoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 015 5v1" />
    </svg>
);
