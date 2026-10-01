import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setupTests.js'],
    isolate: false, 
    include: ['src/**/*.test.{js,jsx,ts,tsx}'], 
    exclude: ['tests/**/*.spec.{js,jsx,ts,tsx}', 'node_modules/**/*'], 
  },
});