import React, { memo } from "react";
import { useTranslation } from "react-i18next";

export const GuestsListSection = memo(function GuestsListSection({ copy, guests, totalPersonCount, notAttendingCount }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const guestList = Array.isArray(guests) ? guests : [];
  
  const totalResponses = guestList.length;
  const attending = totalPersonCount !== undefined ? totalPersonCount : guestList.filter(g => g.attendance === "Katılacağım").length;
  const notAttending = notAttendingCount !== undefined ? notAttendingCount : guestList.filter(g => g.attendance === "Katılamayacağım").length;

  return (
    <section className="card">
      <p className="section-label">{isEn ? t('invitation.guestsLabel') : copy?.guestsLabel}</p>
      <h2>{isEn ? t('invitation.guestsTitle') : copy?.guestsTitle}</h2>
      
      <div className="guest-stats">
        <div><strong>{totalResponses}</strong><span>{t('ui.totalResponses')}</span></div>
        <div><strong>{attending}</strong><span>{t('ui.attending')}</span></div>
        <div><strong>{notAttending}</strong><span>{t('ui.notAttending')}</span></div>
      </div>
      
      <div className="private-note-card">
        <p className="private-note-text">🔒 {t('ui.privateNote')}</p>
      </div>
    </section>
  );
});