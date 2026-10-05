import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGuestsQuery } from './useGuestsQuery';

// Supabase mock
vi.mock('../supabaseClient', () => ({
  supabase: {
    functions: { invoke: vi.fn().mockResolvedValue({ data: { success: true, data: {} }, error: null }) },
    channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() })),
    removeChannel: vi.fn()
  }
}));

vi.mock('../services/database', () => ({
  loadGuestsFromDatabase: vi.fn().mockResolvedValue([])
}));

describe('useGuestsQuery Çevrimdışı (Offline) Testleri', () => {
  const createTestQueryClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let originalOnLine;
  let originalLocation;

  beforeEach(() => {
    originalOnLine = navigator.onLine;
    originalLocation = window.location;
    
    // window.location güvenli mocklaması
    Object.defineProperty(window, 'location', {
      value: { pathname: '/' },
      writable: true
    });
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
    Object.defineProperty(window, 'location', { value: originalLocation, configurable: true });
  });

  it('Cihaz çevrimdışıysa (offline) Turnstile tokeni yerine OFFLINE_SYNC gönderilmeli', async () => {
    // Tarayıcının internetini "kesik" (offline) olarak simüle et
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    const queryClient = createTestQueryClient();
    const wrapper = ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

    const { result } = renderHook(() => useGuestsQuery(), { wrapper });

    await act(async () => {
      await result.current.addGuest({ name: 'Çevrimdışı Misafir', attendance: 'Katılacağım', personCount: '1' });
    });

    const { supabase } = await import('../supabaseClient');

    // Supabase fonksiyonuna OFFLINE_SYNC token'ının gittiğini doğrula
    expect(supabase.functions.invoke).toHaveBeenCalledWith('submit-form', expect.objectContaining({
      body: expect.objectContaining({
        turnstileToken: 'OFFLINE_SYNC'
      })
    }));
  });
});