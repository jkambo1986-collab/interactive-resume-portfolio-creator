import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
    isOpen: boolean;
    title?: string;
    messages?: string[];
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isOpen, title = "Processing", messages = [] }) => {
    const [currentMsgIndex, setCurrentMsgIndex] = useState(0);

    useEffect(() => {
        if (!isOpen || messages.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentMsgIndex((prev) => (prev + 1) % messages.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [isOpen, messages]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 transition-all duration-500 bg-slate-900/40 backdrop-blur-md">
            <div className="relative flex flex-col items-center max-w-md w-full animate-pop-in">
                {/* Visual Accent */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/20 blur-[100px] rounded-full"></div>

                <div className="bg-white/90 glass-morphism p-8 rounded-[40px] shadow-2xl flex flex-col items-center w-full border border-white/40">
                    <div className="mb-6 relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full scale-150 animate-pulse"></div>
                        <LoadingSpinner className="h-16 w-16 text-indigo-600 relative z-10" />
                    </div>

                    <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2 text-center uppercase tracking-[0.2em]">{title}</h2>

                    <div className="h-6 overflow-hidden w-full flex justify-center">
                        <p className="text-sm font-medium text-slate-500 transition-all duration-500 animate-fade-in-up text-center italic" key={currentMsgIndex}>
                            {messages[currentMsgIndex] || "Please wait..."}
                        </p>
                    </div>

                    <div className="mt-8 flex gap-1.5 justify-center">
                        {messages.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 rounded-full transition-all duration-500 ${i === currentMsgIndex ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-200'}`}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;
