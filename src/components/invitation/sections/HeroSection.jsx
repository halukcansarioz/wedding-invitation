import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

export function HeroSection({ invitation, copy, guestGreeting, personalTableNumber, scrollToNext }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  
  return (
    <motion.section 
      initial="hidden" animate="visible" variants={fadeUp}
      className="hero-section" 
    >
      {invitation?.heroVideo ? (
        <video key={invitation.heroVideo} className="hero-video-bg" autoPlay loop muted playsInline poster={invitation.heroVideo ? "" : invitation.heroImage}>
          <source src={invitation.heroVideo} type="video/mp4" />
        </video>
      ) : null}
      
      <div className="hero-content">
        <p className="small-title">{isEn ? t('invitation.heroLabel') : copy?.heroLabel}</p>
        <h1 className="couple-title"><span>{invitation?.bride}</span><em>&</em><span>{invitation?.groom}</span></h1>
        <p className="hero-date">{invitation?.dateText}</p>
        <p className="hero-time">{t('ui.time')} {invitation?.timeText}</p>
        
        {guestGreeting && <p className="hero-guest-greeting">{guestGreeting}</p>}
        {personalTableNumber && (
          <div style={{ marginTop: '14px' }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(255,255,255,0.85)', color: 'var(--rose-deep)', borderRadius: '999px', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              🍽️ {isEn ? `Reserved Table: ${personalTableNumber}` : `Masa Numaranız: ${personalTableNumber}`}
            </span>
          </div>
        )}
      </div>

      <div className="scroll-indicator" onClick={(e) => { e.stopPropagation(); if (scrollToNext) scrollToNext(); }} style={{ cursor: 'pointer', zIndex: 20 }}>
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <span>{t('ui.scroll')}</span>
      </div>
    </motion.section>
  );
}