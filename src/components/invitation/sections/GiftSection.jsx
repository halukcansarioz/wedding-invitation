import React, { useState, memo } from "react";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

export const GiftSection = memo(function GiftSection({ giftData }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const [copied, setCopied] = useState(false);

  const copyIban = () => {
    navigator.clipboard.writeText(giftData?.iban);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!giftData) return null;

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card">
      <p className="section-label">{t('ui.giftTitle')}</p>
      <h2>{isEn ? t('ui.giftTitle') : giftData.title}</h2>
      <p className="gift-description">
        {isEn ? t('ui.giftDescription') : giftData.description}
      </p>
      
      {/* Boyutları ufaltılmış, sınırlandırılmış (maxWidth) ve ortalanmış daha şık IBAN kartı */}
      <div className="gift-card" style={{ 
        background: 'var(--paper-soft)', 
        padding: '20px 16px', 
        borderRadius: '12px', 
        margin: '16px auto 24px auto', 
        maxWidth: '450px',
        textAlign: 'center', 
        border: '1px solid rgba(159, 79, 104, 0.08)' 
      }}>
        <strong className="gift-card-receiver" style={{ 
          display: 'block', 
          fontSize: '16px', 
          color: 'var(--rose-dark)', 
          fontWeight: '700', 
          marginBottom: '4px' 
        }}>
          {giftData.receiver}
        </strong>
        <span className="gift-card-bank" style={{ 
          display: 'block', 
          fontSize: '13px', 
          color: 'var(--text-muted)', 
          marginBottom: '14px' 
        }}>
          {giftData.bankName}
        </span>
        <code className="gift-card-iban" style={{ 
          display: 'inline-block', 
          fontSize: '14px', 
          padding: '10px 18px', 
          background: 'var(--paper)', 
          borderRadius: '8px', 
          border: '1px dashed var(--rose-dark)', 
          color: 'var(--text-main)', 
          letterSpacing: '1px', 
          wordBreak: 'break-all' 
        }}>
          {giftData.iban}
        </code>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button type="button" className="main-button gift-copy-button" onClick={copyIban} style={{ paddingLeft: '32px', paddingRight: '32px' }}>
          {copied ? t('ui.copied') : t('ui.copyIban')}
        </button>
      </div>
    </m.section>
  );
});