import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAdminSession } from './useAdminSession';
import { useAdminStore } from '../store/useAdminStore';
import { useStore } from '../store/useStore';
import { supabase } from '../supabaseClient';
import * as helpers from '../utils/helpers';

vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    }
  }
}));

// HATA DÜZELTİLDİ: ESM importlarında vi.spyOn çalışmadığı için helpers doğrudan mocklandı.
vi.mock('../utils/helpers', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    isAdminSessionFresh: vi.fn(),
  };
});

describe('useAdminSession Oturum Yönetimi Kapsamlı Testleri', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    useAdminStore.getState().clearAdminAuth();
    useStore.setState({ guests: [{ id: 1 }], wishes: [{ id: 1, approved: false }] });
    
    // Varsayılan olarak Supabase ortamını hazır varsayıyoruz
    helpers.isAdminSessionFresh.mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('Yönetici sayfası değilse (isAdminPage: false) oturum kontrolünü pas geçmeli', async () => {
    renderHook(() => useAdminSession({ isAdminPage: false, isEn: false }));
    expect(supabase.auth.getSession).not.toHaveBeenCalled();
  });

  it('Oturum zaman aşımına uğradığında verileri temizleyip admin panelini kilitlemeli', async () => {
    // Session bayatlamış gibi davran
    helpers.isAdminSessionFresh.mockReturnValue(false);
    
    useAdminStore.setState({ isAdminUnlocked: true });

    renderHook(() => useAdminSession({ isAdminPage: true, isEn: false }));

    await act(async () => {
      vi.advanceTimersByTime(61000);
    });

    const adminState = useAdminStore.getState();
    const mainState = useStore.getState();

    expect(adminState.isAdminUnlocked).toBe(false);
    
    expect(mainState.guests).toHaveLength(0);
    expect(mainState.wishes).toHaveLength(0);
    
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});