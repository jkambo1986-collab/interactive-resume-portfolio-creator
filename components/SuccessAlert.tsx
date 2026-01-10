/**
 * @file SuccessAlert.tsx
 * A component that displays a styled success message toast notification.
 * It automatically dismisses itself after a few seconds.
 */

import React, { useEffect, memo } from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface SuccessAlertProps {
  message: string;
  onClose: () => void;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({ message, onClose }) => {
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <div className="flex items-center gap-3 bg-white border border-green-200 shadow-xl rounded-lg p-4 max-w-sm">
        <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
        <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Success</p>
            <p className="text-sm text-slate-600">{message}</p>
        </div>
        <button 
            onClick={onClose}
            className="ml-2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Close"
        >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default memo(SuccessAlert);