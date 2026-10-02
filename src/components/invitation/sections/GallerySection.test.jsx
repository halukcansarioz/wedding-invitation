import React from 'react';
import { render, screen, fireEvent } from '../../../../tests/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { GallerySection } from './GallerySection';

// Framer-motion ve intersection observer bağımlılıklarını çözer
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

  it('Galerideki fotoğrafları render etmeli ve tıklanınca Lightbox açılmalı', () => {
    render(<GallerySection invitation={mockInvitation} copy={{ galleryTitle: "Galerimiz" }} />);
    
    // Resimlerin DOM'a işlendiğini doğrula
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);

    // İlk resme tıkla
    fireEvent.click(images[0]);

    // Lightbox modalının DOM'a eklendiğini doğrula
    const lightboxModal = document.querySelector('.gallery-lightbox-overlay');
    expect(lightboxModal).toBeInTheDocument();

    // 1 / 3 fotoğraf textinin yazdığını doğrula
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('Galeri boş ise hatasız şekilde boş bölüm render etmeli', () => {
    render(<GallerySection invitation={{ gallery: [] }} />);
    // Çökmüyorsa başarılıdır. Resim arandığında 0 dönmelidir.
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });
});