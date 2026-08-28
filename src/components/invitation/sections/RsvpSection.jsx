import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OptionGroup } from "../../common/UIComponents";
import { triggerConfetti } from "../../../utils/helpers";
import { NOTE_MAX_LENGTH, ATTENDANCE_OPTIONS } from "../../../config/constants";
import { getRsvpSchema } from "../../../validations/schemas"; 

// --- Alt Bileşenler (Sadece bu dosyada kullanıldığı için burada kalabilir) ---
const DeadlineBanner = memo(({ isEn, title, text }) => (
  <div className="rsvp-deadline-banner">
    <div className="deadline-icon">⏳</div>
    <h3 className="deadline-title">{isEn ? title : (title || "Form Kapatıldı")}</h3>
    <p className="deadline-text">{isEn ? text : (text || "Form süresi dolmuştur.")}</p>
  </div>
));

const DeclineModal = memo(({ isEn, copy, showIban, giftData, showDeclineGift, showDeclineModal, resetAndCloseModal, setShowDeclineGift, copyIban, copied, t }) => {
  if (!showDeclineModal) return null;
  return createPortal(
    <div onClick={resetAndCloseModal} className="app-modal-backdrop">
      <div onClick={(e) => e.stopPropagation()} className="app-modal-card">
        <div className="app-modal-content">
          <h3>{isEn ? t('invitation.declineTitle') : (copy?.declineTitle || t('invitation.declineTitle'))}</h3>
          <p className="deadline-text modal-message">
            {isEn ? t('invitation.declineMessage') : (copy?.declineMessage || t('invitation.declineMessage'))}
          </p>
        </div>
        {!showDeclineGift ? (
          <div className="app-modal-actions">
            <button type="button" className="secondary-button app-modal-cancel" onClick={resetAndCloseModal}>{t('ui.close')}</button>
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
              <button type="button" className="secondary-button app-modal-cancel" onClick={resetAndCloseModal}>{t('ui.closeBtn')}</button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
});

// --- Ana Bileşen (memo ile sarmalandı) ---
export const RsvpSection = memo(function RsvpSection({ copy, submitGuest, invitation, rsvpWhatsappText, showIban, giftData, personalTableNumber }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showDeclineGift, setShowDeclineGift] = useState(false);
  const [copied, setCopied] = useState(false);
  const [urlGuestName, setUrlGuestName] = useState("");

  const rsvpSchema = useMemo(() => getRsvpSchema(t), [t]);
  const { control, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(rsvpSchema),
    defaultValues: { name: "", attendance: "Katılacağım", songRequest: "", note: "", honeypot: "" }
  });

  const currentNote = watch("note") || "";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const guestName = params.get("guest") || params.get("davetli") || "";
    if (guestName) {
      setUrlGuestName(guestName);
      setValue("name", guestName);
    }
  }, [setValue]);

  const todayStr = new Date().toLocaleDateString('en-CA'); 
  const isDeadlinePassed = invitation?.rsvpDeadline && todayStr > invitation.rsvpDeadline;

  const onSubmit = async (data) => {
    if (data.honeypot) return;
    const isDeclining = data.attendance === "Katılamayacağım";
    await submitGuest(data);
    if (!isDeclining) triggerConfetti();
    reset();
    if (isDeclining) setShowDeclineModal(true);
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

  const translatedAttendance = useMemo(() => ATTENDANCE_OPTIONS.map(opt => ({ 
    ...opt, 
    label: isEn ? (opt.value === "Katılacağım" ? t('ui.attending') : t('ui.notAttending')) : opt.label 
  })), [isEn, t]);

  return (
    <section className="card rsvp-card">
      <p className="section-label">{isEn ? t('invitation.rsvpLabel') : copy?.rsvpLabel}</p>
      <h2>{isEn ? t('invitation.rsvpTitle') : copy?.rsvpTitle}</h2>
      <p>{isEn ? t('invitation.rsvpText') : copy?.rsvpText}</p>
      
      {isDeadlinePassed ? (
        <DeadlineBanner isEn={isEn} title={t('invitation.deadlineTitle')} text={t('invitation.deadlineText')} />
      ) : (
        <form className="rsvp-form" onSubmit={handleSubmit(onSubmit)} noValidate>
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

          <div className="field-with-counter">
            <Controller name="note" control={control} render={({ field }) => <textarea {...field} placeholder={t('form.notePlaceholder')} maxLength={NOTE_MAX_LENGTH}></textarea>} />
            <span>{currentNote.length}/{NOTE_MAX_LENGTH}</span>
          </div>

          <button type="submit" className="main-button form-button" disabled={isSubmitting}>
            {isSubmitting ? "..." : t('form.submitRsvp')}
          </button>
        </form>
      )}

      <div className="rsvp-actions">
        <a className="secondary-button rsvp-whatsapp-button" href={`https://wa.me/${invitation?.whatsappNumber?.replace(/\D/g, "")}?text=${rsvpWhatsappText}`} target="_blank" rel="noreferrer">
          {t('form.whatsappRsvp')}
        </a>
      </div>
      <DeclineModal isEn={isEn} copy={copy} showIban={showIban} giftData={giftData} showDeclineGift={showDeclineGift} showDeclineModal={showDeclineModal} resetAndCloseModal={resetAndCloseModal} setShowDeclineGift={setShowDeclineGift} copyIban={copyIban} copied={copied} t={t} />
    </section>
  );
});