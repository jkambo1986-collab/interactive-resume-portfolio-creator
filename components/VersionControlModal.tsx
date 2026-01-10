/**
 * @file VersionControlModal.tsx
 * A dashboard component that allows users to manage different versions (snapshots)
 * of their resume data. Users can save the current state as a new version,
 * load a previous version, or delete old ones.
 */

import React, { useState } from 'react';
import type { ResumeVersion } from '../types';
import { SaveIcon } from './icons/SaveIcon';
import { TrashIcon } from './icons/TrashIcon';
import { FolderOpenIcon } from './icons/FolderOpenIcon';
import { StackIcon } from './icons/StackIcon';

interface VersionControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedVersions: ResumeVersion[];
  onSave: (name: string) => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

const VersionControlModal: React.FC<VersionControlModalProps> = ({ isOpen, onClose, savedVersions, onSave, onLoad, onDelete }) => {
  const [newVersionName, setNewVersionName] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newVersionName.trim()) {
      onSave(newVersionName.trim());
      setNewVersionName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-fade-in-up">
        
        {/* Header */}
        <header className="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-lg">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-sky-100 rounded-lg text-sky-600">
                <StackIcon className="h-6 w-6" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-800">Resume Versions</h2>
                <p className="text-sm text-slate-500">Manage snapshots for different job applications.</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 text-2xl leading-none">&times;</button>
        </header>

        {/* Content */}
        <main className="p-6 overflow-y-auto space-y-8 flex-grow">
          
          {/* Create New Section */}
          <section>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">Save Current Snapshot</h3>
            <form onSubmit={handleCreate} className="flex gap-3">
              <input
                type="text"
                value={newVersionName}
                onChange={(e) => setNewVersionName(e.target.value)}
                placeholder="e.g. Product Manager @ Google"
                className="flex-grow block w-full px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              />
              <button 
                type="submit" 
                disabled={!newVersionName.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-300 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <SaveIcon />
                <span className="ml-2">Save Version</span>
              </button>
            </form>
          </section>

          {/* List Section */}
          <section>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">Saved Snapshots ({savedVersions.length})</h3>
            
            {savedVersions.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <p className="text-slate-500 text-sm">No versions saved yet. Create a snapshot to backup your progress for a specific role.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {savedVersions.map(version => (
                        <div key={version.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div>
                                <h4 className="font-semibold text-slate-800">{version.name}</h4>
                                <p className="text-xs text-slate-500 mt-1">Saved on {new Date(version.timestamp).toLocaleDateString()} at {new Date(version.timestamp).toLocaleTimeString()}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-3 sm:mt-0">
                                <button 
                                    onClick={() => onLoad(version.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                                >
                                    <FolderOpenIcon />
                                    Load
                                </button>
                                <button 
                                    onClick={() => onDelete(version.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-md hover:bg-red-100 transition-colors"
                                >
                                    <TrashIcon />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </section>

        </main>

        <footer className="p-4 bg-slate-50 border-t rounded-b-lg flex justify-end">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
            >
                Close
            </button>
        </footer>
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

export default VersionControlModal;