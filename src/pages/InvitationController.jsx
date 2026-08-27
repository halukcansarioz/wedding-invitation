import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../store/useStore";
import { useAudio } from "../hooks/useAudio";
import { useCountdown } from "../hooks/useCountdown";
import { useDatabaseManager } from "../hooks/useDatabaseManager";
import IntroPage from "../components/invitation/IntroPage";
import FloatingMenu from "../components/common/FloatingMenu";
import { 
  formatMessageTemplate, 
  getCurrentShareLink, 
  createGoogleCalendarLink, 
  getGuestNameFromUrl, 
  getTableFromUrl,
  getQrImageUrl 
} from "../utils/helpers";

const InvitationView = lazy(() => import("./InvitationView"));

export default function InvitationController() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');

  const siteData = useStore((state) => state.siteData);
  const guests = useStore((state) => state.guests);
  const setGuests = useStore((state) => state.setGuests);
  const wishes = useStore((state) => state.wishes);
  const setWishes = useStore((state) => state.setWishes);
  const opened = useStore((state) => state.opened);
  const setOpened = useStore((state) => state.setOpened);
  const isOpening = useStore((state) => state.isOpening);
  const setIsOpening = useStore((state) => state.setIsOpening);
  const showAppAlert = useStore((state) => state.showAppAlert);
  const showAppConfirm = useStore((state) => state.showAppConfirm);

  const toggleLanguage = () => i18n.changeLanguage(isEn ? 'tr' : 'en');

  const invitation = useMemo(() => siteData.invitation, [siteData.invitation]);
  const familyInfo = useMemo(() => siteData.familyInfo, [siteData.familyInfo]);
  const copy = useMemo(() => siteData.copy, [siteData.copy]);
  const settings = useMemo(() => siteData.settings, [siteData.settings]);
  const messages = useMemo(() => siteData.messages, [siteData.messages]);
  
  const coupleName = useMemo(() => `${invitation.bride} & ${invitation.groom}`, [invitation.bride, invitation.groom]);
  const personalGuestName = useMemo(() => getGuestNameFromUrl(), []);
  const personalTableNumber = useMemo(() => getTableFromUrl(), []);
  
  const attendingGuests = useMemo(() => guests.filter((g) => g.attendance === "Katılacağım"), [guests]);
  const totalPersonCount = useMemo(() => attendingGuests.reduce((tot, g) => tot + Number(g.personCount || 1), 0), [attendingGuests]);
  const notAttendingCount = useMemo(() => guests.filter((g) => g.attendance === "Katılamayacağım").length, [guests]);
  const approvedWishes = useMemo(() => wishes.filter((w) => w.approved !== false), [wishes]);
  
  const currentShareLink = useMemo(() => invitation.shareLink || getCurrentShareLink(), [invitation.shareLink]);
  const guestGreeting = useMemo(() => personalGuestName ? formatMessageTemplate(messages.guestGreeting, { guest: personalGuestName, couple: coupleName, link: currentShareLink }) : "", [personalGuestName, messages.guestGreeting, coupleName, currentShareLink]);
  const shareText = useMemo(() => encodeURIComponent(formatMessageTemplate(messages.whatsappShareMessage, { couple: coupleName, link: currentShareLink, guest: personalGuestName })), [messages.whatsappShareMessage, coupleName, currentShareLink, personalGuestName]);
  const rsvpWhatsappText = useMemo(() => encodeURIComponent(formatMessageTemplate(messages.rsvpWhatsappMessage, { couple: coupleName, link: currentShareLink, guest: personalGuestName })), [messages.rsvpWhatsappMessage, coupleName, currentShareLink, personalGuestName]);
  const qrImageUrl = useMemo(() => getQrImageUrl(currentShareLink), [currentShareLink]);
  const googleCalendarLink = useMemo(() => createGoogleCalendarLink(siteData, coupleName), [siteData, coupleName]);

  const timeLeft = useCountdown(invitation.weddingDate);
  const { audioRef, isMusicPlaying, startMusic, toggleMusic } = useAudio(invitation.musicFile);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  // TÜM CİHAZLAR İÇİN STANDARTLAŞTIRILMIŞ KAYDIRMA FONKSİYONLARI
  const scrollToNext = useCallback(() => {
    const sections = Array.from(document.querySelectorAll('.invitation-page > section, .invitation-page > footer'));
    const viewCenter = window.innerHeight / 2;
    let minDistance = Infinity;
    let currentIndex = 0;

    sections.forEach((sec, idx) => {
      const rect = sec.getBoundingClientRect();
      const secCenter = rect.top + rect.height / 2;
      const distance = Math.abs(secCenter - viewCenter);
      if (distance < minDistance) {
        minDistance = distance;
        currentIndex = idx;
      }
    });

    if (currentIndex < sections.length - 1) {
      const targetSec = sections[currentIndex + 1];
      const targetY = targetSec.getBoundingClientRect().top + window.scrollY;
      let scrollToY = targetY - (window.innerHeight - targetSec.offsetHeight) / 2;
      if (targetSec.offsetHeight > window.innerHeight * 0.95) scrollToY = targetY - 40;
      window.scrollTo({ top: scrollToY, behavior: 'smooth' });
    }
  }, []);

  const scrollToPrev = useCallback(() => {
    const sections = Array.from(document.querySelectorAll('.invitation-page > section, .invitation-page > footer'));
    const viewCenter = window.innerHeight / 2;
    let minDistance = Infinity;
    let currentIndex = 0;

    sections.forEach((sec, idx) => {
      const rect = sec.getBoundingClientRect();
      const secCenter = rect.top + rect.height / 2;
      const distance = Math.abs(secCenter - viewCenter);
      if (distance < minDistance) {
        minDistance = distance;
        currentIndex = idx;
      }
    });

    if (currentIndex > 0) {
      const targetSec = sections[currentIndex - 1];
      const targetY = targetSec.getBoundingClientRect().top + window.scrollY;
      let scrollToY = targetY - (window.innerHeight - targetSec.offsetHeight) / 2;
      if (targetSec.offsetHeight > window.innerHeight * 0.95) scrollToY = targetY - 40;
      window.scrollTo({ top: scrollToY, behavior: 'smooth' });
    }
  }, []);
  
  useEffect(() => {
    if (!opened) return;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      setShowScrollTop(currentScrollY > 50);
      const isAtBottom = Math.ceil(clientHeight + currentScrollY) >= scrollHeight - 50;
      setShowScrollDown(!isAtBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    setShowScrollDown(true); 
    setTimeout(handleScroll, 800); 
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [opened]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!opened) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [opened, scrollToNext, scrollToPrev]);
  
  const openInvitation = useCallback(() => {
    setIsOpening(true);
    startMusic().catch((err) => console.log("Müzik başlatılamadı:", err));
    setTimeout(() => { setOpened(true); }, 4000);
  }, [startMusic, setIsOpening, setOpened]);

  const copyInvitationLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentShareLink);
      await showAppAlert(t('alerts.linkCopied'), { title: isEn ? "Copied ✅" : "Kopyalandı ✅" });
    } catch {
      await showAppAlert(t('alerts.linkCopyError'), { title: isEn ? "Copy error ⚠️" : "Kopyalama hatası ⚠️" });
    }
  }, [currentShareLink, showAppAlert, t, isEn]);

  const { submitGuest, submitWish } = useDatabaseManager({
    guests, setGuests, wishes, setWishes, settings, 
    showAppAlert, showAppConfirm, t, isEn
  });

  if (!opened) {
    return (
      <div style={{height: "100%"}}>
        <audio key={invitation.musicFile} ref={audioRef} src={invitation.musicFile || ""} loop preload="auto" />
        <IntroPage 
          isOpening={isOpening} 
          copy={copy} 
          invitation={invitation} 
          personalGuestName={personalGuestName} 
          personalTableNumber={personalTableNumber}
          openInvitation={openInvitation} 
        />
        <FloatingMenu 
          isEn={isEn} 
          toggleLanguage={toggleLanguage} 
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
    <div style={{height: "100%"}}>
      <audio key={invitation.musicFile} ref={audioRef} src={invitation.musicFile || ""} loop preload="auto" />
      <FloatingMenu isEn={isEn} toggleLanguage={toggleLanguage} shareText={shareText} toggleMusic={toggleMusic} isMusicPlaying={isMusicPlaying} showScrollDown={showScrollDown} scrollToNext={scrollToNext} showScrollTop={showScrollTop} scrollToPrev={scrollToPrev} />
      
      <Suspense fallback={<div className="app-loading">Yükleniyor...</div>}>
        <InvitationView
          siteData={siteData} 
          settings={settings} 
          invitation={invitation} 
          copy={copy} 
          familyInfo={familyInfo} 
          coupleName={coupleName}
          guestGreeting={guestGreeting} 
          personalTableNumber={personalTableNumber}
          timeLeft={timeLeft} 
          googleCalendarLink={googleCalendarLink} 
          qrImageUrl={qrImageUrl}
          shareText={shareText} 
          copyInvitationLink={copyInvitationLink} 
          submitGuest={submitGuest}
          rsvpWhatsappText={rsvpWhatsappText} 
          guests={guests} 
          totalPersonCount={totalPersonCount} 
          notAttendingCount={notAttendingCount}
          submitWish={submitWish} 
          approvedWishes={approvedWishes} 
          scrollToNext={scrollToNext}
          scrollToPrev={scrollToPrev}
        />
      </Suspense>
    </div>
  );
}