import React, { memo } from "react";

const FLOATING_MENU_CSS = `
  @keyframes dockButtonBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  .admin-panel-trigger {
    display: block;
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 999999;
  }

  #main-dock {
    position: fixed;
    z-index: 999999;
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    flex-direction: row;
    bottom: calc(24px + env(safe-area-inset-bottom));
    top: auto;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: fit-content;
    height: auto;
  }

  #main-dock .dock-btn {
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    margin: 0 6px;
    width: 48px;
    height: 48px;
    min-width: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: var(--theme-surface, #ffffff);
    color: var(--amp-color, #9f4f68);
    border: 1.5px solid var(--amp-color, #9f4f68);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    overflow: hidden;
    opacity: 1;
    visibility: visible;
    animation: dockButtonBounce 2.5s infinite ease-in-out;
  }

  #main-dock .dock-btn:nth-child(1) { animation-delay: 0s; }
  #main-dock .dock-btn:nth-child(2) { animation-delay: 0.15s; }
  #main-dock .dock-btn:nth-child(3) { animation-delay: 0.3s; }
  #main-dock .dock-btn:nth-child(4) { animation-delay: 0.45s; }

  #main-dock .dock-btn:hover,
  #main-dock .dock-btn:active {
    animation-play-state: paused;
    transform: scale(1.08);
    background: var(--amp-color, #9f4f68);
    color: var(--theme-surface, #ffffff);
  }

  #main-dock .dock-btn svg {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    transition: all 0.5s ease;
  }

  #main-dock .dock-btn.hidden-btn {
    opacity: 0;
    visibility: hidden;
    width: 0;
    min-width: 0;
    height: 0;
    padding: 0;
    border-width: 0;
    margin: 0;
    transform: scale(0);
    pointer-events: none;
  }

  #main-dock .dock-btn.hidden-btn svg {
    width: 0;
    height: 0;
  }

  @media (min-width: 651px) {
    #main-dock {
      flex-direction: column;
      right: 32px;
      left: auto;
      top: 50%;
      bottom: auto;
      transform: translateY(-50%);
      margin: 0;
      height: fit-content;
      width: auto;
    }

    #main-dock .dock-btn {
      margin: 6px 0;
    }

    #main-dock .dock-btn.hidden-btn {
      margin: 0;
    }
  }
`;

export const FloatingMenu = memo(function FloatingMenu({
  isEn,
  toggleLanguage,
  shareText,
  toggleMusic,
  isMusicPlaying,
  showScrollDown,
  scrollToNext,
  showScrollTop,
  scrollToPrev,
}) {
  return (
    <>
      <style>{FLOATING_MENU_CSS}</style>

      <div className="admin-panel-trigger">
        <a
          href="/admin"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn-clean"
          title={isEn ? "Admin Panel" : "Yönetici Paneli"}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </a>
      </div>

      <div id="main-dock">
        <button
          type="button"
          className="dock-btn lang-btn"
          onClick={toggleLanguage}
          title={isEn ? "Türkçe'ye Çevir" : "Switch to English"}
        >
          <span style={{ fontSize: "14px", fontWeight: "bold" }}>{isEn ? "TR" : "EN"}</span>
        </button>

        <button
          type="button"
          className="dock-btn ctrl-play-btn"
          onClick={toggleMusic}
          aria-pressed={isMusicPlaying}
          title={isMusicPlaying ? (isEn ? "Mute" : "Sesi Kapat") : isEn ? "Play" : "Sesi Aç"}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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

        <button
          type="button"
          className={`dock-btn scroll-up-btn ${!showScrollTop ? "hidden-btn" : ""}`}
          onClick={scrollToPrev}
          title={isEn ? "Previous Section" : "Önceki Bölüm"}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>

        <button
          type="button"
          className={`dock-btn scroll-down-btn ${!showScrollDown ? "hidden-btn" : ""}`}
          onClick={scrollToNext}
          title={isEn ? "Next Section" : "Sonraki Bölüm"}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        </button>
      </div>
    </>
  );
});