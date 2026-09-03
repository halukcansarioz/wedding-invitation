import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { handleAddToCalendar, getNavigationLinks } from "../../utils/helpers";
import { m } from "framer-motion";

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
          {isEn ? "Choose Navigation App" : "Yol Tarifi Al"}
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
          {copied ? (isEn ? "Address Copied! ✅" : "Adres Kopyalandı! ✅") : (isEn ? "Copy Full Address 📋" : "Tam Adresi Kopyala 📋")}
        </button>
        <button type="button" className="secondary-button" onClick={onClose} style={{ width: '100%' }}>
          {t('ui.closeBtn')}
        </button>
      </div>
    </div>,
    document.body
  );
}

export function HeroSection({ invitation, copy, guestGreeting, personalTableNumber, scrollToNext }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  
  return (
    <m.section 
      initial="hidden" animate="visible" variants={fadeUp}
      className="hero-section" 
    >
      {invitation?.heroVideo ? (
        <video key={invitation.heroVideo} className="hero-video-bg" autoPlay loop muted playsInline poster={invitation.heroVideo ? "" : invitation.heroImage}>
          <source src={invitation.heroVideo} type="video/mp4" />
        </video>
      ) : null}
      
      <div className="hero-content">
        <p className="small-title">{isEn ? t('invitation.heroLabel') : copy?.heroLabel}</p>
        <h1 className="couple-title"><span>{invitation?.bride}</span><em>&</em><span>{invitation?.groom}</span></h1>
        <p className="hero-date">{invitation?.dateText}</p>
        <p className="hero-time">{t('ui.time')} {invitation?.timeText}</p>
        <div className="scroll-indicator" onClick={(e) => { e.stopPropagation(); if (scrollToNext) scrollToNext(); }} style={{ cursor: 'pointer', zIndex: 20 }}>
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <span>{t('ui.scroll')}</span>
        </div>
        
        {guestGreeting && <p className="hero-guest-greeting">{guestGreeting}</p>}
        {personalTableNumber && (
          <div style={{ marginTop: '14px' }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(255,255,255,0.85)', color: 'var(--rose-deep)', borderRadius: '999px', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              🍽️ {isEn ? `Reserved Table: ${personalTableNumber}` : `Masa Numaranız: ${personalTableNumber}`}
            </span>
          </div>
        )}
      </div>

    </m.section>
  );
}

export function CountdownSection({ copy, timeLeft }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');

  const isFinished = timeLeft?.days === 0 && timeLeft?.hours === 0 && timeLeft?.minutes === 0 && timeLeft?.seconds === 0;

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="countdown-section">
      <p className="section-label">{isEn ? t('invitation.countdownLabel') : copy?.countdownLabel}</p>
      <h2>{isEn ? t('invitation.countdownTitle') : copy?.countdownTitle}</h2>
      
      {isFinished ? (
        <div style={{ padding: '24px', background: 'var(--paper-soft)', borderRadius: '24px', border: '1px solid rgba(217, 140, 161, 0.4)', marginTop: '20px' }}>
          <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🎉💍✨</span>
          <strong style={{ fontSize: '24px', color: 'var(--rose-dark)' }}>
            {isEn ? "Today is the Big Day!" : "Bugün En Mutlu Günümüz!"}
          </strong>
          <p style={{ marginTop: '6px', fontSize: '16px' }}>
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
}

export function InvitationMessageSection({ copy, invitation }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card invitation-card">
      <p className="section-label">{isEn ? t('invitation.invitationLabel') : copy?.invitationLabel}</p>
      <h2>{isEn ? t('invitation.invitationTitle') : copy?.invitationTitle}</h2>
      <p>{invitation?.message}</p>
    </m.section>
  );
}

export function FamilySection({ copy, familyInfo }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card family-card">
      <p className="section-label">{isEn ? t('invitation.familyLabel') : copy?.familyLabel}</p>
      <h2>{isEn ? t('invitation.familyTitle') : copy?.familyTitle}</h2>
      <p>{familyInfo?.text}</p>
      <div className="family-grid">
        <div><span>{familyInfo?.brideFamilyTitle}</span><strong>{familyInfo?.brideFamilyName}</strong></div>
        <div><span>{familyInfo?.groomFamilyTitle}</span><strong>{familyInfo?.groomFamilyName}</strong></div>
      </div>
    </m.section>
  );
}

export function StorySection({ copy, storyTimeline }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const stories = Array.isArray(storyTimeline) ? storyTimeline : [];

  if (stories.length === 0) return null;

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="card story-card">
      <p className="section-label">{isEn ? t('invitation.storyLabel') : copy?.storyLabel}</p>
      <h2>{isEn ? t('invitation.storyTitle') : copy?.storyTitle}</h2>
      
      <div className="story-timeline-container">
        <div className="story-line"></div>
        {stories.map((story, index) => (
          <m.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: index * 0.2 }} 
            viewport={{ once: true, amount: 0.3 }}
            className={`story-node ${index % 2 === 0 ? 'left' : 'right'}`} 
            key={index}
          >
            <div className="story-dot"></div>
            <div className="story-content-box">
              <span className="story-date">{story.date}</span>
              <h3 className="story-heading">{story.title}</h3>
              <p className="story-desc">{story.description}</p>
              {story.image && (
                <img src={story.image} alt={story.title} className="story-image" loading="lazy" />
              )}
            </div>
          </m.div>
        ))}
      </div>
    </m.section>
  );
}

