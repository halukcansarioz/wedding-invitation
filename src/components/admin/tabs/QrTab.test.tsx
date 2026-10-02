import React from 'react';
import { render, screen, fireEvent } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QrTab } from './QrTab';

// Custom hook'u mockluyoruz
vi.mock('../../../hooks/useAdminQr', () => ({
  useAdminQr: () => ({
    tableCount: 10,
    setTableCount: vi.fn(),
    printTableCards: vi.fn()
  })
}));

describe('QrTab Admin Bileşen Testleri', () => {
  let mockDownloadQrCode: any;
  let mockCopyAdminLink: any;

  beforeEach(() => {
    mockDownloadQrCode = vi.fn();
    mockCopyAdminLink = vi.fn();
    vi.clearAllMocks();
  });

  it('Genel QR İndir butonuna tıklandığında ilgili prop fonksiyonunu tetiklemeli', () => {
    render(
      <QrTab 
        isEn={false} 
        saveSiteContent={vi.fn()} 
        qrImageUrl="test-qr.png" 
        downloadQrCode={mockDownloadQrCode} 
        currentShareLink="https://test.com" 
        copyAdminLink={mockCopyAdminLink} 
      />
    );

    const downloadBtn = screen.getByRole('button', { name: /Genel QR İndir/i });
    fireEvent.click(downloadBtn);

    expect(mockDownloadQrCode).toHaveBeenCalledTimes(1);
  });

  it('Genel davetiye linki kopyalama butonunu tetiklemeli', () => {
    render(
      <QrTab 
        isEn={false} 
        saveSiteContent={vi.fn()} 
        qrImageUrl="test-qr.png" 
        downloadQrCode={mockDownloadQrCode} 
        currentShareLink="https://test.com" 
        copyAdminLink={mockCopyAdminLink} 
      />
    );

    const copyBtn = screen.getByRole('button', { name: /Linki Kopyala/i });
    fireEvent.click(copyBtn);

    expect(mockCopyAdminLink).toHaveBeenCalledWith('https://test.com', 'Davetiye linki kopyalandı!');
  });
});