import { useState, useRef, useCallback, useEffect } from "react";

export function useScrollNavigation(isAdminPage, opened) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);

  // Ekran boyutunu izle
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Masaüstünde kartların birbirine karışmasını engellemek için sadece top-level elementler seçilir
  const getDesktopSections = () => Array.from(document.querySelectorAll('.hero-section, .countdown-section, .card, .footer'));

  const getActiveDesktopIndex = (sections) => {
    let activeIdx = 0;
    sections.forEach((sec, idx) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.55) {
        activeIdx = idx;
      }
    });
    return activeIdx;
  };

  const scrollToNext = useCallback(() => {
    if (isMobile) {
      const wrappers = Array.from(document.querySelectorAll('.slide-wrapper'));
      if (wrappers.length === 0) return;
      
      setCurrentSlideIndex(prev => {
        const next = prev + 1;
        return next < wrappers.length ? next : prev;
      });
    } else {
      const sections = getDesktopSections();
      if (sections.length === 0) return;
      
      const activeIdx = getActiveDesktopIndex(sections);
      const nextIdx = activeIdx + 1;
      
      if (nextIdx < sections.length) {
        const nextSection = sections[nextIdx];
        const rect = nextSection.getBoundingClientRect();
        const absoluteTop = window.scrollY + rect.top;

        if (rect.height <= window.innerHeight) {
          window.scrollTo({ top: absoluteTop - (window.innerHeight - rect.height) / 2, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: absoluteTop - 40, behavior: 'smooth' });
        }
      } else {
        window.scrollBy({ top: window.innerHeight * 0.6, behavior: 'smooth' });
      }
    }
  }, [isMobile]);

  const scrollToPrev = useCallback(() => {
    if (isMobile) {
      const wrappers = Array.from(document.querySelectorAll('.slide-wrapper'));
      if (wrappers.length === 0) return;
      
      const currentWrapper = wrappers[currentSlideIndex];
      
      // AKILLI KAYDIRMA: Slaytın içerisinde çok aşağı inildiyse, önce nazikçe o slaytın en tepesine çıkar.
      if (currentWrapper && currentWrapper.scrollTop > 150) {
        currentWrapper.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      // Zaten slaytın en üstündeyse bir önceki slayta/bölüme geçer.
      setCurrentSlideIndex(prev => prev > 0 ? prev - 1 : 0);
    } else {
      const sections = getDesktopSections();
      if (sections.length === 0) return;
      
      const activeIdx = getActiveDesktopIndex(sections);
      const currentSection = sections[activeIdx];
      
      // AKILLI KAYDIRMA: Masaüstünde uzun bir kartın sonlarındaysa, önceki karta atlamak yerine bulunduğu kartın en üstüne çıkar.
      if (currentSection) {
        const currentRect = currentSection.getBoundingClientRect();
        if (currentRect.top < -150) {
           const absoluteTop = window.scrollY + currentRect.top;
           window.scrollTo({ top: absoluteTop - 40, behavior: 'smooth' });
           return;
        }
      }

      const prevIdx = activeIdx - 1;
      if (prevIdx >= 0) {
        const prevSection = sections[prevIdx];
        const rect = prevSection.getBoundingClientRect();
        const absoluteTop = window.scrollY + rect.top;

        if (rect.height <= window.innerHeight) {
          window.scrollTo({ top: absoluteTop - (window.innerHeight - rect.height) / 2, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: absoluteTop - 40, behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [isMobile, currentSlideIndex]);

  const handleWheel = useCallback((e) => {
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

    if (target.closest('input, textarea, select, .gallery-lightbox-overlay, .admin-custom-select-menu')) return; 

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

  // Scroll olaylarını yönet ve butonların görünürlüğünü belirle
useEffect(() => {
    if (isAdminPage || !opened) return;

    const handleScroll = () => {
      if (isMobile) {
         const wrappers = document.querySelectorAll('.slide-wrapper');
         const currentWrapper = wrappers[currentSlideIndex];
         const isScrolledInside = currentWrapper ? currentWrapper.scrollTop > 100 : false;
         
         setShowScrollTop(currentSlideIndex > 0 || isScrolledInside);
         setShowScrollDown(wrappers.length === 0 ? true : currentSlideIndex < wrappers.length - 1);
      } else {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        
        // GÜNCELLEME: Sayfanın en tepesindeyken bile aşağı butonunun hemen görünmesi sağlanır
        setShowScrollTop(scrollTop > 100);
        
        // Sadece sayfanın en sonuna (footer'a) ulaşıldığında aşağı butonu gizlenir
        const isAtBottom = Math.ceil(window.innerHeight + scrollTop) >= document.documentElement.scrollHeight - 50;
        setShowScrollDown(!isAtBottom);
      }
    };

    if (!isMobile) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    let activeWrapper = null;
    if (isMobile) {
       const wrappers = document.querySelectorAll('.slide-wrapper');
       activeWrapper = wrappers[currentSlideIndex];
       if (activeWrapper) {
          activeWrapper.addEventListener('scroll', handleScroll, { passive: true });
       }
    }

    const revealTimer = window.setTimeout(handleScroll, 100);
    handleScroll();
    
    return () => {
      if (!isMobile) {
        window.removeEventListener('scroll', handleScroll);
      }
      if (activeWrapper) {
        activeWrapper.removeEventListener('scroll', handleScroll);
      }
      window.clearTimeout(revealTimer);
    };
  }, [isAdminPage, opened, isMobile, currentSlideIndex]);
  
  return { currentSlideIndex, showScrollTop, showScrollDown, scrollToNext, scrollToPrev, handleWheel, handleTouchStart, handleTouchEnd };
}