import React, { useEffect, MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import FocusTrap from "focus-trap-react";
import { LazyImage } from "./LazyImage";

export interface LightboxModalProps {
  gallery: string[];
  lightboxIndex: number | null;
  closeLightbox: () => void;
  prevImage?: (e?: MouseEvent<HTMLButtonElement>) => void;
  nextImage?: (e?: MouseEvent<HTMLButtonElement>) => void;
}

export function LightboxModal({ gallery, lightboxIndex, closeLightbox, prevImage, nextImage }: LightboxModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft" && prevImage) prevImage();
      if (e.key === "ArrowRight" && nextImage) nextImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, closeLightbox, prevImage, nextImage]);

  if (lightboxIndex === null || typeof document === "undefined") return null;

  return createPortal(
    <FocusTrap focusTrapOptions={{ initialFocus: false, clickOutsideDeactivates: true }}>
      <div onClick={closeLightbox} className="gallery-lightbox-overlay" role="dialog" aria-modal="true" aria-label="Fotoğraf Galerisi">
        <button type="button" onClick={closeLightbox} className="lightbox-control-btn lightbox-close" title={t('ui.closeEsc')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {gallery.length > 1 && prevImage && (
          <button type="button" onClick={prevImage} className="lightbox-control-btn lightbox-prev" title={t('ui.prev')}>
            &#10094;
          </button>
        )}

        <div onClick={(e) => e.stopPropagation()} className="gallery-lightbox-content">
          <LazyImage src={gallery[lightboxIndex]} alt="Büyütülmüş Fotoğraf" className="gallery-lightbox-image" />
          <span className="gallery-lightbox-caption">
            {lightboxIndex + 1} / {gallery.length}
          </span>
        </div>

        {gallery.length > 1 && nextImage && (
          <button type="button" onClick={nextImage} className="lightbox-control-btn lightbox-next" title={t('ui.next')}>
            &#10095;
          </button>
        )}
      </div>
    </FocusTrap>,
    document.body
  );
}