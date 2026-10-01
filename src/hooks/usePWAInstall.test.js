import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePWAInstall } from './usePWAInstall';

describe('usePWAInstall Hook Testleri', () => {
  let originalUserAgent;

  beforeEach(() => {
    originalUserAgent = navigator.userAgent;
    // window.matchMedia mock'laması (PWA'nın zaten yüklü olup olmadığını anlamak için)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false, // Varsayılan: standalone (yüklü) değil
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', { value: originalUserAgent, configurable: true });
    vi.restoreAllMocks();
  });

  it('Cihaz iOS (iPhone) ise isIos ve isInstallable değerleri true olmalı', () => {
    // iPhone kullanıcı ajanını taklit et
    Object.defineProperty(navigator, 'userAgent', { 
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)', 
      configurable: true 
    });
    
    const { result } = renderHook(() => usePWAInstall());
    
    expect(result.current.isIos).toBe(true);
    expect(result.current.isInstallable).toBe(true);
  });

  it('Android/PC cihazlarda beforeinstallprompt olayı tetiklenene kadar isInstallable false olmalı', () => {
    // Windows/Chrome kullanıcı ajanını taklit et
    Object.defineProperty(navigator, 'userAgent', { 
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 
      configurable: true 
    });
    
    const { result } = renderHook(() => usePWAInstall());
    
    // Başlangıçta false
    expect(result.current.isIos).toBe(false);
    expect(result.current.isInstallable).toBe(false);

    // Tarayıcının "Kurulabilir!" eventini tetikliyoruz
    act(() => {
      const event = new Event('beforeinstallprompt');
      event.preventDefault = vi.fn();
      window.dispatchEvent(event);
    });

    // Event geldikten sonra true olmalı
    expect(result.current.isInstallable).toBe(true);
  });
});