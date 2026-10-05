import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LazyImage } from './LazyImage';

describe('LazyImage Bileşeni', () => {
  it('görsel yüklenmeden önce skeleton göstermeli, yüklenince skeleton kaybolmalı', async () => {
    const { container } = render(<LazyImage src="test.jpg" alt="Test Görseli" />);
    
    // Yüklenmeden önce skeleton class'ına sahip element DOM'da olmalı
    const skeleton = container.querySelector('.image-skeleton');
    expect(skeleton).toBeInTheDocument();

    const img = screen.getByAltText('Test Görseli');
    expect(img).toHaveStyle('opacity: 0'); // Başlangıçta görünmez

    // load eventini manuel tetikle
    fireEvent.load(img);

    // Yüklendikten sonra skeleton DOM'dan kaldırılmalı (asenkron durum için waitFor kullanıldı)
    await waitFor(() => {
      expect(container.querySelector('.image-skeleton')).not.toBeInTheDocument();
      expect(img).toHaveStyle('opacity: 1');
    });
  });
});