export function CeremonySection({ copy, eventDetails }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const events = Array.isArray(eventDetails) ? eventDetails : [];
  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card ceremony-card">
      <p className="section-label">{isEn ? t('invitation.ceremonyLabel') : copy?.ceremonyLabel}</p>
      <h2>{isEn ? t('invitation.ceremonyTitle') : copy?.ceremonyTitle}</h2>
      <div className="ceremony-grid">
        {events.map((event, index) => (
          <div className="ceremony-item" key={`${event.label}-${index}`}>
            <span>{event.label}</span><strong>{event.time}</strong><p>{event.description}</p><em>{event.location}</em>
          </div>
        ))}
      </div>
    </m.section>
  );
}

export function ScheduleSection({ copy, invitation, scheduleItems }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const items = Array.isArray(scheduleItems) ? scheduleItems : [];
  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card schedule-card">
      <p className="section-label">{isEn ? t('invitation.scheduleLabel') : copy?.scheduleLabel}</p>
      <h2>{invitation?.dateText}</h2>
      <div className="schedule-list">
        {items.map((item, index) => (
          <div className="schedule-item" key={`${item.time}-${index}`}>
            <strong>{item.time}</strong><div><span>{item.title}</span><p>{item.description}</p></div>
          </div>
        ))}
      </div>
    </m.section>
  );
}

export function LocationSection({ copy, invitation, googleCalendarLink }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card">
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
    </m.section>
  );
}

function LightboxModal({ gallery, lightboxIndex, closeLightbox, prevImage, nextImage, isEn }) {
  const { t } = useTranslation();
  if (lightboxIndex === null || typeof document === "undefined") return null;

  return createPortal(
    <div onClick={closeLightbox} className="gallery-lightbox-overlay">
      <button type="button" onClick={closeLightbox} className="lightbox-control-btn lightbox-close" title={t('ui.closeEsc')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      {gallery.length > 1 && (
        <button type="button" onClick={prevImage} className="lightbox-control-btn lightbox-prev" title={t('ui.prev')}>
          &#10094;
        </button>
      )}

      <div onClick={(e) => e.stopPropagation()} className="gallery-lightbox-content">
        <img src={gallery[lightboxIndex]} alt="Büyütülmüş Fotoğraf" className="gallery-lightbox-image" />
        <span className="gallery-lightbox-caption">
          {lightboxIndex + 1} / {gallery.length}
        </span>
      </div>

      {gallery.length > 1 && (
        <button type="button" onClick={nextImage} className="lightbox-control-btn lightbox-next" title={t('ui.next')}>
          &#10095;
        </button>
      )}
    </div>,
    document.body
  );
}

export function GallerySection({ copy, invitation }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const gallery = Array.isArray(invitation?.gallery) ? invitation.gallery : [];
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  
  const prevImage = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  }, [gallery.length]);
  
  const nextImage = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setLightboxIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  }, [gallery.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, closeLightbox, prevImage, nextImage]);

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card">
      <p className="section-label">{isEn ? t('invitation.galleryLabel') : copy?.galleryLabel}</p>
      <h2>{isEn ? t('invitation.galleryTitle') : copy?.galleryTitle}</h2>
      <div className="gallery-grid">
        {gallery.map((image, index) => (
          <img 
            key={`gallery-img-${index}`} 
            src={image} 
            alt={`Galeri ${index + 1}`} 
            loading="lazy" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openLightbox(index);
            }}
            className="gallery-image"
            style={{ cursor: "zoom-in" }}
          />
        ))}
      </div>
      <LightboxModal gallery={gallery} lightboxIndex={lightboxIndex} closeLightbox={closeLightbox} prevImage={prevImage} nextImage={nextImage} isEn={isEn} />
    </m.section>
  );
}

export function ShareSection({ copy, qrImageUrl, shareText, copyInvitationLink }) {
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
}

export function GiftSection({ giftData }) {
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
}

export function FooterSection({ coupleName, invitation, copy }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  return (
    <m.footer initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="footer">
      <p>{coupleName}</p>
      <span>{invitation?.dateText}</span>
      <small>{isEn ? t('invitation.thanksText') : copy?.thanksText}</small>
      <small>{isEn ? t('invitation.footerSmall') : copy?.footerSmall}</small>
    </m.footer>
  );
}