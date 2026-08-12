import React from "react";
import { useTranslation } from "react-i18next";

export default function IntroPage({ isOpening, copy, invitation, personalGuestName, openInvitation }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');

  // Animasyon gibi algılanan ve yapıyı bozan emojiyi metinden temizliyoruz
  const openText = isEn 
    ? t('invitation.openButton').replace(' 💌', '').replace('💌', '').trim() 
    : copy.openButton;

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

        <button className="envelope-seal" onClick={openInvitation}>
          <span style={{ display: 'block', textAlign: 'center', lineHeight: '1.2' }}>
            {openText}
          </span>
        </button>
      </div>
    </section>
  );
}