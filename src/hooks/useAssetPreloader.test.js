import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAssetPreloader } from './useAssetPreloader';

describe('useAssetPreloader Hook Testleri', () => {
  beforeEach(() => {
    vi.useFakeTimers(); // Asenkron hataları önlemek için sahte zaman kullanıyoruz
    global.Image = class {
      constructor() { setTimeout(() => { if (this.onload) this.onload(); }, 10); }
    };
    const mockCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'video') {
        return { load: function() { setTimeout(() => { if (this.onloadeddata) this.onloadeddata(); }, 10); } };
      }
      return mockCreateElement(tagName);
    });
  });

  afterEach(() => { 
    vi.useRealTimers();
    vi.restoreAllMocks(); 
  });

  it('medya URLsi boş ise anında yüklendi (true) kabul etmeli', () => {
    const { result } = renderHook(() => useAssetPreloader(null));
    expect(result.current).toBe(true);
  });

  it('resim (.jpg) gönderildiğinde onload tetiklenene kadar false, sonra true olmalı', async () => {
    const { result } = renderHook(() => useAssetPreloader('test.jpg'));
    expect(result.current).toBe(false);
    act(() => { vi.advanceTimersByTime(20); });
    expect(result.current).toBe(true);
  });

  it('video (.mp4) gönderildiğinde onloadeddata tetiklenene kadar false, sonra true olmalı', async () => {
    const { result } = renderHook(() => useAssetPreloader('test.mp4'));
    expect(result.current).toBe(false);
    act(() => { vi.advanceTimersByTime(20); });
    expect(result.current).toBe(true);
  });
});