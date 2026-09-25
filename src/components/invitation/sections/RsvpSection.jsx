import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FocusTrap from 'focus-trap-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { OptionGroup } from "../../common/UIComponents";
import { triggerConfetti } from "../../../utils/helpers";
import { NOTE_MAX_LENGTH, ATTENDANCE_OPTIONS } from "../../../config/constants";
import { getRsvpSchema } from "../../../validations/schemas";
import { subscribeToPushNotifications } from "../../common/PwaInstallBanner";
import { supabase } from "../../../supabaseClient";

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

  const [songQuery, setSongQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const rsvpSchema = useMemo(() => getRsvpSchema(t), [t]);

  const { control, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(rsvpSchema),
    defaultValues: { name: "", attendance: "Katılacağım", note: "", songRequest: "", honeypot: "" }
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

  const searchSpotify = async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await supabase.functions.invoke('spotify-handler', {
        body: { action: 'search', query }
      });
      if (res.data?.tracks) setSearchResults(res.data.tracks);
    } catch (err) {
      console.error("Spotify arama hatası", err);
    } finally {
      setIsSearching(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-CA'); 
  const isDeadlinePassed = invitation?.rsvpDeadline && todayStr > invitation.rsvpDeadline;

  const onSubmit = async (data) => {
    if (data.honeypot) return;
    if (!turnstileToken && navigator.onLine) return;

    if (selectedSong) {
      data.songRequest = `${selectedSong.name} - ${selectedSong.artist}`;
      supabase.functions.invoke('spotify-handler', {
        body: { action: 'add', trackUri: selectedSong.uri }
      }).catch(console.error);
    }

    const isDeclining = data.attendance === "Katılamayacağım";
    await submitGuest({ ...data, turnstileToken });
    
    if (!isDeclining) {
      triggerConfetti();
      setTimeout(() => {
        if (window.confirm(isEn ? "Would you like to receive a reminder notification 1 day before the wedding?" : "Düğüne 1 gün kala hatırlatma bildirimi almak ister misiniz?")) {
          subscribeToPushNotifications();
        }
      }, 1500);
    }
    
    reset();
    setSelectedSong(null);
    setSongQuery("");
    setTurnstileToken("");
    setFormKey(prev => prev + 1);
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

  const translatedAttendance = useMemo(() => ATTENDANCE_OPTIONS.map(opt => ({ ...opt, label: isEn ? (opt.value === "Katılacağım" ? t('ui.attending') : t('ui.notAttending')) : opt.label })), [isEn, t]);

  return (
    <section className="card rsvp-card">
      <p className="section-label">{isEn ? t('invitation.rsvpLabel') : copy?.rsvpLabel}</p>
      <h2>{isEn ? t('invitation.rsvpTitle') : copy?.rsvpTitle}</h2>
      <p>{isEn ? t('invitation.rsvpText') : copy?.rsvpText}</p>
      
      {isDeadlinePassed ? (
        <DeadlineBanner isEn={isEn} title={t('invitation.deadlineTitle')} text={t('invitation.deadlineText')} />
      ) : (
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

          <div className="spotify-search-container" style={{ position: 'relative', marginTop: '12px', width: '100%' }}>
            {selectedSong ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: 'var(--paper)', border: '1px solid #1DB954', borderRadius: '12px' }}>
                <img src={selectedSong.image} alt="album" style={{ width: '40px', height: '40px', borderRadius: '6px' }} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-main)' }}>{selectedSong.name}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedSong.artist}</span>
                </div>
                <button type="button" onClick={() => setSelectedSong(null)} style={{ border: 'none', background: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '18px' }}>✕</button>
              </div>
            ) : (
              <>
                <input 
                  type="text" 
                  placeholder={isEn ? "Search a song for the playlist... 🎵" : "Çalma listesi için bir şarkı ara... 🎵"} 
                  value={songQuery}
                  onChange={(e) => {
                    setSongQuery(e.target.value);
                    searchSpotify(e.target.value);
                  }}
                  style={{ borderColor: songQuery ? '#1DB954' : undefined, width: '100%', padding: '14px', borderRadius: '12px' }}
                />
                {isSearching && <span style={{ position: 'absolute', right: '12px', top: '14px', fontSize: '12px', color: '#1DB954' }}>Aranıyor...</span>}
                
                {searchResults.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'var(--paper)', zIndex: 10, borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', marginTop: '4px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                    {searchResults.map(track => (
                      <div 
                        key={track.id} 
                        onClick={() => { setSelectedSong(track); setSearchResults([]); setSongQuery(""); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                      >
                        <img src={track.image} alt="" style={{ width: '30px', height: '30px', borderRadius: '4px' }} />
                        <div style={{ textAlign: 'left' }}>
                          <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)' }}>{track.name}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{track.artist}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

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