import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LocalizedDate } from './LocalizedDate';

// react-i18next kütüphanesini mockluyoruz ki istediğimiz dili simüle edebilelim
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'tr' } 
  })
}));

describe('LocalizedDate Bileşeni', () => {
  it('Verilen ISO tarih stringini Türkçe formatında doğru şekilde render etmeli', () => {
    // 22 Ağustos 2026 tarihi Cumartesi gününe denk gelir
    const testDate = "2026-08-22T19:00:00";
    
    render(<LocalizedDate dateString={testDate} />);
    
    // Intl.DateTimeFormat 'tr' dili için bu çıktıyı üretecektir
    const expectedText = new Intl.DateTimeFormat('tr', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    }).format(new Date(testDate));

    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });
});