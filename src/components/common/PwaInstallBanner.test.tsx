/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PwaInstallBanner } from './PwaInstallBanner';
import * as pwaHooks from '../../hooks/usePWAInstall';

describe('PwaInstallBanner İleri Seviye Testleri', () => {

  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('Cihaz iOS ise Safari paylaşım yönergelerini göstermeli', () => {
    vi.spyOn(pwaHooks, 'usePWAInstall').mockReturnValue({
      isIos: true,
      isInstallable: true,
      promptInstall: vi.fn(),
      setIsInstallable: vi.fn(), 
    });

    render(<PwaInstallBanner />);
    
    expect(screen.getByText(/Ana Ekrana Ekle/i)).toBeDefined();
  });

  it('Cihaz Android/PC ise tek tıklamalık Yükle butonunu göstermeli', () => {
    const promptInstall = vi.fn();
    vi.spyOn(pwaHooks, 'usePWAInstall').mockReturnValue({
      isIos: false,
      isInstallable: true,
      promptInstall,
      setIsInstallable: vi.fn(), 
    });

    render(<PwaInstallBanner />);
    
    fireEvent.click(screen.getByRole('button', { name: /Yükle/i }));
    expect(promptInstall).toHaveBeenCalledTimes(1);
  });

  it('Kurulum desteklenmiyorsa banner render etmemeli', () => {
    vi.spyOn(pwaHooks, 'usePWAInstall').mockReturnValue({
      isIos: false,
      isInstallable: false,
      promptInstall: vi.fn(),
      setIsInstallable: vi.fn(),
    });

    render(<PwaInstallBanner />);

    expect(document.querySelector('.pwa-install-banner')).toBeNull();
  });

  it('iOS cihazlarda kurulum butonu yerine yalnızca yönerge göstermeli', () => {
    vi.spyOn(pwaHooks, 'usePWAInstall').mockReturnValue({
      isIos: true,
      isInstallable: true,
      promptInstall: vi.fn(),
      setIsInstallable: vi.fn(),
    });

    render(<PwaInstallBanner />);

    expect(screen.queryByRole('button')).toBeNull();
    expect(document.querySelector('.ios-banner')).not.toBeNull();
  });
});