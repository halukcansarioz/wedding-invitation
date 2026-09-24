import React, { useState, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { LazyImage } from "../../common/LazyImage";
// Yeni ortak bileşeni import ediyoruz
import { LightboxModal } from "../../common/LightboxModal"; 

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

export const GallerySection = memo(function GallerySection({ copy, invitation }) {
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

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card">
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

      {/* Tekrar eden uzun portal kodu yerine sadece bu satır */}
      <LightboxModal 
        gallery={gallery} 
        lightboxIndex={lightboxIndex} 
        closeLightbox={closeLightbox} 
        prevImage={prevImage} 
        nextImage={nextImage} 
      />
    </m.section>
  );
});