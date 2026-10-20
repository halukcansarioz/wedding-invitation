/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
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
    vi.spyOn(pwaHooks, 'usePWAInstall').mockReturnValue({
      isIos: false,
      isInstallable: true,
      promptInstall: vi.fn(),
      setIsInstallable: vi.fn(), 
    });

    render(<PwaInstallBanner />);
    
    expect(screen.getByRole('button', { name: /Yükle/i })).toBeDefined();
  });
});