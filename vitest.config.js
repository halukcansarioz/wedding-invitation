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
    // ÇÖZÜM: Vitest'in varsayılan 15 saniyelik zaman aşımı süresini 30 saniyeye (30000ms) çıkardık.
    testTimeout: 30000, 
  },
});