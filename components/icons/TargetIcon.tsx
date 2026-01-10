/**
 * @file TargetIcon.tsx
 * A stateless functional component that renders a target or bullseye SVG icon.
 * Used for the "Analyze Fit" feature.
 */

import React from 'react';

export const TargetIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);
