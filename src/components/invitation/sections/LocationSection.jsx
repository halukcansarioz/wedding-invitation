import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { handleAddToCalendar, getNavigationLinks } from "../../../utils/helpers";
import { m } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

function NavigationModal({ invitation, isOpen, onClose, isEn, t }) {
  const [copied, setCopied] = useState(false);
  
  // Hata yapma potansiyeli olan sembolleri tamamen temizledik
  if (isOpen === false) return null;
  if (typeof document === "undefined") return null;

  const links = getNavigationLinks(invitation);

  const copyAddress = () => {
    // || yerine ?? kullanıldı
    const venueText = invitation?.venue ?? "";
    const addressText = invitation?.address ?? "";
    navigator.clipboard.writeText(`${venueText} ${addressText}`.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return createPortal(
    <div onClick={onClose} className="app-modal-backdrop">
      <div onClick={(e) => e.stopPropagation()} className="app-modal-card location-nav-modal">
        <h3 className="location-nav-title">
          {t('navigation.chooseApp', 'Yol Tarifi Al')}
        </h3>
        <p className="location-nav-address">
          {invitation?.venue} – {invitation?.address}
        </p>

        <div className="location-nav-grid">
          <a href={links.google} target="_blank" rel="noreferrer" className="secondary-button location-nav-btn">
            Google Maps 🗺️
          </a>
          <a href={links.apple} target="_blank" rel="noreferrer" className="secondary-button location-nav-btn">
            Apple Maps 🍏
          </a>
          <a href={links.yandex} target="_blank" rel="noreferrer" className="secondary-button location-nav-btn">
            Yandex Navi 🚕
          </a>
          <a href={links.waze} target="_blank" rel="noreferrer" className="secondary-button location-nav-btn">
            Waze 🚙
          </a>
        </div>

        <button type="button" className="main-button location-nav-copy" onClick={copyAddress}>
          {copied ? t('navigation.addressCopied', 'Adres Kopyalandı') : t('navigation.copyAddress', 'Adresi Kopyala')}
        </button>
        <button type="button" className="secondary-button location-nav-close" onClick={onClose}>
          {t('ui.closeBtn', 'Kapat')}
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

  // KARIŞIKLIĞA SEBEP OLAN KISMI TERTEMİZ DEĞİŞKENLERE AYIRDIK
  const venueStr = invitation?.venue ?? "";
  const addressStr = invitation?.address ?? "";
  const mapQuery = encodeURIComponent(`${venueStr} ${addressStr}`);
  const mapIframeSrc = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card">
      <p className="section-label">{isEn ? t('invitation.locationLabel', 'Tarih ve Konum') : copy?.locationLabel}</p>
      <h2>{isEn ? t('invitation.locationTitle', 'Düğün Bilgileri') : copy?.locationTitle}</h2>
      <div className="info-list">
        <div className="info-row"><span>{t('ui.date', 'Tarih')}</span><strong>{invitation?.dateText}</strong></div>
        <div className="info-row"><span>{t('ui.time', 'Saat')}</span><strong>{invitation?.timeText}</strong></div>
        <div className="info-row"><span>{t('ui.venue', 'Mekan')}</span><strong>{invitation?.venue}</strong></div>
        <div className="info-row"><span>{t('ui.address', 'Adres')}</span><strong>{invitation?.address}</strong></div>
      </div>
      <div className="mini-map">
        <iframe 
          title="Map" 
          src={mapIframeSrc} 
          loading="lazy" 
          allowFullScreen 
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      <div className="button-group">
        <button type="button" className="main-button" onClick={() => setIsNavOpen(true)}>
          {t('ui.goToMap', 'Konuma Git')}
        </button>
        <button type="button" className="secondary-button" onClick={() => handleAddToCalendar(invitation, googleCalendarLink)}>
          {t('ui.addToCalendar', 'Takvime Ekle')}
        </button>
      </div>

      {isNavOpen && <NavigationModal invitation={invitation} isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} isEn={isEn} t={t} />}
    </m.section>
  );
}