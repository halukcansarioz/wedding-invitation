import React from 'react';
import { render, screen, waitFor, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PaymentsTab } from './PaymentsTab';

const mockSupabaseSelect = vi.fn();
vi.mock('../../../supabaseClient', () => ({
  supabase: { from: () => ({ select: () => ({ order: mockSupabaseSelect }) }) }
}));

describe('PaymentsTab İleri Seviye Testleri', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Hiç ödeme yoksa boş durum mesajını (Empty State) göstermeli', async () => {
    mockSupabaseSelect.mockResolvedValue({ data: [], error: null });

    render(<PaymentsTab isEn={false} />);

    await waitFor(() => {
      expect(screen.getByText('Henüz bir hediye/ödeme alınmamış.')).toBeInTheDocument();
    });
  });

  it('Sadece "completed" (başarılı) statüsündeki ödemeleri toplam tutara eklemeli', async () => {
    const mixedPayments = [
      { id: '1', guest_name: 'Ahmet', amount: '1000', currency: 'TRY', status: 'completed', created_at: '2026-08-01' },
      { id: '2', guest_name: 'Mehmet', amount: '500', currency: 'TRY', status: 'pending', created_at: '2026-08-01' }, // Başarısız/Bekleyen
      { id: '3', guest_name: 'Ayşe', amount: '2000', currency: 'TRY', status: 'completed', created_at: '2026-08-01' }
    ];
    mockSupabaseSelect.mockResolvedValue({ data: mixedPayments, error: null });

    render(<PaymentsTab isEn={false} />);

    await waitFor(() => {
      expect(screen.getByText('Ahmet')).toBeInTheDocument();
      expect(screen.getByText('Mehmet')).toBeInTheDocument();
    });

    // Toplam tutar: Sadece 1000 + 2000 = 3000 olmalı. (500 dahil edilmemeli)
    const expectedTotal = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(3000);
    const totalAmountElements = screen.getAllByText(expectedTotal);
    expect(totalAmountElements.length).toBeGreaterThan(0);
  });
});