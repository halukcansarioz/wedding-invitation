import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { LocalizedDate } from './LocalizedDate';

// react-i18next kütüphanesini mockluyoruz ki istediğimiz dili simüle edebilelim[cite: 1]
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'tr' } 
  })
}));

describe('LocalizedDate Bileşeni', () => {
  // ÇÖZÜM: Testler arası DOM temizliği eklenerek birden fazla element oluşması engellendi[cite: 1]
  afterEach(() => {
    cleanup();
  });

  it('Verilen ISO tarih stringini Türkçe formatında doğru şekilde render etmeli', () => {
    // 22 Ağustos 2026 tarihi Cumartesi gününe denk gelir[cite: 1]
    const testDate = "2026-08-22T19:00:00";
    
    render(<LocalizedDate dateString={testDate} />);
    
    // Intl.DateTimeFormat 'tr' dili için bu çıktıyı üretecektir[cite: 1]
    const expectedText = new Intl.DateTimeFormat('tr', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    }).format(new Date(testDate));

    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });
});