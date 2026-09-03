import { useState, useRef, useCallback, useEffect } from "react";

export function useScrollNavigation(isAdminPage, opened) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);

  const scrollToNext = useCallback(() => {
    const sections = Array.from(document.querySelectorAll('.slide-wrapper'));
    
    const nextSection = sections.find(sec => {
      const rect = sec.getBoundingClientRect();
      // Ekranın üstünden %20 daha aşağıda beliren ilk slide'ı bul
      return rect.top > window.innerHeight * 0.2; 
    });
    
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (sections.length > 0) {
      sections[sections.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const scrollToPrev = useCallback(() => {
    const sections = Array.from(document.querySelectorAll('.slide-wrapper'));
    
    const prevSection = [...sections].reverse().find(sec => {
      const rect = sec.getBoundingClientRect();
      // Ekranın altından daha yukarıda olan ilk slide'ı bul
      return rect.bottom < window.innerHeight * 0.8; 
    });

    if (prevSection) {
      prevSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleWheel = useCallback((e) => {
    if (isAdminPage || !opened || isScrollingRef.current) return;
    
    if (window.innerWidth <= 650) {
      if (e.deltaY > 0) scrollToNext();
      else scrollToPrev();

      isScrollingRef.current = true;
      setTimeout(() => { isScrollingRef.current = false; }, 600);
    }
  }, [isAdminPage, opened, scrollToNext, scrollToPrev]);

  const handleTouchStart = useCallback((e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartYRef.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (isAdminPage || !opened || isScrollingRef.current || !e.changedTouches || e.changedTouches.length === 0) return;

    if (window.innerWidth <= 650) {
      const target = e.target;
      if (target.closest('input, textarea, select, .wish-list, .guest-list, .gallery-lightbox-overlay')) {
        return; 
      }

      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartYRef.current - touchEndY;

      if (Math.abs(diff) > 60) {
        if (diff > 0) scrollToNext(); 
        else scrollToPrev(); 

        isScrollingRef.current = true;
        setTimeout(() => { isScrollingRef.current = false; }, 600);
      }
    }
  }, [isAdminPage, opened, scrollToNext, scrollToPrev]);

  useEffect(() => {
    if (isAdminPage || !opened) return;

    const handleScroll = () => {
      const scrollTop = (document.scrollingElement || document.documentElement).scrollTop;
      setShowScrollTop(scrollTop > 100);
      const isAtBottom = Math.ceil(window.innerHeight + scrollTop) >= document.documentElement.scrollHeight - 100;
      setShowScrollDown(!isAtBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const revealTimer = window.setTimeout(() => setShowScrollDown(true), 900);
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.clearTimeout(revealTimer);
    };
  }, [isAdminPage, opened]);

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