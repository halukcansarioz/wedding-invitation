import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCountdown } from './useCountdown';

describe('useCountdown İleri Seviye Hook Testleri', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Sayfa arka plandaysa (document.hidden = true) geri sayım hesaplamasını durdurmalı', () => {
    const now = new Date('2026-08-01T00:00:00Z').getTime();
    vi.setSystemTime(now);
    const targetDate = new Date(now + 60000).toISOString(); // 1 dakika sonrası

    // Document.hidden özelliğini mockla
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });

    const { result } = renderHook(() => useCountdown(targetDate));

    // document.hidden true olduğu için ilk renderda updateCountdown return yapıp state'i default bırakır (0,0,0,0)
    // Aslında hedef tarihe 1 dakika olmasına rağmen güncelleme yapmamalıdır.
    expect(result.current).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // Özelliği normale çevir
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
  });

  it('Hedef tarih geçersiz bir string ise NaN yerine tüm değerleri 0 dönmeli', () => {
    const { result } = renderHook(() => useCountdown('gecersiz-tarih-formati'));
    expect(result.current).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});