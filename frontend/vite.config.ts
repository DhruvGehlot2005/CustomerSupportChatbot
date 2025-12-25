/**
 * Vite Configuration
 * 
 * Purpose: Configure Vite build tool for React + TypeScript frontend
 * 
 * Dependencies:
 * - @vitejs/plugin-react: React support with Fast Refresh
 * 
 * Configuration:
 * - React plugin with Fast Refresh for development
 * - Server port: 5173 (Vite default)
 * - Proxy API requests to backend during development
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API requests to backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
