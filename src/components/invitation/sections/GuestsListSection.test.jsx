import React from 'react';
import { render, screen, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { GuestsListSection } from './GuestsListSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('GuestsListSection Bileşen Testleri', () => {
  afterEach(() => cleanup());

  it('Gelen misafir istatistiklerini dogru hesaplayip gostermeli', () => {
    const mockGuests = [
      { attendance: "Katılacağım", personCount: "2" },
      { attendance: "Katılacağım", personCount: "1" },
      { attendance: "Katılamayacağım", personCount: "1" }
    ];

    render(<GuestsListSection guests={mockGuests} totalPersonCount={3} notAttendingCount={1} />);

    const totals = screen.getAllByText('3');
    expect(totals.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('1')).toBeDefined();
  });
});