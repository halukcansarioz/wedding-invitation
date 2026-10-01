import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../../tests/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { PaymentsTab } from './PaymentsTab';

const mockSupabaseSelect = vi.fn();
vi.mock('../../../supabaseClient', () => ({
  supabase: { from: () => ({ select: () => ({ order: mockSupabaseSelect }) }) }
}));

describe('PaymentsTab Admin Bileşen Testleri', () => {
  it('Yükleniyor durumunu ve ardından gelen ödemeleri doğru şekilde render etmeli', async () => {
    const mockPayments = [
      { id: '1', guest_name: 'Kemal Sunal', amount: '1500', currency: 'TRY', status: 'completed', created_at: '2026-08-01' }
    ];
    mockSupabaseSelect.mockResolvedValue({ data: mockPayments, error: null });

    render(<PaymentsTab isEn={false} />);

    await waitFor(() => {
      expect(screen.getByText('Kemal Sunal')).toBeInTheDocument();
    });

    // Toplam tutarı gösteren spesifik elementi seçiyoruz
    const totalAmounts = screen.getAllByText(/1\.500/i);
    expect(totalAmounts[0]).toBeInTheDocument();
  });
});