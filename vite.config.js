import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11'], // IE 11 hariç genel tarayıcı standartlarını hedefler
      polyfills: true, // Eksik JavaScript özelliklerini (örn: Promise, Array.includes) otomatik ekler
    })
  ],
});