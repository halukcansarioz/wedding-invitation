import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GuestCameraSection } from './GuestCameraSection';
import { useStore } from '../../../store/useStore';
import * as dbServices from '../../../services/database';

vi.mock('../../../store/useStore');
vi.mock('../../../services/database', () => ({ 
  // Bilinçli olarak hata fırlatıyoruz
  uploadAndModerateGuestPhoto: vi.fn().mockRejectedValue(new Error('Yükleme hatası')) 
}));
vi.mock('framer-motion', () => ({ m: { section: ({ children }) => <section>{children}</section> } }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } }) }));

describe('GuestCameraSection Hata Yönetimi Testi', () => {
  let mockShowAppAlert;

  beforeEach(() => {
    vi.clearAllMocks();
    mockShowAppAlert = vi.fn();
    useStore.mockImplementation((selector) => selector({
      showAppAlert: mockShowAppAlert,
      siteData: { invitation: { bride: "Test", groom: "Çift" } }
    }));

    // İyileştirilmiş Image mock
    global.Image = class {
      constructor() {
        this._src = '';
      }
      set src(value) {
        this._src = value;
        // src atandığında küçük bir gecikme ile onload'u tetikle
        setTimeout(() => { if (this.onload) this.onload(); }, 10);
      }
      get src() {
        return this._src;
      }
    };

    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ drawImage: vi.fn(), createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })), fillRect: vi.fn(), fillText: vi.fn() }));
    HTMLCanvasElement.prototype.toBlob = vi.fn((cb) => cb(new Blob()));
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/test-image');
  });

  afterEach(() => {
    cleanup();
  });

  it('Fotoğraf yüklenirken bir hata oluşursa error uyarısı göstermeli ve butonu serbest bırakmalı', async () => {
    render(<GuestCameraSection />);
    
    // DÜZELTME: Kırılgan querySelector yerine doğrudan Test ID ile stabil hedefleme
    const fileInput = screen.getByTestId('camera-input');
    fireEvent.change(fileInput, { target: { files: [new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' })] } });

    await waitFor(() => {
      // Store üzerinden çağrılan "Hata" tonundaki alerti kontrol et
      expect(mockShowAppAlert).toHaveBeenCalledWith(
        expect.stringContaining('Fotoğraf işlenemedi'), 
        expect.objectContaining({ tone: 'error', title: 'Hata' })
      );
    });

    // Buton tekrar tıklanabilir (disabled = false) olmalı
    const cameraButton = screen.getByRole('button', { name: /Kamera \/ Galeri Aç/i });
    expect(cameraButton).not.toBeDisabled();
  });
});