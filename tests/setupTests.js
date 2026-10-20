import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

vi.stubEnv('VITE_SUPABASE_URL', 'https://mock.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'mock-key');

// JSDOM window.location nesnesini tüm testlerde (delete ve defineProperty için) esnek hale getir
const initialLocation = window.location;
try {
  delete window.location;
  Object.defineProperty(window, 'location', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: {
      ...initialLocation,
      href: 'http://localhost:3000/',
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: '/',
      search: '',
      hash: '',
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
    },
  });
} catch {
  // Ortam zaten yapılandırılmışsa devam et
}

window.scrollTo = vi.fn();
window.alert = vi.fn();
window.prompt = vi.fn();
window.confirm = vi.fn();

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

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

class IntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', { writable: true, configurable: true, value: IntersectionObserver });
Object.defineProperty(global, 'IntersectionObserver', { writable: true, configurable: true, value: IntersectionObserver });

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

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  BrowserRouter: ({ children }) => React.createElement('div', null, children),
}));

vi.mock('focus-trap-react', () => ({
  default: ({ children }) => React.createElement('div', null, children)
}));