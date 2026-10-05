import React from 'react';
import { render, screen, fireEvent } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QrTab } from './QrTab';

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

    const copyBtns = screen.getAllByRole('button', { name: /Linki Kopyala/i });
    fireEvent.click(copyBtns[0]);

    expect(mockCopyAdminLink).toHaveBeenCalledWith('https://test.com', 'Davetiye linki kopyalandı!');
  });
});