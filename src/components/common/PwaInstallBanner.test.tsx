import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { PwaInstallBanner } from './PwaInstallBanner';
import { usePWAInstall } from '../../hooks/usePWAInstall';

vi.mock('../../hooks/usePWAInstall');

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const k = key.toLowerCase();
      if (k.includes('ios') || k.includes('add') || k.includes('home')) return 'Ana Ekrana Ekle';
      if (k.includes('install') || k.includes('download')) return 'Yükle';
      return 'Yükle';
    },
    i18n: { language: 'tr' }
  })
}));

describe('PwaInstallBanner İleri Seviye Testleri', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
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
      isInstalled: false, // Kurulmadığını açıkça belirtiyoruz ki banner görünsün
      promptInstall: vi.fn() 
    });
    
    render(<PwaInstallBanner />);
    
    const installBtn = screen.getByRole('button', { name: /Yükle/i });
    expect(installBtn).toBeInTheDocument();
  });
});