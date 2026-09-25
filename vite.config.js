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
        suppressWarnings: true // EKLENEN SATIR: Geliştirme uyarılarını gizler
      }
    })
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.js',
    exclude: [
      '**/node_modules/**', 
      '**/dist/**', 
      '**/tests/**' 
    ],
  }
});