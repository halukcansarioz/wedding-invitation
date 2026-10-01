import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";

export const GuestsListSection = memo(function GuestsListSection({ copy, guests, totalPersonCount, notAttendingCount }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const guestList = Array.isArray(guests) ? guests : [];
  
  // React Performans Optimizasyonu: Her render'da listeyi tekrar saymasını engelliyoruz
  const { totalResponses, attending, notAttending } = useMemo(() => {
    const total = guestList.length;
    const att = totalPersonCount !== undefined 
        ? totalPersonCount 
        : guestList.filter(g => g.attendance === "Katılacağım").length;
    const notAtt = notAttendingCount !== undefined 
        ? notAttendingCount 
        : guestList.filter(g => g.attendance === "Katılamayacağım").length;
        
    return { totalResponses: total, attending: att, notAttending: notAtt };
  }, [guestList, totalPersonCount, notAttendingCount]);

  return (
    <section className="card">
      <p className="section-label">{isEn ? t('invitation.guestsLabel', 'Misafirler') : copy?.guestsLabel}</p>
      <h2>{isEn ? t('invitation.guestsTitle', 'Misafir Listesi') : copy?.guestsTitle}</h2>
      
      <div className="guest-stats" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '12px', 
        flexWrap: 'wrap', 
        margin: '24px auto 16px', 
        width: '100%' 
      }}>
        <div style={{ flex: '1 1 0', minWidth: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 8px', background: 'var(--paper)', border: '1px solid rgba(var(--theme-rgb), 0.15)', borderRadius: '12px' }}>
          <strong style={{ fontSize: '28px', color: 'var(--rose-dark)', marginBottom: '6px' }}>{totalResponses}</strong>
          <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'center' }}>{t('ui.totalResponses', 'Toplam Form')}</span>
        </div>
        <div style={{ flex: '1 1 0', minWidth: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 8px', background: 'var(--paper)', border: '1px solid rgba(var(--theme-rgb), 0.15)', borderRadius: '12px' }}>
          <strong style={{ fontSize: '28px', color: 'var(--rose-dark)', marginBottom: '6px' }}>{attending}</strong>
          <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'center' }}>{t('ui.attending', 'Katılacaklar')}</span>
        </div>
        <div style={{ flex: '1 1 0', minWidth: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 8px', background: 'var(--paper)', border: '1px solid rgba(var(--theme-rgb), 0.15)', borderRadius: '12px' }}>
          <strong style={{ fontSize: '28px', color: 'var(--rose-dark)', marginBottom: '6px' }}>{notAttending}</strong>
          <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'center' }}>{t('ui.notAttending', 'Katılamayacaklar')}</span>
        </div>
      </div>
      
      <div className="private-note-card" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <p className="private-note-text" style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'center', 
          textAlign: 'left', 
          margin: '0 auto', 
          color: 'var(--text-muted)', 
          fontSize: '15px', 
          lineHeight: '1.6', 
          maxWidth: '90%' 
        }}>
          <span style={{ marginRight: '8px', fontSize: '18px', marginTop: '0px', flexShrink: 0 }}>🔒</span>
          <span style={{ textAlign: 'center' }}>{t('ui.privateNote', 'Güvenlik notu ve içerik.')}</span>
        </p>
      </div>
    </section>
  );
});