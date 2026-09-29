import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FocusTrap from 'focus-trap-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { OptionGroup } from "../../common/UIComponents";
import { triggerConfetti, getQrImageUrl } from "../../../utils/helpers";
import { NOTE_MAX_LENGTH, ATTENDANCE_OPTIONS } from "../../../config/constants";
import { getRsvpSchema } from "../../../validations/schemas";
import { subscribeToPushNotifications } from "../../common/PwaInstallBanner";

const DeadlineBanner = memo(({ isEn, title, text }) => (
  <div className="rsvp-deadline-banner">
    <div className="deadline-icon">⏳</div>
    <h3 className="deadline-title">{isEn ? title : (title || "Form Kapatıldı")}</h3>
    <p className="deadline-text">{isEn ? text : (text || "Form süresi dolmuştur.")}</p>
  </div>
));

const DeclineModal = memo(({ isEn, copy, showIban, giftData, showDeclineGift, showDeclineModal, resetAndCloseModal, setShowDeclineGift, copyIban, copied, t }) => {
  const handleClose = () => resetAndCloseModal();
  if (!showDeclineModal) return null;

  return createPortal(
    <FocusTrap focusTrapOptions={{ initialFocus: false, clickOutsideDeactivates: true }}>
      <div onClick={handleClose} className="app-modal-backdrop" role="dialog" aria-modal="true">
        <div onClick={(e) => e.stopPropagation()} className="app-modal-card">
          <div className="app-modal-content">
            <h3>{isEn ? t('invitation.declineTitle') : (copy?.declineTitle || t('invitation.declineTitle'))}</h3>
            <p className="deadline-text modal-message">
              {isEn ? t('invitation.declineMessage') : (copy?.declineMessage || t('invitation.declineMessage'))}
            </p>
          </div>

          {!showDeclineGift ? (
            <div className="app-modal-actions">
              <button type="button" className="secondary-button app-modal-cancel" onClick={handleClose}>{t('ui.close')}</button>
              {showIban && giftData && (
                <button type="button" className="main-button" onClick={() => setShowDeclineGift(true)}><span>{t('ui.sendGift')}</span></button>
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
                <button type="button" className="main-button" onClick={copyIban}>{copied ? t('ui.copied') : t('ui.copyIban')}</button>
                <button type="button" className="secondary-button app-modal-cancel" onClick={handleClose}>{t('ui.closeBtn')}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </FocusTrap>,
    document.body
  );
});

export const RsvpSection = memo(function RsvpSection({ copy, submitGuest, invitation, rsvpWhatsappText, showIban, giftData, personalTableNumber }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en') || false;
  
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showDeclineGift, setShowDeclineGift] = useState(false);
  const [copied, setCopied] = useState(false);
  const [urlGuestName, setUrlGuestName] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [formKey, setFormKey] = useState(0); 
  
  // YENİ: Cüzdana bilet ekleme için başarılı kayıt tutucu
  const [submittedGuest, setSubmittedGuest] = useState(null);

  const rsvpSchema = useMemo(() => getRsvpSchema(t), [t]);

  const { control, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(rsvpSchema),
    defaultValues: { name: "", attendance: "Katılacağım", note: "", honeypot: "" }
  });

  const currentNote = watch("note") || "";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const guestName = params.get("guest") || params.get("davetli") || "";
    const countParam = params.get("count") || params.get("kisi") || "";

    if (guestName) {
      setUrlGuestName(guestName);
      setValue("name", guestName);
    }
    if (countParam) setValue("note", `${countParam} Kişi`); 
  }, [setValue]);

  const todayStr = new Date().toLocaleDateString('en-CA'); 
  const isDeadlinePassed = invitation?.rsvpDeadline && todayStr > invitation.rsvpDeadline;

  const onSubmit = async (data) => {
    if (data.honeypot) return;
    if (!turnstileToken && navigator.onLine) return;

    const isDeclining = data.attendance === "Katılamayacağım";
    await submitGuest({ ...data, turnstileToken });
    
    if (!isDeclining) {
      triggerConfetti();
      setSubmittedGuest(data); // Bileti oluşturmak için bilgiyi kaydet
      
      setTimeout(() => {
        if (window.confirm(isEn ? "Would you like to receive a reminder notification 1 day before the wedding?" : "Düğüne 1 gün kala hatırlatma bildirimi almak ister misiniz?")) {
          subscribeToPushNotifications();
        }
      }, 1500);
    } else {
      setShowDeclineModal(true);
    }
    
    reset();
    setTurnstileToken("");
    setFormKey(prev => prev + 1);
  };

  // YENİ: Apple/Google Wallet (Dijital Bilet) Üretici Fonksiyon
  const downloadDigitalTicket = () => {
    if (!submittedGuest) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    
    // Arka Plan
    ctx.fillStyle = '#fffafb';
    ctx.fillRect(0, 0, 400, 700);
    
    // Üst Header
    ctx.fillStyle = '#9f4f68';
    ctx.fillRect(0, 0, 400, 110);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isEn ? 'VIP WEDDING PASS' : 'VIP DAVETİYE KARTI', 200, 65);
    
    // Çift İsmi
    ctx.fillStyle = '#55303b';
    ctx.font = 'bold 20px serif';
    ctx.fillText(`${invitation?.bride} & ${invitation?.groom}`, 200, 160);
    
    // Tarih ve Saat
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#6f4451';
    ctx.fillText(`${invitation?.dateText} - ${invitation?.timeText}`, 200, 190);
    
    // Kesik Çizgi (Bilet Formu)
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(20, 240);
    ctx.lineTo(380, 240);
    ctx.strokeStyle = '#d98ca1';
    ctx.stroke();
    
    // Misafir İsmi
    ctx.fillStyle = '#55303b';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(submittedGuest.name, 200, 300);
    
    // Masa Numarası
    if(personalTableNumber) {
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#27ae60';
      ctx.fillText(isEn ? `TABLE: ${personalTableNumber}` : `MASA: ${personalTableNumber}`, 200, 340);
    }

    // QR Code (API'den çekip çizmek asenkron olduğundan Dummy Text ekliyoruz, Wallet okuyucuları için sembolik)
    ctx.fillStyle = '#000';
    ctx.fillRect(125, 400, 150, 150);
    ctx.fillStyle = '#fff';
    ctx.fillRect(135, 410, 130, 130);
    ctx.fillStyle = '#000';
    ctx.font = '12px monospace';
    ctx.fillText('QR SCAN', 200, 480);
    
    // Alt Bilgi
    ctx.fillStyle = '#6f4451';
    ctx.font = '14px sans-serif';
    ctx.fillText(isEn ? 'Save this to your Photos / Wallet' : 'Girişte göstermek için galerinize kaydedin.', 200, 620);
    
    // İndirme Tetikle
    const link = document.createElement('a');
    link.download = `${submittedGuest.name}-Bilet.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const resetAndCloseModal = useCallback(() => {
    setShowDeclineModal(false);
    setTimeout(() => { setShowDeclineGift(false); setCopied(false); }, 300);
  }, []);

  const copyIban = useCallback(() => {
    if (giftData?.iban) {
      navigator.clipboard.writeText(giftData.iban);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [giftData?.iban]);

  const translatedAttendance = useMemo(() => ATTENDANCE_OPTIONS.map(opt => ({ ...opt, label: isEn ? (opt.value === "Katılacağım" ? t('ui.attending') : t('ui.notAttending')) : opt.label })), [isEn, t]);

  return (
    <section className="card rsvp-card">
      <p className="section-label">{isEn ? t('invitation.rsvpLabel') : copy?.rsvpLabel}</p>
      <h2>{isEn ? t('invitation.rsvpTitle') : copy?.rsvpTitle}</h2>
      <p>{isEn ? t('invitation.rsvpText') : copy?.rsvpText}</p>
      
      {isDeadlinePassed ? (
        <DeadlineBanner isEn={isEn} title={t('invitation.deadlineTitle')} text={t('invitation.deadlineText')} />
      ) : (
        <>
          <form key={`rsvp-form-${formKey}`} className="rsvp-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <input type="text" {...control.register("honeypot")} style={{ display: "none", opacity: 0, position: "absolute", zIndex: -1 }} tabIndex={-1} autoComplete="off" />

            {urlGuestName && (
              <div className="guest-badge-banner">
                {t('ui.prefilled', { name: urlGuestName })}
                {personalTableNumber && ` (Masa: ${personalTableNumber})`}
              </div>
            )}

            <div style={{ width: '100%' }}>
              <Controller name="name" control={control} render={({ field }) => <input {...field} placeholder={t('form.namePlaceholder')} />} />
              {errors.name && <span style={{ color: 'red', fontSize: '13px', display: 'block', marginTop: '6px' }}>{errors.name.message}</span>}
            </div>

            <Controller name="attendance" control={control} render={({ field }) => <OptionGroup onChange={field.onChange} options={translatedAttendance} value={field.value} />} />

            <div className="field-with-counter" style={{ marginTop: '12px' }}>
              <Controller name="note" control={control} render={({ field }) => <textarea {...field} placeholder={t('form.notePlaceholder')} maxLength={NOTE_MAX_LENGTH}></textarea>} />
              <span>{currentNote.length}/{NOTE_MAX_LENGTH}</span>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
              <Turnstile siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} onSuccess={(token) => setTurnstileToken(token)} onExpire={() => setTurnstileToken("")} />
            </div>

            <button type="submit" className="main-button form-button" disabled={isSubmitting || (!turnstileToken && navigator.onLine)}>
              {isSubmitting ? "..." : t('form.submitRsvp')}
            </button>
          </form>
          
          {/* YENİ: Başarılı Katılım Sonrası Bilet İndirme Butonu */}
          {submittedGuest && (
            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid #2ecc71', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ color: '#27ae60', fontWeight: 'bold', marginBottom: '12px' }}>
                {isEn ? "RSVP Confirmed!" : "Katılım Onaylandı!"}
              </p>
              <button onClick={downloadDigitalTicket} className="main-button" style={{ background: '#27ae60', borderColor: '#27ae60', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🎟️ {isEn ? "Add to Apple/Google Wallet" : "Cüzdana/Galeriye Ekle"}
              </button>
            </div>
          )}
        </>
      )}

      <div className="rsvp-actions" style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
        <a className="secondary-button rsvp-whatsapp-button" style={{ width: "fit-content", margin: "0 auto" }} href={`https://wa.me/${invitation?.whatsappNumber?.replace(/\D/g, "")}?text=${rsvpWhatsappText}`} target="_blank" rel="noreferrer">
          {t('form.whatsappRsvp')}
        </a>
      </div>
      <DeclineModal isEn={isEn} copy={copy} showIban={showIban} giftData={giftData} showDeclineGift={showDeclineGift} showDeclineModal={showDeclineModal} resetAndCloseModal={resetAndCloseModal} setShowDeclineGift={setShowDeclineGift} copyIban={copyIban} copied={copied} t={t} />
    </section>
  );
});