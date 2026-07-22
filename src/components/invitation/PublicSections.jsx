import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { downloadIcsCalendar, handleAddToCalendar } from "../../utils/helpers";

export function HeroSection({ invitation, copy, guestGreeting }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  
  return (
    <section className="hero-section">
      {invitation?.heroVideo ? (
        <video key={invitation.heroVideo} className="hero-video-bg" autoPlay loop muted playsInline poster={invitation.heroVideo ? "" : invitation.heroImage}>
          <source src={invitation.heroVideo} type="video/mp4" />
        </video>
      ) : null}
      
      <div className="hero-content">
        <p className="small-title">{isEn ? t('invitation.heroLabel') : copy?.heroLabel}</p>
        <h1 className="couple-title"><span>{invitation?.bride}</span><em>&</em><span>{invitation?.groom}</span></h1>
        <p className="hero-date">{invitation?.dateText}</p>
        <p className="hero-time">{isEn ? "Time" : "Saat"} {invitation?.timeText}</p>
        {guestGreeting && <p className="hero-guest-greeting">{guestGreeting}</p>}
      </div>

      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <span>{isEn ? "SCROLL" : "KAYDIR"}</span>
      </div>
    </section>
  );
}

export function CountdownSection({ copy, timeLeft }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  return (
    <section className="countdown-section">
      <p className="section-label">{isEn ? t('invitation.countdownLabel') : copy?.countdownLabel}</p>
      <h2>{isEn ? t('invitation.countdownTitle') : copy?.countdownTitle}</h2>
      <div className="countdown-grid">
        <div className="count-box countdown-animated"><strong>{timeLeft?.days || 0}</strong><span>{isEn ? "Days" : "Gün"}</span></div>
        <div className="count-box countdown-animated"><strong>{timeLeft?.hours || 0}</strong><span>{isEn ? "Hours" : "Saat"}</span></div>
        <div className="count-box countdown-animated"><strong>{timeLeft?.minutes || 0}</strong><span>{isEn ? "Mins" : "Dakika"}</span></div>
        <div className="count-box countdown-animated"><strong>{timeLeft?.seconds || 0}</strong><span>{isEn ? "Secs" : "Saniye"}</span></div>
      </div>
    </section>
  );
}

export function InvitationMessageSection({ copy, invitation }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  return (
    <section className="card invitation-card">
      <p className="section-label">{isEn ? t('invitation.invitationLabel') : copy?.invitationLabel}</p>
      <h2>{isEn ? t('invitation.invitationTitle') : copy?.invitationTitle}</h2>
      <p>{invitation?.message}</p>
    </section>
  );
}

export function FamilySection({ copy, familyInfo }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  return (
    <section className="card family-card">
      <p className="section-label">{isEn ? t('invitation.familyLabel') : copy?.familyLabel}</p>
      <h2>{isEn ? t('invitation.familyTitle') : copy?.familyTitle}</h2>
      <p>{familyInfo?.text}</p>
      <div className="family-grid">
        <div><span>{familyInfo?.brideFamilyTitle}</span><strong>{familyInfo?.brideFamilyName}</strong></div>
        <div><span>{familyInfo?.groomFamilyTitle}</span><strong>{familyInfo?.groomFamilyName}</strong></div>
      </div>
    </section>
  );
}

