/**
 * @file Header.tsx
 * This component renders the main header for the application.
 * It displays the application title and a "Help" button to trigger the onboarding guide.
 * It now includes the User Subscription status and Upgrade button.
 */

import React, { memo } from 'react';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';
import { useAppContext } from '../context/AppContext';
import { SparklesIcon } from './icons/SparklesIcon';

interface HeaderProps {
  onShowHelp: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowHelp }) => {
  const { tier, user, logout, setIsAuthModalOpen, triggerUpgrade } = useAppContext();

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    AI Interactive Resume Creator
                    {tier === 'pro' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800 border border-violet-200">
                            PRO
                        </span>
                    )}
                </h1>
                <p className="text-slate-500 text-sm hidden sm:block">
                    Craft your perfect resume with the power of AI.
                </p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            {tier === 'free' && (
                <button
                    onClick={triggerUpgrade}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-md shadow-sm hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 animate-pulse"
                >
                    <SparklesIcon />
                    Upgrade to Pro
                </button>
            )}

            {user ? (
              <div className="flex items-center gap-3 border-l pl-4 ml-1">
                 <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-slate-700">{user.name}</p>
                    <p className="text-xs text-slate-500 uppercase">{tier} Plan</p>
                 </div>
                 <button 
                  onClick={logout}
                  className="text-sm text-slate-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-slate-100"
                 >
                   Logout
                 </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l pl-4 ml-1">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-sm font-medium text-slate-700 hover:text-sky-600 px-3 py-2 rounded-md hover:bg-slate-50"
                >
                  Log In
                </button>
              </div>
            )}

            <button
            onClick={onShowHelp}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md shadow-sm hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            aria-label="Show help tutorial"
            >
            <QuestionMarkCircleIcon />
            <span className="hidden sm:inline">Help</span>
            </button>
        </div>
      </div>
    </header>
  );
};

// Memoize the component to prevent re-renders if props haven't changed.
export default memo(Header);