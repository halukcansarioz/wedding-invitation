import React from 'react';
import { render, screen, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { PwaInstallBanner } from './PwaInstallBanner';
import { usePWAInstall } from '../../hooks/usePWAInstall';

// 1. Hook'u factory fonksiyonu ile güvenli şekilde mockluyoruz
vi.mock('../../hooks/usePWAInstall', () => ({
  usePWAInstall: vi.fn()
}));

// 2. ESM spyOn hatasını önlemek için react-i18next mock'unu doğrudan dosya seviyesine alıyoruz
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const k = key.toLowerCase();
      if (k.includes('ios') || k.includes('add') || k.includes('home')) return 'Ana Ekrana Ekle';
      return 'Yükle';
    },
    i18n: { language: 'tr' },
    ready: true
  })
}));

describe('PwaInstallBanner İleri Seviye Testleri', () => {
  beforeEach(() => {
    vi.useFakeTimers(); // Bileşendeki setTimeout gecikmelerini yakalamak için
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Açık kalan zamanlayıcıları temizle
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
    cleanup();
  });

  it('Cihaz iOS ise Safari paylaşım yönergelerini göstermeli', () => {
    (usePWAInstall as any).mockReturnValue({ 
      isIos: true, 
      isInstallable: true, 
      isInstalled: false, 
      promptInstall: vi.fn() 
    });
    
    render(<PwaInstallBanner />);
    
    // Bileşen içindeki setTimeout delayını aşmak için zamanı anında ileri sarıyoruz
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    
    // waitFor'a gerek kalmadan senkron olarak kontrol ediyoruz
    expect(screen.getByText(/Ana Ekrana Ekle/i)).toBeInTheDocument();
  });

  it('Cihaz Android/PC ise tek tıklamalık Yükle butonunu göstermeli', () => {
    (usePWAInstall as any).mockReturnValue({ 
      isIos: false, 
      isInstallable: true, 
      isInstalled: false, 
      promptInstall: vi.fn() 
    });
    
    render(<PwaInstallBanner />);
    
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    
    const installBtn = screen.getByRole('button', { name: /Yükle/i });
    expect(installBtn).toBeInTheDocument();
  });
});