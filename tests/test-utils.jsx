import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Her test için temiz bir QueryClient oluştur
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Testlerde ağ hatası olursa tekrar denemesin, hemen sonuç versin
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

  return render(ui, { wrapper: Wrapper, ...options });
}

// Orijinal testing-library'deki her şeyi dışa aktar
export * from '@testing-library/react';
// Normal 'render' yerine bizim özel sarmalayıcımızı kullanılsın diye eziyoruz
export { renderWithProviders as render };