import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LazyImage } from './LazyImage';

describe('LazyImage Bileşeni', () => {
  it('görsel yüklenmeden önce skeleton göstermeli, yüklenince skeleton kaybolmalı', async () => {
    const { container } = render(<LazyImage src="test.jpg" alt="Test Görseli" />);
    
    const skeleton = container.querySelector('.image-skeleton');
    expect(skeleton).toBeInTheDocument();

    const img = screen.getByAltText('Test Görseli');
    expect(img).toHaveStyle('opacity: 0'); 

    fireEvent.load(img);

    await waitFor(() => {
      expect(container.querySelector('.image-skeleton')).not.toBeInTheDocument();
      expect(img).toHaveStyle('opacity: 1');
    });
  });
});