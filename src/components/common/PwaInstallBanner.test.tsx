/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { PwaInstallBanner } from './PwaInstallBanner';
import { usePWAInstall } from '../../hooks/usePWAInstall';

vi.mock('../../hooks/usePWAInstall', () => ({
  usePWAInstall: vi.fn(),
}));

describe('PwaInstallBanner İleri Seviye Testleri', () => {
  
  // Her testten sonra DOM'u temizleyerek testlerin birbirine karışmasını (multiple elements hatasını) önlüyoruz
  afterEach(() => {
    cleanup();
  });

  it('Cihaz iOS ise Safari paylaşım yönergelerini göstermeli', () => {
    (usePWAInstall as any).mockReturnValue({
      isIos: true,
      isInstallable: true,
      promptInstall: vi.fn(),
    });

    render(<PwaInstallBanner />);
    
    // TS-2339 hatasını önlemek için toBeInTheDocument yerine toBeDefined kullanıldı
    expect(screen.getByText(/Ana Ekrana Ekle/i)).toBeDefined();
  });

  it('Cihaz Android/PC ise tek tıklamalık Yükle butonunu göstermeli', () => {
    (usePWAInstall as any).mockReturnValue({
      isIos: false,
      isInstallable: true,
      promptInstall: vi.fn(),
    });

    render(<PwaInstallBanner />);
    
    expect(screen.getByRole('button', { name: /Yükle/i })).toBeDefined();
  });
});