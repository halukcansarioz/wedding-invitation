import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAdminGuestPhotos } from './useAdminGuestPhotos';
import { useStore } from '../store/useStore';

const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({
          data: [
            { id: '1', image_url: 'pic1.jpg', approved: false },
            { id: '2', image_url: 'pic2.jpg', approved: true }
          ],
          error: null
        })
      })),
      update: mockUpdate.mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
      delete: mockDelete.mockReturnThis()
    }))
  }
}));

vi.mock('../services/database', () => ({
  deleteMediaFile: vi.fn().mockResolvedValue(true)
}));

describe('useAdminGuestPhotos Hook Testleri', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    
    // KRİTİK DÜZELTME: setState ile değil, spyOn ile fonksiyonu izliyoruz!
    vi.spyOn(useStore.getState(), 'showAppAlert').mockResolvedValue(true);
  });

  afterEach(() => {
    // Test bitince orijinal fonksiyonu geri yükler
    vi.restoreAllMocks();
  });

  it('Verileri çektikten sonra onaylı ve onaysız olarak doğru ayırmalı', async () => {
    const { result } = renderHook(() => useAdminGuestPhotos(false));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pendingPhotos).toHaveLength(1);
    expect(result.current.approvedPhotos).toHaveLength(1);
  });

  it('approvePhoto çağrıldığında Supabase update çalışmalı ve state güncellenmeli', async () => {
    const { result } = renderHook(() => useAdminGuestPhotos(false));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.approvePhoto('1');
    });

    expect(mockUpdate).toHaveBeenCalledWith({ approved: true });
    expect(result.current.pendingPhotos).toHaveLength(0);
  });
});