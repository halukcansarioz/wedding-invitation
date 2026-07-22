import React, { useState } from "react";
import { createPortal } from "react-dom";
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

  // LCV Tarihinin Geçip Geçmediğini Kontrol Ediyoruz
  const deadline = invitation.rsvpDeadline ? new Date(invitation.rsvpDeadline) : null;
  const isDeadlinePassed = deadline && !Number.isNaN(deadline.getTime()) && new Date() > deadline;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const isDeclining = guestForm.attendance === "Katılamayacağım";
    const currentName = guestForm.name.trim();

    await submitGuest(e);
    
    // Sadece "Katılamayacağım" seçildiyse VE isim boş değilse bu pop-up çıkar
    if (isDeclining && currentName.length > 0) {
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
      
      {/* TARİH GEÇTİYSE KİLİT KARTI, GEÇMEDİYSE NORMAL FORM GÖSTERİLİR */}
      {isDeadlinePassed ? (
        <div style={{
          margin: "32px auto 0",
          padding: "34px 24px",
          background: "var(--paper-soft, #fff7f9)",
          border: "1.5px dashed var(--rose-dark, #9f4f68)",
          borderRadius: "24px",
          maxWidth: "620px",
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.03)"
        }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>⏳</div>
          <h3 style={{ color: "var(--rose-dark, #9f4f68)", margin: "0 0 10px", fontFamily: "Playfair Display, serif", fontSize: "24px", fontWeight: "800" }}>
            {isEn ? t('invitation.deadlineTitle') : (copy.deadlineTitle || "LCV Bildirim Süresi Doldu")}
          </h3>
          
          {/* TARİHİ ÇOK ŞIK BİR ROZET İÇİNDE GÖSTERİYORUZ */}
          <span style={{ display: "inline-block", padding: "6px 16px", background: "rgba(159, 79, 104, 0.12)", border: "1px solid rgba(159, 79, 104, 0.3)", borderRadius: "999px", color: "var(--rose-dark, #9f4f68)", fontWeight: "800", fontSize: "14px", marginBottom: "18px", fontFamily: "Playfair Display, serif", letterSpacing: "1px" }}>
            📅 {isEn ? "Deadline:" : "Son Tarih:"} {invitation.rsvpDeadline}
          </span>

          <p style={{ fontSize: "16px", lineHeight: "1.7", color: "var(--text, #55303b)", margin: "0 auto", fontFamily: "Playfair Display, serif", fontWeight: "600", maxWidth: "520px" }}>
            {isEn ? t('invitation.deadlineText') : (copy.deadlineText || "Katılım bildirimleri için belirlenen son tarih dolmuştur. Masa ve ikram planlamalarımız tamamlandığı için form ziyarete kapatılmıştır. Acil bir değişiklik veya sorunuz için aşağıdaki WhatsApp butonunu kullanabilirsiniz.")}
          </p>
        </div>
      ) : (
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
      )}

      {/* WHATSAPP BUTONU HER ZAMAN GÖRÜNÜR */}
      <a className="secondary-button whatsapp-button" href={`https://wa.me/${invitation.whatsappNumber?.replace(/\D/g, "")}?text=${rsvpWhatsappText}`} target="_blank" rel="noreferrer">
        {isEn ? t('form.whatsappRsvp') : "WhatsApp ile Bildir"}
      </a>

      {/* IBAN ve Takı Modal Ekranı */}
      {showGiftModal && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setShowGiftModal(false)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 2147483647, backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={{ backgroundColor: "#ffffff", borderRadius: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", width: "90%", maxWidth: "460px", textAlign: "center", padding: "40px 24px", border: "2px solid #b56c83", position: "relative" }}
          >
            <h3 style={{ color: "var(--rose-dark, #9f4f68)", margin: "0 0 12px", fontFamily: "Playfair Display, serif", fontSize: "24px", fontWeight: "800" }}>
              {isEn ? "Gift & Registry" : giftData.title}
            </h3>
            <p style={{ fontSize: "16px", lineHeight: "1.6", color: "var(--text, #55303b)", marginBottom: "20px", fontFamily: "Playfair Display, serif", fontWeight: "600" }}>
              {isEn ? "For those who wish to send a gift or contribute to our new life together:" : giftData.description}
            </p>
            <div style={{ backgroundColor: "#fff7f9", padding: "16px", borderRadius: "16px", border: "1px solid #eab4c5", marginBottom: "20px" }}>
              <strong style={{ display: "block", fontSize: "18px", color: "#7a2f49", fontFamily: "Playfair Display, serif" }}>{giftData.receiver}</strong>
              <span style={{ display: "block", fontSize: "14px", color: "#6f4451", margin: "4px 0 10px", fontFamily: "Playfair Display, serif" }}>{giftData.bankName}</span>
              <code style={{ display: "block", fontSize: "16px", wordBreak: "break-all", backgroundColor: "#ffffff", padding: "10px", borderRadius: "8px", border: "1px dashed #d98ca1", color: "#08060d", fontFamily: "monospace" }}>
                {giftData.iban}
              </code>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
              <button type="button" className="main-button" onClick={copyIban} style={{ margin: 0, minWidth: "160px" }}>
                {copied ? (isEn ? "Copied!" : "IBAN Kopyalandı ✓") : (isEn ? "Copy IBAN" : "IBAN'ı Kopyala")}
              </button>
              <button type="button" className="secondary-button" onClick={() => setShowGiftModal(false)} style={{ margin: 0, minWidth: "120px" }}>
                {isEn ? "Close" : "Kapat"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Katılamayacağım diyenler için Özel Üzüntü Modalı */}
      {showDeclineModal && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setShowDeclineModal(false)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 2147483647, backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={{ backgroundColor: "#ffffff", borderRadius: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", width: "90%", maxWidth: "450px", textAlign: "center", padding: "40px 24px", border: "2px solid #b56c83", position: "relative" }}
          >
            <div style={{ fontSize: "44px", marginBottom: "10px" }}>💌</div>
            <h3 style={{ color: "var(--rose-dark, #9f4f68)", margin: "0 0 12px", fontFamily: "Playfair Display, serif", fontSize: "24px", fontWeight: "800" }}>
              {isEn ? "We'll Miss You!" : copy.declineTitle || "Çok Üzüldük!"}
            </h3>
            <p style={{ fontSize: "16px", lineHeight: "1.6", color: "var(--text, #55303b)", marginBottom: "24px", fontFamily: "Playfair Display, serif", fontWeight: "600" }}>
              {isEn ? "We are sad that you won't be able to make it to our wedding. You can still leave us a sweet note in our Guestbook or send a gift via our registry screen." : copy.declineMessage}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
              <button type="button" className="main-button" onClick={() => { setShowDeclineModal(false); setShowGiftModal(true); }} style={{ margin: 0 }}>
                🎁 {isEn ? "View Registry" : "Hediye Ekranını Aç"}
              </button>
              <button type="button" className="secondary-button" onClick={() => setShowDeclineModal(false)} style={{ margin: 0 }}>
                {isEn ? "Close" : "Tamam"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}

// Dosyanın altındaki GuestsListSection ve WishesSection bileşenleri aynen kalıyor...

export function GuestsListSection({ copy, guests, totalPersonCount, notAttendingCount }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');

  return (
    <section className="card">
      <p className="section-label">{isEn ? t('invitation.guestsLabel') : copy.guestsLabel}</p>
      <h2>{isEn ? t('invitation.guestsTitle') : copy.guestsTitle}</h2>
      
      {/* Sadece genel sayılar (İstatistikler) görünür */}
      <div className="guest-stats">
        <div><strong>{guests.length}</strong><span>{isEn ? "Total Responses" : "Toplam Yanıt"}</span></div>
        <div><strong>{totalPersonCount}</strong><span>{isEn ? "Attending" : "Katılacak Kişi"}</span></div>
        <div><strong>{notAttendingCount}</strong><span>{isEn ? "Not Attending" : "Katılamayacak"}</span></div>
      </div>
      
      {/* Yazının ve ikonun hem yatay hem dikey tam ortalandığı gizlilik kutusu */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        textAlign: "center", 
        marginTop: "24px", 
        padding: "22px 18px", 
        background: "var(--paper-soft)", 
        borderRadius: "16px", 
        border: "1px dashed var(--border)",
        minHeight: "80px"
      }}>
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