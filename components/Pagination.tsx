/**
 * @file Pagination.tsx
 * A presentational component that displays the steps of the resume form wizard.
 * It highlights the current step and indicates completed and upcoming steps.
 * It now allows clicking on steps to jump directly to them.
 */

import React, { memo } from 'react';

interface PaginationProps {
  currentStep: number;
  steps: string[];
  onStepClick: (step: number) => void;
}

const PaginationComponent: React.FC<PaginationProps> = ({ currentStep, steps, onStepClick }) => {
  return (
    <nav aria-label="Progress">
       <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((stepName, stepIdx) => {
          const stepNumber = stepIdx + 1;
          const status = currentStep > stepNumber ? 'complete' : currentStep === stepNumber ? 'current' : 'upcoming';
          
          let borderClass = '';
          let textClass1 = '';
          let textClass2 = '';

          if (status === 'complete') {
              borderClass = 'border-sky-600 hover:border-sky-800';
              textClass1 = 'text-sky-600 group-hover:text-sky-800';
              textClass2 = 'text-slate-800 group-hover:text-slate-900';
          } else if (status === 'current') {
              borderClass = 'border-sky-600';
              textClass1 = 'text-sky-600';
              textClass2 = 'text-sky-600';
          } else {
              borderClass = 'border-gray-200 group-hover:border-gray-300';
              textClass1 = 'text-gray-500 group-hover:text-gray-700';
              textClass2 = 'text-gray-500 group-hover:text-gray-700';
          }

          return (
            <li key={stepName} className="md:flex-1">
              <button 
                onClick={() => onStepClick(stepNumber)}
                className={`group w-full flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0 text-left focus:outline-none transition-colors ${borderClass}`}
                aria-current={status === 'current' ? 'step' : undefined}
              >
                <span className={`text-sm font-medium ${textClass1}`}>{`Step ${stepNumber}`}</span>
                <span className={`text-sm font-medium ${textClass2}`}>{stepName}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Memoize the component to prevent re-renders if props haven't changed.
export const Pagination = memo(PaginationComponent);