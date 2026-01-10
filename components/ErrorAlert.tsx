/**
 * @file ErrorAlert.tsx
 * A component that displays a styled error message.
 * It's used as a global error notification banner at the top of the app.
 * It includes a dismiss button to close the alert.
 */

import React, { memo } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';

interface ErrorAlertProps {
  message: string;
  onClose: () => void;
}

const ErrorAlertComponent: React.FC<ErrorAlertProps> = ({ message, onClose }) => {
  return (
    <div className="rounded-md bg-red-50 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">An Error Occurred</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
              aria-label="Dismiss error message"
            >
              <span className="sr-only">Dismiss</span>
              {/* Close Icon SVG */}
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoize the component for performance.
export default memo(ErrorAlertComponent);
