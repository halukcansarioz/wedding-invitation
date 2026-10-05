import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SmartAlbumSection } from './SmartAlbumSection';
import * as dbServices from '../../../services/database';
import { supabase } from '../../../supabaseClient';
import { useStore } from '../../../store/useStore';

// 1. Supabase Client ve Alt Katmanları (Storage & Functions) Mockluyoruz
vi.mock('../../../supabaseClient', () => ({
  supabase: {
    functions: { invoke: vi.fn() },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://mock.com/test.jpg' } }),
        remove: vi.fn().mockResolvedValue({ data: {}, error: null }) // ÇÖZÜM BURADA: Çöp toplama fonksiyonu eklendi
      }))
    }
  }
}));

// 2. Database Services Mock
vi.mock('../../../services/database', () => ({
  uploadMediaFile: vi.fn(),
  uploadAndModerateGuestPhoto: vi.fn(),
  deleteMediaFile: vi.fn()
}));

// 3. Store Mock
vi.mock('../../../store/useStore', () => ({
  useStore: vi.fn()
}));

// 4. Kütüphaneler Mock
vi.mock('framer-motion', () => ({
  m: { section: ({ children, className }) => <section className={className}>{children}</section> }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

vi.mock('browser-image-compression', () => ({
  default: vi.fn(async () => new File(['dummy'], 'compressed.jpg', { type: 'image/jpeg' }))
}));

describe('SmartAlbumSection Kapsamlı Testleri', () => {

  beforeEach(() => {
    vi.clearAllMocks();

    // Store'u başarılı duruma hazırla
    vi.mocked(useStore).mockReturnValue({
      showAppAlert: vi.fn(),
      siteData: { invitation: { bride: "Gelin", groom: "Damat" } }
    });

    // --- KRİTİK TARAYICI API MOCK'LARI (JSDOM Çökmelerini Engeller) ---
    if (typeof window.URL.createObjectURL === 'undefined') {
      window.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/test-image');
    }
    if (typeof window.URL.revokeObjectURL === 'undefined') {
      window.URL.revokeObjectURL = vi.fn(); 
    }

    // Web Worker Mock (Görsel Sıkıştırma)
    global.Worker = class {
      constructor() {
        this.listeners = {};
        this.onmessage = null;
      }
      postMessage() {
        setTimeout(() => {
          const event = { data: { blob: new Blob(['dummy'], { type: 'image/jpeg' }) } };
          if (this.onmessage) this.onmessage(event);
          if (this.listeners['message']) {
            this.listeners['message'].forEach(cb => cb(event));
          }
        }, 10);
      }
      addEventListener(type, cb) {
        if (!this.listeners[type]) this.listeners[type] = [];
        this.listeners[type].push(cb);
      }
      removeEventListener() {}
      terminate() {}
    };
    window.Worker = global.Worker;

    // Terminal kirliliğini önlemek için console.error'ı gizle
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('Yapay zeka API hata verdiğinde (Örn: Yüz bulunamadı) ekranda hata metni göstermeli', async () => {
    // 1. Bu test için API'lerin DÜRÜSTÇE HATA dönmesini sağlıyoruz.
    vi.mocked(dbServices.uploadMediaFile).mockResolvedValue('https://mock-storage.com/test.jpg');
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: new Error('Yüz tespit edilemedi.') // HATA DURUMU
    });

    const { container } = render(<SmartAlbumSection />);
    
    // Dosya Yükle
    const fileInput = container.querySelector('input[type="file"]');
    fireEvent.change(fileInput, { target: { files: [new File(['dummy'], 'selfie.jpg', { type: 'image/jpeg' })] } });

    // Hata mesajı BELİRMELİ
    await waitFor(() => {
      expect(screen.getByText(/Maalesef albümde size ait bir kare bulunamadı/i)).toBeInTheDocument();
    });

    // Butonun kilidi açılmış olmalı
    const uploadBtn = screen.getByRole('button', { name: /Aramak İçin Selfie Çek/i });
    expect(uploadBtn).not.toBeDisabled();
  });

  it('Yüz eşleştirme başarılı olduğunda hata mesajı kaybolmalı ve fotoğraflar ekranda gösterilmeli', async () => {
    // 1. Bu test için API'lerin DÜRÜSTÇE BAŞARILI dönmesini sağlıyoruz.
    vi.mocked(dbServices.uploadMediaFile).mockResolvedValue('https://mock-storage.com/test.jpg');
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { success: true, matches: ['match1.jpg', 'match2.jpg'] }, // BAŞARI DURUMU
      error: null
    });

    const { container } = render(<SmartAlbumSection />);
    
    // Dosya Yükle
    const fileInput = container.querySelector('input[type="file"]');
    fireEvent.change(fileInput, { target: { files: [new File(['dummy'], 'selfie.jpg', { type: 'image/jpeg' })] } });

    // Hata mesajı OLMAMALI
    await waitFor(() => {
      expect(screen.queryByText(/Maalesef albümde size ait bir kare bulunamadı/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Eşleşen fotoğraflar img etiketi olarak yerini almalı
    await waitFor(() => {
      const imgs = container.querySelectorAll('img');
      const hasMatch = Array.from(imgs).some(img => img.src.includes('match1.jpg'));
      expect(hasMatch).toBe(true);
    });
  });
});