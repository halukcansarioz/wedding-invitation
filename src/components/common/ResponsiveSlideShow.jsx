import React, { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';

export function ResponsiveSlideShow({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  // Ekran genişliğini dinleyerek Mobil/Web ayrımını yapıyoruz
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile(); // İlk açılışta kontrol et
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Yalnızca mobilde scroll kilitleme (Web tarafı etkilenmez)
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, [isMobile]);

  // Görünür olan bölümleri listeye alıyoruz
  const sections = React.Children.toArray(children).filter(child => child);

  const goNext = () => {
    if (isAnimating || currentIndex === sections.length - 1) return;
    setIsAnimating(true);
    setCurrentIndex(prev => prev + 1);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const goPrev = () => {
    if (isAnimating || currentIndex === 0) return;
    setIsAnimating(true);
    setCurrentIndex(prev => prev - 1);
    setTimeout(() => setIsAnimating(false), 800);
  };

  // Dokunmatik ekranda parmak kaydırma (Swipe) algılama
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    touchEndY.current = e.changedTouches[0].clientY;
    const swipeDistance = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 50;

    if (swipeDistance > minSwipeDistance) goNext(); 
    else if (swipeDistance < -minSwipeDistance) goPrev(); 
  };

  // WEB (Masaüstü) Görünümü: Klasik alt alta kaydırmalı tasarım
  if (!isMobile) {
    return <div className="invitation-page">{children}</div>;
  }

  // MOBİL Görünüm: Slayt yapısı ve animasyonlu geçiş
  return (
    <div 
      className="slideshow-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        <m.div
          key={currentIndex}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="slide-wrapper"
        >
          {sections[currentIndex]}
        </m.div>
      </AnimatePresence>

      {/* Üst İlerleme Çubuğu */}
      <div className="slide-progress-bar">
        <div 
          className="slide-progress-fill" 
          style={{ width: `${((currentIndex + 1) / sections.length) * 100}%` }} 
        />
      </div>

      {/* Kontrol Butonları */}
      <div className="slide-controls">
        <button 
          type="button" 
          className="secondary-button slide-btn" 
          onClick={goPrev} 
          disabled={currentIndex === 0 || isAnimating}
          style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
        </button>
        <button 
          type="button" 
          className="main-button slide-btn" 
          onClick={goNext} 
          disabled={currentIndex === sections.length - 1 || isAnimating}
          style={{ opacity: currentIndex === sections.length - 1 ? 0.3 : 1 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
      </div>
    </div>
  );
}