import { useState, useRef, useCallback, useEffect } from "react";

export function useScrollNavigation(isAdminPage, opened) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);

  const scrollToNext = useCallback(() => {
    const isMobile = window.innerWidth <= 650;
    const sections = Array.from(document.querySelectorAll('.invitation-page > section, .invitation-page > footer'));
    
    if (isMobile) {
      if (currentSlideIndex < sections.length - 1) {
        setCurrentSlideIndex((prev) => prev + 1);
      }
    } else {
      const currentScroll = window.scrollY;
      const nextSection = sections.find(sec => {
        const rect = sec.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        return absoluteTop > currentScroll + (window.innerHeight * 0.5);
      });

      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (sections.length > 0) {
        sections[sections.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentSlideIndex]);

  const scrollToPrev = useCallback(() => {
    const isMobile = window.innerWidth <= 650;
    const sections = Array.from(document.querySelectorAll('.invitation-page > section, .invitation-page > footer'));
    
    if (isMobile) {
      if (currentSlideIndex > 0) {
        setCurrentSlideIndex((prev) => prev - 1);
      }
    } else {
      const currentScroll = window.scrollY;
      const prevSection = [...sections].reverse().find(sec => {
        const rect = sec.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        return absoluteTop < currentScroll - (window.innerHeight * 0.1); 
      });

      if (prevSection) {
        prevSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentSlideIndex]);

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
      if (window.innerWidth > 650) {
        setShowScrollTop(window.scrollY > 100);
        const isAtBottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 100;
        setShowScrollDown(!isAtBottom);
      }
    };

    if (window.innerWidth > 650) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      setShowScrollDown(true); 
      setTimeout(handleScroll, 800); 
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
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