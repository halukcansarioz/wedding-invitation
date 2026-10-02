import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { getQrImageUrl } from "../../../utils/helpers";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

export const ShareSection = memo(function ShareSection({ copy, qrImageUrl, shareText, copyInvitationLink }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');

  const safeQrUrl = qrImageUrl || getQrImageUrl();

  // Web Share API ile Native Paylaşım
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          // ÇÖZÜM: Hardcoded metinler yerine i18n t() ve admin copy verileri entegre edildi
          title: isEn ? t('invitation.shareTitle') : (copy?.shareTitle || 'Düğün Davetiyemiz'),
          text: isEn ? t('invitation.shareDescription') : (copy?.shareDescription || 'Bu mutlu günümüzde sizi de aramızda görmek isteriz.'),
          url: window.location.href,
        });
      } catch (err) {
        console.log('Paylaşım iptal edildi.', err);
      }
    } else {
      copyInvitationLink(); 
    }
  };

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card">
      <p className="section-label">{isEn ? t('invitation.shareLabel') : copy?.shareLabel}</p>
      <h2>{isEn ? t('invitation.shareTitle') : copy?.shareTitle}</h2>
      <p style={{ marginBottom: "20px" }}>{isEn ? t('invitation.shareDescription') : copy?.shareDescription}</p>
      
      <div style={{ 
        margin: '0 auto 32px', 
        padding: '20px', 
        background: 'var(--paper)', 
        borderRadius: '20px', 
        display: 'inline-block', 
        border: '1px solid rgba(var(--theme-rgb), 0.15)', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.04)' 
      }}>
        <img src={safeQrUrl} alt="QR Code" loading="lazy" style={{ display: 'block', width: '160px', height: '160px', margin: '0 auto 12px', borderRadius: '8px' }} />
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
          {isEn ? "Share quickly via QR code." : "QR kod ile hızlıca paylaşın."}
        </span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '380px', margin: '0 auto' }}>
        
        <button className="main-button" onClick={handleNativeShare} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', width: '100%', margin: 0, borderRadius: '14px', fontSize: '16px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          <span>{isEn ? "Share Invitation" : "Davetiyeyi Paylaş"}</span>
        </button>

        <div style={{ display: 'flex', gap: '14px' }}>
          <a className="secondary-button" href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: 1, padding: '14px 12px', margin: 0, borderRadius: '14px', textDecoration: 'none', fontSize: '15px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span>WhatsApp</span>
          </a>
          
          <button className="secondary-button" onClick={copyInvitationLink} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: 1, padding: '14px 12px', margin: 0, borderRadius: '14px', fontSize: '15px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>{isEn ? "Copy Link" : "Kopyala"}</span>
          </button>
        </div>

      </div>
    </m.section>
  );
});