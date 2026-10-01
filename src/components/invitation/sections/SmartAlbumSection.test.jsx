import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { render, screen, fireEvent, waitFor } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SmartAlbumSection } from './SmartAlbumSection';

// Supabase Mock
vi.mock('../../../supabaseClient', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'temp.jpg' } }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/temp.jpg' } }),
        remove: vi.fn().mockResolvedValue({})
      })
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { matches: ['match1.jpg', 'match2.jpg'] } })
    }
  }
}));

// Framer Motion & i18n Mock
vi.mock('framer-motion', () => ({
  m: { section: ({ children }) => <section>{children}</section>, div: ({ children }) => <div>{children}</div> }
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'tr' } })
}));

describe('SmartAlbumSection Bileşen Testleri', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // JS alert fonksiyonunu mockluyoruz
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('Selfie yüklendiğinde AI araması başlatmalı ve eşleşen fotoğrafları göstermeli', async () => {
    render(<SmartAlbumSection />);
    
    // Yükleme butonunu tetiklemek için gizli file input'u bul
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['dummy content'], 'selfie.jpg', { type: 'image/jpeg' });
    
    // Dosyayı yükle
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Yükleniyor durumuna geçtiğini kontrol et
    expect(screen.getByRole('button')).toHaveTextContent(/Albüm Taranıyor/i);

    const { supabase } = await import('../../../supabaseClient');

    // Supabase işlemlerinin bitmesini ve sonucun ekrana yansımasını bekle
    await waitFor(() => {
      // API doğru çağrıldı mı?
      expect(supabase.functions.invoke).toHaveBeenCalledWith('face-match', expect.objectContaining({
        body: { sourceImageUrl: 'https://test.com/temp.jpg' }
      }));
      // Ekranda sonuç gösteriliyor mu?
      expect(screen.getByText('2 Fotoğraf Bulundu!')).toBeInTheDocument();
    });
  });
});