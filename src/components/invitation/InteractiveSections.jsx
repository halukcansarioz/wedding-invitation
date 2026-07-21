import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { OptionGroup } from "../common/UIComponents";
import {
  NOTE_MAX_LENGTH,
  WISH_MAX_LENGTH,
  ATTENDANCE_OPTIONS,
  PERSON_COUNT_OPTIONS,
  SIDE_OPTIONS,
  CHILD_OPTIONS,
  DEFAULT_SITE_DATA
} from "../../config/constants";

export function RsvpSection({ copy, guestForm, handleGuestChange, updateAttendance, setGuestForm, isAttending, submitGuest, invitation, rsvpWhatsappText }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const giftData = DEFAULT_SITE_DATA.giftRegistry;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const isDeclining = guestForm.attendance === "Katılamayacağım";
    await submitGuest(e);
    if (isDeclining && guestForm.name.trim()) {
      setShowDeclineModal(true);
    }
  };

  const copyIban = () => {
    navigator.clipboard.writeText(giftData.iban);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const translatedAttendance = ATTENDANCE_OPTIONS.map(opt => ({ ...opt, label: isEn ? (opt.value === "Katılacağım" ? "Attending" : "Not Attending") : opt.label }));
  const translatedPerson = PERSON_COUNT_OPTIONS.map(opt => ({ ...opt, label: isEn ? opt.label.replace('Kişi', 'Person').replace('2 Person', '2 People').replace('3 Person', '3 People').replace('4 Person', '4 People') : opt.label }));
  const translatedSide = SIDE_OPTIONS.map(opt => ({ ...opt, label: isEn ? (opt.value === "Gelin Tarafı" ? "Bride's Side" : opt.value === "Damat Tarafı" ? "Groom's Side" : "Mutual") : opt.label }));
  const translatedChild = CHILD_OPTIONS.map(opt => ({ ...opt, label: isEn ? (opt.value === "Hayır" ? "No Children" : "With Children") : opt.label }));

  return (
    <section className="card rsvp-card">
      <p className="section-label">{isEn ? t('invitation.rsvpLabel') : copy.rsvpLabel}</p>
      <h2>{isEn ? t('invitation.rsvpTitle') : copy.rsvpTitle}</h2>
      <p>{isEn ? t('invitation.rsvpText') : copy.rsvpText}</p>
      
      <form className="rsvp-form" onSubmit={handleFormSubmit}>
        <input name="name" value={guestForm.name} onChange={handleGuestChange} placeholder={isEn ? t('form.namePlaceholder') : "Ad Soyad"} />
        <input name="phone" type="tel" value={guestForm.phone} onChange={handleGuestChange} placeholder={isEn ? t('form.phonePlaceholder') : "Telefon Numaranız"} maxLength="20" />

        <OptionGroup onChange={updateAttendance} options={translatedAttendance} value={guestForm.attendance} />
        <OptionGroup disabled={!isAttending} onChange={(personCount) => setGuestForm((prev) => ({ ...prev, personCount }))} options={translatedPerson} value={guestForm.personCount} />
        <OptionGroup disabled={!isAttending} onChange={(side) => setGuestForm((prev) => ({ ...prev, side }))} options={translatedSide} value={guestForm.side} />
        <OptionGroup disabled={!isAttending} onChange={(hasChild) => setGuestForm((prev) => ({ ...prev, hasChild }))} options={translatedChild} value={guestForm.hasChild} />

        <div className="field-with-counter">
          <textarea name="note" value={guestForm.note} onChange={handleGuestChange} placeholder={isEn ? t('form.notePlaceholder') : "Notunuz"} maxLength={NOTE_MAX_LENGTH}></textarea>
          <span>{guestForm.note.length}/{NOTE_MAX_LENGTH}</span>
        </div>
        <button type="submit" className="main-button form-button">{isEn ? t('form.submitRsvp') : "Katılımı Gönder"}</button>
      </form>

      <div className="button-group" style={{ marginTop: "20px" }}>
        <a className="secondary-button whatsapp-button" style={{ margin: 0 }} href={`https://wa.me/${invitation.whatsappNumber?.replace(/\D/g, "")}?text=${rsvpWhatsappText}`} target="_blank" rel="noreferrer">
          {isEn ? t('form.whatsappRsvp') : "WhatsApp ile Bildir"}
        </a>
        <button type="button" className="secondary-button" style={{ margin: 0 }} onClick={() => setShowGiftModal(true)}>
          🎁 {isEn ? "Gift & Registry" : copy.giftButton || "Hediye & Takı Gönder"}
        </button>
      </div>

      {/* IBAN ve Takı Modal Ekranı */}
      {showGiftModal && (
        <div className="app-modal-backdrop" onClick={() => setShowGiftModal(false)}>
          <div className="app-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: "480px", textAlign: "center", padding: "34px 28px" }}>
            <h3 style={{ color: "var(--rose-dark)", marginBottom: "12px", fontFamily: "Playfair Display, serif", fontSize: "24px" }}>
              {isEn ? "Gift & Registry" : giftData.title}
            </h3>
            <p style={{ fontSize: "16px", lineHeight: "1.6", color: "var(--text)", marginBottom: "20px" }}>
              {isEn ? "For those who wish to send a gift or contribute to our new life together:" : giftData.description}
            </p>
            <div style={{ background: "var(--paper-soft)", padding: "16px", borderRadius: "16px", border: "1px solid var(--border)", marginBottom: "20px" }}>
              <strong style={{ display: "block", fontSize: "18px", color: "var(--rose-deep)" }}>{giftData.receiver}</strong>
              <span style={{ display: "block", fontSize: "14px", color: "var(--text-soft)", margin: "4px 0 10px" }}>{giftData.bankName}</span>
              <code style={{ display: "block", fontSize: "16px", wordBreak: "break-all", background: "#fff", padding: "10px", borderRadius: "8px", border: "1px dashed var(--rose)" }}>
                {giftData.iban}
              </code>
            </div>
            <div className="app-modal-actions" style={{ justifyContent: "center" }}>
              <button type="button" className="main-button" onClick={copyIban}>
                {copied ? (isEn ? "Copied!" : "IBAN Kopyalandı ✓") : (isEn ? "Copy IBAN" : "IBAN'ı Kopyala")}
              </button>
              <button type="button" className="secondary-button" onClick={() => setShowGiftModal(false)}>
                {isEn ? "Close" : "Kapat"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Katılamayacağım diyenler için Özel Üzüntü Modalı */}
      {showDeclineModal && (
        <div className="app-modal-backdrop" onClick={() => setShowDeclineModal(false)}>
          <div className="app-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: "450px", textAlign: "center", padding: "34px 28px" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>💌</div>
            <h3 style={{ color: "var(--rose-dark)", marginBottom: "12px", fontFamily: "Playfair Display, serif", fontSize: "24px" }}>
              {isEn ? "We'll Miss You!" : copy.declineTitle || "Çok Üzüldük!"}
            </h3>
            <p style={{ fontSize: "16px", lineHeight: "1.6", color: "var(--text)", marginBottom: "24px" }}>
              {isEn ? "We are sad that you won't be able to make it to our wedding. You can still leave us a sweet note in our Guestbook or send a gift via our registry screen." : copy.declineMessage}
            </p>
            <div className="app-modal-actions" style={{ justifyContent: "center" }}>
              <button type="button" className="main-button" onClick={() => { setShowDeclineModal(false); setShowGiftModal(true); }}>
                🎁 {isEn ? "View Registry" : "Hediye Ekranını Aç"}
              </button>
              <button type="button" className="secondary-button" onClick={() => setShowDeclineModal(false)}>
                {isEn ? "Close" : "Tamam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function GuestsListSection({ copy, guests, totalPersonCount, notAttendingCount }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');

  return (
    <section className="card">
      <p className="section-label">{isEn ? t('invitation.guestsLabel') : copy.guestsLabel}</p>
      <h2>{isEn ? t('invitation.guestsTitle') : copy.guestsTitle}</h2>
      <div className="guest-stats">
        <div><strong>{guests.length}</strong><span>{isEn ? "Total Responses" : "Toplam Yanıt"}</span></div>
        <div><strong>{totalPersonCount}</strong><span>{isEn ? "Attending" : "Katılacak Kişi"}</span></div>
        <div><strong>{notAttendingCount}</strong><span>{isEn ? "Not Attending" : "Katılamayacak"}</span></div>
      </div>
      <div className="guest-list">
        {guests.length === 0 ? (
          <p className="empty-text">{isEn ? "No responses yet." : "Henüz katılım bildirimi yok."}</p>
        ) : (
          guests.slice(0, 6).map((guest) => (
            <div className="guest-item" key={guest.id}>
              <div>
                <strong>{guest.name}</strong>
                <span>{isEn ? (guest.side === "Gelin Tarafı" ? "Bride's Side" : guest.side === "Damat Tarafı" ? "Groom's Side" : "Mutual") : guest.side} · {guest.personCount} {isEn ? (guest.personCount === "1" ? "Person" : "People") : "kişi"} · {isEn ? "Children" : "Çocuk"}: {isEn ? (guest.hasChild === "Evet" ? "Yes" : "No") : (guest.hasChild || "Hayır")}</span>
                {guest.phone && <small>{guest.phone}</small>}
              </div>
              <em>{isEn ? (guest.attendance === "Katılacağım" ? "Attending" : "Not Attending") : guest.attendance}</em>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function WishesSection({ copy, wishForm, handleWishChange, submitWish, approvedWishes }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');

  return (
    <section className="card">
      <p className="section-label">{isEn ? t('invitation.wishesLabel') : copy.wishesLabel}</p>
      <h2>{isEn ? t('invitation.wishesTitle') : copy.wishesTitle}</h2>
      <form className="wish-form" onSubmit={submitWish}>
        <input name="name" value={wishForm.name} onChange={handleWishChange} placeholder={isEn ? t('form.namePlaceholder') : "Ad Soyad"} />
        <div className="field-with-counter">
          <textarea name="message" value={wishForm.message} onChange={handleWishChange} placeholder={isEn ? t('form.messagePlaceholder') : "Mesajınız"} maxLength={WISH_MAX_LENGTH}></textarea>
          <span>{wishForm.message.length}/{WISH_MAX_LENGTH}</span>
        </div>
        <button type="submit" className="main-button form-button">{isEn ? t('form.submitWish') : "Mesajı Gönder"}</button>
      </form>
      <div className="wish-list">
        {approvedWishes.length === 0 ? (
          <p className="empty-text">{isEn ? "No wishes yet." : "Henüz güzel dilek yok."}</p>
        ) : (
          approvedWishes.slice(0, 4).map((wish) => (
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