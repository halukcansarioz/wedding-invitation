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
      
      <div className="gift-card">
        <strong className="gift-card-receiver">{giftData.receiver}</strong>
        <span className="gift-card-bank">{giftData.bankName}</span>
        <code className="gift-card-iban">{giftData.iban}</code>
      </div>
      
      <button type="button" className="main-button gift-copy-button" onClick={copyIban}>
        {copied ? t('ui.copied') : t('ui.copyIban')}
      </button>
    </m.section>
  );
});