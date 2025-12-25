/**
 * Frontend Entry Point
 * 
 * Purpose: Initialize and render the React application
 * 
 * Dependencies:
 * - React: UI library
 * - ReactDOM: DOM rendering
 * - App: Root application component
 * 
 * Integration Points:
 * - Mounts React app to #root element in index.html
 * - Enables React StrictMode for development checks
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Get root element from DOM
const rootElement = document.getElementById('root');

// Ensure root element exists before rendering
if (!rootElement) {
  throw new Error('Root element not found. Ensure index.html contains <div id="root"></div>');
}

// Create React root and render application
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
