import React, { Suspense, lazy, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAudio } from "../hooks/useAudio";
import { useScrollNavigation } from "../hooks/useScrollNavigation";
import IntroPage from "../components/invitation/IntroPage";
import { FloatingMenu } from "../components/common/FloatingMenu";
import { formatMessageTemplate, getCurrentShareLink, getGuestNameFromUrl, getTableFromUrl } from "../utils/helpers";
import { useAssetPreloader } from "../hooks/useAssetPreloader";
import { PwaInstallBanner } from "../components/common/PwaInstallBanner";
import { useStore } from "../store/useStore";

const InvitationView = lazy(() => import("./InvitationView"));

export default function InvitationController() {
  const { i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');

  const siteData = useStore((state) => state.siteData);
  const opened = useStore((state) => state.opened);
  const setOpened = useStore((state) => state.setOpened);
  const isOpening = useStore((state) => state.isOpening);
  const setIsOpening = useStore((state) => state.setIsOpening);

  const invitation = siteData.invitation;
  const isHeroLoaded = useAssetPreloader(invitation.heroImage);
  const personalGuestName = getGuestNameFromUrl();
  const currentShareLink = invitation.shareLink || getCurrentShareLink();
  const coupleName = `${invitation.bride} & ${invitation.groom}`;
  const shareText = encodeURIComponent(formatMessageTemplate(siteData.messages.whatsappShareMessage, { couple: coupleName, link: currentShareLink, guest: personalGuestName }));

  const { audioRef, isMusicPlaying, startMusic, toggleMusic } = useAudio(invitation.musicFile);
  const { showScrollTop, showScrollDown, scrollToNext, scrollToPrev, handleWheel, handleTouchStart, handleTouchEnd } = useScrollNavigation(false, opened);

  // Event listener'ları DOM'a attach et
  useEffect(() => {
    if (!opened) return;

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [opened, handleWheel, handleTouchStart, handleTouchEnd]);

  const openInvitation = () => {
    setIsOpening(true);
    startMusic().catch(console.error);
    setTimeout(() => setOpened(true), 4000);
  };

  if (!opened) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%", overflowX: "hidden" }}>
        <audio key={invitation.musicFile} ref={audioRef} src={invitation.musicFile || ""} loop preload="auto" />
        <IntroPage 
          isOpening={isOpening} 
          copy={siteData.copy} 
          invitation={invitation} 
          personalGuestName={personalGuestName} 
          personalTableNumber={getTableFromUrl()}
          openInvitation={openInvitation} 
          isHeroLoaded={isHeroLoaded}
        />
        <FloatingMenu 
          isEn={isEn} 
          toggleLanguage={() => i18n.changeLanguage(isEn ? 'tr' : 'en')} 
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%", overflowX: "hidden" }}>
      <audio key={invitation.musicFile} ref={audioRef} src={invitation.musicFile || ""} loop preload="auto" />
      <PwaInstallBanner />
      <FloatingMenu 
        isEn={isEn} 
        toggleLanguage={() => i18n.changeLanguage(isEn ? 'tr' : 'en')} 
        shareText={shareText} 
        toggleMusic={toggleMusic} 
        isMusicPlaying={isMusicPlaying} 
        showScrollDown={showScrollDown} 
        scrollToNext={scrollToNext} 
        showScrollTop={showScrollTop} 
        scrollToPrev={scrollToPrev} 
      />
      <Suspense fallback={<div className="app-loading">Yükleniyor...</div>}>
        <InvitationView scrollToNext={scrollToNext} scrollToPrev={scrollToPrev} />
      </Suspense>
    </div>
  );
}