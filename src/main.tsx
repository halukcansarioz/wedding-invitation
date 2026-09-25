import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { get, set, del } from 'idb-keyval'; // npm install idb-keyval
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';

// IndexedDB Persister (Çevrimdışı verileri tarayıcıda tutmak için)
const indexedDBPersister = createSyncStoragePersister({
  storage: {
    getItem: async (key) => await get(key),
    setItem: async (key, value) => await set(key, value),
    removeItem: async (key) => await del(key),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 60 * 24, // 24 saat cache'te tut
    },
    mutations: {
      // İnternet yoksa mutation'ı durdur ve IndexedDB'ye al, gelince otomatik çalıştır
      networkMode: 'offlineFirst',
    },
  },
});

// PWA Service Worker (Arka plan senkronizasyonu yetkisiyle)
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PersistQueryClientProvider 
      client={queryClient} 
      persistOptions={{ persister: indexedDBPersister, maxAge: 1000 * 60 * 60 * 24 }}
    >
      <BrowserRouter>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </BrowserRouter>
    </PersistQueryClientProvider>
  </React.StrictMode>
);