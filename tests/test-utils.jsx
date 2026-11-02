import React from 'react';
import { render as rtlRender, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Her test için temiz bir QueryClient oluştur
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
  },
});

export function renderWithProviders(ui, options = {}) {
  const testQueryClient = createTestQueryClient();

  const Wrapper = ({ children }) => (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

export { screen, fireEvent, cleanup, waitFor, act };
export { renderWithProviders as render };