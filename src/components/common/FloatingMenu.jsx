import React, { memo } from "react";

export const FloatingMenu = memo(function FloatingMenu({ 
  isEn, 
  toggleLanguage, 
  shareText, 
  toggleMusic, 
  isMusicPlaying, 
  showScrollDown, 
  scrollToNext, 
  showScrollTop, 
  scrollToPrev 
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        /* DÜZELTME: Tüm dock butonları tek bir boyutta ve stilde eşitlendi */
        .floating-actions {
          display: flex !important;
          gap: 12px !important;
          align-items: center !important;
          justify-content: center !important;
          height: auto !important;
          top: auto !important;
          bottom: calc(24px + env(safe-area-inset-bottom)) !important;
          right: 50% !important;
          transform: translateX(50%) !important;
          padding: 8px 14px !important;
        }
        .floating-actions .dock-btn {
          position: relative !important;
          margin: 0 !important;
          top: auto !important;
          bottom: auto !important;
          left: auto !important;
          right: auto !important;
          transform: none !important;
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.26, 1.55) !important;
          width: 48px !important;
          height: 48px !important;
          min-width: 48px !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
          background: var(--paper, #fff) !important;
          color: var(--rose-dark, #9f4f68) !important;
          border: 1.5px solid rgba(159, 79, 104, 0.3) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
          cursor: pointer !important;
        }
        .floating-actions .dock-btn svg {
          width: 22px !important;
          height: 22px !important;
        }
        .hidden-btn {
          opacity: 0 !important;
          transform: scale(0.4) translateY(20px) !important;
          pointer-events: none !important;
          position: absolute !important;
          visibility: hidden !important;
        }
        @media (min-width: 651px) {
          .floating-actions {
            flex-direction: column !important;
            right: 24px !important;
            bottom: 24px !important;
            transform: none !important;
          }
        }
        @media (max-width: 650px) {
          .floating-actions {
            flex-direction: row !important;
          }
        }
      `}} />

      <div className="admin-panel-trigger" style={{ display: "block", position: "fixed", top: "20px", left: "20px", zIndex: 999999 }}>
        <a href="/admin" target="_blank" rel="noopener noreferrer" className="admin-btn-clean" title={isEn ? "Admin Panel" : "Yönetici Paneli"}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </a>
      </div>

      <div 
        className="floating-actions glass-dock"
        style={{ zIndex: 999999, pointerEvents: 'auto' }}
      >
        <button type="button" className="dock-btn lang-btn" onClick={toggleLanguage} title={isEn ? "Türkçe'ye Çevir" : "Switch to English"}>
          <span style={{ fontSize: "14px", fontWeight: "bold" }}>{isEn ? "TR" : "EN"}</span>
        </button>

        <button type="button" className="dock-btn music-btn" onClick={toggleMusic} aria-pressed={isMusicPlaying} title={isMusicPlaying ? (isEn ? "Mute Music" : "Müziği Kapat") : (isEn ? "Play Music" : "Müziği Aç")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isMusicPlaying ? (
              <>
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </>
            ) : (
              <>
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
                <line x1="3" y1="3" x2="21" y2="21" />
              </>
            )}
          </svg>
        </button>

        <button type="button" className={`dock-btn scroll-up-btn ${!showScrollTop ? 'hidden-btn' : ''}`} onClick={scrollToPrev} tabIndex={!showScrollTop ? -1 : 0}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>
        
        <button type="button" className={`dock-btn scroll-down-btn ${!showScrollDown ? 'hidden-btn' : ''}`} onClick={scrollToNext} tabIndex={!showScrollDown ? -1 : 0}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        </button>
      </div>
    </>
  );
});