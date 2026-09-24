import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCountdown } from './useCountdown';

describe('useCountdown Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hedeflenen tarihe kalan süreyi doğru hesaplamalıdır', () => {
    // Şimdiki zamanı sabitle
    const now = new Date('2026-08-01T00:00:00Z').getTime();
    vi.setSystemTime(now);

    // Hedef: 2 gün, 5 saat, 30 dakika, 15 saniye sonrası
    const targetDate = new Date(now + (2 * 86400000) + (5 * 3600000) + (30 * 60000) + (15 * 1000)).toISOString();

    const { result } = renderHook(() => useCountdown(targetDate));

    expect(result.current).toEqual({
      days: 2,
      hours: 5,
      minutes: 30,
      seconds: 15,
    });
  });

  it('hedef tarih geçmişse tüm değerleri 0 dönmelidir', () => {
    const now = new Date('2026-08-01T00:00:00Z').getTime();
    vi.setSystemTime(now);
    
    // Hedef tarih dündü
    const targetDate = new Date(now - 86400000).toISOString();

    const { result } = renderHook(() => useCountdown(targetDate));

    expect(result.current).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it('zaman ilerledikçe sayacı güncellemelidir', () => {
    const now = new Date('2026-08-01T00:00:00Z').getTime();
    vi.setSystemTime(now);
    const targetDate = new Date(now + 10000).toISOString(); // 10 saniye sonrası

    const { result } = renderHook(() => useCountdown(targetDate));
    
    expect(result.current.seconds).toBe(10);

    act(() => {
      vi.advanceTimersByTime(2000); // 2 saniye ileri sar
    });

    expect(result.current.seconds).toBe(8);
  });
});