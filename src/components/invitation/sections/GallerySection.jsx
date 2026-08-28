import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { LazyImage } from "../../common/LazyImage";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

function LightboxModal({ gallery, lightboxIndex, closeLightbox, prevImage, nextImage, isEn }) {
  const { t } = useTranslation();
  if (lightboxIndex === null || typeof document === "undefined") return null;

  return createPortal(
    <div onClick={closeLightbox} className="gallery-lightbox-overlay">
      <button type="button" onClick={closeLightbox} className="lightbox-control-btn lightbox-close" title={t('ui.closeEsc')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      {gallery.length > 1 && (
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

      {gallery.length > 1 && (
        <button type="button" onClick={nextImage} className="lightbox-control-btn lightbox-next" title={t('ui.next')}>
          &#10095;
        </button>
      )}
    </div>,
    document.body
  );
}

export function GallerySection({ copy, invitation }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const gallery = Array.isArray(invitation?.gallery) ? invitation.gallery : [];
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  
  const prevImage = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  }, [gallery.length]);
  
  const nextImage = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setLightboxIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  }, [gallery.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, closeLightbox, prevImage, nextImage]);

  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card">
      <p className="section-label">{isEn ? t('invitation.galleryLabel') : copy?.galleryLabel}</p>
      <h2>{isEn ? t('invitation.galleryTitle') : copy?.galleryTitle}</h2>
      <div className="gallery-grid">
        {gallery.map((image, index) => (
          <LazyImage 
            key={`gallery-img-${index}`} 
            src={image} 
            alt={`Galeri ${index + 1}`} 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openLightbox(index);
            }}
            className="gallery-image"
            style={{ cursor: "zoom-in" }}
          />
        ))}
      </div>
      <LightboxModal gallery={gallery} lightboxIndex={lightboxIndex} closeLightbox={closeLightbox} prevImage={prevImage} nextImage={nextImage} isEn={isEn} />
    </motion.section>
  );
}