export function CeremonySection({ copy, eventDetails }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const events = Array.isArray(eventDetails) ? eventDetails : [];
  return (
    <section className="card ceremony-card">
      <p className="section-label">{isEn ? t('invitation.ceremonyLabel') : copy?.ceremonyLabel}</p>
      <h2>{isEn ? t('invitation.ceremonyTitle') : copy?.ceremonyTitle}</h2>
      <div className="ceremony-grid">
        {events.map((event, index) => (
          <div className="ceremony-item" key={`${event.label}-${index}`}>
            <span>{event.label}</span><strong>{event.time}</strong><p>{event.description}</p><em>{event.location}</em>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ScheduleSection({ copy, invitation, scheduleItems }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const items = Array.isArray(scheduleItems) ? scheduleItems : [];
  return (
    <section className="card schedule-card">
      <p className="section-label">{isEn ? t('invitation.scheduleLabel') : copy?.scheduleLabel}</p>
      <h2>{invitation?.dateText}</h2>
      <div className="schedule-list">
        {items.map((item, index) => (
          <div className="schedule-item" key={`${item.time}-${index}`}>
            <strong>{item.time}</strong><div><span>{item.title}</span><p>{item.description}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LocationSection({ copy, invitation, googleCalendarLink }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  return (
    <section className="card">
      <p className="section-label">{isEn ? t('invitation.locationLabel') : copy?.locationLabel}</p>
      <h2>{isEn ? t('invitation.locationTitle') : copy?.locationTitle}</h2>
      <div className="info-list">
        <div className="info-row"><span>{isEn ? "Date" : "Tarih"}</span><strong>{invitation?.dateText}</strong></div>
        <div className="info-row"><span>{isEn ? "Time" : "Saat"}</span><strong>{invitation?.timeText}</strong></div>
        <div className="info-row"><span>{isEn ? "Venue" : "Yer"}</span><strong>{invitation?.venue}</strong></div>
        <div className="info-row"><span>{isEn ? "Address" : "Adres"}</span><strong>{invitation?.address}</strong></div>
      </div>
      <div className="mini-map"><iframe title="Map" src={`https://maps.google.com/maps?q=${encodeURIComponent(`${invitation?.venue || ""} ${invitation?.address || ""}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"></iframe></div>
      <div className="button-group">
        <a className="main-button" href={invitation?.mapLink} target="_blank" rel="noreferrer">
          📍 {isEn ? "Go to Map" : "Konuma Git"}
        </a>
        <button type="button" className="secondary-button" onClick={() => handleAddToCalendar(invitation, googleCalendarLink)}>
          📅 {isEn ? "Add to Calendar" : "Takvime Ekle"}
        </button>
      </div>
    </section>
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
    <section className="card">
      <p className="section-label">{isEn ? t('invitation.galleryLabel') : copy?.galleryLabel}</p>
      <h2>{isEn ? t('invitation.galleryTitle') : copy?.galleryTitle}</h2>
      <div className="gallery-grid">
        {gallery.map((image, index) => (
          <img 
            key={`gallery-img-${index}`} 
            src={image} 
            alt={`Galeri ${index + 1}`} 
            loading="lazy" 
            onClick={() => openLightbox(index)}
            style={{ cursor: "pointer", transition: "transform 0.25s ease" }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          />
        ))}
      </div>

      {lightboxIndex !== null && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={closeLightbox}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)", zIndex: 2147483647,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)"
          }}
        >
          <button 
            type="button" 
            onClick={closeLightbox}
            title={isEn ? "Close (Esc)" : "Kapat (Esc)"}
            style={{
              position: "absolute", top: "20px", right: "20px",
              background: "rgba(255, 255, 255, 0.25)", border: "2px solid rgba(255, 255, 255, 0.7)", 
              color: "#fff", fontSize: "32px", width: "50px", height: "50px", borderRadius: "50%",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              lineHeight: 1, zIndex: 10, transition: "all 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.4)"}
            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)"}
          >
            &times;
          </button>

          {gallery.length > 1 && (
            <button 
              type="button" 
              onClick={prevImage}
              title={isEn ? "Previous (←)" : "Önceki (←)"}
              style={{
                position: "absolute", left: "20px", background: "rgba(255, 255, 255, 0.25)",
                border: "1.5px solid rgba(255, 255, 255, 0.5)", color: "#fff", fontSize: "24px", 
                width: "50px", height: "50px", borderRadius: "50%", cursor: "pointer", 
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.4)"}
              onMouseOut={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)"}
            >
              &#10094;
            </button>
          )}

          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "90vw", maxHeight: "85vh" }}
          >
            <img 
              src={gallery[lightboxIndex]} 
              alt="Büyütülmüş Fotoğraf" 
              style={{
                maxHeight: "78vh", maxWidth: "85vw", borderRadius: "16px",
                boxShadow: "0 25px 50px rgba(0,0,0,0.7)", objectFit: "contain"
              }}
            />
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px", marginTop: "14px", fontWeight: 700, fontFamily: "Playfair Display, serif", letterSpacing: "2px" }}>
              {lightboxIndex + 1} / {gallery.length}
            </span>
          </div>

          {gallery.length > 1 && (
            <button 
              type="button" 
              onClick={nextImage}
              title={isEn ? "Next (→)" : "Sonraki (→)"}
              style={{
                position: "absolute", right: "20px", background: "rgba(255, 255, 255, 0.25)",
                border: "1.5px solid rgba(255, 255, 255, 0.5)", color: "#fff", fontSize: "24px", 
                width: "50px", height: "50px", borderRadius: "50%", cursor: "pointer", 
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.4)"}
              onMouseOut={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)"}
            >
              &#10095;
            </button>
          )}
        </div>,
        document.body
      )}
    </section>
  );
}

export function ShareSection({ copy, qrImageUrl, shareText, copyInvitationLink }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  return (
    <section className="card">
      <p className="section-label">{isEn ? t('invitation.shareLabel') : copy?.shareLabel}</p>
      <h2>{isEn ? t('invitation.shareTitle') : copy?.shareTitle}</h2>
      <p>{isEn ? t('invitation.shareDescription') : copy?.shareDescription}</p>
      <div className="qr-public-card">
        <img src={qrImageUrl} alt="QR Code" loading="lazy" />
        <span>{isEn ? "Share quickly via QR code." : "QR kod ile hızlıca paylaşabilirsiniz."}</span>
      </div>
      <div className="button-group">
        <a className="main-button" href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer">{isEn ? "Share via WhatsApp" : "WhatsApp ile Paylaş"}</a>
        <button className="secondary-button" onClick={copyInvitationLink}>{isEn ? "Copy Link" : "Linki Kopyala"}</button>
      </div>
    </section>
  );
}

export function FooterSection({ coupleName, invitation, copy }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  return (
    <footer className="footer">
      <p>{coupleName}</p>
      <span>{invitation?.dateText}</span>
      <small>{isEn ? t('invitation.thanksText') : copy?.thanksText}</small>
      <small>{isEn ? t('invitation.footerSmall') : copy?.footerSmall}</small>
    </footer>
  );
}