import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useGuestPhotosQuery } from './useGuestPhotosQuery';

// Supabase Realtime Channel ve Query taklidi
const { mockRemoveChannel } = vi.hoisted(() => ({
  mockRemoveChannel: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({
              data: [{ id: '1', image_url: 'test.jpg', approved: true }]
            })
          }))
        }))
      }))
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
    })),
    removeChannel: mockRemoveChannel
  }
}));

describe('useGuestPhotosQuery Hook Testleri', () => {
  it('Bileşen yüklendiğinde onaylı fotoğrafları çekmeli ve realtime kanalı açmalı', async () => {
    const { result } = renderHook(() => useGuestPhotosQuery());

    // Promise'in çözülmesini ve verinin state'e yazılmasını bekle
    await waitFor(() => {
      expect(result.current.photos).toHaveLength(1);
    });

    expect(result.current.photos[0].image_url).toBe('test.jpg');
    
    const { supabase } = await import('../supabaseClient');
    expect(supabase.from).toHaveBeenCalledWith('guest_photos');
    expect(supabase.channel).toHaveBeenCalled();
  });

  it('Bileşen unmount olduğunda kanalı kapatmalı', () => {
    const { unmount } = renderHook(() => useGuestPhotosQuery());
    unmount();
    
    expect(mockRemoveChannel).toHaveBeenCalled();
  });
});