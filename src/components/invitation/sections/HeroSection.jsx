import React from "react";
import { useTranslation } from "react-i18next";

export function HeroSection({ invitation, copy, guestGreeting, personalTableNumber, scrollToNext }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en') || false;
  
  return (
    <section 
      className="hero-section" 
      style={{ 
        position: "relative", 
        overflow: "hidden",
        minHeight: "100vh", /* KESİN ÇÖZÜM: Mobilde boyutu 0'a düşmesini engeller */
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        backgroundColor: "var(--paper)"
      }}
    >
      {/* 1. KESİN ÇÖZÜM: Animasyonsuz doğrudan arka plan (Safari engellerini aşar) */}
      {invitation?.heroImage && (
        <div 
          style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1,
            backgroundImage: `url(${invitation.heroImage})`,
            backgroundPosition: "center", backgroundSize: "cover", backgroundRepeat: "no-repeat",
            pointerEvents: "none"
          }} 
        />
      )}

      {/* 2. Video (Varsa ve mobil izin veriyorsa üste biner) */}
      {invitation?.heroVideo && (
        <video 
          key={invitation.heroVideo} 
          autoPlay 
          loop 
          muted 
          playsInline 
          poster={invitation?.heroImage}
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            objectFit: "cover", zIndex: 2, pointerEvents: "none"
          }}
        >
          <source src={invitation.heroVideo} type="video/mp4" />
        </video>
      )}

      {/* 3. Karartma Katmanı (Yazıların her fotoğrafta okunması için) */}
      <div 
        style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)",
          zIndex: 3, pointerEvents: "none"
        }} 
      />
      
      {/* 4. İçerik ve Yazılar */}
      <div className="hero-content" style={{ position: "relative", zIndex: 4, width: "100%", textAlign: "center" }}>
        <p className="small-title" style={{ color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          {isEn ? t('invitation.heroLabel') : copy?.heroLabel}
        </p>
        
        <h1 className="couple-title" style={{ color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
          <span>{invitation?.bride}</span>
          <em style={{ color: "var(--gold)", margin: "0 10px" }}>&</em>
          <span>{invitation?.groom}</span>
        </h1>
        
        <p className="hero-date" style={{ color: "#fff", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.2)" }}>
          {invitation?.dateText}
        </p>
        <p className="hero-time" style={{ color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          {t('ui.time')} {invitation?.timeText}
        </p>
        
        <div className="scroll-indicator" onClick={(e) => { e.stopPropagation(); if (scrollToNext) scrollToNext(); }} style={{ cursor: 'pointer', zIndex: 20, marginTop: "20px" }}>
          <div className="mouse" style={{ borderColor: "#fff" }}>
            <div className="wheel" style={{ background: "#fff" }}></div>
          </div>
          <span style={{ color: "#fff" }}>{t('ui.scroll')}</span>
        </div>
        
        {guestGreeting && <p className="hero-guest-greeting" style={{ color: "#fff", marginTop: "15px" }}>{guestGreeting}</p>}
        
        {personalTableNumber && (
          <div style={{ marginTop: '14px' }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(255,255,255,0.85)', color: 'var(--rose-deep)', borderRadius: '999px', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              🍽️ {isEn ? `Reserved Table: ${personalTableNumber}` : `Masa Numaranız: ${personalTableNumber}`}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}