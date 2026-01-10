/**
 * @file OnboardingGuide.tsx
 * A modal component that provides a step-by-step tutorial for new users.
 * It guides them through the main features of the application.
 * It manages its own state for the current step.
 */

import React, { useState, memo } from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface OnboardingGuideProps {
  onClose: () => void;
}

// The content for each step of the onboarding guide.
const steps = [
  {
    title: "Welcome to the AI Resume Creator!",
    content: "This quick tour will guide you through creating the perfect resume and other professional materials. Click 'Next' to get started!",
  },
  {
    title: "Step 1: Get Your Data In",
    content: "The easiest way to begin is by uploading your existing resume (PDF or DOCX). The AI will read it and automatically fill out the form for you. Alternatively, you can fill out the form manually step-by-step.",
  },
  {
    title: "Step 2: Target a Job",
    content: "For the best results, paste the job description for a role you're interested in. The AI will use this to tailor your resume, cover letter, and even mock interview questions specifically for that position.",
  },
  {
    title: "Step 3: Enhance Your Experience",
    content: "When describing your work history, look for the 'Enhance with AI' button. This feature rewrites your responsibilities to be more impactful and action-oriented, focusing on achievements and metrics.",
  },
  {
    title: "Step 4: Generate Your Assets",
    content: "Once the form is complete, you can generate multiple assets. Create different resume layouts, a portfolio website, a full outreach kit (cover letter & messages), or even start a mock interview session.",
  },
  {
    title: "Step 5: Review and Refine",
    content: "Your generated content will appear in the preview panel on the right. For resumes, you can ask the AI to make small changes like 'make the header bigger' or 'use a different color for titles'.",
  },
  {
    title: "Step 6: Download Your Resume",
    content: "When you're happy with a layout, you can download it as a PDF for applications, a DOCX file for manual editing, or an HTML file.",
  },
  {
    title: "You're All Set!",
    content: "That's it! You're ready to create. You can reopen this guide anytime by clicking the 'Help' button in the header. Good luck with your job search!",
  },
];

const OnboardingGuideComponent: React.FC<OnboardingGuideProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = steps.length;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose(); // Close the guide on the last step.
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    onClose();
  };

  const { title, content } = steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  return (
    // Modal container with overlay
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative transform transition-all animate-fade-in-up">
        <button
          onClick={handleFinish}
          className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-600"
          aria-label="Close tutorial"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="text-sm font-semibold text-sky-600 mb-2">
            Step {currentStep + 1} of {totalSteps}
          </div>
          <h2 id="onboarding-title" className="text-xl font-bold text-slate-800">{title}</h2>
          <p className="mt-4 text-slate-600">{content}</p>
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon />
            Previous
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            {isLastStep ? 'Finish' : 'Next'}
            {!isLastStep && <ChevronRightIcon />}
          </button>
        </div>
      </div>
       <style>
        {`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default memo(OnboardingGuideComponent);
