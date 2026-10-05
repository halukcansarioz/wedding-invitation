import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SmartAlbumSection } from './SmartAlbumSection';

vi.mock('../../../supabaseClient', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'temp.jpg' } }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/temp.jpg' } }),
        remove: vi.fn().mockResolvedValue({ data: {}, error: null }) // Eksik olan remove eklendi
      })
    },
    functions: {
      invoke: vi.fn().mockRejectedValue(new Error('Yüz tespit edilemedi.'))
    }
  }
}));

vi.mock('framer-motion', () => ({
  m: { section: ({ children }) => <section>{children}</section>, div: ({ children }) => <div>{children}</div> }
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ i18n: { language: 'tr' } }) }));

describe('SmartAlbumSection Hata (Error) Durumu Testleri', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  it('Yapay zeka (face-match) API hata verdiğinde alert göstermeli ve butonu sıfırlamalı', async () => {
    render(<SmartAlbumSection />);
    
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['dummy'], 'selfie.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Fotoğraflar taranamadı'));
    });
  });
});