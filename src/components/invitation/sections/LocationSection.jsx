import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { handleAddToCalendar, getNavigationLinks } from "../../../utils/helpers";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

function NavigationModal({ invitation, isOpen, onClose, isEn, t }) {
  const [copied, setCopied] = useState(false);
  if (!isOpen || typeof document === "undefined") return null;

  const links = getNavigationLinks(invitation);

  const copyAddress = () => {
    navigator.clipboard.writeText(`${invitation?.venue || ""} ${invitation?.address || ""}`.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return createPortal(
    <div onClick={onClose} className="app-modal-backdrop">
      <div onClick={(e) => e.stopPropagation()} className="app-modal-card" style={{ maxWidth: '420px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 8px 0', color: 'var(--rose-deep)' }}>
          {t('navigation.chooseApp')}
        </h3>
        <p style={{ margin: '0 0 18px 0', fontSize: '15px' }}>
          {invitation?.venue} – {invitation?.address}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <a href={links.google} target="_blank" rel="noreferrer" className="secondary-button" style={{ padding: '12px', fontSize: '14px', borderRadius: '14px' }}>
            Google Maps 🗺️
          </a>
          <a href={links.apple} target="_blank" rel="noreferrer" className="secondary-button" style={{ padding: '12px', fontSize: '14px', borderRadius: '14px' }}>
            Apple Maps 🍏
          </a>
          <a href={links.yandex} target="_blank" rel="noreferrer" className="secondary-button" style={{ padding: '12px', fontSize: '14px', borderRadius: '14px' }}>
            Yandex Navi 🚕
          </a>
          <a href={links.waze} target="_blank" rel="noreferrer" className="secondary-button" style={{ padding: '12px', fontSize: '14px', borderRadius: '14px' }}>
            Waze 🚙
          </a>
        </div>

        <button type="button" className="main-button" onClick={copyAddress} style={{ width: '100%', marginBottom: '10px' }}>
          {copied ? t('navigation.addressCopied') : t('navigation.copyAddress')}
        </button>
        <button type="button" className="secondary-button" onClick={onClose} style={{ width: '100%' }}>
          {t('ui.closeBtn')}
        </button>
      </div>
    </div>,
    document.body
  );
}

export function LocationSection({ copy, invitation, googleCalendarLink }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card">
      <p className="section-label">{isEn ? t('invitation.locationLabel') : copy?.locationLabel}</p>
      <h2>{isEn ? t('invitation.locationTitle') : copy?.locationTitle}</h2>
      <div className="info-list">
        <div className="info-row"><span>{t('ui.date')}</span><strong>{invitation?.dateText}</strong></div>
        <div className="info-row"><span>{t('ui.time')}</span><strong>{invitation?.timeText}</strong></div>
        <div className="info-row"><span>{t('ui.venue')}</span><strong>{invitation?.venue}</strong></div>
        <div className="info-row"><span>{t('ui.address')}</span><strong>{invitation?.address}</strong></div>
      </div>
      <div className="mini-map">
        <iframe title="Map" src={`https://maps.google.com/maps?q=${encodeURIComponent(`${invitation?.venue || ""} ${invitation?.address || ""}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"></iframe>
      </div>
      <div className="button-group">
        <button type="button" className="main-button" onClick={() => setIsNavOpen(true)}>
          {t('ui.goToMap')}
        </button>
        <button type="button" className="secondary-button" onClick={() => handleAddToCalendar(invitation, googleCalendarLink)}>
          {t('ui.addToCalendar')}
        </button>
      </div>

      <NavigationModal invitation={invitation} isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} isEn={isEn} t={t} />
    </motion.section>
  );
}