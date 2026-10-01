import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWishesQuery } from './useWishesQuery';

// Supabase ve Database servislerini taklit ediyoruz (Gerçek ağ isteği atmamak için)
vi.mock('../supabaseClient', () => ({
  supabase: {
    functions: { 
      invoke: vi.fn().mockResolvedValue({ data: { success: true, data: { id: '2' } }, error: null }) 
    }
  }
}));

vi.mock('../services/database', () => ({
  loadPublishedWishesFromDatabase: vi.fn().mockResolvedValue([
    { id: '1', name: 'Merve', message: 'Çok mutlu olun!', approved: true }
  ])
}));

describe('useWishesQuery (React Query) Testleri', () => {
  // Testler için taze bir QueryClient sağlıyoruz
  const createTestQueryClient = () => new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it('Veritabanındaki yayınlanmış dilekleri (wishes) çekip önbelleğe almalı', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useWishesQuery(), { wrapper });

    // Başlangıçta yükleniyor durumu (isLoading)
    expect(result.current.isLoading).toBe(true);

    // Veri geldiğinde (Promise çözüldüğünde) kontrol et
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.wishes).toHaveLength(1);
    expect(result.current.wishes[0].name).toBe('Merve');
    expect(result.current.wishes[0].message).toBe('Çok mutlu olun!');
  });

  it('Yeni bir dilek (addWish) eklendiğinde mutasyon çalışmalı', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useWishesQuery(), { wrapper });

    // Mutasyonu tetikle
    await result.current.addWish({
      name: 'Burak',
      message: 'Tebrikler!',
      approved: false,
      turnstileToken: 'fake-token'
    });

    // Mocklanan Supabase fonksiyonunun çağrıldığından emin oluyoruz
    const { supabase } = await import('../supabaseClient');
    expect(supabase.functions.invoke).toHaveBeenCalledWith('submit-form', expect.any(Object));
  });
});