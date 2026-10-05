import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { GallerySection } from './GallerySection';

vi.mock('framer-motion', () => ({
  m: { section: ({ children }) => <section>{children}</section> }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('GallerySection Bileşen Testleri', () => {
  const mockInvitation = {
    gallery: ['img1.jpg', 'img2.jpg', 'img3.jpg']
  };

  // GÜNCELLENDİ: Testler arası DOM temizliği eklenerek hayalet görsellerin kalması engellendi
  afterEach(() => {
    cleanup();
  });

  it('Galerideki fotoğrafları render etmeli ve tıklanınca Lightbox açılmalı', () => {
    render(<GallerySection invitation={mockInvitation} copy={{ galleryTitle: "Galerimiz" }} />);
    
    // Resimlerin DOM'a işlendiğini doğrula
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);

    // İlk resme tıkla
    fireEvent.click(images[0]);

    // Global querySelector yerine dialog rolünü kullanarak temiz arama yapıyoruz
    const lightboxModal = screen.getByRole('dialog', { hidden: true });
    expect(lightboxModal).toBeInTheDocument();

    // 1 / 3 fotoğraf textinin yazdığını doğrula
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('Galeri boş ise hatasız şekilde boş bölüm render etmeli', () => {
    render(<GallerySection invitation={{ gallery: [] }} />);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });
});