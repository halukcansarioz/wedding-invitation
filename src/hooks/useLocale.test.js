import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useLocale } from './useLocale';

// react-i18next'i test senaryosuna göre dinamik kontrol edebilmek için mockluyoruz
let mockLanguage = 'tr';
const mockChangeLanguage = vi.fn((lang) => { mockLanguage = lang; });

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { 
      get language() { return mockLanguage; },
      changeLanguage: mockChangeLanguage
    }
  })
}));

describe('useLocale Hook Testleri', () => {
  it('dil TR iken isEn değeri false dönmeli', () => {
    mockLanguage = 'tr';
    const { result } = renderHook(() => useLocale());
    expect(result.current.isEn).toBe(false);
  });

  it('dil EN iken isEn değeri true dönmeli', () => {
    mockLanguage = 'en-US';
    const { result } = renderHook(() => useLocale());
    expect(result.current.isEn).toBe(true);
  });

  it('toggleLanguage fonksiyonu dili değiştirmeli', () => {
    mockLanguage = 'tr';
    const { result } = renderHook(() => useLocale());
    
    act(() => {
      result.current.toggleLanguage();
    });
    
    // Dil TR olduğu için EN'ye geçmesini bekleriz
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });
});