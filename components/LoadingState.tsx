/**
 * @file LoadingState.tsx
 * A component that displays a loading spinner along with a title and a series of
 * messages that cycle to provide more engaging feedback to the user during long
 * asynchronous operations.
 */

import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingStateProps {
  title: string;
  messages: string[];
}

const LoadingState: React.FC<LoadingStateProps> = ({ title, messages }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Effect to cycle through the loading messages every 2.5 seconds.
  useEffect(() => {
    if (messages.length > 1) {
      const intervalId = setInterval(() => {
        setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
      }, 2500);
      // Cleanup the interval on component unmount.
      return () => clearInterval(intervalId);
    }
  }, [messages]);

  return (
    <div className="text-center p-4 flex flex-col items-center justify-center">
      <LoadingSpinner />
      <h3 className="mt-4 text-slate-700 font-semibold text-lg">{title}</h3>
      {/* The key is changed to re-trigger the animation on each message change */}
      <p key={currentMessageIndex} className="mt-2 text-sm text-slate-500 h-5 animate-fade-in">
        {messages[currentMessageIndex] || ''}
      </p>
      {/* Inline style for the animation definition */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoadingState;
