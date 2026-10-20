import React, { Suspense, lazy, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useAudio } from "../hooks/useAudio";
import { useScrollNavigation } from "../hooks/useScrollNavigation";
import { useDatabaseManager } from "../hooks/useDatabaseManager";
import IntroPage from "../components/invitation/IntroPage";
import { FloatingMenu } from "../components/common/FloatingMenu";
import {
  formatMessageTemplate,
  getCurrentShareLink,
  getGuestNameFromUrl,
  getTableFromUrl,
  createGoogleCalendarLink,
  getQrImageUrl,
} from "../utils/helpers";
import { useAssetPreloader } from "../hooks/useAssetPreloader";
import { PwaInstallBanner } from "../components/common/PwaInstallBanner";
import { useStore } from "../store/useStore";
import "../styles/invitation.css";

const InvitationView = lazy(() => import("./InvitationView"));

export default function InvitationController() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith("en");

  const siteData = useStore((state) => state.siteData);
  const guests = useStore((state) => state.guests);
  const setGuests = useStore((state) => state.setGuests);
  const wishes = useStore((state) => state.wishes);
  const setWishes = useStore((state) => state.setWishes);
  const showAppAlert = useStore((state) => state.showAppAlert);
  const showAppConfirm = useStore((state) => state.showAppConfirm);
  const showAppPrompt = useStore((state) => state.showAppPrompt);

  const opened = useStore((state) => state.opened);
  const setOpened = useStore((state) => state.setOpened);
  const isOpening = useStore((state) => state.isOpening);
  const setIsOpening = useStore((state) => state.setIsOpening);

  const invitation = siteData.invitation;
  const isHeroLoaded = useAssetPreloader(invitation.heroImage);
  const personalGuestName = getGuestNameFromUrl();
  const personalTableNumber = getTableFromUrl();
  const currentShareLink = invitation.shareLink || getCurrentShareLink();
  const coupleName = `${invitation.bride} & ${invitation.groom}`;

  const shareText = useMemo(
    () =>
      encodeURIComponent(
        formatMessageTemplate(siteData.messages?.whatsappShareMessage, {
          couple: coupleName,
          link: currentShareLink,
          guest: personalGuestName,
        })
      ),
    [siteData.messages?.whatsappShareMessage, coupleName, currentShareLink, personalGuestName]
  );

  const rsvpWhatsappText = useMemo(
    () =>
      encodeURIComponent(
        formatMessageTemplate(siteData.messages?.rsvpWhatsappMessage, {
          couple: coupleName,
          link: currentShareLink,
          guest: personalGuestName,
        })
      ),
    [siteData.messages?.rsvpWhatsappMessage, coupleName, currentShareLink, personalGuestName]
  );

  const guestGreeting = useMemo(() => {
    if (!personalGuestName) return "";
    return formatMessageTemplate(siteData.messages?.guestGreeting, {
      guest: personalGuestName,
      couple: coupleName,
      link: currentShareLink,
    });
  }, [personalGuestName, siteData.messages?.guestGreeting, coupleName, currentShareLink]);

  const googleCalendarLink = useMemo(
    () => createGoogleCalendarLink(siteData, coupleName),
    [siteData, coupleName]
  );

  const qrImageUrl = useMemo(
    () => getQrImageUrl(currentShareLink),
    [currentShareLink]
  );

  const copyInvitationLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentShareLink);
      await showAppAlert(t("alerts.linkCopied"), { title: t("alerts.successTitle") });
    } catch {
      await showAppAlert(t("alerts.linkCopyError"), { title: t("alerts.errorTitle") });
    }
  }, [currentShareLink, showAppAlert, t]);

  const { submitGuest, submitWish } = useDatabaseManager({
    guests,
    setGuests,
    wishes,
    setWishes,
    settings: siteData.settings,
    showAppAlert,
    showAppConfirm,
    showAppPrompt,
    t,
    isEn,
  });

  const approvedWishes = useMemo(
    () => (Array.isArray(wishes) ? wishes.filter((w) => w.approved !== false) : []),
    [wishes]
  );

  const totalPersonCount = useMemo(
    () =>
      (Array.isArray(guests) ? guests : [])
        .filter((g) => g.attendance === "Katılacağım")
        .reduce((sum, g) => sum + Number(g.personCount || 1), 0),
    [guests]
  );

  const notAttendingCount = useMemo(
    () =>
      (Array.isArray(guests) ? guests : []).filter(
        (g) => g.attendance === "Katılamayacağım"
      ).length,
    [guests]
  );

  const { audioRef, isMusicPlaying, startMusic, toggleMusic } = useAudio(invitation.musicFile);

  const {
    currentSlideIndex,
    showScrollTop,
    showScrollDown,
    scrollToNext,
    scrollToPrev,
    handleWheel,
    handleTouchStart,
    handleTouchEnd,
  } = useScrollNavigation(false, opened);

  useEffect(() => {
    if (!opened) return;

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [opened, handleWheel, handleTouchStart, handleTouchEnd]);

  const openInvitation = () => {
    setIsOpening(true);
    startMusic().catch(console.error);
    setTimeout(() => setOpened(true), 4000);
  };

  const pageTitle = isEn
    ? `${coupleName} | Wedding Invitation`
    : `${coupleName} | Düğün Davetiyesi`;
  const pageDescription =
    invitation.message ||
    (isEn ? "You are invited to our wedding." : "Düğün davetiyemize davetlisiniz.");
  const ogImage = invitation.heroImage || invitation.introImage;

  const renderSEO = () => (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentShareLink} />
      <meta
        property="og:title"
        content={`${coupleName} | ${isEn ? "We're Getting Married!" : "Evleniyoruz! 💍"}`}
      />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={coupleName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentShareLink} />
      <meta
        name="twitter:title"
        content={`${coupleName} | ${isEn ? "We're Getting Married!" : "Evleniyoruz! 💍"}`}
      />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );

  if (!opened) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflowX: "hidden",
        }}
      >
        {renderSEO()}
        <audio
          key={invitation.musicFile}
          ref={audioRef}
          src={invitation.musicFile || ""}
          loop
          preload="none"
        />
        <IntroPage
          isOpening={isOpening}
          copy={siteData.copy}
          invitation={invitation}
          personalGuestName={personalGuestName}
          personalTableNumber={personalTableNumber}
          openInvitation={openInvitation}
          isHeroLoaded={isHeroLoaded}
        />
        <FloatingMenu
          isEn={isEn}
          toggleLanguage={() => i18n.changeLanguage(isEn ? "tr" : "en")}
          shareText={shareText}
          toggleMusic={toggleMusic}
          isMusicPlaying={isMusicPlaying}
          showScrollDown={false}
          scrollToNext={scrollToNext}
          showScrollTop={false}
          scrollToPrev={scrollToPrev}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {renderSEO()}
      <audio
        key={invitation.musicFile}
        ref={audioRef}
        src={invitation.musicFile || ""}
        loop
        preload="none"
      />
      <PwaInstallBanner />
      <FloatingMenu
        isEn={isEn}
        toggleLanguage={() => i18n.changeLanguage(isEn ? "tr" : "en")}
        shareText={shareText}
        toggleMusic={toggleMusic}
        isMusicPlaying={isMusicPlaying}
        showScrollDown={showScrollDown}
        scrollToNext={scrollToNext}
        showScrollTop={showScrollTop}
        scrollToPrev={scrollToPrev}
      />
      <Suspense fallback={<div className="app-loading">Yükleniyor...</div>}>
        <InvitationView
          scrollToNext={scrollToNext}
          scrollToPrev={scrollToPrev}
          currentSlideIndex={currentSlideIndex}
          guestGreeting={guestGreeting}
          personalTableNumber={personalTableNumber}
          googleCalendarLink={googleCalendarLink}
          submitGuest={submitGuest}
          rsvpWhatsappText={rsvpWhatsappText}
          guests={guests}
          totalPersonCount={totalPersonCount}
          notAttendingCount={notAttendingCount}
          submitWish={submitWish}
          approvedWishes={approvedWishes}
          qrImageUrl={qrImageUrl}
          shareText={shareText}
          copyInvitationLink={copyInvitationLink}
        />
      </Suspense>
    </div>
  );
}