import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePWAInstall } from './usePWAInstall';

describe('usePWAInstall Hook Testleri', () => {
  let originalUserAgent;

  beforeEach(() => {
    originalUserAgent = navigator.userAgent;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false, 
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
    Object.defineProperty(navigator, 'userAgent', { 
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)', 
      configurable: true 
    });
    
    const { result } = renderHook(() => usePWAInstall());
    
    expect(result.current.isIos).toBe(true);
    expect(result.current.isInstallable).toBe(true);
  });

  it('Android/PC cihazlarda beforeinstallprompt olayı tetiklenene kadar isInstallable false olmalı', () => {
    Object.defineProperty(navigator, 'userAgent', { 
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 
      configurable: true 
    });
    
    const { result } = renderHook(() => usePWAInstall());
    
    expect(result.current.isIos).toBe(false);
    expect(result.current.isInstallable).toBe(false);

    act(() => {
      const event = new Event('beforeinstallprompt');
      // Read-only özelliğin üzerine yazmaya çalışmak (TypeError) yerine güvenli mock:
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);
  });
});