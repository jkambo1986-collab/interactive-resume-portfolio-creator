/**
 * @file RedoIcon.tsx
 * A stateless functional component that renders a redo (go forward) SVG icon.
 */

import React from 'react';

export const RedoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 15l3-3m0 0l-3-3m3 3H5a5 5 0 00-5 5v1" />
    </svg>
);
