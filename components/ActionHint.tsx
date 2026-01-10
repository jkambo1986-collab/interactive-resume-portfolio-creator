import React from 'react';

interface ActionHintProps {
    message: string;
    className?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

const ActionHint: React.FC<ActionHintProps> = ({ message, className = '', position = 'top' }) => {
    const positionClasses = {
        top: 'bottom-full mb-3 left-1/2 -translate-x-1/2',
        bottom: 'top-full mt-3 left-1/2 -translate-x-1/2',
        left: 'right-full mr-3 top-1/2 -translate-y-1/2',
        right: 'left-full ml-3 top-1/2 -translate-y-1/2',
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-indigo-600',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-indigo-600',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-indigo-600',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-indigo-600',
    };

    return (
        <div className={`absolute z-50 animate-pop-in ${positionClasses[position]} ${className}`}>
            <div className="relative glass-morphism px-4 py-2 rounded-lg border border-indigo-200 shadow-xl max-w-xs">
                <p className="text-xs font-medium text-indigo-900 leading-relaxed italic">
                    <span className="mr-1">✨</span>
                    {message}
                </p>
                <div className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}></div>
            </div>
        </div>
    );
};

export default ActionHint;
