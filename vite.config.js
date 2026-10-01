import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        environment: 'jsdom', 
        setupFiles: './tests/setupTests.js',
        suppressWarnings: true
      }
    })
  ],
test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setupTests.js',
    css: true,
    poolOptions: {
      threads: {
        isolate: false, 
      }
    },
    include: ['src/**/*.test.{js,jsx,ts,tsx}'], 
    exclude: ['tests/**/*.spec.{js,jsx,ts,tsx}', 'node_modules/**/*'], 
  },
});