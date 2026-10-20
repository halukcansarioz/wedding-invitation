import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setupTests.js', './vitest.setup.js'],
    pool: 'threads',
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**/*.spec.js'],
  },
});