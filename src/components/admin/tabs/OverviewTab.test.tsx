import React from 'react';
import { render, screen, waitFor, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { OverviewTab } from './OverviewTab';

vi.mock('../../../supabaseClient', () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation(() => {
        if (table === 'guest_photos') return Promise.resolve({ count: 5 });
        if (table === 'payments') return Promise.resolve({ data: [{ amount: 1000 }, { amount: 2000 }] });
        return Promise.resolve({ data: [] });
      })
    }))
  }
}));

describe('OverviewTab Bileşen Testleri', () => {
  afterEach(() => cleanup());

  it('İstatistikleri veritabanı ve proplar üzerinden doğru hesaplayıp ekranda göstermeli', async () => {
    const mockGuests = [
      { attendance: 'Katılacağım', personCount: '2' }, 
      { attendance: 'Katılamayacağım', personCount: '1' }
    ] as any[];
    
    const mockWishes = [
      { approved: false }, 
      { approved: true }, 
      { approved: false }
    ] as any[];

    render(<OverviewTab guests={mockGuests} wishes={mockWishes} isEn={false} setActiveAdminTab={vi.fn()} />);

    expect(screen.getAllByText('2')).toHaveLength(2);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeDefined();
      expect(screen.getByText(/3.000/)).toBeDefined();
    });
  });
});