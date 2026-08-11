import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { OptionGroup } from "../common/UIComponents";
import {
  NOTE_MAX_LENGTH,
  WISH_MAX_LENGTH,
  ATTENDANCE_OPTIONS
} from "../../config/constants";

function DeadlineBanner({ isEn, title, text }) {
  return (
    <div className="rsvp-deadline-banner">
      <div className="deadline-icon">⏳</div>
      <h3 className="deadline-title">{isEn ? title : (title || "Form Kapatıldı")}</h3>
      <p className="deadline-text">{isEn ? text : (text || "Form süresi dolmuştur.")}</p>
    </div>
  );
}

function DeclineModal({ isEn, copy, showIban, giftData, showDeclineGift, showDeclineModal, resetAndCloseModal, setShowDeclineGift, copyIban, copied, t, trickyDecline }) {
  const [runawayStyle, setRunawayStyle] = useState({});

  // Butonu kutudan tamamen koparıp tüm ekranda uçuran fonksiyon
  const handleRunaway = (e) => {
    if (trickyDecline) {
      // Ekranın mevcut genişlik ve yüksekliğini al (Taşmayı önlemek için)
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Butonun mevcut boyutlarını al (Yoksa varsayılan 160x50)
      const btnWidth = e.target.offsetWidth || 160;
      const btnHeight = e.target.offsetHeight || 50;

      // Ekran sınırları içinde kalacak rastgele X ve Y koordinatları üret
      const randomX = Math.max(20, Math.floor(Math.random() * (windowWidth - btnWidth - 40)));
      const randomY = Math.max(20, Math.floor(Math.random() * (windowHeight - btnHeight - 40)));

      // SİHİRLİ KISIM: Butonu "fixed" yaparak kutudan bağımsızlaştırıyoruz.
      // Artık transform yerine doğrudan left ve top değerleriyle hareket edecek.
      setRunawayStyle({
        position: "fixed", 
        left: `${randomX}px`,
        top: `${randomY}px`,
        margin: "0",
        width: `${btnWidth}px`, // Şeklinin bozulmaması için genişliği sabitliyoruz
        transition: "left 0.2s ease-out, top 0.2s ease-out", // Kayma animasyonu
        zIndex: 9999999, // Her şeyin en üstünde durmasını sağlar
      });
    }
  };

  const handleClose = () => {
    setRunawayStyle({});
    resetAndCloseModal();
  };

  if (!showDeclineModal) return null;

  return createPortal(
    <div onClick={handleClose} className="app-modal-backdrop">
      <div onClick={(e) => e.stopPropagation()} className="app-modal-card">
        <div className="app-modal-content">
          <h3>{isEn ? t('invitation.declineTitle') : (copy?.declineTitle || t('invitation.declineTitle'))}</h3>
          <p className="deadline-text modal-message">
            {isEn ? t('invitation.declineMessage') : (copy?.declineMessage || t('invitation.declineMessage'))}
          </p>
        </div>

        {!showDeclineGift ? (
          <div className="app-modal-actions">
            {/* 1. ŞAKACI BUTON (Tamam 👍) */}
            <button 
              type="button" 
              className="secondary-button app-modal-cancel" 
              onClick={(e) => {
                if (trickyDecline) {
                  e.preventDefault();
                  handleRunaway(e);
                } else {
                  handleClose();
                }
              }}
              onMouseEnter={handleRunaway}
              style={runawayStyle}
            >
              {t('ui.close')}
            </button>
            
            {showIban && giftData && (
              <button 
                type="button" 
                className="main-button" 
                onClick={() => { setShowDeclineGift(true); setRunawayStyle({}); }}
              >
                <span>{t('ui.sendGift')}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="app-modal-content">
            <div className="modal-gift-card">
              <strong className="modal-gift-receiver">{giftData.receiver}</strong>
              <span className="modal-gift-bank">{giftData.bankName}</span>
              <code className="modal-gift-iban">{giftData.iban}</code>
            </div>
            <div className="app-modal-actions">
              <button type="button" className="main-button" onClick={copyIban}>
                {copied ? t('ui.copied') : t('ui.copyIban')}
              </button>
              
              {/* 2. ŞAKACI BUTON (Kapat ❌) */}
              <button 
                type="button" 
                className="secondary-button app-modal-cancel" 
                onClick={(e) => {
                  if (trickyDecline) {
                    e.preventDefault();
                    handleRunaway(e);
                  } else {
                    handleClose();
                  }
                }}
                onMouseEnter={handleRunaway}
                style={runawayStyle}
              >
                {t('ui.closeBtn')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function RsvpSection({ copy, guestForm, handleGuestChange, updateAttendance, setGuestForm, submitGuest, invitation, rsvpWhatsappText, showIban, giftData, trickyDecline }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showDeclineGift, setShowDeclineGift] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [urlGuestName, setUrlGuestName] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const guestName = params.get("guest") || params.get("davetli") || "";

    if (guestName) {
      setUrlGuestName(guestName);
      setGuestForm((prev) => ({ ...prev, name: prev.name || guestName }));
    }
  }, [setGuestForm]);

  const deadline = invitation?.rsvpDeadline ? new Date(invitation.rsvpDeadline) : null;
  if (deadline && !Number.isNaN(deadline.getTime())) {
    deadline.setHours(23, 59, 59, 999);
  }
  const isDeadlinePassed = deadline && !Number.isNaN(deadline.getTime()) && new Date() > deadline;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const isDeclining = guestForm.attendance === "Katılamayacağım";
    const currentName = guestForm.name?.trim();

    await submitGuest(e);
    
    if (isDeclining && currentName && currentName.length > 0) {
      setShowDeclineModal(true);
    }
  };

  const resetAndCloseModal = () => {
    setShowDeclineModal(false);
    setTimeout(() => {
      setShowDeclineGift(false);
      setCopied(false);
    }, 300);
  };

  const copyIban = () => {
    if (giftData?.iban) {
      navigator.clipboard.writeText(giftData.iban);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const translatedAttendance = ATTENDANCE_OPTIONS.map(opt => ({ ...opt, label: isEn ? (opt.value === "Katılacağım" ? t('ui.attending') : t('ui.notAttending')) : opt.label }));

  return (
    <section className="card rsvp-card">
      <p className="section-label">{isEn ? t('invitation.rsvpLabel') : copy?.rsvpLabel}</p>
      <h2>{isEn ? t('invitation.rsvpTitle') : copy?.rsvpTitle}</h2>
      <p>{isEn ? t('invitation.rsvpText') : copy?.rsvpText}</p>
      
      {isDeadlinePassed ? (
        <DeadlineBanner isEn={isEn} title={t('invitation.deadlineTitle')} text={t('invitation.deadlineText')} />
      ) : (
          <form className="rsvp-form" onSubmit={handleFormSubmit} noValidate>
            {urlGuestName && (
            <div className="guest-badge-banner">
              {t('ui.prefilled', { name: urlGuestName })}
            </div>
          )}

          <input name="name" value={guestForm.name || ""} onChange={handleGuestChange} placeholder={t('form.namePlaceholder')} required />

          <OptionGroup onChange={updateAttendance} options={translatedAttendance} value={guestForm.attendance} />

          <div className="field-with-counter">
            <textarea name="note" value={guestForm.note || ""} onChange={handleGuestChange} placeholder={t('form.notePlaceholder')} maxLength={NOTE_MAX_LENGTH}></textarea>
            <span>{(guestForm.note || "").length}/{NOTE_MAX_LENGTH}</span>
          </div>
          <button type="submit" className="main-button form-button">{t('form.submitRsvp')}</button>
        </form>
      )}

      <div className="rsvp-actions">
        <a className="secondary-button rsvp-whatsapp-button" href={`https://wa.me/${invitation?.whatsappNumber?.replace(/\D/g, "")}?text=${rsvpWhatsappText}`} target="_blank" rel="noreferrer">
          {t('form.whatsappRsvp')}
        </a>
      </div>

    <DeclineModal isEn={isEn} copy={copy} showIban={showIban} giftData={giftData} showDeclineGift={showDeclineGift} showDeclineModal={showDeclineModal} resetAndCloseModal={resetAndCloseModal} setShowDeclineGift={setShowDeclineGift} copyIban={copyIban} copied={copied} t={t} trickyDecline={trickyDecline} />    </section>
  );
}

export function GuestsListSection({ copy, guests }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const guestList = Array.isArray(guests) ? guests : [];
  
  const attendingCount = guestList.filter(g => g.attendance === "Katılacağım").length;
  const notAttendingCount = guestList.filter(g => g.attendance === "Katılamayacağım").length;

  return (
    <section className="card">
      <p className="section-label">{isEn ? t('invitation.guestsLabel') : copy?.guestsLabel}</p>
      <h2>{isEn ? t('invitation.guestsTitle') : copy?.guestsTitle}</h2>
      
      <div className="guest-stats">
        <div><strong>{guestList.length}</strong><span>{t('ui.totalResponses')}</span></div>
        <div><strong>{attendingCount}</strong><span>{t('ui.attending')}</span></div>
        <div><strong>{notAttendingCount}</strong><span>{t('ui.notAttending')}</span></div>
      </div>
      
      <div className="private-note-card">
        <p className="private-note-text">
          🔒 {t('ui.privateNote')}
        </p>
      </div>
    </section>
  );
}

export function WishesSection({ copy, wishForm, handleWishChange, submitWish, approvedWishes }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const wishes = Array.isArray(approvedWishes) ? approvedWishes : [];

  return (
    <section className="card">
      <p className="section-label">{isEn ? t('invitation.wishesLabel') : copy?.wishesLabel}</p>
      <h2>{isEn ? t('invitation.wishesTitle') : copy?.wishesTitle}</h2>
      <form className="wish-form" onSubmit={submitWish} noValidate>
        <input name="name" value={wishForm.name} onChange={handleWishChange} placeholder={t('form.namePlaceholder')} />
        <div className="field-with-counter">
          <textarea name="message" value={wishForm.message} onChange={handleWishChange} placeholder={t('form.messagePlaceholder')} maxLength={WISH_MAX_LENGTH}></textarea>
          <span>{wishForm.message.length}/{WISH_MAX_LENGTH}</span>
        </div>
        <button type="submit" className="main-button form-button">{t('form.submitWish')}</button>
      </form>
      <div className="wish-list">
        {wishes.length === 0 ? (
          <p className="empty-text">{t('ui.noWishes')}</p>
        ) : (
          wishes.slice(0, 4).map((wish) => (
            <div className="wish-item" key={wish.id}>
              <p>"{wish.message}"</p>
              <strong>{wish.name}</strong>
            </div>
          ))
        )}
      </div>
    </section>
  );
}