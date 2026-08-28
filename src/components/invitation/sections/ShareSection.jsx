import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

export const ShareSection = memo(function ShareSection({ copy, qrImageUrl, shareText, copyInvitationLink }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card">
      <p className="section-label">{isEn ? t('invitation.shareLabel') : copy?.shareLabel}</p>
      <h2>{isEn ? t('invitation.shareTitle') : copy?.shareTitle}</h2>
      <p>{isEn ? t('invitation.shareDescription') : copy?.shareDescription}</p>
      <div className="qr-public-card">
        <img src={qrImageUrl} alt="QR Code" loading="lazy" />
        <span>{t('ui.shareQr')}</span>
      </div>
      <div className="button-group">
        <a className="main-button" href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer">{t('ui.shareWhatsapp')}</a>
        <button className="secondary-button" onClick={copyInvitationLink}>{t('ui.copyLink')}</button>
      </div>
    </m.section>
  );
});