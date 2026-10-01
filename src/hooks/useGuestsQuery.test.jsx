import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGuestsQuery } from './useGuestsQuery';

// Supabase fonksiyonlarını taklit et (Mock)
vi.mock('../supabaseClient', () => ({
  supabase: {
    functions: { 
      invoke: vi.fn().mockResolvedValue({ data: { success: true, data: { id: 'test-id' } }, error: null }) 
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
    })),
    removeChannel: vi.fn()
  }
}));

vi.mock('../services/database', () => ({
  loadGuestsFromDatabase: vi.fn().mockResolvedValue([
    { id: '1', name: 'Ahmet', attendance: 'Katılacağım', personCount: '2' }
  ])
}));

describe('useGuestsQuery (React Query) Testleri', () => {
  const createTestQueryClient = () => new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it('Kayıtlı misafirleri önbelleğe (cache) yüklemeli', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useGuestsQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.guests).toHaveLength(1);
    expect(result.current.guests[0].name).toBe('Ahmet');
  });

  it('addGuest mutasyonu ile yeni LCV eklendiğinde Supabase Edge Function çağrılmalı', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useGuestsQuery(), { wrapper });

    // Yeni LCV ekleme işlemini tetikle
    await result.current.addGuest({
      name: 'Ayşe Kaya',
      attendance: 'Katılamayacağım',
      personCount: '1',
      turnstileToken: 'test-token'
    });

    const { supabase } = await import('../supabaseClient');
    
    // Supabase Edge Function 'submit-form' ismiyle doğru payload ile çağrılmış mı kontrol et
    expect(supabase.functions.invoke).toHaveBeenCalledWith('submit-form', expect.objectContaining({
      body: expect.objectContaining({
        type: 'guest',
        turnstileToken: 'test-token',
        data: expect.objectContaining({ name: 'Ayşe Kaya' })
      })
    }));
  });
});