import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function IntroPage({ isOpening, copy, invitation, personalGuestName, openInvitation }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');

  // Dil seçimine göre metni ayarlar (İngilizceyse en.json'dan, Türkçeyse panelden/copy'den alır)
  const openText = isEn 
    ? t('invitation.openButton').replace(' 💌', '').replace('💌', '').trim() 
    : copy.openButton;

  // Space ve Enter tuşları ile zarfı açma işlemi
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Eğer zarf zaten açılıyorsa işlemi tekrar tetikleme
      if (isOpening) return;
      
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault(); // Boşluk tuşunun sayfayı aşağı kaydırmasını engeller
        openInvitation();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpening, openInvitation]);

  return (
    <section className={`intro-page ${isOpening ? "opening" : ""}`}>
      <div className="petal-layer" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, index) => (
          <span key={index}></span>
        ))}
      </div>

      <div className="envelope-container">
        <div className="envelope-back"></div>

        <div className="intro-card">
          <div className="leaf-mark" aria-hidden="true"></div>
          <p className="intro-small">{isEn ? t('invitation.introLabel') : copy.introLabel}</p>

          <h1 className="couple-title">
            <span>{invitation.bride}</span>
            <em>&</em>
            <span>{invitation.groom}</span>
          </h1>

          <p className="intro-text">{isEn ? t('invitation.introText') : copy.introText}</p>
        </div>

        <div className="envelope-front"></div>
        <div className="envelope-flap"></div>

        {personalGuestName && (
          <div className="envelope-guest-badge">
            {isEn ? "Dear" : "Sevgili"} {personalGuestName}
          </div>
        )}

        {/* --- BUTON KISMI --- */}
        <button className="envelope-seal" onClick={openInvitation}>
          <span 
            style={{ 
              display: 'block', 
              textAlign: 'center', 
              lineHeight: '1.2',
              color: '#ffffff', 
              WebkitTextFillColor: '#ffffff', /* Arka plandaki rengin sızmasını engeller */
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.6)', 
              fontWeight: '900',
              fontSize: '18px',
              letterSpacing: '0.5px'
            }}
          >
            {openText}
          </span>
        </button>
      </div>
    </section>
  );
}