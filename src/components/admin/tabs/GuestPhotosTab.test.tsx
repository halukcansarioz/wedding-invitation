import React from 'react';
import { render, screen, fireEvent } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GuestPhotosTab } from './GuestPhotosTab';
import { useAdminGuestPhotos } from '../../../hooks/useAdminGuestPhotos';

vi.mock('../../../hooks/useAdminGuestPhotos');

describe('GuestPhotosTab Admin Bileşen Testleri', () => {
  const mockApprovePhoto = vi.fn();
  const mockRejectPhoto = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Veriler yüklenirken Loading ekranını göstermeli', () => {
    (useAdminGuestPhotos as any).mockReturnValue({
      isLoading: true,
      pendingPhotos: [],
      approvedPhotos: [],
      approvePhoto: mockApprovePhoto,
      rejectPhoto: mockRejectPhoto
    });

    render(<GuestPhotosTab isEn={false} />);
    
    // GÜNCELLENDİ: TS hatasını (ts-2339) önlemek için toBeInTheDocument yerine toBeDefined kullanıldı.
    // getByText zaten elementi bulamazsa hata fırlatır, test güvenliği aynı kalır.
    expect(screen.getByText(/Fotoğraflar yükleniyor/i)).toBeDefined();
  });

  it('Bekleyen ve Onaylanan fotoğrafları listelemeli ve buton aksiyonlarını tetiklemeli', () => {
    (useAdminGuestPhotos as any).mockReturnValue({
      isLoading: false,
      pendingPhotos: [{ id: '1', image_url: 'bekleyen.jpg' }],
      approvedPhotos: [{ id: '2', image_url: 'onayli.jpg' }],
      approvePhoto: mockApprovePhoto,
      rejectPhoto: mockRejectPhoto
    });

    render(<GuestPhotosTab isEn={false} />);
    
    expect(screen.getByText('Onay Bekleyenler (1)')).toBeDefined();
    expect(screen.getByText('Yayında Olanlar (1)')).toBeDefined();

    const approveBtn = screen.getByRole('button', { name: /Onayla/i });
    fireEvent.click(approveBtn);
    expect(mockApprovePhoto).toHaveBeenCalledWith('1');

    const removeBtn = screen.getByRole('button', { name: /Kaldır/i });
    fireEvent.click(removeBtn);
    expect(mockRejectPhoto).toHaveBeenCalledWith('2', 'onayli.jpg');
  });
});