import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSiteContext, useUIContext } from "../context/Providers";
import { useAudio } from "../hooks/useAudio";
import { useCountdown } from "../hooks/useCountdown";
import { useDatabaseManager } from "../hooks/useDatabaseManager";
import IntroPage from "../components/invitation/IntroPage";
import FloatingMenu from "../components/common/FloatingMenu";
import { formatMessageTemplate, getCurrentShareLink, createGoogleCalendarLink, getGuestNameFromUrl, getQrImageUrl } from "../utils/helpers";

const InvitationView = lazy(() => import("./InvitationView"));

export default function InvitationController() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');

  const { siteData, guests, setGuests, wishes, setWishes } = useSiteContext();
  const { opened, setOpened, isOpening, setIsOpening, guestForm, setGuestForm, wishForm, setWishForm, showAppAlert, showAppConfirm } = useUIContext();

  const toggleLanguage = () => i18n.changeLanguage(isEn ? 'tr' : 'en');

  // Memoize Edilmiş Alt Veriler
  const invitation = useMemo(() => siteData.invitation, [siteData.invitation]);
  const familyInfo = useMemo(() => siteData.familyInfo, [siteData.familyInfo]);
  const copy = useMemo(() => siteData.copy, [siteData.copy]);
  const settings = useMemo(() => siteData.settings, [siteData.settings]);
  const messages = useMemo(() => siteData.messages, [siteData.messages]);
  
  const coupleName = useMemo(() => `${invitation.bride} & ${invitation.groom}`, [invitation.bride, invitation.groom]);
  const personalGuestName = useMemo(() => getGuestNameFromUrl(), []);
  
  const isAttending = useMemo(() => guestForm.attendance === "Katılacağım", [guestForm.attendance]);
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

  // SCROLL SİSTEMİ
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);

  const scrollToNext = useCallback(() => {
    const isMobile = window.innerWidth <= 650;
    const sections = Array.from(document.querySelectorAll('.invitation-page > section, .invitation-page > footer'));
    if (isMobile) {
      if (currentSlideIndex < sections.length - 1) setCurrentSlideIndex((prev) => prev + 1);
    } else {
      const currentScroll = window.scrollY;
      const nextSection = sections.find(sec => {
        const rect = sec.getBoundingClientRect();
        return (rect.top + window.scrollY) > currentScroll + (window.innerHeight * 0.5);
      });
      if (nextSection) nextSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else if (sections.length > 0) sections[sections.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentSlideIndex]);

  const scrollToPrev = useCallback(() => {
    const isMobile = window.innerWidth <= 650;
    const sections = Array.from(document.querySelectorAll('.invitation-page > section, .invitation-page > footer'));
    if (isMobile) {
      if (currentSlideIndex > 0) setCurrentSlideIndex((prev) => prev - 1);
    } else {
      const currentScroll = window.scrollY;
      const prevSection = [...sections].reverse().find(sec => {
        const rect = sec.getBoundingClientRect();
        return (rect.top + window.scrollY) < currentScroll - (window.innerHeight * 0.1); 
      });
      if (prevSection) prevSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentSlideIndex]);

  const handleWheel = useCallback((e) => {
    if (!opened || isScrollingRef.current) return;
    if (window.innerWidth <= 650) {
      if (e.deltaY > 0) scrollToNext();
      else scrollToPrev();
      isScrollingRef.current = true;
      setTimeout(() => { isScrollingRef.current = false; }, 600);
    }
  }, [opened, scrollToNext, scrollToPrev]);

  const handleTouchStart = useCallback((e) => {
    if (e.touches && e.touches.length > 0) touchStartYRef.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!opened || isScrollingRef.current || !e.changedTouches || e.changedTouches.length === 0) return;
    if (window.innerWidth <= 650) {
      const target = e.target;
      if (target.closest('input, textarea, select, .wish-list, .guest-list, .gallery-lightbox-overlay')) return; 

      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartYRef.current - touchEndY;

      if (Math.abs(diff) > 60) {
        if (diff > 0) scrollToNext(); 
        else scrollToPrev(); 
        isScrollingRef.current = true;
        setTimeout(() => { isScrollingRef.current = false; }, 600);
      }
    }
  }, [opened, scrollToNext, scrollToPrev]);

  useEffect(() => {
    if (!opened) return;
    const checkAndApplyClasses = () => {
      const sections = document.querySelectorAll('.invitation-page > section, .invitation-page > footer');
      if (!sections.length) { setTimeout(checkAndApplyClasses, 50); return; }
      if (window.innerWidth <= 650) {
        sections.forEach((sec, idx) => {
          if (idx === currentSlideIndex) sec.classList.add('active-slide');
          else sec.classList.remove('active-slide');
        });
        setShowScrollTop(currentSlideIndex > 0);
        setShowScrollDown(currentSlideIndex < sections.length - 1);
      }
    };
    checkAndApplyClasses();
    
    const handleScroll = () => {
      if (window.innerWidth > 650) {
        setShowScrollTop(window.scrollY > 100);
        const isAtBottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 100;
        setShowScrollDown(!isAtBottom);
      }
    };

    if (window.innerWidth > 650) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      setShowScrollDown(true); 
      setTimeout(handleScroll, 800); 
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentSlideIndex, opened]);

  const openInvitation = useCallback(() => {
    setIsOpening(true);
    startMusic().catch((err) => console.log("Müzik başlatılamadı:", err));
    setTimeout(() => { setOpened(true); }, 4000);
  }, [startMusic, setIsOpening, setOpened]);

  const handleGuestChange = useCallback((e) => setGuestForm(prev => ({ ...prev, [e.target.name]: e.target.value })), [setGuestForm]);
  const handleWishChange = useCallback((e) => setWishForm(prev => ({ ...prev, [e.target.name]: e.target.value })), [setWishForm]);

  const updateAttendance = useCallback((attendance) => {
    setGuestForm(prev => ({
      ...prev, attendance,
      personCount: attendance === "Katılacağım" ? (prev.personCount === "0" ? "1" : prev.personCount) : "0",
      side: attendance === "Katılacağım" ? (prev.side === "-" ? "Gelin Tarafı" : prev.side) : "-",
      hasChild: attendance === "Katılacağım" ? (prev.hasChild === "-" ? "Hayır" : prev.hasChild) : "-",
    }));
  }, [setGuestForm]);

  const copyInvitationLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentShareLink);
      await showAppAlert(t('alerts.linkCopied'), { title: isEn ? "Copied ✅" : "Kopyalandı ✅" });
    } catch {
      await showAppAlert(t('alerts.linkCopyError'), { title: isEn ? "Copy error ⚠️" : "Kopyalama hatası ⚠️" });
    }
  }, [currentShareLink, showAppAlert, t, isEn]);

  const { submitGuest, submitWish } = useDatabaseManager({
    guests, setGuests, wishes, setWishes, guestForm, setGuestForm, wishForm, setWishForm, settings, 
    showAppAlert, showAppConfirm, t, isEn
  });

  if (!opened) {
    return (
      <div onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{height: "100%"}}>
        <audio key={invitation.musicFile} ref={audioRef} src={invitation.musicFile || ""} loop preload="auto" />
        <IntroPage isOpening={isOpening} copy={copy} invitation={invitation} personalGuestName={personalGuestName} openInvitation={openInvitation} />
        <FloatingMenu isEn={isEn} toggleLanguage={toggleLanguage} shareText={shareText} toggleMusic={toggleMusic} isMusicPlaying={isMusicPlaying} showScrollDown={showScrollDown} scrollToNext={scrollToNext} showScrollTop={showScrollTop} scrollToPrev={scrollToPrev} />
      </div>
    );
  }

  return (
    <div onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{height: "100%"}}>
      <audio key={invitation.musicFile} ref={audioRef} src={invitation.musicFile || ""} loop preload="auto" />
      <FloatingMenu isEn={isEn} toggleLanguage={toggleLanguage} shareText={shareText} toggleMusic={toggleMusic} isMusicPlaying={isMusicPlaying} showScrollDown={showScrollDown} scrollToNext={scrollToNext} showScrollTop={showScrollTop} scrollToPrev={scrollToPrev} />
      
      <Suspense fallback={<div className="app-loading">Yükleniyor...</div>}>
        <InvitationView
          siteData={siteData} settings={settings} invitation={invitation} copy={copy} familyInfo={familyInfo} coupleName={coupleName}
          guestGreeting={guestGreeting} timeLeft={timeLeft} googleCalendarLink={googleCalendarLink} qrImageUrl={qrImageUrl}
          shareText={shareText} copyInvitationLink={copyInvitationLink} guestForm={guestForm} handleGuestChange={handleGuestChange}
          updateAttendance={updateAttendance} setGuestForm={setGuestForm} isAttending={isAttending} submitGuest={submitGuest}
          rsvpWhatsappText={rsvpWhatsappText} guests={guests} totalPersonCount={totalPersonCount} notAttendingCount={notAttendingCount}
          wishForm={wishForm} handleWishChange={handleWishChange} submitWish={submitWish} approvedWishes={approvedWishes} scrollToNext={scrollToNext}
        />
      </Suspense>
    </div>
  );
}