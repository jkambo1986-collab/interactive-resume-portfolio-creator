/**
 * @file ScaleIcon.tsx
 * A stateless functional component that renders a balance scale SVG icon.
 * Used for the A/B Test feature.
 */

import React from 'react';

export const ScaleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm.25 11.5a.75.75 0 00.75.75h3.5a.75.75 0 00.75-.75V4a.75.75 0 00-.75-.75h-3.5a.75.75 0 00-.75.75v9.5zM10.5 4a.75.75 0 01.75-.75h3.5a.75.75 0 01.75.75v9.5a.75.75 0 01-.75.75h-3.5a.75.75 0 01-.75-.75V4z" clipRule="evenodd" />
    </svg>
);
