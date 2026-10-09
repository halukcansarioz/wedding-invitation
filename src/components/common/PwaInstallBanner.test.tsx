import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PwaInstallBanner } from './PwaInstallBanner';
import { usePWAInstall } from '../../hooks/usePWAInstall';

// Named export olduğu için vi.fn() ile açıkça mockluyoruz
vi.mock('../../hooks/usePWAInstall', () => ({
  usePWAInstall: vi.fn(),
}));

describe('PwaInstallBanner İleri Seviye Testleri', () => {
  it('Cihaz iOS ise Safari paylaşım yönergelerini göstermeli', () => {
    // Artık .mockReturnValue güvenle kullanılabilir
    (usePWAInstall as any).mockReturnValue({
      isIos: true,
      isInstallable: true,
      promptInstall: vi.fn(),
    });

    render(<PwaInstallBanner />);
    expect(screen.getByText(/Ana Ekrana Ekle/i)).toBeInTheDocument();
  });

  it('Cihaz Android/PC ise tek tıklamalık Yükle butonunu göstermeli', () => {
    (usePWAInstall as any).mockReturnValue({
      isIos: false,
      isInstallable: true,
      promptInstall: vi.fn(),
    });

    render(<PwaInstallBanner />);
    const installBtn = screen.getByRole('button', { name: /Yükle/i });
    expect(installBtn).toBeInTheDocument();
  });
});