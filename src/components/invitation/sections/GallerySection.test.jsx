import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { GallerySection } from './GallerySection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('GallerySection Bileşen Testleri', () => {
  afterEach(() => {
    cleanup();
  });

  it('Galerideki fotoğrafları render etmeli ve tıklanınca Lightbox açılmalı', () => {
    const mockInvitation = { gallery: ['img1.jpg', 'img2.jpg', 'img3.jpg'] };
    const { container } = render(<GallerySection invitation={mockInvitation} />);
    
    // ÇÖZÜM: Lightbox açıldığında DOM'a 4. bir kopya resim eklenir. 
    // Çakışmayı önlemek için sadece grid içindeki resimleri sayıyoruz.
    const gridImages = container.querySelectorAll('.gallery-grid img');
    expect(gridImages.length).toBe(3);

    // İlk fotoğrafa tıklayarak Lightbox'ı aç
    fireEvent.click(gridImages[0]);

    // Lightbox'ın açıldığını "Büyütülmüş Fotoğraf" alt metninden doğrula
    expect(screen.getByAltText('Büyütülmüş Fotoğraf')).toBeDefined();
  });
});