/**
 * @file InterviewSimulator.tsx
 * This component provides a real-time mock interview experience using the Gemini Live API.
 * It manages the entire lifecycle of the interview, including:
 * - Requesting microphone permissions.
 * - Starting and ending the live session with the AI.
 * - Streaming user audio to the AI and playing back AI audio responses.
 * - Displaying a real-time transcript of the conversation.
 * - Triggering analysis of the completed interview.
 * - Displaying the final feedback report.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { InterviewState, InterviewFeedback, InterviewTranscriptItem } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';

interface InterviewSimulatorProps {
  state: InterviewState;
  questions: string[];
  feedback: InterviewFeedback | null;
  onAnalysis: (transcript: InterviewTranscriptItem[]) => Promise<void>;
  setState: React.Dispatch<React.SetStateAction<InterviewState>>;
}

const InterviewSimulator: React.FC<InterviewSimulatorProps> = ({ state, questions, feedback, onAnalysis, setState }) => {
  // State for the component
  const [transcript, setTranscript] = useState<InterviewTranscriptItem[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Refs to hold mutable values that persist across renders without causing re-renders.
  const sessionPromise = useRef<Promise<any> | null>(null);
  const inputAudioContext = useRef<AudioContext | null>(null);
  const outputAudioContext = useRef<AudioContext | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const scriptProcessor = useRef<ScriptProcessorNode | null>(null);
  const nextStartTime = useRef(0); // For scheduling gapless audio playback
  const sources = useRef<Set<AudioBufferSourceNode>>(new Set()); // To track active audio sources

  // Refs to hold the latest state and transcript to avoid stale closures in asynchronous callbacks.
  // This is crucial for functions like `onclose` which are defined once but need the latest data.
  const stateRef = useRef(state);
  stateRef.current = state;
  const transcriptRef = useRef(transcript);
  transcriptRef.current = transcript;

  /**
   * Cleans up all resources associated with the live session.
   * Stops media tracks, closes audio contexts, disconnects nodes, and closes the session.
   */
  const endSession = useCallback(() => {
    mediaStream.current?.getTracks().forEach(track => track.stop());
    inputAudioContext.current?.close();
    outputAudioContext.current?.close();
    scriptProcessor.current?.disconnect();
    sources.current.forEach(source => source.stop());
    sessionPromise.current?.then(session => session.close());
    sessionPromise.current = null;
  }, []);

  /**
   * Initiates the end of the interview from a user action.
   */
  const handleEndInterview = useCallback(() => {
    // Only end if the session is currently active.
    if (stateRef.current === 'active') {
      setState('ending'); // Give immediate UI feedback
      endSession();
    }
  }, [endSession, setState]);


  // Effect for cleanup when the component unmounts.
  useEffect(() => {
    return () => {
      endSession();
    };
  }, [endSession]);

  /**
   * Requests microphone access from the user.
   */
  const requestMicrophone = useCallback(async () => {
    try {
      mediaStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionError(null);
      return true;
    } catch (err) {
      setPermissionError('Microphone access denied. Please enable it in your browser settings to proceed.');
      setState('error');
      return false;
    }
  }, [setState]);

  /**
   * Updates the transcript state, either by appending a new item or updating the last streaming item.
   */
  const updateTranscript = useCallback((speaker: 'user' | 'ai', text: string, isFinal: boolean) => {
    setTranscript(prev => {
      const lastItem = prev[prev.length - 1];
      // If the last item is from the same speaker and not final, append the text.
      if (lastItem && lastItem.speaker === speaker && !lastItem.isFinal) {
        const updatedItem = { ...lastItem, text: lastItem.text + text, isFinal };
        return [...prev.slice(0, -1), updatedItem];
      } else {
        // Otherwise, add a new transcript item.
        return [...prev, { speaker, text, isFinal }];
      }
    });
  }, []);

  /**
   * Handles incoming messages from the Gemini Live API server.
   * This includes processing transcriptions and playing back audio.
   */
  const handleServerMessage = useCallback(async (message: LiveServerMessage) => {
    // We get streaming transcription results. We mark them as final when the turn is complete.
    if (message.serverContent?.inputTranscription) {
      updateTranscript('user', message.serverContent.inputTranscription.text, false);
    }
    if (message.serverContent?.outputTranscription) {
      updateTranscript('ai', message.serverContent.outputTranscription.text, false);
    }

    // When a turn is complete, finalize all current transcript entries.
    if (message.serverContent?.turnComplete) {
      setTranscript(prev => prev.map(item => ({ ...item, isFinal: true })));
    }

    // Handle audio playback.
    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
    if (base64Audio && outputAudioContext.current) {
      // Schedule the audio to play immediately after the previous chunk finishes.
      nextStartTime.current = Math.max(nextStartTime.current, outputAudioContext.current.currentTime);
      const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext.current, 24000, 1);
      const source = outputAudioContext.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputAudioContext.current.destination);
      source.addEventListener('ended', () => {
        sources.current.delete(source); // Clean up the source node after it finishes playing.
      });
      source.start(nextStartTime.current);
      nextStartTime.current += audioBuffer.duration; // Update the start time for the next chunk.
      sources.current.add(source);
    }
  }, [updateTranscript]);

  /**
   * Starts the entire interview session.
   */
  const startSession = useCallback(async () => {
    const hasPermission = await requestMicrophone();
    if (!hasPermission || !mediaStream.current) return;

    setState('starting_session');

    // Initialize audio contexts for input (mic) and output (speaker).
    inputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    // Live API temporarily disabled due to SDK migration.
    // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    // sessionPromise.current = ai.live.connect({ ... });

    console.warn("Live Mock Interview is currently unavailable due to system upgrade.");
    setPermissionError("The Live Interview feature (powered by gemini-2.5-flash-native-audio-preview-09-2025) is temporarily under maintenance while we improve the Core Resume AI Engine. Please check back later.");
    setState('error');
    return;
  }, [requestMicrophone, setState, questions, onAnalysis, handleServerMessage]);

  // --- UI Rendering based on the current interview state ---

  if (state === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center bg-white p-8 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-slate-800">Mock Interview Not Started</h3>
        <p className="mt-2 text-sm text-slate-500">Click the "Mock Interview" button in the form to begin your practice session.</p>
      </div>
    );
  }

  if (state === 'ready') {
    return (
      <div className="text-center p-4">
        <h3 className="font-semibold text-lg">Your Mock Interview is Ready</h3>
        <p className="text-sm text-slate-600 my-4">The AI has prepared tailored questions based on your resume and the job description. When you're ready, click below to start.</p>
        <button onClick={startSession} className="bg-rose-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-rose-700 flex items-center gap-2 mx-auto">
          <MicrophoneIcon /> Begin Interview
        </button>
      </div>
    );
  }

  if (state === 'starting_session') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <LoadingSpinner />
        <p className="mt-4 text-slate-600 font-medium">Starting interview session...</p>
      </div>
    );
  }

  if (state === 'active') {
    return (
      <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 220px)' }}>
        <div className="flex-grow bg-slate-100 rounded-lg p-4 overflow-y-auto space-y-4">
          {transcript.map((item, index) => (
            <div key={index} className={`flex ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 ${item.speaker === 'user' ? 'bg-sky-500 text-white' : 'bg-white shadow-sm'}`}>
                <p className="text-sm">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex-shrink-0 pt-4 text-center">
          <button onClick={handleEndInterview} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">
            End Interview & Get Feedback
          </button>
        </div>
      </div>
    );
  }

  if (state === 'ending') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <LoadingSpinner />
        <p className="mt-4 text-slate-600 font-medium">Finalizing session...</p>
        <p className="mt-2 text-sm text-slate-500">Your feedback will be ready shortly.</p>
      </div>
    );
  }

  if (state === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <LoadingSpinner />
        <p className="mt-4 text-slate-600 font-medium">Analyzing your performance...</p>
        <p className="mt-2 text-sm text-slate-500">The AI is preparing your detailed feedback.</p>
      </div>
    );
  }

  if (state === 'complete' && feedback) {
    return (
      <div className="space-y-6 p-1" style={{ height: 'calc(100vh - 220px)', overflowY: 'auto' }}>
        <h2 className="text-xl font-bold text-slate-800">Interview Feedback Report</h2>

        {/* Summary */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Overall Summary</h3>
          <p className="p-4 bg-slate-50 rounded-md border text-sm">{feedback.overallSummary}</p>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Strengths</h3>
            <ul className="list-disc list-inside space-y-2 p-4 bg-green-50 text-green-800 rounded-md border border-green-200 text-sm">
              {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Areas for Improvement</h3>
            <ul className="list-disc list-inside space-y-2 p-4 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200 text-sm">
              {feedback.areasForImprovement.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Detailed Analysis</h3>
          <div className="space-y-4">
            {feedback.detailedAnalysis.map((item, i) => (
              <div key={i} className="p-4 border rounded-lg bg-white">
                <p className="text-sm font-semibold text-slate-600">Q: {item.question}</p>
                <p className="mt-2 text-sm text-slate-800 italic border-l-4 pl-3">A: {item.answer}</p>
                <div className="mt-3 p-3 bg-slate-50 rounded-md">
                  <p className="text-sm font-semibold text-sky-700">Feedback:</p>
                  <p className="text-sm text-slate-700">{item.feedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="text-center p-4 bg-red-50 text-red-700 rounded-lg">
        <h3 className="font-semibold text-lg">An Error Occurred</h3>
        <p className="text-sm my-2">{permissionError || 'Something went wrong during the interview process. Please try again.'}</p>
        <button onClick={() => setState('idle')} className="bg-slate-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-slate-600 text-sm">
          Reset
        </button>
      </div>
    );
  }

  return null;
};

export default InterviewSimulator;
