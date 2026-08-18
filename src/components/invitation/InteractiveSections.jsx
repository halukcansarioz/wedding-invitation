import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

function DeclineModal({ isEn, copy, showIban, giftData, showDeclineGift, showDeclineModal, resetAndCloseModal, setShowDeclineGift, copyIban, copied, t }) {
  const handleClose = () => resetAndCloseModal();
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
            <button type="button" className="secondary-button app-modal-cancel" onClick={handleClose}>
              {t('ui.close')}
            </button>
            {showIban && giftData && (
              <button type="button" className="main-button" onClick={() => setShowDeclineGift(true)}>
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
              <button type="button" className="secondary-button app-modal-cancel" onClick={handleClose}>
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

export function RsvpSection({ copy, submitGuest, invitation, rsvpWhatsappText, showIban, giftData }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showDeclineGift, setShowDeclineGift] = useState(false);
  const [copied, setCopied] = useState(false);
  const [urlGuestName, setUrlGuestName] = useState("");

  const rsvpSchema = z.object({
    name: z.string().min(3, { message: t('form.missingNameMessage') }),
    attendance: z.string(),
    note: z.string().max(NOTE_MAX_LENGTH).optional()
  });

  const { control, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(rsvpSchema),
    defaultValues: { name: "", attendance: "Katılacağım", note: "" }
  });

  const currentNote = watch("note") || "";

  useEffect(() => {
    if (typeof window === "undefined") return;
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
    const isDeclining = data.attendance === "Katılamayacağım";
    await submitGuest(data);
    reset();
    
    if (isDeclining) {
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
          <form className="rsvp-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {urlGuestName && (
            <div className="guest-badge-banner">
              {t('ui.prefilled', { name: urlGuestName })}
            </div>
          )}

          <div style={{ width: '100%' }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <input {...field} placeholder={t('form.namePlaceholder')} />}
            />
            {errors.name && <span style={{ color: 'red', fontSize: '13px', display: 'block', marginTop: '6px' }}>{errors.name.message}</span>}
          </div>

          <Controller
            name="attendance"
            control={control}
            render={({ field }) => <OptionGroup onChange={field.onChange} options={translatedAttendance} value={field.value} />}
          />

          <div className="field-with-counter">
            <Controller
              name="note"
              control={control}
              render={({ field }) => <textarea {...field} placeholder={t('form.notePlaceholder')} maxLength={NOTE_MAX_LENGTH}></textarea>}
            />
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
}

export function GuestsListSection({ copy, guests, totalPersonCount, notAttendingCount }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const guestList = Array.isArray(guests) ? guests : [];
  
  const totalResponses = guestList.length;
  const attending = totalPersonCount !== undefined ? totalPersonCount : guestList.filter(g => g.attendance === "Katılacağım").length;
  const notAttending = notAttendingCount !== undefined ? notAttendingCount : guestList.filter(g => g.attendance === "Katılamayacağım").length;

  return (
    <section className="card">
      <p className="section-label">{isEn ? t('invitation.guestsLabel') : copy?.guestsLabel}</p>
      <h2>{isEn ? t('invitation.guestsTitle') : copy?.guestsTitle}</h2>
      
      <div className="guest-stats">
        <div><strong>{totalResponses}</strong><span>{t('ui.totalResponses')}</span></div>
        <div><strong>{attending}</strong><span>{t('ui.attending')}</span></div>
        <div><strong>{notAttending}</strong><span>{t('ui.notAttending')}</span></div>
      </div>
      
      <div className="private-note-card">
        <p className="private-note-text">
          🔒 {t('ui.privateNote')}
        </p>
      </div>
    </section>
  );
}

export function WishesSection({ copy, submitWish, approvedWishes }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const wishes = Array.isArray(approvedWishes) ? approvedWishes : [];

  const wishSchema = z.object({
    name: z.string().min(2, { message: t('form.missingNameMessage') }),
    message: z.string().min(5, { message: t('form.missingWishMessage') }).max(WISH_MAX_LENGTH)
  });

  const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(wishSchema),
    defaultValues: { name: "", message: "" }
  });

  const currentMessage = watch("message") || "";

  const onSubmit = async (data) => {
    await submitWish(data);
    reset();
  };

  return (
    <section className="card">
      <p className="section-label">{isEn ? t('invitation.wishesLabel') : copy?.wishesLabel}</p>
      <h2>{isEn ? t('invitation.wishesTitle') : copy?.wishesTitle}</h2>
      
      <form className="wish-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ width: '100%' }}>
          <Controller name="name" control={control} render={({ field }) => <input {...field} placeholder={t('form.namePlaceholder')} />} />
          {errors.name && <span style={{ color: 'red', fontSize: '13px', display: 'block', marginTop: '6px' }}>{errors.name.message}</span>}
        </div>
        
        <div className="field-with-counter">
          <Controller name="message" control={control} render={({ field }) => <textarea {...field} placeholder={t('form.messagePlaceholder')} maxLength={WISH_MAX_LENGTH}></textarea>} />
          <span>{currentMessage.length}/{WISH_MAX_LENGTH}</span>
          {errors.message && <span style={{ color: 'red', fontSize: '13px', display: 'block', marginTop: '6px' }}>{errors.message.message}</span>}
        </div>
        
        <button type="submit" className="main-button form-button" disabled={isSubmitting}>
          {isSubmitting ? "..." : t('form.submitWish')}
        </button>
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