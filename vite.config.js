import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // 1. Javascript paket boyutu uyarısı için (chunkSizeWarningLimit buraya yazılır)
  build: {
    chunkSizeWarningLimit: 1000
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'], // Cache'lenecek ekstra statik dosyalar
      manifest: {
        name: 'Düğün Davetiyesi',
        short_name: 'Davetiye',
        description: 'Düğün Davetiyesi Uygulaması',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // 2. Büyük boyutlu fotoğrafların önbellek hatası için (2MB limitini 5MB'a çıkarır)
        maximumFileSizeToCacheInBytes: 5000000, 
        // Çevrimdışı çalışması için önbelleğe alınacak dosya uzantıları
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,mp4,mp3}'] 
      }
    })
  ]
})