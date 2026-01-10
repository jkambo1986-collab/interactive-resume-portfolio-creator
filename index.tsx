/**
 * @file index.tsx
 * This is the main entry point for the React application.
 * It sets up the root of the application, wraps it in a context provider for global state,
 * and renders the main App component into the DOM.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';

// Find the root DOM element where the React app will be mounted.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create a React root for concurrent mode features.
const root = ReactDOM.createRoot(rootElement);

// Render the application.
// React.StrictMode is a wrapper that checks for potential problems in the app during development.
// AppProvider is our custom context provider that makes global state available to all components.
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
