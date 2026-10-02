import React from 'react';
import { render, screen, waitFor, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OverviewTab } from './OverviewTab';
import { useStore } from '../../../store/useStore';

vi.mock('../../../store/useStore');

// Supabase'den gelen istatistik verilerini mockluyoruz
vi.mock('../../../supabaseClient', () => ({
  supabase: {
    from: vi.fn((table) => {
      if (table === 'guest_photos') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ count: 5, data: [] }) // 5 bekleyen fotoğraf
        };
      }
      if (table === 'payments') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ 
            data: [{ amount: '500' }, { amount: '1500' }] // Toplam 2000 TL
          })
        };
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ count: 0, data: [] }) };
    })
  }
}));

describe('OverviewTab Bileşen Kapsamlı Testleri', () => {
  let mockSetActiveTab;

  beforeEach(() => {
    mockSetActiveTab = vi.fn();
    useStore.mockImplementation((selector) => selector({
      adminDraft: { invitation: { bride: 'Ayşe', groom: 'Veli' } }
    }));
    vi.spyOn(window, 'open').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Supabase verilerini çekip istatistikleri (Fotoğraf ve Hediye) ekranda göstermeli', async () => {
    render(<OverviewTab guests={[]} wishes={[]} isEn={false} setActiveAdminTab={mockSetActiveTab} />);
    
    await waitFor(() => {
      // 5 bekleyen fotoğraf (1. satırdaki mock)
      expect(screen.getByText('5')).toBeInTheDocument();
      
      // Toplam ödeme hesaplaması: 500 + 1500 = 2000 (Formatlanmış hali 2.000)
      const formattedTotal = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(2000);
      expect(screen.getByText(formattedTotal)).toBeInTheDocument();
    });
  });

  it('Barkovizyonu Başlat butonuna tıklandığında yeni sekmede /live rotasını açmalı', () => {
    // Window lokasyonunu simüle et
    Object.defineProperty(window, 'location', { value: { pathname: '/demo' }, writable: true });
    
    render(<OverviewTab guests={[]} wishes={[]} isEn={false} setActiveAdminTab={mockSetActiveTab} />);
    
    const liveBtn = screen.getByRole('button', { name: /Barkovizyonu Başlat/i });
    fireEvent.click(liveBtn);

    expect(window.open).toHaveBeenCalledWith('/demo/live', '_blank');
  });
});