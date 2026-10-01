import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PwaInstallBanner } from './PwaInstallBanner';
import { usePWAInstall } from '../../hooks/usePWAInstall';

// usePWAInstall hook'unu taklit ediyoruz
vi.mock('../../hooks/usePWAInstall');

// i18next Mock
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('PwaInstallBanner Bileşeni', () => {
  it('uygulama kurulabilir değilse (zaten kuruluysa) hiçbir şey render etmemeli', () => {
    usePWAInstall.mockReturnValue({ isInstallable: false, isIos: false, promptInstall: vi.fn() });
    const { container } = render(<PwaInstallBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('uygulama kurulabilirse ama cihaz iOS ise bannerı GİZLEMELİ (Apple desteklemediği için)', () => {
    usePWAInstall.mockReturnValue({ isInstallable: true, isIos: true, promptInstall: vi.fn() });
    const { container } = render(<PwaInstallBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('uygulama kurulabilirse ve Android/PC ise bannerı göstermeli', () => {
    usePWAInstall.mockReturnValue({ isInstallable: true, isIos: false, promptInstall: vi.fn() });
    render(<PwaInstallBanner />);
    expect(screen.getByText('📱 Kolay Erişim İçin Yükle')).toBeInTheDocument();
  });

  it('Yükle butonuna tıklandığında promptInstall fonksiyonu çağrılmalı', () => {
    const mockPromptInstall = vi.fn();
    usePWAInstall.mockReturnValue({ isInstallable: true, isIos: false, promptInstall: mockPromptInstall });
    
    render(<PwaInstallBanner />);
    fireEvent.click(screen.getByText('Yükle'));
    
    expect(mockPromptInstall).toHaveBeenCalledTimes(1);
  });
});