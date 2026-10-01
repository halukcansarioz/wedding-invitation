import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OverviewTab } from './OverviewTab';
import { useStore } from '../../../store/useStore';

vi.mock('../../../store/useStore');
vi.mock('../../../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 0, data: [] })
    }))
  }
}));

describe('OverviewTab Bileşen Testleri', () => {
  beforeEach(() => {
    useStore.mockImplementation((selector) => selector({
      adminDraft: { invitation: { bride: 'Ayşe', groom: 'Veli' } }
    }));
  });

  it('Gelin/Damat adını karşılama mesajında göstermeli', () => {
    render(<OverviewTab guests={[]} wishes={[]} isEn={false} setActiveAdminTab={vi.fn()} />);
    expect(screen.getByText(/Ayşe & Veli/i)).toBeInTheDocument();
  });
});