import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LazyImage } from './LazyImage';

describe('LazyImage Bileşeni', () => {
  it('görsel yüklenmeden önce skeleton göstermeli, yüklenince skeleton kaybolmalı', () => {
    const { container } = render(<LazyImage src="test.jpg" alt="Test Görseli" />);
    
    // Yüklenmeden önce skeleton class'ına sahip element DOM'da olmalı
    const skeleton = container.querySelector('.image-skeleton');
    expect(skeleton).toBeInTheDocument();

    const img = screen.getByAltText('Test Görseli');
    expect(img).toHaveStyle('opacity: 0'); // Başlangıçta görünmez

    // load eventini manuel tetikle
    fireEvent.load(img);

    // Yüklendikten sonra skeleton DOM'dan kaldırılmalı
    expect(container.querySelector('.image-skeleton')).not.toBeInTheDocument();
    
    // Resim görünür hale gelmeli
    expect(img).toHaveStyle('opacity: 1');
  });
});