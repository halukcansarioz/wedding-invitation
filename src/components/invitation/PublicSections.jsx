import React from "react";

export function HeroSection({ invitation, copy, guestGreeting }) {
  return (
    <section className="hero-section">
      {invitation.heroVideo ? (
        <video
          key={invitation.heroVideo} 
          className="hero-video-bg"
          autoPlay
          loop
          muted
          playsInline
          poster={invitation.heroVideo ? "" : invitation.heroImage} 
        >
          <source src={invitation.heroVideo} type="video/mp4" />
        </video>
      ) : null}

      <div className="hero-content">
        <p className="small-title">{copy.heroLabel}</p>
        <h1 className="couple-title">
          <span>{invitation.bride}</span>
          <em>&</em>
          <span>{invitation.groom}</span>
        </h1>
        <p className="hero-date">{invitation.dateText}</p>
        <p className="hero-time">Saat {invitation.timeText}</p>
        {guestGreeting && <p className="hero-guest-greeting">{guestGreeting}</p>}
      </div>
    </section>
  );
}

export function CountdownSection({ copy, timeLeft }) {
  return (
    <section className="countdown-section">
      <p className="section-label">{copy.countdownLabel}</p>
      <h2>{copy.countdownTitle}</h2>
      <div className="countdown-grid">
        <div className="count-box countdown-animated"><strong>{timeLeft.days}</strong><span>Gün</span></div>
        <div className="count-box countdown-animated"><strong>{timeLeft.hours}</strong><span>Saat</span></div>
        <div className="count-box countdown-animated"><strong>{timeLeft.minutes}</strong><span>Dakika</span></div>
        <div className="count-box countdown-animated"><strong>{timeLeft.seconds}</strong><span>Saniye</span></div>
      </div>
    </section>
  );
}

export function InvitationMessageSection({ copy, invitation }) {
  return (
    <section className="card invitation-card">
      <p className="section-label">{copy.invitationLabel}</p>
      <h2>{copy.invitationTitle}</h2>
      <p>{invitation.message}</p>
    </section>
  );
}

export function FamilySection({ copy, familyInfo }) {
  return (
    <section className="card family-card">
      <p className="section-label">{copy.familyLabel}</p>
      <h2>{copy.familyTitle}</h2>
      <p>{familyInfo.text}</p>
      <div className="family-grid">
        <div>
          <span>{familyInfo.brideFamilyTitle}</span>
          <strong>{familyInfo.brideFamilyName}</strong>
        </div>
        <div>
          <span>{familyInfo.groomFamilyTitle}</span>
          <strong>{familyInfo.groomFamilyName}</strong>
        </div>
      </div>
    </section>
  );
}

export function CeremonySection({ copy, eventDetails }) {
  return (
    <section className="card ceremony-card">
      <p className="section-label">{copy.ceremonyLabel}</p>
      <h2>{copy.ceremonyTitle}</h2>
      <div className="ceremony-grid">
        {eventDetails.map((event, index) => (
          <div className="ceremony-item" key={`${event.label}-${index}`}>
            <span>{event.label}</span>
            <strong>{event.time}</strong>
            <p>{event.description}</p>
            <em>{event.location}</em>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ScheduleSection({ copy, invitation, scheduleItems }) {
  return (
    <section className="card schedule-card">
      <p className="section-label">{copy.scheduleLabel}</p>
      <h2>{invitation.dateText}</h2>
      <div className="schedule-list">
        {scheduleItems.map((item, index) => (
          <div className="schedule-item" key={`${item.time}-${index}`}>
            <strong>{item.time}</strong>
            <div>
              <span>{item.title}</span>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LocationSection({ copy, invitation, googleCalendarLink }) {
  return (
    <section className="card">
      <p className="section-label">{copy.locationLabel}</p>
      <h2>{copy.locationTitle}</h2>
      <div className="info-list">
        <div className="info-row"><span>Tarih</span><strong>{invitation.dateText}</strong></div>
        <div className="info-row"><span>Saat</span><strong>{invitation.timeText}</strong></div>
        <div className="info-row"><span>Yer</span><strong>{invitation.venue}</strong></div>
        <div className="info-row"><span>Adres</span><strong>{invitation.address}</strong></div>
      </div>
      <div className="mini-map">
        <iframe
          title="Düğün Konumu"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(`${invitation.venue} ${invitation.address}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      <div className="button-group">
        <a className="main-button" href={invitation.mapLink} target="_blank" rel="noreferrer">Konuma Git</a>
        <a className="secondary-button" href={googleCalendarLink} target="_blank" rel="noreferrer">Takvime Ekle</a>
      </div>
    </section>
  );
}

export function GallerySection({ copy, invitation }) {
  return (
    <section className="card">
      <p className="section-label">{copy.galleryLabel}</p>
      <h2>{copy.galleryTitle}</h2>
      <div className="gallery-grid">
        {invitation.gallery.map((image, index) => (
          <img key={`gallery-img-${index}`} src={image} alt={`Galeri ${index + 1}`} loading="lazy" />
        ))}
      </div>
    </section>
  );
}

export function ShareSection({ copy, qrImageUrl, shareText, copyInvitationLink }) {
  return (
    <section className="card">
      <p className="section-label">{copy.shareLabel}</p>
      <h2>{copy.shareTitle}</h2>
      <p>{copy.shareDescription}</p>
      <div className="qr-public-card">
        <img src={qrImageUrl} alt="Davetiye QR kodu" loading="lazy" />
        <span>QR kod ile hızlıca paylaşabilirsiniz.</span>
      </div>
      <div className="button-group">
        <a className="main-button" href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer">WhatsApp ile Paylaş</a>
        <button className="secondary-button" onClick={copyInvitationLink}>Linki Kopyala</button>
      </div>
    </section>
  );
}

export function FooterSection({ coupleName, invitation, copy }) {
  return (
    <footer className="footer">
      <p>{coupleName}</p>
      <span>{invitation.dateText}</span>
      <small>{copy.thanksText}</small>
      <small>{copy.footerSmall}</small>
    </footer>
  );
}