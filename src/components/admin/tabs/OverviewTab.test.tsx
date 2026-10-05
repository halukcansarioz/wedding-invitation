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
          eq: vi.fn().mockResolvedValue({ count: 5, data: [] })
        };
      }
      if (table === 'payments') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ 
            data: [{ amount: '500' }, { amount: '1500' }] 
          })
        };
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ count: 0, data: [] }) };
    })
  }
}));

describe('OverviewTab Bileşen Kapsamlı Testleri', () => {
  let mockSetActiveTab: any;

  beforeEach(() => {
    mockSetActiveTab = vi.fn();
    (useStore as any).mockImplementation((selector: any) => selector({
      adminDraft: { invitation: { bride: 'Ayşe', groom: 'Veli' } }
    }));
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Supabase verilerini çekip istatistikleri (Fotoğraf ve Hediye) ekranda göstermeli', async () => {
    render(<OverviewTab guests={[]} wishes={[]} isEn={false} setActiveAdminTab={mockSetActiveTab} />);
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      const formattedTotal = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(2000);
      expect(screen.getByText(formattedTotal)).toBeInTheDocument();
    });
  });

  it('Barkovizyonu Başlat butonuna tıklandığında yeni sekmede /live rotasını açmalı', async () => {
    Object.defineProperty(window, 'location', { value: { pathname: '/demo' }, writable: true });
    
    render(<OverviewTab guests={[]} wishes={[]} isEn={false} setActiveAdminTab={mockSetActiveTab} />);
    
    // GÜNCELLENDİ: Act uyarısını kesmek için tıklamadan önce asenkron işlemlerin oturmasını bekliyoruz.
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    const liveBtn = screen.getByRole('button', { name: /Barkovizyonu Başlat/i });
    fireEvent.click(liveBtn);

    expect(window.open).toHaveBeenCalledWith('/demo/live', '_blank');
  });
});