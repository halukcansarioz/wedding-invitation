import React from 'react';
import { render, screen, cleanup } from '../../../../tests/test-utils'; // DÜZELTİLDİ
import { describe, it, expect, vi, afterEach } from 'vitest';
import { GuestsListSection } from './GuestsListSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'tr' }
  }),
}));

describe('GuestsListSection Bileşeni', () => {
  afterEach(() => {
    cleanup(); 
    vi.clearAllMocks();
  });

  const mockCopy = {
    guestsLabel: "Misafirler",
    guestsTitle: "Misafir Listesi"
  };

  const mockGuests = [
    { id: 1, attendance: "Katılacağım", personCount: "2" },
    { id: 2, attendance: "Katılamayacağım", personCount: "1" },
    { id: 3, attendance: "Katılacağım", personCount: "1" }
  ];

  it('misafir istatistiklerini doğru hesaplamalı ve göstermeli', () => {
    render(<GuestsListSection copy={mockCopy} guests={mockGuests} />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
    
    expect(screen.getByText('2')).toBeInTheDocument();
    
    const statsContainer = document.querySelector('.guest-stats');
    expect(statsContainer).toHaveTextContent('1');
  });

  it('dışarıdan prop ile gelen sayıları öncelikli olarak kullanmalı', () => {
    render(<GuestsListSection copy={mockCopy} guests={mockGuests} totalPersonCount={10} notAttendingCount={5} />);
    
    expect(screen.getByText('10')).toBeInTheDocument(); // totalPersonCount
    expect(screen.getByText('5')).toBeInTheDocument();  // notAttendingCount
  });
});