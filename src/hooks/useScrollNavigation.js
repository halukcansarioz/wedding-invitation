import { useState, useRef, useCallback, useEffect } from "react";

export function useScrollNavigation(isAdminPage, opened) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);

  // Doğrudan DOM Stillerini güncelleyen yardımcı fonksiyon (React'in silmesini engeller)
  const updateSlides = useCallback((activeIndex) => {
    if (window.innerWidth > 650) return;
    const sections = document.querySelectorAll('.slide-wrapper');
    sections.forEach((sec, index) => {
      if (index === activeIndex) {
        sec.style.opacity = '1';
        sec.style.visibility = 'visible';
        sec.style.pointerEvents = 'auto';
        sec.style.zIndex = '5';
      } else {
        sec.style.opacity = '0';
        sec.style.visibility = 'hidden';
        sec.style.pointerEvents = 'none';
        sec.style.zIndex = '1';
      }
    });
  }, []);

  useEffect(() => {
    if (isAdminPage || !opened) return;
    
    if (window.innerWidth <= 650) {
      // React Suspense gecikmesini aşmak için Interval kullanıyoruz
      const initInterval = setInterval(() => {
        const sections = document.querySelectorAll('.slide-wrapper');
        if (sections.length > 0) {
          updateSlides(0); // İlk slaytı zorla görünür yap
          setCurrentSlideIndex(0);
          setShowScrollTop(false);
          setShowScrollDown(sections.length > 1);
          clearInterval(initInterval);
        }
      }, 50); // Saniyede 20 kez kontrol et, bulunca iptal et
      
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      return () => { 
        clearInterval(initInterval);
        document.body.style.overflow = ''; 
        document.documentElement.style.overflow = '';
        
        // Masaüstü moduna dönülürse (ekran büyürse) stilleri temizle
        const sections = document.querySelectorAll('.slide-wrapper');
        sections.forEach(sec => {
          sec.style.opacity = '';
          sec.style.visibility = '';
          sec.style.pointerEvents = '';
          sec.style.zIndex = '';
        });
      };
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [isAdminPage, opened, updateSlides]);

  const scrollToNext = useCallback(() => {
    if (window.innerWidth <= 650) {
      const sections = document.querySelectorAll('.slide-wrapper');
      setCurrentSlideIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex < sections.length) {
          updateSlides(nextIndex);
          sections[nextIndex].scrollTop = 0; // Yeni slaytın en üstüne sar
          setShowScrollTop(true);
          setShowScrollDown(nextIndex < sections.length - 1);
          return nextIndex;
        }
        return prev;
      });
    } else {
      const sections = Array.from(document.querySelectorAll('.slide-wrapper'));
      const nextSection = sections.find(sec => {
        const rect = sec.getBoundingClientRect();
        return rect.top > window.innerHeight * 0.2; 
      });
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (sections.length > 0) {
        sections[sections.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [updateSlides]);

  const scrollToPrev = useCallback(() => {
    if (window.innerWidth <= 650) {
      const sections = document.querySelectorAll('.slide-wrapper');
      setCurrentSlideIndex(prev => {
        const nextIndex = prev - 1;
        if (nextIndex >= 0) {
          updateSlides(nextIndex);
          sections[nextIndex].scrollTop = 0;
          setShowScrollTop(nextIndex > 0);
          setShowScrollDown(true);
          return nextIndex;
        }
        return prev;
      });
    } else {
      const sections = Array.from(document.querySelectorAll('.slide-wrapper'));
      const prevSection = [...sections].reverse().find(sec => {
        const rect = sec.getBoundingClientRect();
        return rect.bottom < window.innerHeight * 0.8; 
      });
      if (prevSection) {
        prevSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [updateSlides]);

  const handleWheel = useCallback((e) => {
    if (isAdminPage || !opened || isScrollingRef.current) return;
    
    if (window.innerWidth <= 650) {
      const sections = document.querySelectorAll('.slide-wrapper');
      const activeSlide = sections[currentSlideIndex];
      if (activeSlide) {
        const isAtTop = activeSlide.scrollTop <= 0;
        const isAtBottom = Math.ceil(activeSlide.scrollTop + activeSlide.clientHeight) >= activeSlide.scrollHeight - 5;
        
        if (e.deltaY > 0 && isAtBottom) {
          scrollToNext();
          isScrollingRef.current = true;
          setTimeout(() => { isScrollingRef.current = false; }, 800);
        } else if (e.deltaY < 0 && isAtTop) {
          scrollToPrev();
          isScrollingRef.current = true;
          setTimeout(() => { isScrollingRef.current = false; }, 800);
        }
      }
    }
  }, [isAdminPage, opened, currentSlideIndex, scrollToNext, scrollToPrev]);

  const handleTouchStart = useCallback((e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartYRef.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (isAdminPage || !opened || isScrollingRef.current || !e.changedTouches || e.changedTouches.length === 0) return;

    if (window.innerWidth <= 650) {
      const target = e.target;
      // Formlar ve harita içinde kaydırma yapılıyorsa slaytı geçme
      if (target.closest('input, textarea, select, .wish-list, .guest-list, .gallery-lightbox-overlay, .mini-map')) {
        return; 
      }

      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartYRef.current - touchEndY;

      // Hassasiyet 50 piksel
      if (Math.abs(diff) > 50) {
        const sections = document.querySelectorAll('.slide-wrapper');
        const activeSlide = sections[currentSlideIndex];
        if (activeSlide) {
          const isAtTop = activeSlide.scrollTop <= 0;
          const isAtBottom = Math.ceil(activeSlide.scrollTop + activeSlide.clientHeight) >= activeSlide.scrollHeight - 5;
          
          if (diff > 0 && isAtBottom) {
            scrollToNext(); 
            isScrollingRef.current = true;
            setTimeout(() => { isScrollingRef.current = false; }, 800);
          } else if (diff < 0 && isAtTop) {
            scrollToPrev(); 
            isScrollingRef.current = true;
            setTimeout(() => { isScrollingRef.current = false; }, 800);
          }
        }
      }
    }
  }, [isAdminPage, opened, currentSlideIndex, scrollToNext, scrollToPrev]);

  // Masaüstü için tetikleyiciler
  useEffect(() => {
    if (isAdminPage || !opened) return;

    const handleScroll = () => {
      if (window.innerWidth <= 650) return; 
      const scrollTop = (document.scrollingElement || document.documentElement).scrollTop;
      setShowScrollTop(scrollTop > 100);
      const isAtBottom = Math.ceil(window.innerHeight + scrollTop) >= document.documentElement.scrollHeight - 100;
      setShowScrollDown(!isAtBottom);
    };

    if (window.innerWidth > 650) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      const revealTimer = window.setTimeout(() => setShowScrollDown(true), 900);
      handleScroll();
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.clearTimeout(revealTimer);
      };
    }
  }, [isAdminPage, opened]);

  return {
    currentSlideIndex,  
    showScrollTop,
    showScrollDown,
    scrollToNext,
    scrollToPrev,
    handleWheel,
    handleTouchStart,
    handleTouchEnd,
  };
}