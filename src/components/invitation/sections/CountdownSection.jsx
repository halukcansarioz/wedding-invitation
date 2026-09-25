import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

export const CountdownSection = memo(function CountdownSection({ copy, timeLeft }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const isFinished = timeLeft?.days === 0 && timeLeft?.hours === 0 && timeLeft?.minutes === 0 && timeLeft?.seconds === 0;

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="countdown-section">
      <p className="section-label">{isEn ? t('invitation.countdownLabel') : copy?.countdownLabel}</p>
      <h2>{isEn ? t('invitation.countdownTitle') : copy?.countdownTitle}</h2>
      
      {isFinished ? (
        <div className="countdown-finished-box" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8% 5%',
          background: 'var(--paper-soft)',
          border: '1px solid rgba(159, 79, 104, 0.15)',
          borderRadius: '16px',
          margin: '20px auto 0',
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
        }}>
          <span className="countdown-finished-icon" style={{ fontSize: 'clamp(2.5rem, 8vw, 3rem)', marginBottom: '16px', display: 'block', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>🎉💍✨</span>
          <strong className="countdown-finished-title" style={{ fontSize: 'clamp(1.2rem, 5vw, 1.5rem)', color: 'var(--rose-dark)', marginBottom: '12px', textAlign: 'center', fontFamily: '"Playfair Display", serif' }}>
            {isEn ? "Today is the Big Day!" : "Bugün En Mutlu Günümüz!"}
          </strong>
          <p className="countdown-finished-text" style={{ fontSize: 'clamp(0.9rem, 4vw, 1rem)', color: 'var(--text-muted)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
            {isEn ? "We can't wait to celebrate with you." : "Sizinle kutlamak için sabırsızlanıyoruz."}
          </p>
        </div>
      ) : (
        <div className="countdown-grid">
          <div className="count-box countdown-animated"><strong>{timeLeft?.days || 0}</strong><span>{t('ui.days')}</span></div>
          <div className="count-box countdown-animated"><strong>{timeLeft?.hours || 0}</strong><span>{t('ui.hours')}</span></div>
          <div className="count-box countdown-animated"><strong>{timeLeft?.minutes || 0}</strong><span>{t('ui.mins')}</span></div>
          <div className="count-box countdown-animated"><strong>{timeLeft?.seconds || 0}</strong><span>{t('ui.secs')}</span></div>
        </div>
      )}
    </m.section>
  );
});