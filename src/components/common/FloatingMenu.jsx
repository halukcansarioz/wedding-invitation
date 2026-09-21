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
        /* ZIPLAMA ANİMASYONLARI */
        @keyframes syncContainerBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes syncDesktopBounce {
          0%, 100% { transform: translateY(-50%); }
          50% { transform: translateY(calc(-50% - 8px)); }
        }

        /* ANA MENÜ ÇERÇEVESİ */
        #main-dock {
          position: fixed !important;
          z-index: 999999 !important;
          pointer-events: auto !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 8px !important;
          
          /* gap komutu silindi. Boşluklar butonların margin'i ile sağlanıp, animasyonla yavaşça eritilecek. */
          animation: syncContainerBounce 2.5s infinite ease-in-out !important;
          
          flex-direction: row !important;
          bottom: calc(24px + env(safe-area-inset-bottom)) !important;
          top: auto !important;
          left: 0 !important;
          right: 0 !important;
          margin: 0 auto !important;
          width: fit-content !important;
          height: auto !important;
        }

        #main-dock:hover {
          animation-play-state: paused !important;
        }

        /* TEKİL BUTONLAR VE ANİMASYONLARI */
        #main-dock .dock-btn {
          /* Ortaya çıkma ve kaybolma hızını yarım saniyeye yayarak pürüzsüzleştirir */
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important; 
          
          /* Her butonun sağında ve solunda 6px boşluk (Toplamda butonlar arası 12px) */
          margin: 0 6px !important; 
          
          width: 48px !important;
          height: 48px !important;
          min-width: 48px !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
          
          background: var(--theme-surface, #ffffff) !important;
          color: var(--amp-color, #9f4f68) !important;
          border: 1.5px solid var(--amp-color, #9f4f68) !important;
          
          box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
          cursor: pointer !important;
          overflow: hidden !important; 
          opacity: 1 !important;
          visibility: visible !important;
          transform: scale(1) !important;
        }

        #main-dock .dock-btn:hover,
        #main-dock .dock-btn:active {
          transform: scale(1.08) !important;
          background: var(--amp-color, #9f4f68) !important;
          color: var(--theme-surface, #ffffff) !important;
        }

        #main-dock .dock-btn svg {
          width: 22px !important;
          height: 22px !important;
          flex-shrink: 0 !important;
          transition: all 0.5s ease !important;
        }

        /* YAVAŞÇA KAYBOLMA SINIFI (Hayalet boşluk bırakmaz) */
        #main-dock .hidden-btn {
          opacity: 0 !important;
          visibility: hidden !important;
          width: 0 !important;
          min-width: 0 !important;
          height: 0 !important;
          padding: 0 !important;
          border-width: 0 !important;
          
          /* En kritik nokta: Margin de 0'a düşerek aradaki boşluğu yavaşça eritir */
          margin: 0 0 !important; 
          
          transform: scale(0) !important; 
        }

        #main-dock .hidden-btn svg {
          width: 0 !important;
          height: 0 !important;
        }

        /* MASAÜSTÜ GÖRÜNÜM */
        @media (min-width: 651px) {
          #main-dock {
            flex-direction: column !important;
            right: 32px !important;          
            left: auto !important;
            top: 50% !important;             
            bottom: auto !important;         
            margin: 0 !important; 
            height: fit-content !important;
            width: auto !important;
            animation: syncDesktopBounce 2.5s infinite ease-in-out !important;
          }
          
          /* Masaüstü için dikey boşluk (Alt-Üst 6px) */
          #main-dock .dock-btn {
            margin: 6px 0 !important;
          }

          /* Masaüstünde gizlenen buton boşluğunu da sıfırlar */
          #main-dock .hidden-btn {
             margin: 0 0 !important;
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

      <div id="main-dock">
        <button type="button" className="dock-btn lang-btn" onClick={toggleLanguage} title={isEn ? "Türkçe'ye Çevir" : "Switch to English"}>
          <span style={{ fontSize: "14px", fontWeight: "bold" }}>{isEn ? "TR" : "EN"}</span>
        </button>

        <button type="button" className="dock-btn ctrl-play-btn" onClick={toggleMusic} aria-pressed={isMusicPlaying} title={isMusicPlaying ? (isEn ? "Mute" : "Sesi Kapat") : (isEn ? "Play" : "Sesi Aç")}>
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

        {/* Butonlar her zaman HTML'de var olur. Sadece .hidden-btn sınıfını alarak CSS ile yavaşça küçülüp kaybolurlar */}
        <button type="button" className={`dock-btn scroll-up-btn ${!showScrollTop ? 'hidden-btn' : ''}`} onClick={scrollToPrev}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>
        
        <button type="button" className={`dock-btn scroll-down-btn ${!showScrollDown ? 'hidden-btn' : ''}`} onClick={scrollToNext}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        </button>
      </div>
    </>
  );
});