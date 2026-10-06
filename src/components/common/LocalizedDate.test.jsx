import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { LocalizedDate } from './LocalizedDate';

// react-i18next kütüphanesini mockluyoruz
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'tr' } 
  })
}));

describe('LocalizedDate Bileşeni', () => {
  afterEach(() => {
    cleanup();
  });

  it('Verilen ISO tarih stringini Türkçe formatında doğru şekilde render etmeli', () => {
    const testDate = "2026-08-22T19:00:00";
    
    render(<LocalizedDate dateString={testDate} />);
    
    const expectedText = new Intl.DateTimeFormat('tr', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    }).format(new Date(testDate));

    const elements = screen.getAllByText(expectedText);
    expect(elements.length).toBeGreaterThan(0);
    expect(elements[0]).toBeInTheDocument();
  });
});