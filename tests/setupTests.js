import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// --- EKSİK DOM API'LERİ VE ORTAM DEĞİŞKENLERİ ---

// Supabase'in "URL eksik" diyerek çökmesini engeller
vi.stubEnv('VITE_SUPABASE_URL', 'https://mock.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'mock-key');

// UI Bileşenlerinin aradığı tarayıcı fonksiyonları
window.scrollTo = vi.fn();
window.alert = vi.fn();
window.prompt = vi.fn();
window.confirm = vi.fn();

// ResizeObserver Mock
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// --- KÜTÜPHANE MOCKLARI ---

// 1. window.matchMedia Mock (PWA Hook'ları için)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 2. IntersectionObserver Mock (Framer Motion için)
class IntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', { writable: true, configurable: true, value: IntersectionObserver });
Object.defineProperty(global, 'IntersectionObserver', { writable: true, configurable: true, value: IntersectionObserver });

// 3. React i18next Global Mock
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str) => str,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
      language: 'tr',
    },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() }
}));

// 4. Framer Motion Global Mock
vi.mock('framer-motion', () => ({
  m: {
    div: ({ children, ...props }) => React.createElement('div', props, children),
    section: ({ children, ...props }) => React.createElement('section', props, children),
    p: ({ children, ...props }) => React.createElement('p', props, children),
    h2: ({ children, ...props }) => React.createElement('h2', props, children),
    footer: ({ children, ...props }) => React.createElement('footer', props, children),
  },
  AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
}));

// 5. React Router Global Mock
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  BrowserRouter: ({ children }) => React.createElement('div', null, children),
}));