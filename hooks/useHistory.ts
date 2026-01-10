/**
 * @file useHistory.ts
 * This custom React hook provides state management with undo/redo functionality.
 * It's a generic hook that can be used with any data type.
 * It uses a "live" state for immediate UI updates and a debounced history update
 * for performance, preventing the history stack from being updated on every keystroke.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export const useHistory = <T>(initialState: T) => {
  // State for the history stack (array of past states) and the current position in it.
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // The "live" state that updates immediately for a responsive UI. This is the state
  // that components will actually consume and display.
  const [liveState, setLiveState] = useState<T>(initialState);

  // Ref to hold the timeout ID for debouncing history updates.
  const debounceTimeout = useRef<number | null>(null);

  /**
   * Pushes a new state to the history stack.
   * If the user has undone some actions, this creates a new branch from the current point.
   */
  const pushToHistory = useCallback((newState: T) => {
    try {
      // Prevent pushing duplicate states to the history to keep it clean.
      const currentHistoryState = history[currentIndex];
      if (JSON.stringify(newState) === JSON.stringify(currentHistoryState)) {
        return;
      }

      // If we've undone, any new change should branch off from the current point,
      // discarding the "redo" history.
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(newState);

      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    } catch (e) {
      // Catch potential errors from JSON.stringify, e.g., circular structures.
      console.error("Error processing history state. This may be due to a circular structure in the data.", e);
      // Silently fail to not disrupt user experience, as history is non-critical.
    }
  }, [currentIndex, history]);

  /**
   * The main setState function that components will use.
   * It updates the live state immediately and debounces the update to the history stack.
   */
  const setState = useCallback((action: T | ((prevState: T) => T)) => {
    // Update the live state immediately for a responsive UI.
    setLiveState(currentLiveState => {
      // Calculate the new state based on the action (value or function).
      const newState = typeof action === 'function' 
        ? (action as (prevState: T) => T)(currentLiveState) 
        : action;
      
      // Clear any pending timeout to reset the debounce timer.
      if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
      }

      // Set a new timeout to push the state to history after a delay.
      debounceTimeout.current = window.setTimeout(() => {
          pushToHistory(newState);
      }, 500); // 500ms debounce delay.

      // Return the new state to update the UI immediately.
      return newState;
    });
  }, [pushToHistory]);

  /**
   * Moves the current state back one step in the history.
   */
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      // When undoing, clear any pending history push to prevent conflicts.
      if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
      }
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      // Update the live state to reflect the undone state.
      setLiveState(history[newIndex]);
    }
  }, [currentIndex, history]);

  /**
   * Moves the current state forward one step in the history.
   */
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      // When redoing, clear any pending history push.
      if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
      }
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      // Update the live state to reflect the redone state.
      setLiveState(history[newIndex]);
    }
  }, [currentIndex, history]);

  // Effect to clean up the timeout when the component unmounts to prevent memory leaks.
  useEffect(() => {
    return () => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
    }
  }, []);

  // Boolean flags to easily enable/disable undo/redo buttons in the UI.
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Return the live state for the UI, along with the history control functions.
  return { state: liveState, setState, undo, redo, canUndo, canRedo };
};
