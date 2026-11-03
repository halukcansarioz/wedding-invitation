import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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

  it('özel class, aspect ratio ve click callbackini aktarmalı', () => {
    const onClick = vi.fn();
    const { container } = render(
      <LazyImage
        src="test.jpg"
        alt="Test Görseli"
        className="custom-image"
        aspectRatio="16 / 9"
        onClick={onClick}
      />,
    );

    const wrapper = container.querySelector(".lazy-image-wrapper");
    expect(wrapper).toHaveClass("custom-image");
    expect(wrapper).toHaveStyle("aspect-ratio: 16 / 9");

    fireEvent.click(wrapper);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('görsel kaynağını ve alt metnini image elementine aktarmalı', () => {
    render(<LazyImage src="/images/photo.webp" alt="Düğün fotoğrafı" />);

    expect(screen.getByRole("img", { name: "Düğün fotoğrafı" })).toHaveAttribute(
      "src",
      "/images/photo.webp",
    );
  });
});
