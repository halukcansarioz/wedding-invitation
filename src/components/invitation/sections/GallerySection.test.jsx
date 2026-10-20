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
    
    const gridImages = container.querySelectorAll('.gallery-grid img');
    expect(gridImages.length).toBe(3);

    fireEvent.click(gridImages[0]);

    expect(screen.getByAltText('Büyütülmüş Fotoğraf')).toBeDefined();
  });
});