import { useState, useRef, useCallback, useEffect } from "react";

export function useScrollNavigation(isAdminPage, opened) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);

  const scrollToNext = useCallback(() => {
    const sections = Array.from(document.querySelectorAll('.invitation-page > section, .invitation-page > footer'));
    const scrollContainer = document.scrollingElement || document.documentElement;
    const currentScroll = scrollContainer.scrollTop;
    const scrollOffset = window.innerWidth <= 650 ? 16 : 0;
    // Tüm cihazlarda: bir sonraki section'a scroll yap
    const nextSection = sections.find(sec => {
      const rect = sec.getBoundingClientRect();
      return (rect.top + window.scrollY) > currentScroll + (window.innerHeight * 0.5);
    });
    
    if (nextSection) {
      const targetTop = nextSection.offsetTop - scrollOffset;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
    } else if (sections.length > 0) {
      const lastSection = sections[sections.length - 1];
      const targetTop = lastSection.offsetTop - scrollOffset;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
    }
  }, []);

  const scrollToPrev = useCallback(() => {
    const sections = Array.from(document.querySelectorAll('.invitation-page > section, .invitation-page > footer'));
    const scrollContainer = document.scrollingElement || document.documentElement;
    const currentScroll = scrollContainer.scrollTop;
    const scrollOffset = window.innerWidth <= 650 ? 16 : 0;
    
    // Tüm cihazlarda: bir önceki section'a scroll yap
    const prevSection = [...sections].reverse().find(sec => {
      const rect = sec.getBoundingClientRect();
      return (rect.top + window.scrollY) < currentScroll - (window.innerHeight * 0.1); 
    });

    if (prevSection) {
      const targetTop = prevSection.offsetTop - scrollOffset;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
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