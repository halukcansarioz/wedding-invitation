import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

// React.memo ile sarmalandı
export const HeroSection = memo(function HeroSection({ invitation, copy, guestGreeting, personalTableNumber, scrollToNext, settings }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en') || false;
  const isPostWedding = settings?.isPostWedding;
  
  return (
    <m.section 
      initial="hidden" animate="visible" variants={fadeUp}
      className="hero-section" 
    >
      {invitation?.heroVideo ? (
        <video key={invitation.heroVideo} className="hero-video-bg" autoPlay loop muted playsInline poster={invitation.heroVideo ? "" : invitation.heroImage}>
          <source src={invitation.heroVideo} type="video/mp4" />
        </video>
      ) : null}
      
      <div className="hero-content">
        <p className="small-title" style={{ color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          {isPostWedding ? (isEn ? "Thank You For Being With Us" : "Yanımızda Olduğunuz İçin Teşekkürler") : (isEn ? t('invitation.heroLabel') : copy?.heroLabel)}
        </p>

        <h1 className="couple-title" style={{ color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
          <span>{invitation?.bride}</span>
          <em style={{ color: "var(--gold)", margin: "0 10px" }}>&</em>
          <span>{invitation?.groom}</span>
        </h1>
        
        {isPostWedding ? (
          <p className="hero-date" style={{ color: "#fff", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.2)" }}>
            {isEn ? "Memories of Our Happiest Day" : "En Mutlu Günümüzün Anıları"}
          </p>
        ) : (
          <>
            <p className="hero-date" style={{ color: "#fff", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.2)" }}>
              {invitation?.dateText}
            </p>
            <p className="hero-time" style={{ color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
              {t('ui.time')} {invitation?.timeText}
            </p>
          </>
        )}

        <div className="scroll-indicator" onClick={(e) => { e.stopPropagation(); if (scrollToNext) scrollToNext(); }} style={{ cursor: 'pointer', zIndex: 20 }}>
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <span>{t('ui.scroll')}</span>
        </div>
        
        {guestGreeting && <p className="hero-guest-greeting">{guestGreeting}</p>}
        {personalTableNumber && (
          <div style={{ marginTop: '14px' }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(255,255,255,0.85)', color: 'var(--rose-deep)', borderRadius: '999px', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              🍽️ {isEn ? `Reserved Table: ${personalTableNumber}` : `Masa Numaranız: ${personalTableNumber}`}
            </span>
          </div>
        )}
      </div>
    </m.section>
  );
});