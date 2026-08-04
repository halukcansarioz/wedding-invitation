import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { OptionGroup } from "../common/UIComponents";
import { getGuestNameFromUrl } from "../../utils/helpers";
import {
  NOTE_MAX_LENGTH,
  WISH_MAX_LENGTH,
  ATTENDANCE_OPTIONS,
  PERSON_COUNT_OPTIONS,
  SIDE_OPTIONS,
  CHILD_OPTIONS,
  DEFAULT_SITE_DATA
} from "../../config/constants";

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
        <div style={{ margin: "32px auto 0", padding: "34px 24px", background: "var(--theme-surface-soft, #fff7f9)", border: "1.5px dashed var(--amp-color)", borderRadius: "24px", maxWidth: "620px", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>⏳</div>
          <h3 style={{ color: "var(--amp-color)", margin: "0 0 10px", fontFamily: "Playfair Display, serif", fontSize: "24px", fontWeight: "800" }}>
            {isEn ? t('invitation.deadlineTitle') : (copy?.deadlineTitle || "Form Kapatıldı")}
          </h3>
          <p style={{ fontSize: "16px", lineHeight: "1.7", color: "var(--theme-text-main)", margin: "0 auto", fontFamily: "Playfair Display, serif", fontWeight: "600", maxWidth: "520px" }}>
            {isEn ? t('invitation.deadlineText') : (copy?.deadlineText || "Form süresi dolmuştur.")}
          </p>
        </div>
      ) : (
        <form className="rsvp-form" onSubmit={handleFormSubmit}>
          {urlGuestName && (
            <div style={{ background: "color-mix(in srgb, var(--amp-color) 8%, transparent)", border: "1px dashed color-mix(in srgb, var(--amp-color) 35%, transparent)", padding: "12px 18px", borderRadius: "16px", color: "var(--amp-color)", fontSize: "15px", fontWeight: "700", textAlign: "center", marginBottom: "8px", fontFamily: "Playfair Display, serif" }}>
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

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '18px' }}>
        <a className="secondary-button" style={{ minWidth: "220px", margin: 0 }} href={`https://wa.me/${invitation?.whatsappNumber?.replace(/\D/g, "")}?text=${rsvpWhatsappText}`} target="_blank" rel="noreferrer">
          {isEn ? t('form.whatsappRsvp') : "WhatsApp ile Bildir"}
        </a>
      </div>

      {showDeclineModal && typeof document !== 'undefined' && createPortal(
        <div onClick={resetAndCloseModal} style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 2147483647, backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "var(--theme-surface)", borderRadius: "24px", width: "90%", maxWidth: "450px", textAlign: "center", padding: "clamp(24px, 6vw, 40px) clamp(16px, 5vw, 24px)", border: "2px solid var(--amp-color)", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
            
            <div style={{ fontSize: "clamp(36px, 8vw, 48px)", marginBottom: "20px", lineHeight: "1" }}>💌</div>
            
            <h3 style={{ color: "var(--amp-color)", margin: "0 0 12px", fontFamily: "Playfair Display, serif", fontSize: "clamp(20px, 5vw, 24px)", fontWeight: "800" }}>
              {isEn ? "We'll Miss You!" : copy?.declineTitle || "Çok Üzüldük!"}
            </h3>
            <p style={{ fontSize: "clamp(14px, 3.5vw, 16px)", lineHeight: "1.6", color: "var(--theme-text-main)", marginBottom: "24px", fontFamily: "Playfair Display, serif", fontWeight: "600" }}>
              {isEn ? "We are sad that you won't be able to make it to our wedding. You can still leave us a sweet note in our Guestbook." : "Düğünümüzde aramızda olamayacağınız için üzgünüz. Güzel dileklerinizi Anı Defteri üzerinden bizimle paylaşabilirsiniz."}
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
              {!showDeclineGift ? (
                <>
                  <button type="button" className="secondary-button" onClick={resetAndCloseModal} style={{ margin: 0, width: "100%", padding: "12px", fontSize: "clamp(14px, 3.5vw, 15px)" }}>
                    {isEn ? "Close" : "Tamam"}
                  </button>
                  {showIban && giftData && (
                    <button 
                      type="button" 
                      className="main-button" 
                      onClick={() => setShowDeclineGift(true)} 
                      style={{ 
                        margin: 0, 
                        width: "100%", 
                        padding: "12px", 
                        fontSize: "clamp(14px, 3.5vw, 15px)",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        gap: "8px"
                      }}
                    >
                      <span style={{ fontSize: "18px", lineHeight: "1" }}>🎁</span>
                      <span>{isEn ? "Would you like to send a gift?" : "Hediye Göndermek İster misiniz?"}</span>
                    </button>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center", animation: "adminFadeUp 0.4s ease", width: "100%" }}>
                  <div style={{ backgroundColor: "var(--theme-surface-soft)", padding: "16px", borderRadius: "16px", border: "1.5px dashed color-mix(in srgb, var(--amp-color) 60%, transparent)", marginBottom: "16px" }}>
                    <strong style={{ display: "block", fontSize: "clamp(16px, 4vw, 18px)", color: "var(--amp-color)", fontFamily: "Playfair Display, serif" }}>
                      {giftData.receiver}
                    </strong>
                    <span style={{ display: "block", fontSize: "clamp(13px, 3.5vw, 15px)", color: "var(--theme-text-muted)", margin: "4px 0 12px", fontFamily: "Playfair Display, serif" }}>
                      {giftData.bankName}
                    </span>
                    <code style={{ display: "block", fontSize: "clamp(12px, 3.5vw, 15px)", wordBreak: "break-all", backgroundColor: "var(--theme-surface)", padding: "10px", borderRadius: "8px", border: "1px solid color-mix(in srgb, var(--amp-color) 30%, transparent)", color: "var(--theme-text-main)", fontFamily: "monospace" }}>
                      {giftData.iban}
                    </code>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                    <button type="button" className="main-button" onClick={copyIban} style={{ margin: 0, width: "100%", padding: "12px", fontSize: "clamp(14px, 3.5vw, 15px)" }}>
                      {copied ? (isEn ? "Copied! ✓" : "Kopyalandı ✓") : (isEn ? "Copy IBAN" : "IBAN'ı Kopyala")}
                    </button>
                    <button type="button" className="secondary-button" onClick={resetAndCloseModal} style={{ margin: 0, width: "100%", padding: "12px", fontSize: "clamp(14px, 3.5vw, 15px)" }}>
                      {isEn ? "Close" : "Kapat"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>,
        document.body
      )}
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
      
      <div className="guest-stats" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div><strong>{guestList.length}</strong><span>{isEn ? "Total Responses" : "Toplam Yanıt"}</span></div>
        <div><strong>{attendingCount}</strong><span>{isEn ? "Attending" : "Katılacak"}</span></div>
        <div><strong>{notAttendingCount}</strong><span>{isEn ? "Not Attending" : "Katılmayacak"}</span></div>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", marginTop: "24px", padding: "22px 18px", background: "var(--paper-soft)", borderRadius: "16px", border: "1px dashed var(--border)", minHeight: "80px" }}>
        <p style={{ margin: 0, fontSize: "15px", lineHeight: "1.6", color: "var(--text-soft)", fontStyle: "italic", width: "100%" }}>
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