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

function DeclineModal({ isEn, copy, showIban, giftData, showDeclineGift, showDeclineModal, resetAndCloseModal, setShowDeclineGift, copyIban, copied }) {
  if (!showDeclineModal) return null;

  return createPortal(
    <div onClick={resetAndCloseModal} className="app-modal-backdrop">
      <div onClick={(e) => e.stopPropagation()} className="app-modal-card">
        <div className="app-modal-icon">💌</div>
        <div className="app-modal-content">
          <h3>{isEn ? "We'll Miss You!" : copy?.declineTitle || "Çok Üzüldük!"}</h3>
          <p className="deadline-text modal-message">
            {isEn ? "We are sad that you won't be able to make it to our wedding. You can still leave us a sweet note in our Guestbook." : "Düğünümüzde aramızda olamayacağınız için üzgünüz. Güzel dileklerinizi Anı Defteri üzerinden bizimle paylaşabilirsiniz."}
          </p>
        </div>

        {!showDeclineGift ? (
          <div className="app-modal-actions">
            <button type="button" className="secondary-button app-modal-cancel" onClick={resetAndCloseModal}>
              {isEn ? "Close" : "Tamam"}
            </button>
            {showIban && giftData && (
              <button type="button" className="main-button" onClick={() => setShowDeclineGift(true)}>
                <span className="modal-button-icon">🎁</span>
                <span>{isEn ? "Would you like to send a gift?" : "Hediye Göndermek İster misiniz?"}</span>
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
                {copied ? (isEn ? "Copied! ✓" : "Kopyalandı ✓") : (isEn ? "Copy IBAN" : "IBAN'ı Kopyala")}
              </button>
              <button type="button" className="secondary-button app-modal-cancel" onClick={resetAndCloseModal}>
                {isEn ? "Close" : "Kapat"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function RsvpSection({ copy, guestForm, handleGuestChange, updateAttendance, setGuestForm, submitGuest, invitation, rsvpWhatsappText, showIban, giftData }) {
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

  const translatedAttendance = ATTENDANCE_OPTIONS.map(opt => ({ ...opt, label: isEn ? (opt.value === "Katılacağım" ? "Attending" : "Not Attending") : opt.label }));

  return (
    <section className="card rsvp-card">
      <p className="section-label">{isEn ? t('invitation.rsvpLabel') : copy?.rsvpLabel}</p>
      <h2>{isEn ? t('invitation.rsvpTitle') : copy?.rsvpTitle}</h2>
      <p>{isEn ? t('invitation.rsvpText') : copy?.rsvpText}</p>
      
      {isDeadlinePassed ? (
        <DeadlineBanner isEn={isEn} title={t('invitation.deadlineTitle')} text={t('invitation.deadlineText')} />
      ) : (
        <form className="rsvp-form" onSubmit={handleFormSubmit}>
          {urlGuestName && (
            <div className="guest-badge-banner">
              ✨ {isEn ? `Dear ${urlGuestName}, this form is pre-filled for you.` : `Sevgili ${urlGuestName}, form senin için otomatik dolduruldu.`}
            </div>
          )}

          <input name="name" value={guestForm.name || ""} onChange={handleGuestChange} placeholder={isEn ? t('form.namePlaceholder') : "Ad Soyad"} required />

          <OptionGroup onChange={updateAttendance} options={translatedAttendance} value={guestForm.attendance} />

          <div className="field-with-counter">
            <textarea name="note" value={guestForm.note || ""} onChange={handleGuestChange} placeholder={isEn ? t('form.notePlaceholder') : "Notunuz"} maxLength={NOTE_MAX_LENGTH}></textarea>
            <span>{(guestForm.note || "").length}/{NOTE_MAX_LENGTH}</span>
          </div>
          <button type="submit" className="main-button form-button">{isEn ? t('form.submitRsvp') : "Gönder"}</button>
        </form>
      )}

      <div className="rsvp-actions">
        <a className="secondary-button rsvp-whatsapp-button" href={`https://wa.me/${invitation?.whatsappNumber?.replace(/\D/g, "")}?text=${rsvpWhatsappText}`} target="_blank" rel="noreferrer">
          {isEn ? t('form.whatsappRsvp') : "WhatsApp ile Bildir"}
        </a>
      </div>

      <DeclineModal isEn={isEn} copy={copy} showIban={showIban} giftData={giftData} showDeclineGift={showDeclineGift} showDeclineModal={showDeclineModal} resetAndCloseModal={resetAndCloseModal} setShowDeclineGift={setShowDeclineGift} copyIban={copyIban} copied={copied} />
    </section>
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
        <div><strong>{guestList.length}</strong><span>{isEn ? "Total Responses" : "Toplam Yanıt"}</span></div>
        <div><strong>{attendingCount}</strong><span>{isEn ? "Attending" : "Katılacak"}</span></div>
        <div><strong>{notAttendingCount}</strong><span>{isEn ? "Not Attending" : "Katılmayacak"}</span></div>
      </div>
      
      <div className="private-note-card">
        <p className="private-note-text">
          🔒 {isEn ? "Guest list and RSVP details are kept private and can only be viewed by the bride and groom." : "Misafir listesi ve katılım detayları gizlilik amacıyla sadece gelin ve damat tarafından görülmektedir."}
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
      <form className="wish-form" onSubmit={submitWish}>
        <input name="name" value={wishForm.name} onChange={handleWishChange} placeholder={isEn ? t('form.namePlaceholder') : "Ad Soyad"} />
        <div className="field-with-counter">
          <textarea name="message" value={wishForm.message} onChange={handleWishChange} placeholder={isEn ? t('form.messagePlaceholder') : "Mesajınız"} maxLength={WISH_MAX_LENGTH}></textarea>
          <span>{wishForm.message.length}/{WISH_MAX_LENGTH}</span>
        </div>
        <button type="submit" className="main-button form-button">{isEn ? t('form.submitWish') : "Mesajı Gönder"}</button>
      </form>
      <div className="wish-list">
        {wishes.length === 0 ? (
          <p className="empty-text">{isEn ? "No wishes yet." : "Henüz güzel dilek yok."}</p>
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