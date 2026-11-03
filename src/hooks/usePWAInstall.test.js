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
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);
  });

  it('Kurulum promptu kabul edilince kurulabilirlik durumunu kapatmalı', async () => {
    Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 (Windows NT 10.0)', configurable: true });
    const prompt = vi.fn().mockResolvedValue(undefined);
    const userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });
    const { result } = renderHook(() => usePWAInstall());
    const event = new Event('beforeinstallprompt');
    Object.defineProperties(event, {
      preventDefault: { value: vi.fn() },
      prompt: { value: prompt },
      userChoice: { value: userChoice },
    });

    act(() => window.dispatchEvent(event));
    await act(async () => { await result.current.promptInstall(); });

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(result.current.isInstallable).toBe(false);
  });

  it('Kullanıcı promptu reddederse promptu temizleyip kurulabilirlik durumunu korumalı', async () => {
    Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 (Windows NT 10.0)', configurable: true });
    const prompt = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => usePWAInstall());
    const event = new Event('beforeinstallprompt');
    Object.defineProperties(event, {
      preventDefault: { value: vi.fn() },
      prompt: { value: prompt },
      userChoice: { value: Promise.resolve({ outcome: 'dismissed', platform: 'web' }) },
    });

    act(() => window.dispatchEvent(event));
    await act(async () => { await result.current.promptInstall(); });

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(result.current.isInstallable).toBe(true);
    await act(async () => { window.dispatchEvent(new Event('appinstalled')); });
    expect(result.current.isInstallable).toBe(false);
  });

  it('Standalone modda kurulum bannerı için installable durumunu açmamalı', () => {
    Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 (Windows NT 10.0)', configurable: true });
    window.matchMedia.mockImplementation(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));

    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isIos).toBe(false);
  });
});
