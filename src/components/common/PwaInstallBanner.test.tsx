import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

// DÜZELTME: Güvenli ve doğrudan import yöntemi
import { PwaInstallBanner } from './PwaInstallBanner';
import { usePWAInstall } from '../../hooks/usePWAInstall';

vi.mock('../../hooks/usePWAInstall');

describe('PwaInstallBanner İleri Seviye Testleri', () => {
  
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Cihaz iOS ise Safari paylaşım yönergelerini göstermeli', () => {
    (usePWAInstall as any).mockReturnValue({ isIos: true, isInstallable: true, promptInstall: vi.fn() });
    
    render(<PwaInstallBanner />);
    
    expect(screen.getByText(/Ana Ekrana Ekle/i)).toBeInTheDocument();
  });

  it('Cihaz Android/PC ise tek tıklamalık Yükle butonunu göstermeli', () => {
    (usePWAInstall as any).mockReturnValue({ isIos: false, isInstallable: true, promptInstall: vi.fn() });
    
    render(<PwaInstallBanner />);
    
    const installBtn = screen.getByRole('button', { name: /Yükle/i });
    expect(installBtn).toBeInTheDocument();
  });
});