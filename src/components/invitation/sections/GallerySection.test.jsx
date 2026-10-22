import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { GallerySection } from './GallerySection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('GallerySection Bileşen Testleri', () => {
  const mockInvitation = { gallery: ['img1.jpg', 'img2.jpg'] };

  afterEach(() => {
    cleanup();
  });

  it('Galeri görselleri render edilmeli', () => {
    render(<GallerySection invitation={mockInvitation} />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(2);
  });

  it('Görsele tıklandığında Lightbox modali açılmalı', () => {
    const { container } = render(<GallerySection invitation={mockInvitation} />);
    const firstImageWrapper = container.querySelectorAll('.lazy-image-wrapper')[0];
    
    fireEvent.click(firstImageWrapper);
    
    expect(document.querySelector('.gallery-lightbox-overlay')).toBeInTheDocument();
  });
});