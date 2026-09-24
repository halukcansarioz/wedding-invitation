import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { registerSW } from 'virtual:pwa-register';
import * as Sentry from '@sentry/react'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // EKLENDİ: React Query
import './i18n/config';
import App from './App';
import './index.css';

// Sentry konfigürasyonu
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || "",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0, 
  replaysSessionSampleRate: 0.1, 
  replaysOnErrorSampleRate: 1.0, 
});

// PWA Service Worker
registerSW({ immediate: true }); 

// YENİ: React Query İstemcisi Oluşturuluyor
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Veriler 5 dakika boyunca taze kabul edilir (gereksiz ağ isteğini önler)
      refetchOnWindowFocus: true, // Kullanıcı sekmeye dönünce veriyi arkada gizlice günceller
      retry: 2, // Hata olursa 2 kez tekrar dener
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* YENİ: Uygulamayı QueryClientProvider ile sarmalıyoruz */}
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <HelmetProvider>
          <App />
          <Analytics />
          <SpeedInsights />
        </HelmetProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);