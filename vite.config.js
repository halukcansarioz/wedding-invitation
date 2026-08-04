import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const manualChunks = (id) => {
  if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
    return 'vendor-react';
  }
  if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
    return 'vendor-i18n';
  }
  if (id.includes('node_modules/@supabase')) {
    return 'vendor-supabase';
  }
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
})
