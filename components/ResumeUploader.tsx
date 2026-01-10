
/**
 * @file ResumeUploader.tsx
 * A component that allows users to upload their resume via click or drag-and-drop.
 * Upon successful upload, it displays a read-only preview of the uploaded file
 * and its metadata to confirm the action.
 */

import React, { useCallback, useState, memo } from 'react';
import { DocumentArrowUpIcon } from './icons/DocumentArrowUpIcon';
import LoadingSpinner from './LoadingSpinner';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { useAppContext } from '../context/AppContext';

interface ResumeUploaderProps {
    onUpload: (file: File) => Promise<void>;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const ResumeUploaderComponent: React.FC<ResumeUploaderProps> = ({ onUpload }) => {
    const { uploadedFileInfo } = useAppContext();
    const [status, setStatus] = useState<UploadStatus>(uploadedFileInfo ? 'success' : 'idle');
    const [message, setMessage] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const handleFile = useCallback(async (files: FileList | null) => {
        if (!files || !files[0]) return;
        const file = files[0];

        if (file.type !== 'application/pdf' && !file.type.includes('word') && !file.type.includes('officedocument')) {
            setMessage('Unsupported file type. Please upload a PDF or Word document.');
            setStatus('error');
            return;
        }

        setStatus('uploading');
        setMessage('AI is reading your resume...');

        try {
            await onUpload(file);
            setStatus('success');
            setMessage('Success! Your resume has been parsed.');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'An unknown error occurred while parsing the file.');
        }
    }, [onUpload]);

    const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (status !== 'idle') return;
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, [status]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (status !== 'idle') return;
        setDragActive(false);
        handleFile(e.dataTransfer.files);
    }, [handleFile, status]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        handleFile(e.target.files);
    };

    const handleTryAgain = () => {
        setStatus('idle');
        setMessage('');
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const renderContent = () => {
        switch (status) {
            case 'uploading':
                return (
                    <div className="flex flex-col items-center justify-center text-center py-8">
                        <LoadingSpinner />
                        <p className="mt-4 font-semibold text-slate-700">{message}</p>
                        <p className="mt-1 text-xs text-slate-500 italic">This usually takes about 5 seconds...</p>
                    </div>
                );
            case 'success':
                return (
                    <div className="w-full space-y-4 animate-fade-in-up">
                        <div className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                <span className="font-bold text-slate-800 text-sm">Upload Confirmed</span>
                            </div>
                            <button onClick={handleTryAgain} className="text-xs text-sky-600 font-bold hover:underline">Replace File</button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Read-only Document Preview Thumbnail */}
                            <div className="sm:w-32 sm:h-44 h-48 bg-slate-100 rounded border overflow-hidden flex-shrink-0 relative group">
                                {uploadedFileInfo?.type === 'application/pdf' ? (
                                    <iframe
                                        src={`${uploadedFileInfo.previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                        className="w-full h-full border-none pointer-events-none"
                                        title="Original Upload Preview"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-sky-50 p-2">
                                        <svg className="w-10 h-10 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                        </svg>
                                        <span className="text-[10px] font-bold text-sky-700 mt-2">Word Doc</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none"></div>
                            </div>

                            <div className="flex-grow flex flex-col justify-center">
                                <h4 className="text-sm font-bold text-slate-900 truncate max-w-[200px]" title={uploadedFileInfo?.name}>
                                    {uploadedFileInfo?.name}
                                </h4>
                                <div className="mt-1 space-y-1">
                                    <p className="text-xs text-slate-500 flex items-center gap-2">
                                        <span className="font-semibold text-slate-700">Size:</span>
                                        {formatSize(uploadedFileInfo?.size || 0)}
                                    </p>
                                    <p className="text-xs text-slate-500 flex items-center gap-2">
                                        <span className="font-semibold text-slate-700">Status:</span>
                                        <span className="text-green-600 font-medium">Successfully Parsed</span>
                                    </p>
                                </div>
                                <div className="mt-4 p-2 bg-blue-50 border border-blue-100 rounded text-[11px] text-blue-700 leading-tight">
                                    The AI has extracted your history. Review and refine your details in the next steps.
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'error':
                return (
                    <div className="flex flex-col items-center justify-center text-center py-6">
                        <XCircleIcon className="h-10 w-10 text-red-500" />
                        <p className="mt-4 font-semibold text-red-700">{message}</p>
                        <button
                            onClick={handleTryAgain}
                            className="mt-4 text-sm font-bold text-sky-600 hover:text-sky-700 border border-sky-600 px-4 py-2 rounded-md transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center text-center py-6">
                        <DocumentArrowUpIcon />
                        <p className="mt-4 text-sm font-medium text-slate-900">
                            Click to upload or drag and drop
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            PDF or DOCX (Max 10MB)
                        </p>
                    </div>
                );
        }
    };

    return (
        className = {`relative p-6 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer overflow-hidden ${dragActive ? 'border-sky-500 bg-sky-50' : 'border-slate-300 hover:border-sky-400 bg-white hover:bg-slate-50'
            } ${status !== 'idle' ? 'cursor-default' : ''} ${status === 'idle' ? 'hover:shadow-lg hover:shadow-indigo-500/10' : ''}`}
onDragEnter = { handleDrag }
onDragLeave = { handleDrag }
onDragOver = { handleDrag }
onDrop = { handleDrop }
onClick = {() => status === 'idle' && document.getElementById('resume-file-input')?.click()}
        >
    <input
        id="resume-file-input"
        type="file"
        className="sr-only"
        accept=".pdf,.doc,.docx"
        onChange={handleChange}
        disabled={status !== 'idle'}
    />
{ renderContent() }
        </div >
    );
};

export default memo(ResumeUploaderComponent);
