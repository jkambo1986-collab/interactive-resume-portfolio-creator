/**
 * @file PlusIcon.tsx
 * A stateless functional component that renders a plus (+) SVG icon.
 */

import React, { memo } from 'react';

const PlusIconComponent: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

export const PlusIcon = memo(PlusIconComponent);
