import { useState, useRef, useCallback, useEffect } from "react";

export function useScrollNavigation(isAdminPage, opened) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);

  // Ekran boyutunu takip et
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 650);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToNext = useCallback(() => {
    if (isMobile) {
      // Mobilde: Slayt İndeksini artır (Animasyonlu Geçiş)
      const sectionsCount = document.querySelectorAll('.slide-wrapper').length;
      setCurrentSlideIndex(prev => {
        const next = prev + 1;
        return next < sectionsCount ? next : prev;
      });
    } else {
      // Masaüstünde: Eski usül aşağı kaydırma
      const sections = Array.from(document.querySelectorAll('.slide-wrapper'));
      const nextSection = sections.find(sec => sec.getBoundingClientRect().top > 50);
      if (nextSection) {
        const topPosition = nextSection.getBoundingClientRect().top + window.scrollY - 12;
        if (!isNaN(topPosition)) window.scrollTo({ top: topPosition, behavior: 'smooth' });
      } else if (sections.length > 0) {
        const topPosition = sections[sections.length - 1].getBoundingClientRect().top + window.scrollY - 12;
        if (!isNaN(topPosition)) window.scrollTo({ top: topPosition, behavior: 'smooth' });
      }
    }
  }, [isMobile]);

  const scrollToPrev = useCallback(() => {
    if (isMobile) {
      // Mobilde: Slayt İndeksini azalt (Animasyonlu Geçiş)
      setCurrentSlideIndex(prev => prev > 0 ? prev - 1 : 0);
    } else {
      // Masaüstünde: Eski usül yukarı kaydırma
      const sections = Array.from(document.querySelectorAll('.slide-wrapper'));
      const prevSection = [...sections].reverse().find(sec => sec.getBoundingClientRect().top < -50);
      if (prevSection) {
        const topPosition = prevSection.getBoundingClientRect().top + window.scrollY - 12;
        if (!isNaN(topPosition)) window.scrollTo({ top: Math.max(0, topPosition), behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [isMobile]);

  const handleWheel = useCallback((e) => {
    if (isAdminPage || !opened || isScrollingRef.current) return;
    
    if (isMobile) {
      if (e.deltaY > 0) scrollToNext();
      else scrollToPrev();

      isScrollingRef.current = true;
      setTimeout(() => { isScrollingRef.current = false; }, 600);
    }
  }, [isAdminPage, opened, scrollToNext, scrollToPrev, isMobile]);

  const handleTouchStart = useCallback((e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartYRef.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (isAdminPage || !opened || isScrollingRef.current || !e.changedTouches || e.changedTouches.length === 0) return;

    if (isMobile) {
      const target = e.target instanceof Element ? e.target : e.target.parentElement;
      if (!target) return;
      
      // İnteraktif elementlerde kaydırmayı engelle
      if (target.closest('input, textarea, select, .gallery-lightbox-overlay, .admin-custom-select-menu')) {
        return; 
      }

      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartYRef.current - touchEndY;

      // EĞER KART İÇERİĞİ UZUNSA VE KAYDIRILABİLİYORSA, KARTIN İÇİNDE KAYDIRMAYA İZİN VER
      const slideWrapper = target.closest('.slide-wrapper');
      if (slideWrapper) {
         const isScrollable = slideWrapper.scrollHeight > slideWrapper.clientHeight;
         if (isScrollable) {
             const atTop = slideWrapper.scrollTop <= 0;
             const atBottom = slideWrapper.scrollHeight - slideWrapper.scrollTop <= slideWrapper.clientHeight + 2;
             
             if (diff > 0 && !atBottom) return; // Aşağı iniyorsa ve kartın dibinde değilse slaytı geçme
             if (diff < 0 && !atTop) return;    // Yukarı çıkıyorsa ve kartın tepesinde değilse slaytı geçme
         }
      }

      if (Math.abs(diff) > 40) { 
        if (diff > 0) scrollToNext(); 
        else scrollToPrev(); 

        isScrollingRef.current = true;
        setTimeout(() => { isScrollingRef.current = false; }, 500); 
      }
    }
  }, [isAdminPage, opened, scrollToNext, scrollToPrev, isMobile]);

  // Buton durumlarını ve sayfa oklarını güncelle
  useEffect(() => {
    if (isAdminPage || !opened) return;

    const handleScroll = () => {
      if (isMobile) {
         setShowScrollTop(currentSlideIndex > 0);
         const sectionsCount = document.querySelectorAll('.slide-wrapper').length;
         setShowScrollDown(currentSlideIndex < sectionsCount - 1);
      } else {
        const scrollTop = (document.scrollingElement || document.documentElement).scrollTop;
        setShowScrollTop(scrollTop > 100);
        const isAtBottom = Math.ceil(window.innerHeight + scrollTop) >= document.documentElement.scrollHeight - 100;
        setShowScrollDown(!isAtBottom);
      }
    };

    if (!isMobile) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    const revealTimer = window.setTimeout(handleScroll, 100);
    handleScroll();
    
    return () => {
      if (!isMobile) window.removeEventListener('scroll', handleScroll);
      window.clearTimeout(revealTimer);
    };
  }, [isAdminPage, opened, isMobile, currentSlideIndex]);

  return {
    currentSlideIndex,  
    showScrollTop,
    showScrollDown,
    scrollToNext,
    scrollToPrev,
    handleWheel,
    handleTouchStart,
    handleTouchEnd
  };
}