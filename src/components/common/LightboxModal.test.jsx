import React from 'react';
import { render, screen, fireEvent, cleanup } from "../../../tests/test-utils";
import { describe, it, expect, vi, afterEach } from 'vitest';
import { LightboxModal } from './LightboxModal';

vi.mock('focus-trap-react', () => ({
  default: ({ children }) => <div>{children}</div>
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key })
}));

describe('LightboxModal Bileşen Testleri', () => {
  const mockGallery = ['resim1.jpg', 'resim2.jpg', 'resim3.jpg'];

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('lightboxIndex null ise hiçbir şey render etmemeli', () => {
    const { container } = render(
      <LightboxModal gallery={mockGallery} lightboxIndex={null} />
    );
    expect(container.querySelector('.gallery-lightbox-overlay')).not.toBeInTheDocument();
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

    expect(screen.queryByTitle('ui.next')).not.toBeInTheDocument();
    expect(screen.queryByTitle('ui.prev')).not.toBeInTheDocument();
  });

  it('navigasyon butonları erişilebilir etiketlere sahip olmalı', () => {
    render(
      <LightboxModal
        gallery={mockGallery}
        lightboxIndex={0}
        closeLightbox={vi.fn()}
        prevImage={vi.fn()}
        nextImage={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'ui.prev' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ui.next' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ui.closeEsc' })).toBeInTheDocument();
  });

  it('kapatma butonuna ve overlay alanına tıklanınca kapanmalı', () => {
    const closeLightbox = vi.fn();
    render(
      <LightboxModal
        gallery={mockGallery}
        lightboxIndex={0}
        closeLightbox={closeLightbox}
        prevImage={vi.fn()}
        nextImage={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTitle('ui.closeEsc'));
    fireEvent.click(screen.getByRole('dialog'));

    expect(closeLightbox).toHaveBeenCalledTimes(2);
  });

  it('fotoğraf alanına tıklanınca overlay kapanmamalı', () => {
    const closeLightbox = vi.fn();
    render(
      <LightboxModal
        gallery={mockGallery}
        lightboxIndex={1}
        closeLightbox={closeLightbox}
        prevImage={vi.fn()}
        nextImage={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByAltText('Büyütülmüş Fotoğraf'));

    expect(closeLightbox).not.toHaveBeenCalled();
  });

  it('navigasyon callbackleri yoksa klavye olaylarında hata vermemeli', () => {
    const closeLightbox = vi.fn();
    render(
      <LightboxModal gallery={mockGallery} lightboxIndex={0} closeLightbox={closeLightbox} />,
    );

    expect(() => {
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      fireEvent.keyDown(window, { key: 'ArrowRight' });
    }).not.toThrow();
    expect(closeLightbox).not.toHaveBeenCalled();
  });

  it('sabit navigasyon butonlarına tıklanınca doğru callback çalışmalı', () => {
    const prevImage = vi.fn();
    const nextImage = vi.fn();
    const closeLightbox = vi.fn();
    render(
      <LightboxModal
        gallery={mockGallery}
        lightboxIndex={1}
        closeLightbox={closeLightbox}
        prevImage={prevImage}
        nextImage={nextImage}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'ui.prev' }));
    fireEvent.click(screen.getByRole('button', { name: 'ui.next' }));

    expect(prevImage).toHaveBeenCalledTimes(1);
    expect(nextImage).toHaveBeenCalledTimes(1);
    expect(closeLightbox).not.toHaveBeenCalled();
  });

  it('lightbox kapandığında klavye listenerını temizlemeli', () => {
    const closeLightbox = vi.fn();
    const { rerender } = render(
      <LightboxModal
        gallery={mockGallery}
        lightboxIndex={0}
        closeLightbox={closeLightbox}
        prevImage={vi.fn()}
        nextImage={vi.fn()}
      />
    );

    rerender(
      <LightboxModal
        gallery={mockGallery}
        lightboxIndex={null}
        closeLightbox={closeLightbox}
        prevImage={vi.fn()}
        nextImage={vi.fn()}
      />
    );
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(closeLightbox).not.toHaveBeenCalled();
  });
});
