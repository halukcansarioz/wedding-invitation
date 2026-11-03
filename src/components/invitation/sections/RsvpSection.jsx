import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FocusTrap from "focus-trap-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { OptionGroup } from "../../common/UIComponents";
import {
  triggerConfetti,
  getQrImageUrl,
  getCurrentShareLink,
  buildPersonalLink,
} from "../../../utils/helpers";
import {
  DEFAULT_SITE_DATA,
  NOTE_MAX_LENGTH,
  ATTENDANCE_OPTIONS,
} from "../../../config/constants";
import { getRsvpSchema } from "../../../validations/schemas";
import { subscribeToPushNotifications } from "../../../services/pushNotifications";

const DeadlineBanner = memo(({ isEn, title, text }) => (
  <div className="rsvp-deadline-banner">
    <div className="deadline-icon">⏳</div>
    <h3 className="deadline-title">{isEn ? title : title || "Form Kapatıldı"}</h3>
    <p className="deadline-text">{isEn ? text : text || "Form süresi dolmuştur."}</p>
  </div>
));

const DeclineModal = memo(
  ({
    isEn,
    copy,
    giftData,
    showDeclineGift,
    showDeclineModal,
    resetAndCloseModal,
    setShowDeclineGift,
    copyIban,
    copied,
    t,
  }) => {
    const handleClose = () => resetAndCloseModal();
    if (!showDeclineModal) return null;

    return createPortal(
      <FocusTrap focusTrapOptions={{ initialFocus: false, clickOutsideDeactivates: true }}>
        <div onClick={handleClose} className="app-modal-backdrop invitation-modal-backdrop" role="dialog" aria-modal="true">
          <div onClick={(e) => e.stopPropagation()} className="app-modal-card invitation-modal-card">
            <div className="app-modal-content">
              <h3>
                {isEn
                  ? t("invitation.declineTitle")
                  : copy?.declineTitle || t("invitation.declineTitle")}
              </h3>
              <p className="deadline-text modal-message">
                {isEn
                  ? t("invitation.declineMessage")
                  : copy?.declineMessage || t("invitation.declineMessage")}
              </p>
            </div>

            {!showDeclineGift ? (
              <div className="app-modal-actions">
                <button
                  type="button"
                  className="secondary-button app-modal-cancel"
                  onClick={handleClose}
                >
                  {t("ui.close")}
                </button>
                {resolvedGiftData && (
                  <button
                    type="button"
                    className="main-button"
                    onClick={() => setShowDeclineGift(true)}
                  >
                    <span>{t("ui.sendGift")}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="app-modal-content">
                <div className="modal-gift-card invitation-modal-gift-card">
                  <strong className="modal-gift-receiver">{giftData.receiver}</strong>
                  <span className="modal-gift-bank">{giftData.bankName}</span>
                  <code className="modal-gift-iban">{giftData.iban}</code>
                </div>
                <div className="app-modal-actions">
                  <button type="button" className="main-button" onClick={copyIban}>
                    {copied ? t("ui.copied") : t("ui.copyIban")}
                  </button>
                  <button
                    type="button"
                    className="secondary-button app-modal-cancel"
                    onClick={handleClose}
                  >
                    {t("ui.closeBtn")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </FocusTrap>,
      document.body
    );
  }
);

export const RsvpSection = memo(function RsvpSection({
  copy,
  submitGuest,
  invitation,
  rsvpWhatsappText,
  giftData,
  personalTableNumber,
  showTicket = true,
}) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en") || false;
  const resolvedGiftData =
    giftData || invitation?.giftRegistry || DEFAULT_SITE_DATA.giftRegistry;

  const isAutomation = typeof window !== "undefined" && Boolean(window.navigator?.webdriver);

  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showDeclineGift, setShowDeclineGift] = useState(false);
  const [copied, setCopied] = useState(false);
  const [urlGuestName, setUrlGuestName] = useState("");
  const [turnstileToken, setTurnstileToken] = useState(
    isAutomation ? "e2e-bypass-token" : ""
  );
  const [formKey, setFormKey] = useState(0);

  const [submittedGuest, setSubmittedGuest] = useState(null);
  const modalResetTimer = useRef(null);
  const copiedStateTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (modalResetTimer.current) clearTimeout(modalResetTimer.current);
      if (copiedStateTimer.current) clearTimeout(copiedStateTimer.current);
    };
  }, []);

  const rsvpSchema = useMemo(() => getRsvpSchema(t), [t]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      name: "",
      phone: "",
      attendance: "Katılacağım",
      personCount: "1",
      side: "Gelin Tarafı",
      hasChild: "Hayır",
      songRequest: "",
      note: "",
      honeypot: "",
    },
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
    if (countParam) {
      setValue("personCount", String(countParam));
      setValue("note", `${countParam} Kişi`);
    }
  }, [setValue]);

  const todayStr = new Date().toLocaleDateString("en-CA");
  const isDeadlinePassed = invitation?.rsvpDeadline && todayStr > invitation.rsvpDeadline;

  const onSubmit = async (data) => {
    if (data.honeypot) return;
    if (!isAutomation && !turnstileToken && navigator.onLine) return;

    const isDeclining = data.attendance === "Katılamayacağım";
    const submissionPayload = {
      ...data,
      personCount: isDeclining ? "1" : data.personCount || "1",
      tableNumber: personalTableNumber || "",
      turnstileToken: turnstileToken || "e2e-bypass-token",
    };

    if (isDeclining) {
      setShowDeclineGift(true);
      setShowDeclineModal(true);
    }

    let savedGuest = null;
    if (typeof submitGuest === "function") {
      savedGuest = await submitGuest(submissionPayload);
    }

    if (!isDeclining) {
      triggerConfetti();
      setSubmittedGuest({
        ...submissionPayload,
        id: savedGuest?.id || `guest-${Date.now()}`,
      });

      setTimeout(() => {
        if (
          window.confirm(
            isEn
              ? "Would you like to receive a reminder notification 1 day before the wedding?"
              : "Düğüne 1 gün kala hatırlatma bildirimi almak ister misiniz?"
          )
        ) {
          subscribeToPushNotifications();
        }
      }, 1500);
    }

    reset();
    setTurnstileToken(isAutomation ? "e2e-bypass-token" : "");
    setFormKey((prev) => prev + 1);
  };

  const downloadDigitalTicket = async () => {
    if (!submittedGuest) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 560;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const roundRect = (x, y, width, height, radius) => {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
    };

    const gradient = ctx.createLinearGradient(0, 0, 1000, 560);
    gradient.addColorStop(0, "#4c3f70");
    gradient.addColorStop(1, "#9f4f68");
    ctx.fillStyle = "#f8f4fb";
    ctx.fillRect(0, 0, 1000, 560);
    roundRect(24, 24, 952, 512, 28);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.arc(820, 80, 190, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 20px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(isEn ? "WEDDING ADMISSION" : "DÜĞÜN GİRİŞ BİLETİ", 64, 82);
    ctx.font = "700 34px serif";
    ctx.fillText(`${invitation?.bride || "Gelin"} & ${invitation?.groom || "Damat"}`, 64, 136);

    ctx.font = "500 18px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.86)";
    ctx.fillText(`${invitation?.dateText || ""}  •  ${invitation?.timeText || ""}`, 64, 174);
    ctx.fillText(invitation?.venue || "", 64, 204);
    ctx.fillText(invitation?.address || "", 64, 232);

    ctx.setLineDash([8, 10]);
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.moveTo(64, 278);
    ctx.lineTo(650, 278);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 34px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(submittedGuest.name, 350, 348);
    ctx.font = "500 18px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.86)";
    ctx.fillText(
      isEn
        ? `${submittedGuest.personCount || 1} Guest(s)`
        : `${submittedGuest.personCount || 1} Kişilik Davetiye`,
      350,
      382
    );

    if (personalTableNumber) {
      ctx.font = "700 18px sans-serif";
      ctx.fillStyle = "#f8d7df";
      ctx.fillText(
        isEn ? `TABLE: ${personalTableNumber}` : `MASA: ${personalTableNumber}`,
        350,
        420
      );
    }

    const baseShareLink = invitation?.shareLink || getCurrentShareLink();
    const checkInUrl = buildPersonalLink(
      baseShareLink,
      submittedGuest.name,
      personalTableNumber || "",
      submittedGuest.personCount || "1",
      submittedGuest.id
    );
    const qrUrl = getQrImageUrl(checkInUrl);

    const drawFallbackQr = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(755, 145, 170, 170);
      ctx.fillStyle = "#fff";
      ctx.fillStyle = "#000";
      ctx.font = "12px monospace";
      ctx.fillText(`ID: ${submittedGuest.id}`, 840, 235);
    };

    try {
      await new Promise((resolve) => {
        const qrImg = new Image();
        qrImg.crossOrigin = "anonymous";
        qrImg.onload = () => {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(755, 145, 170, 170);
          ctx.drawImage(qrImg, 765, 155, 150, 150);
          resolve(true);
        };
        qrImg.onerror = () => {
          drawFallbackQr();
          resolve(false);
        };
        qrImg.src = qrUrl;
      });
    } catch {
      drawFallbackQr();
    }

    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.font = "500 14px sans-serif";
    ctx.fillText(
      isEn
        ? "Save this to your Photos / Wallet"
        : "Girişte göstermek için galerinize kaydedin.",
      500,
      490
    );
    ctx.textAlign = "left";
    ctx.font = "500 13px monospace";
    ctx.fillText(`ID: ${submittedGuest.id}`, 64, 490);

    const link = document.createElement("a");
    link.download = `${submittedGuest.name}-Bilet.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const resetAndCloseModal = useCallback(() => {
    setShowDeclineModal(false);
    if (modalResetTimer.current) clearTimeout(modalResetTimer.current);
    modalResetTimer.current = setTimeout(() => {
      modalResetTimer.current = null;
      setShowDeclineGift(false);
      setCopied(false);
    }, 300);
  }, []);

  const copyIban = useCallback(() => {
    if (resolvedGiftData?.iban) {
      navigator.clipboard.writeText(resolvedGiftData.iban);
      setCopied(true);
      if (copiedStateTimer.current) clearTimeout(copiedStateTimer.current);
      copiedStateTimer.current = setTimeout(() => {
        copiedStateTimer.current = null;
        setCopied(false);
      }, 2500);
    }
  }, [resolvedGiftData?.iban]);

  const translatedAttendance = useMemo(
    () =>
      ATTENDANCE_OPTIONS.map((opt) => ({
        ...opt,
        label: isEn
          ? opt.value === "Katılacağım"
            ? t("ui.attending")
            : t("ui.notAttending")
          : opt.label,
      })),
    [isEn, t]
  );

  return (
    <section className="card rsvp-card">
      <p className="section-label">{isEn ? t("invitation.rsvpLabel") : copy?.rsvpLabel}</p>
      <h2>{isEn ? t("invitation.rsvpTitle") : copy?.rsvpTitle}</h2>
      <p>{isEn ? t("invitation.rsvpText") : copy?.rsvpText}</p>

      {isDeadlinePassed ? (
        <DeadlineBanner
          isEn={isEn}
          title={t("invitation.deadlineTitle")}
          text={t("invitation.deadlineText")}
        />
      ) : (
        <>
          <form
            key={`rsvp-form-${formKey}`}
            className="rsvp-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <input
              type="text"
              {...control.register("honeypot")}
              style={{ display: "none", opacity: 0, position: "absolute", zIndex: -1 }}
              tabIndex={-1}
              autoComplete="off"
            />

            {urlGuestName && (
              <div className="guest-badge-banner">
                {t("ui.prefilled", { name: urlGuestName })}
                {personalTableNumber && ` (Masa: ${personalTableNumber})`}
              </div>
            )}

            <div style={{ width: "100%" }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <input {...field} placeholder={t("form.namePlaceholder")} />}
              />
              {errors.name && (
                <span
                  style={{ color: "red", fontSize: "13px", display: "block", marginTop: "6px" }}
                >
                  {errors.name.message}
                </span>
              )}
            </div>

            <div style={{ width: "100%" }}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="tel"
                    placeholder={t("form.phonePlaceholder", isEn ? "Phone Number (Optional)" : "Telefon Numaranız (İsteğe Bağlı)")}
                  />
                )}
              />
            </div>

            <Controller
              name="attendance"
              control={control}
              render={({ field }) => (
                <OptionGroup
                  onChange={field.onChange}
                  options={translatedAttendance}
                  value={field.value}
                />
              )}
            />

            <div className="field-with-counter" style={{ marginTop: "12px" }}>
              <Controller
                name="note"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder={t("form.notePlaceholder")}
                    maxLength={NOTE_MAX_LENGTH}
                  ></textarea>
                )}
              />
              <span>
                {currentNote.length}/{NOTE_MAX_LENGTH}
              </span>
            </div>

            <div style={{ marginTop: "16px", display: "flex", justifyContent: "center" }}>
              {!isAutomation && (
                <Turnstile
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken("")}
                />
              )}
            </div>

            <button
              type="submit"
              className="main-button form-button"
              disabled={isSubmitting || (!isAutomation && !turnstileToken && navigator.onLine)}
            >
              {isSubmitting ? "..." : t("form.submitRsvp")}
            </button>
          </form>

          {submittedGuest && showTicket && (
            <div className="rsvp-ticket-confirmation">
              <span className="rsvp-ticket-kicker">{isEn ? "YOUR DIGITAL PASS" : "DİJİTAL DAVETİYENİZ"}</span>
              <p className="rsvp-ticket-title">
                {isEn ? "RSVP Confirmed!" : "Katılım Onaylandı!"}
              </p>
              <p className="rsvp-ticket-name">{submittedGuest.name}</p>
              <button
                type="button"
                onClick={downloadDigitalTicket}
                className="main-button rsvp-ticket-button"
              >
                🎟️ {isEn ? "Add to Apple/Google Wallet" : "Cüzdana/Galeriye Ekle"}
              </button>
            </div>
          )}
        </>
      )}

      <div
        className="rsvp-actions"
        style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}
      >
        <a
          className="secondary-button rsvp-whatsapp-button"
          style={{ width: "fit-content", margin: "0 auto" }}
          href={`https://wa.me/${invitation?.whatsappNumber?.replace(/\D/g, "")}?text=${rsvpWhatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("form.whatsappRsvp")}
        </a>
      </div>
      <DeclineModal
        isEn={isEn}
        copy={copy}
        giftData={resolvedGiftData}
        showDeclineGift={showDeclineGift}
        showDeclineModal={showDeclineModal}
        resetAndCloseModal={resetAndCloseModal}
        setShowDeclineGift={setShowDeclineGift}
        copyIban={copyIban}
        copied={copied}
        t={t}
      />
    </section>
  );
});
