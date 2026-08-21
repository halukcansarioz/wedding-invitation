import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
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

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  /* =========================================================
     KARTLARI EKRANIN TAM ORTASINA HİZALAYAN KAYDIRMA MANTIĞI
     ========================================================= */
  const scrollToNext = useCallback(() => {
    const sections = Array.from(document.querySelectorAll('.invitation-page > section, .invitation-page > footer'));
    
    // Şu an ekranda GÖZÜKEN (merkeze en yakın) kartı tespit et
    let minDistance = Infinity;
    let currentIndex = 0;
    const viewCenter = window.innerHeight / 2;

    sections.forEach((sec, idx) => {
      const rect = sec.getBoundingClientRect();
      const secCenter = rect.top + rect.height / 2;
      const distance = Math.abs(secCenter - viewCenter);
      if (distance < minDistance) {
        minDistance = distance;
        currentIndex = idx;
      }
    });

    // Eğer son kartta değilsek, bir sonraki (index + 1) karta git
    if (currentIndex < sections.length - 1) {
      const targetSec = sections[currentIndex + 1];
      const targetY = targetSec.getBoundingClientRect().top + window.scrollY;
      const sectionHeight = targetSec.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      let scrollToY = targetY - (viewportHeight - sectionHeight) / 2;
      
      if (sectionHeight > viewportHeight * 0.95) {
        scrollToY = targetY - 40;
      }
      
      window.scrollTo({ top: scrollToY, behavior: 'smooth' });
    } else {
      // Zaten sondaysak sayfanın en dibine kaydır
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  const scrollToPrev = useCallback(() => {
    const sections = Array.from(document.querySelectorAll('.invitation-page > section, .invitation-page > footer'));
    
    // Şu an ekranda GÖZÜKEN (merkeze en yakın) kartı tespit et
    let minDistance = Infinity;
    let currentIndex = 0;
    const viewCenter = window.innerHeight / 2;

    sections.forEach((sec, idx) => {
      const rect = sec.getBoundingClientRect();
      const secCenter = rect.top + rect.height / 2;
      const distance = Math.abs(secCenter - viewCenter);
      if (distance < minDistance) {
        minDistance = distance;
        currentIndex = idx;
      }
    });

    // Eğer ilk kartta değilsek, bir önceki (index - 1) karta git
    if (currentIndex > 0) {
      const targetSec = sections[currentIndex - 1];
      const targetY = targetSec.getBoundingClientRect().top + window.scrollY;
      const sectionHeight = targetSec.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      let scrollToY = targetY - (viewportHeight - sectionHeight) / 2;
      
      if (sectionHeight > viewportHeight * 0.95) {
        scrollToY = targetY - 40;
      }

      window.scrollTo({ top: scrollToY, behavior: 'smooth' });
    } else {
      // Zaten en üstteysek sayfanın en tepesine kaydır
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);
  
  useEffect(() => {
    if (!opened) return;
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100);
      const isAtBottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 100;
      setShowScrollDown(!isAtBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    setShowScrollDown(true); 
    setTimeout(handleScroll, 800); 
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [opened]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Zarf açılmadıysa veya kullanıcı bir form dolduruyorsa (input/textarea) tuşlara müdahale etme
      if (!opened) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault(); // Tarayıcının varsayılan küçük kaydırmasını engeller
        scrollToNext();     // Bizim merkeze hizalayan fonksiyonumuzu çalıştırır
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
      <div style={{height: "100%"}}>
        <audio key={invitation.musicFile} ref={audioRef} src={invitation.musicFile || ""} loop preload="auto" />
        <IntroPage isOpening={isOpening} copy={copy} invitation={invitation} personalGuestName={personalGuestName} openInvitation={openInvitation} />
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