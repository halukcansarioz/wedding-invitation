import { useState, useRef, useCallback, useEffect } from "react";

export function useScrollNavigation(isAdminPage, opened) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);

  // Cihazın mobil olup olmadığını kontrol et (768px sınırı)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Masaüstü için hangi bölümde olduğumuzu hesaplayan yardımcı fonksiyon
  const getActiveDesktopIndex = (sections) => {
    let activeIdx = 0;
    sections.forEach((sec, idx) => {
      const rect = sec.getBoundingClientRect();
      // Eğer bölüm ekranın ortasından daha yukarıdaysa, okuduğumuz/odaklandığımız bölüm odur
      if (rect.top < window.innerHeight * 0.55) {
        activeIdx = idx;
      }
    });
    return activeIdx;
  };

  const scrollToNext = useCallback(() => {
    const sections = Array.from(document.querySelectorAll('.slide-wrapper'));
    if (sections.length === 0) return;

    if (isMobile) {
      // Mobilde Slayt Geçişi
      setCurrentSlideIndex(prev => {
        const next = prev + 1;
        return next < sections.length ? next : prev;
      });
    } else {
      // Masaüstü için Endeks (Index) Tabanlı Hedefleme
      const activeIdx = getActiveDesktopIndex(sections);
      const nextIdx = activeIdx + 1;
      
      if (nextIdx < sections.length) {
        const nextSection = sections[nextIdx];
        const rect = nextSection.getBoundingClientRect();
        const absoluteTop = window.scrollY + rect.top;

        if (rect.height <= window.innerHeight) {
          // Kart ekrana sığıyorsa kusursuz ortala
          window.scrollTo({ 
            top: absoluteTop - (window.innerHeight - rect.height) / 2, 
            behavior: 'smooth' 
          });
        } else {
          // Kart çok uzunsa en tepesinden başlat (okumak için 40px boşluk)
          window.scrollTo({ 
            top: absoluteTop - 40, 
            behavior: 'smooth' 
          });
        }
      } else {
        // En sondayken hala buton görünüyorsa manuel kaydır
        window.scrollBy({ top: window.innerHeight * 0.6, behavior: 'smooth' });
      }
    }
  }, [isMobile]);

  const scrollToPrev = useCallback(() => {
    const sections = Array.from(document.querySelectorAll('.slide-wrapper'));
    if (sections.length === 0) return;

    if (isMobile) {
      setCurrentSlideIndex(prev => prev > 0 ? prev - 1 : 0);
    } else {
      const activeIdx = getActiveDesktopIndex(sections);
      const prevIdx = activeIdx - 1;
      
      if (prevIdx >= 0) {
        const prevSection = sections[prevIdx];
        const rect = prevSection.getBoundingClientRect();
        const absoluteTop = window.scrollY + rect.top;

        if (rect.height <= window.innerHeight) {
          window.scrollTo({ 
            top: absoluteTop - (window.innerHeight - rect.height) / 2, 
            behavior: 'smooth' 
          });
        } else {
          window.scrollTo({ 
            top: absoluteTop - 40, 
            behavior: 'smooth' 
          });
        }
      } else {
        // Zaten 1. karttaysak en tepeye dön
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [isMobile]);

  const handleWheel = useCallback((e) => {
    // Masaüstünde tekerlekle kaydırmaya müdahale etmiyoruz
    if (isAdminPage || !opened || isScrollingRef.current || !isMobile) return;
    
    const slideWrapper = e.target.closest('.slide-wrapper');
    if (slideWrapper) {
      const isScrollable = slideWrapper.scrollHeight > slideWrapper.clientHeight;
      if (isScrollable) {
        const atTop = slideWrapper.scrollTop <= 0;
        const atBottom = Math.ceil(slideWrapper.scrollTop + slideWrapper.clientHeight) >= slideWrapper.scrollHeight - 2;

        if (e.deltaY > 0 && !atBottom) return; 
        if (e.deltaY < 0 && !atTop) return;    
      }
    }

    if (e.deltaY > 0) scrollToNext();
    else scrollToPrev();

    isScrollingRef.current = true;
    setTimeout(() => { isScrollingRef.current = false; }, 600);
  }, [isAdminPage, opened, scrollToNext, scrollToPrev, isMobile]);

  const handleTouchStart = useCallback((e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartYRef.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (isAdminPage || !opened || isScrollingRef.current || !e.changedTouches || e.changedTouches.length === 0 || !isMobile) return;

    const target = e.target instanceof Element ? e.target : e.target.parentElement;
    if (!target) return;

    if (target.closest('input, textarea, select, .gallery-lightbox-overlay, .admin-custom-select-menu')) {
      return; 
    }

    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartYRef.current - touchEndY;

    const slideWrapper = target.closest('.slide-wrapper');
    if (slideWrapper) {
       const isScrollable = slideWrapper.scrollHeight > slideWrapper.clientHeight;
       if (isScrollable) {
           const atTop = slideWrapper.scrollTop <= 0;
           const atBottom = Math.ceil(slideWrapper.scrollTop + slideWrapper.clientHeight) >= slideWrapper.scrollHeight - 2;
           if (diff > 0 && !atBottom) return;
           if (diff < 0 && !atTop) return;
       }
    }

    if (Math.abs(diff) > 40) { 
      if (diff > 0) scrollToNext(); 
      else scrollToPrev(); 

      isScrollingRef.current = true;
      setTimeout(() => { isScrollingRef.current = false; }, 500); 
    }
  }, [isAdminPage, opened, scrollToNext, scrollToPrev, isMobile]);

  useEffect(() => {
    if (isAdminPage || !opened) return;

    const handleScroll = () => {
      if (isMobile) {
         setShowScrollTop(currentSlideIndex > 0);
         const sectionsCount = document.querySelectorAll('.slide-wrapper').length;
         setShowScrollDown(currentSlideIndex < sectionsCount - 1);
      } else {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        setShowScrollTop(scrollTop > 100);
        
        const isAtBottom = Math.ceil(window.innerHeight + scrollTop) >= document.documentElement.scrollHeight - 100;
        setShowScrollDown(!isAtBottom);
      }
    };

    let resizeObserver;
    if (!isMobile) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      resizeObserver = new ResizeObserver(() => handleScroll());
      resizeObserver.observe(document.body);
    }
    
    const revealTimer = window.setTimeout(handleScroll, 100);
    handleScroll();
    
    return () => {
      if (!isMobile) {
        window.removeEventListener('scroll', handleScroll);
        if (resizeObserver) resizeObserver.disconnect();
      }
      window.clearTimeout(revealTimer);
    };
  }, [isAdminPage, opened, isMobile, currentSlideIndex]);

  return { currentSlideIndex, showScrollTop, showScrollDown, scrollToNext, scrollToPrev, handleWheel, handleTouchStart, handleTouchEnd };
}