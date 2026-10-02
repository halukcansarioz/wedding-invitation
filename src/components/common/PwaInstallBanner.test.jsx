import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { PwaInstallBanner } from './PwaInstallBanner';
import { usePWAInstall } from '../../hooks/usePWAInstall';

vi.mock('../../hooks/usePWAInstall');
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('PwaInstallBanner İleri Seviye Testleri', () => {
  afterEach(() => cleanup());

  it('Cihaz iOS ise Safari paylaşım menüsü yönergelerini göstermeli', () => {
    vi.mocked(usePWAInstall).mockReturnValue({
      isInstallable: true,
      isIos: true,
      promptInstall: vi.fn(),
      setIsInstallable: vi.fn()
    });

    render(<PwaInstallBanner />);
    
    expect(screen.getByText(/Paylaş ikonuna dokunun/i)).toBeInTheDocument();
    expect(screen.getByText(/Ana Ekrana Ekle/i)).toBeInTheDocument();
    // iOS'ta manuel buton olmaz, yönerge olur
    expect(screen.queryByRole('button', { name: 'Yükle' })).not.toBeInTheDocument();
  });

  it('Cihaz Android/PC ise tek tıklamalık Yükle butonunu göstermeli', () => {
    vi.mocked(usePWAInstall).mockReturnValue({
      isInstallable: true,
      isIos: false,
      promptInstall: vi.fn(),
      setIsInstallable: vi.fn()
    });

    render(<PwaInstallBanner />);
    
    expect(screen.getByRole('button', { name: 'Yükle' })).toBeInTheDocument();
    expect(screen.queryByText(/Paylaş ikonuna dokunun/i)).not.toBeInTheDocument();
  });
});