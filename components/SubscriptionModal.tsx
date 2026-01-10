/**
 * @file SubscriptionModal.tsx
 * A modal component that displays the pricing tiers (Free vs Pro) and allows users
 * to upgrade their subscription. This acts as the "Paywall" for premium features.
 */

import React from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const FeatureRow: React.FC<{ feature: string; free: boolean; pro: boolean }> = ({ feature, free, pro }) => (
  <div className="grid grid-cols-4 items-center py-4 border-b border-slate-100 last:border-0">
    <div className="col-span-2 text-sm font-medium text-slate-700">{feature}</div>
    <div className="flex justify-center">
      {free ? <CheckCircleIcon className="h-5 w-5 text-green-500" /> : <XCircleIcon className="h-5 w-5 text-slate-300" />}
    </div>
    <div className="flex justify-center">
      {pro ? <CheckCircleIcon className="h-5 w-5 text-violet-600" /> : <XCircleIcon className="h-5 w-5 text-slate-300" />}
    </div>
  </div>
);

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fade-in-up">
        
        <div className="flex flex-col md:flex-row">
            {/* Header / Sales Pitch */}
            <div className="bg-slate-900 p-8 md:w-1/3 flex flex-col justify-between text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
                        <SparklesIcon /> Pro Plan
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Unlock Your Career Potential</h2>
                    <p className="text-slate-300 mb-6">
                        Get hired faster with AI-powered tools that optimize your resume and automate your job search.
                    </p>
                </div>
                
                {/* Decorative background circle */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-violet-600 rounded-full blur-3xl opacity-50"></div>
            </div>

            {/* Pricing Table */}
            <div className="p-8 md:w-2/3">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Choose your plan</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                </div>

                <div className="grid grid-cols-4 mb-4 text-center">
                    <div className="col-span-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Features</div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Free</div>
                    <div className="text-xs font-semibold text-violet-600 uppercase tracking-wider">Pro</div>
                </div>

                <div className="mb-8">
                    <FeatureRow feature="Manual Resume Builder" free={true} pro={true} />
                    <FeatureRow feature="Basic PDF Download" free={true} pro={true} />
                    <FeatureRow feature="AI Writer & Metric Miner" free={false} pro={true} />
                    <FeatureRow feature="Unlimited Versions" free={false} pro={true} />
                    <FeatureRow feature="Job Fit Analysis" free={false} pro={true} />
                    <FeatureRow feature="Outreach Kit (Cover Letters)" free={false} pro={true} />
                    <FeatureRow feature="Premium Layouts (No Watermark)" free={false} pro={true} />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                    <div>
                        <span className="text-3xl font-bold text-slate-900">$19</span>
                        <span className="text-slate-500">/month</span>
                    </div>
                    <button 
                        onClick={onUpgrade}
                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:from-violet-700 hover:to-indigo-700 transform transition-all active:scale-95"
                    >
                        Upgrade to Pro
                    </button>
                </div>
                <p className="text-xs text-center text-slate-400 mt-4">Cancel anytime. Secure payment processing.</p>
            </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SubscriptionModal;