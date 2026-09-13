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

  const scrollToNext = useCallback(() => {
    if (isMobile) {
      // Mobilde Slayt Geçişi
      const sectionsCount = document.querySelectorAll('.slide-wrapper').length;
      setCurrentSlideIndex(prev => {
        const next = prev + 1;
        return next < sectionsCount ? next : prev;
      });
    } else {
      // Masaüstünde Akıllı Ortalama ve Aşağı Kaydırma
      const sections = Array.from(document.querySelectorAll('.slide-wrapper'));
      
      // Ekranın orta noktasından daha aşağıda olan ilk bölümü bul
      const nextSection = sections.find(sec => sec.getBoundingClientRect().top > window.innerHeight * 0.45);
      
      if (nextSection) {
        const rect = nextSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        let topPosition;
        
        if (rect.height <= windowHeight) {
          // Bölüm ekrana sığıyorsa -> Tam ortaya hizala (Üst ve alt boşluklar eşitlenir)
          topPosition = window.scrollY + rect.top - (windowHeight - rect.height) / 2;
        } else {
          // Bölüm ekrandan büyükse -> Okunabilirlik için üstten 24px boşluk bırakarak hizala
          topPosition = window.scrollY + rect.top - 24;
        }
        
        window.scrollTo({ top: topPosition, behavior: 'smooth' });
      }
    }
  }, [isMobile]);

  const scrollToPrev = useCallback(() => {
    if (isMobile) {
      // Mobilde Slayt Geçişi
      setCurrentSlideIndex(prev => prev > 0 ? prev - 1 : 0);
    } else {
      // Masaüstünde Akıllı Ortalama ve Yukarı Kaydırma
      const sections = Array.from(document.querySelectorAll('.slide-wrapper'));
      
      // Ekranın orta noktasından daha yukarıda biten ilk bölümü bul (sondan başa arayarak)
      const prevSection = [...sections].reverse().find(sec => sec.getBoundingClientRect().bottom < window.innerHeight * 0.55);
      
      if (prevSection) {
        const rect = prevSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        let topPosition;
        
        if (rect.height <= windowHeight) {
          // Bölüm ekrana sığıyorsa -> Tam ortaya hizala
          topPosition = window.scrollY + rect.top - (windowHeight - rect.height) / 2;
        } else {
          // Bölüm ekrandan büyükse -> Üstten hizala
          topPosition = window.scrollY + rect.top - 24;
        }
        
        window.scrollTo({ top: Math.max(0, topPosition), behavior: 'smooth' });
      } else {
        // En yukarıdaysa direkt tepeye sıfırla
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [isMobile]);

  const handleWheel = useCallback((e) => {
    // Masaüstünde farenin doğal tekerlek kaydırmasına asla müdahale etme
    if (isAdminPage || !opened || isScrollingRef.current || !isMobile) return;
    
    // Yalnızca Mobildeki Slayt Kartı İçi Kaydırmalar İçin
    const slideWrapper = e.target.closest('.slide-wrapper');
    if (slideWrapper) {
      const isScrollable = slideWrapper.scrollHeight > slideWrapper.clientHeight;
      if (isScrollable) {
        const atTop = slideWrapper.scrollTop <= 0;
        const atBottom = slideWrapper.scrollHeight - slideWrapper.scrollTop <= slideWrapper.clientHeight + 2;

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
    // Sadece mobilde parmak kaydırmayı dinle
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
           const atBottom = slideWrapper.scrollHeight - slideWrapper.scrollTop <= slideWrapper.clientHeight + 2;
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

  // Butonları aktif / deaktif et
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