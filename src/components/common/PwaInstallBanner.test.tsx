import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as i18next from 'react-i18next';

import { PwaInstallBanner } from './PwaInstallBanner';
import { usePWAInstall } from '../../hooks/usePWAInstall';

// 1. Hook'u factory fonksiyonu ile güvenli şekilde mockluyoruz
vi.mock('../../hooks/usePWAInstall', () => ({
  usePWAInstall: vi.fn()
}));

describe('PwaInstallBanner İleri Seviye Testleri', () => {
  beforeEach(() => {
    // 2. KRİTİK: isolate: false olduğu için diğer testlerde banner kapatılıp 
    // localStorage'a kaydedilmiş olabilir. Bileşenin gizlenmemesi (null dönmemesi) 
    // için her testten önce storage'ı temizliyoruz.
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.clearAllMocks();

    // 3. setupTests.js içindeki global i18next mock'unu dinamik olarak eziyoruz.
    // Böylece render edilen metinler Zod/i18n key'leri değil, beklediğimiz Türkçe metinler olacak.
    vi.spyOn(i18next, 'useTranslation').mockReturnValue({
      t: (key: string) => {
        const k = key.toLowerCase();
        if (k.includes('ios') || k.includes('add') || k.includes('home')) return 'Ana Ekrana Ekle';
        return 'Yükle';
      },
      i18n: { language: 'tr' } as any,
      ready: true
    });
  });

  afterEach(() => {
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
    
    const installBtn = screen.getByRole('button', { name: /Yükle/i });
    expect(installBtn).toBeInTheDocument();
  });
});