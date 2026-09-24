import React, { Suspense, lazy, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async"; // EKLENDİ: Meta etiketleri için
import { useAudio } from "../hooks/useAudio";
import { useScrollNavigation } from "../hooks/useScrollNavigation";
import IntroPage from "../components/invitation/IntroPage";
import { FloatingMenu } from "../components/common/FloatingMenu";
import { formatMessageTemplate, getCurrentShareLink, getGuestNameFromUrl, getTableFromUrl } from "../utils/helpers";
import { useAssetPreloader } from "../hooks/useAssetPreloader";
import { PwaInstallBanner } from "../components/common/PwaInstallBanner";
import { useStore } from "../store/useStore";
import '../styles/invitation.css';

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
  
  const { currentSlideIndex, showScrollTop, showScrollDown, scrollToNext, scrollToPrev, handleWheel, handleTouchStart, handleTouchEnd } = useScrollNavigation(false, opened);

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

  // EKLENDİ: Dinamik SEO ve Meta Etiket Bilgileri
  const pageTitle = isEn ? `${coupleName} | Wedding Invitation` : `${coupleName} | Düğün Davetiyesi`;
  const pageDescription = invitation.message || (isEn ? "You are invited to our wedding." : "Düğün davetiyemize davetlisiniz.");
  // Eğer video varsa ve görsel yoksa intro imajını yedek (fallback) olarak kullan
  const ogImage = invitation.heroImage || invitation.introImage;

  // Ortak render fonksiyonu (Kod tekrarını önlemek için)
  const renderSEO = () => (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      
      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentShareLink} />
      <meta property="og:title" content={`${coupleName} | ${isEn ? "We're Getting Married!" : "Evleniyoruz! 💍"}`} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={coupleName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentShareLink} />
      <meta name="twitter:title" content={`${coupleName} | ${isEn ? "We're Getting Married!" : "Evleniyoruz! 💍"}`} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );

  if (!opened) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%", overflowX: "hidden" }}>
        {renderSEO()}
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
      {renderSEO()}
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
        <InvitationView scrollToNext={scrollToNext} scrollToPrev={scrollToPrev} currentSlideIndex={currentSlideIndex} />
      </Suspense>
    </div>
  );
}