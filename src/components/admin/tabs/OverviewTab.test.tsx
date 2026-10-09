import React from 'react';
import { render, screen, waitFor, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { OverviewTab } from './OverviewTab';
import { useStore } from '../../../store/useStore';

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
  let originalLocation: any;
  let initialState: any;

  beforeEach(() => {
    mockSetActiveTab = vi.fn();
    vi.spyOn(window, 'open').mockImplementation(() => null);
    
    initialState = useStore.getState();
    useStore.setState({
      adminDraft: { invitation: { bride: 'Ayşe', groom: 'Veli' } } as any
    });

    // DÜZELTME: JSDOM location hatasını önleme
    originalLocation = window.location;
    delete (window as any).location;
    window.location = { pathname: '/demo' } as any;
  });

  afterEach(() => {
    cleanup();
    window.location = originalLocation;
    useStore.setState(initialState, true);
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
    render(<OverviewTab guests={[]} wishes={[]} isEn={false} setActiveAdminTab={mockSetActiveTab} />);
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    const liveBtn = screen.getByRole('button', { name: /Barkovizyonu Başlat/i });
    fireEvent.click(liveBtn);

    expect(window.open).toHaveBeenCalledWith('/demo/live', '_blank');
  });
});