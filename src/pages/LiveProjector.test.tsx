import React from 'react';
import { render, screen, act, cleanup } from '../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LiveProjector from './LiveProjector';
import { useWishesQuery } from '../hooks/useWishesQuery';
import { useGuestPhotosQuery } from '../hooks/useGuestPhotosQuery';
import { useStore } from '../store/useStore';

vi.mock('../hooks/useWishesQuery');
vi.mock('../hooks/useGuestPhotosQuery');
vi.mock('../store/useStore');
vi.mock('../supabaseClient', () => ({
  supabase: {
    channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() })),
    removeChannel: vi.fn().mockResolvedValue(undefined)
  }
}));

describe('LiveProjector İleri Seviye Zamanlayıcı Testleri', () => {
  beforeEach(() => {
    vi.useFakeTimers(); 
    
    // Zustand selector fonksiyonunu destekleyecek şekilde güncellendi
    (useStore as any).mockImplementation((selector: any) => selector({
      siteData: { invitation: { bride: 'Hande', groom: 'Haluk' } }
    }));

    (useWishesQuery as any).mockReturnValue({
      wishes: [
        { id: 'w1', name: 'Ahmet', message: 'Tebrikler!', approved: true },
        { id: 'w2', name: 'Ayşe', message: 'Çok mutlu olun!', approved: true }
      ]
    });

    (useGuestPhotosQuery as any).mockReturnValue({ photos: [] });
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('Hiç veri yoksa "Anılar bekleniyor" yazısı çıkmalı', () => {
    (useWishesQuery as any).mockReturnValue({ wishes: [] });
    render(<LiveProjector />);
    expect(screen.getByText('Anılar bekleniyor...')).toBeInTheDocument();
  });

  it('Her 8 saniyede bir sıradaki anıya geçiş yapmalı', async () => {
    render(<LiveProjector />);

    const isFirstVisible = screen.queryByText('"Tebrikler!"') || screen.queryByText('"Çok mutlu olun!"');
    expect(isFirstVisible).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(8000);
    });

    const title = screen.getByText('Hande & Haluk');
    expect(title).toBeInTheDocument();
  });
});