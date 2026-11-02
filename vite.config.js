import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        statements: 50,
        branches: 40,
        functions: 50,
        lines: 50,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg}'],
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/admin\/auth/],
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|svg|webp|jpg|jpeg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'invitation-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
                purgeOnQuotaError: true
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        maximumFileSizeToCacheInBytes: 10485760
      },
      manifest: {
        name: 'Düğün Davetiyesi',
        short_name: 'Davetiye',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        lang: 'tr',
        dir: 'ltr',
        orientation: 'portrait-primary',
        description: 'Kişiye özel dijital düğün davetiyesi.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('jspdf')) return 'pdf';
            if (id.includes('html5-qrcode')) return 'qr';
            if (id.includes('heic2any') || id.includes('browser-image-compression')) return 'image-tools';
            if (id.includes('yet-another-react-lightbox') || id.includes('react-photo-album')) return 'gallery';
            if (id.includes('@sentry')) return 'monitoring';
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor';
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase';
            }
            if (id.includes('@tanstack')) return 'query';
            if (id.includes('i18next') || id.includes('react-i18next')) return 'i18n';
            if (id.includes('react-hook-form') || id.includes('/zod/')) return 'forms';
            if (id.includes('idb-keyval')) return 'storage';
            if (id.includes('framer-motion')) {
              return 'ui';
            }
            if (id.includes('recharts')) return 'charts';
            return 'deps';
          }
        }
      }
    }
  }
});