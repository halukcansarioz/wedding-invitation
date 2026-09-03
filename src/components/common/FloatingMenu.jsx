import React, { memo } from "react";

export const FloatingMenu = memo(function FloatingMenu({
  isEn, toggleLanguage, shareText, toggleMusic, isMusicPlaying, 
  showScrollDown, scrollToNext, showScrollTop, scrollToPrev
}) {
  return (
    <>
      <div className="admin-panel-trigger" style={{ display: "block", position: "fixed", top: "20px", left: "20px", zIndex: 999999 }}>
         <a href="/admin" target="_blank" rel="noopener noreferrer" className="admin-btn-clean" title={isEn ? "Admin Panel" : "Yönetici Paneli"}>
           <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
             <path d="M12 8v4" />
             <path d="M12 16h.01" />
           </svg>
         </a>
      </div>
      
      <div className={`floating-actions glass-dock dock-buttons-${1 + Number(showScrollTop) + Number(showScrollDown)}`}>
        <a className="dock-btn wa-btn" href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer" title={isEn ? 'WhatsApp ile Paylaş' : 'Share via WhatsApp'}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </a>
        <button 
          type="button" 
          className="dock-btn music-btn" 
          onClick={toggleMusic} 
          aria-pressed={isMusicPlaying}
          title={isMusicPlaying ? (isEn ? "Mute Music" : "Müziği Kapat") : (isEn ? "Play Music" : "Müziği Aç")}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
        </button>
        <button type="button" className={`dock-btn scroll-down-btn ${!showScrollDown ? 'hidden-btn' : ''}`} onClick={scrollToNext} tabIndex={!showScrollDown ? -1 : 0}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
        </button>
      </div>
    </>
  );
});