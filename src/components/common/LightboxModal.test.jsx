import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { LightboxModal } from './LightboxModal';

// FocusTrap kütüphanesi JSDOM (test ortamı) ile bazen çakışabilir, bu yüzden mockluyoruz
vi.mock('focus-trap-react', () => ({
  default: ({ children }) => <div>{children}</div>
}));

// i18next Mock
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key })
}));

describe('LightboxModal Bileşen Testleri', () => {
  const mockGallery = ['resim1.jpg', 'resim2.jpg', 'resim3.jpg'];

  // ÇÖZÜM: Her testten sonra DOM'u ve body portalını temizle
  afterEach(() => {
    cleanup();
    document.body.innerHTML = ''; 
    vi.clearAllMocks();
  });

  it('lightboxIndex null ise hiçbir şey render etmemeli', () => {
    const { container } = render(
      <LightboxModal gallery={mockGallery} lightboxIndex={null} />
    );
    // Modal kapalıyken DOM'a hiçbir şey eklenmemeli
    expect(container.firstChild).toBeNull();
  });

  it('Sağ ve Sol yön tuşlarına basıldığında ilgili fonksiyonları tetiklemeli', () => {
    const mockNextImage = vi.fn();
    const mockPrevImage = vi.fn();
    const mockCloseLightbox = vi.fn();

    render(
      <LightboxModal 
        gallery={mockGallery} 
        lightboxIndex={1} 
        closeLightbox={mockCloseLightbox} 
        prevImage={mockPrevImage} 
        nextImage={mockNextImage} 
      />
    );

    // Klavye olaylarını simüle et
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(mockNextImage).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(mockPrevImage).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockCloseLightbox).toHaveBeenCalledTimes(1);
  });

  it('Galeride sadece 1 fotoğraf varsa İleri/Geri butonlarını GİZLEMELİ', () => {
    const singleImageGallery = ['tek-resim.jpg'];
    render(
      <LightboxModal 
        gallery={singleImageGallery} 
        lightboxIndex={0} 
        closeLightbox={vi.fn()} 
      />
    );

    // İleri (&#10095;) ve Geri (&#10094;) butonları DOM'da olmamalı
    expect(screen.queryByTitle('ui.next')).not.toBeInTheDocument();
    expect(screen.queryByTitle('ui.prev')).not.toBeInTheDocument();
  });
});