import React, { useMemo, useEffect, lazy, Suspense } from "react";
import { useStore } from "../store/useStore";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useCountdown } from "../hooks/useCountdown";
import { useDatabaseManager } from "../hooks/useDatabaseManager";
import { formatMessageTemplate, getCurrentShareLink, createGoogleCalendarLink, getGuestNameFromUrl, getTableFromUrl, getQrImageUrl } from "../utils/helpers";

import { HeroSection } from "../components/invitation/sections/HeroSection";

const CountdownSection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.CountdownSection })));
const InvitationMessageSection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.InvitationMessageSection })));
const FamilySection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.FamilySection })));
const CeremonySection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.CeremonySection })));
const ScheduleSection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.ScheduleSection })));
const LocationSection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.LocationSection })));
const GallerySection = lazy(() => import("../components/invitation/sections/GallerySection").then(m => ({ default: m.GallerySection })));
const ShareSection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.ShareSection })));
const FooterSection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.FooterSection })));
const GiftSection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.GiftSection })));
const StorySection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.StorySection })));
const RsvpSection = lazy(() => import("../components/invitation/sections/RsvpSection").then(m => ({ default: m.RsvpSection })));
const GuestsListSection = lazy(() => import("../components/invitation/sections/GuestsListSection").then(m => ({ default: m.GuestsListSection })));
const WishesSection = lazy(() => import("../components/invitation/sections/WishesSection").then(m => ({ default: m.WishesSection })));

const SectionLoader = () => <div style={{ minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}></div>;

export default function InvitationView({ scrollToNext, scrollToPrev, currentSlideIndex }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en') || false;

  const siteData = useStore((state) => state.siteData);
  const guests = useStore((state) => state.guests);
  const wishes = useStore((state) => state.wishes);
  const setGuests = useStore((state) => state.setGuests);
  const setWishes = useStore((state) => state.setWishes);
  const showAppAlert = useStore((state) => state.showAppAlert);
  const showAppConfirm = useStore((state) => state.showAppConfirm);

  const { invitation, settings, copy, familyInfo, messages, storyTimeline, eventDetails, scheduleItems, giftRegistry } = siteData;
  const coupleName = `${invitation.bride} & ${invitation.groom}`;
  const personalGuestName = getGuestNameFromUrl();
  const personalTableNumber = getTableFromUrl();
  const currentShareLink = invitation.shareLink || getCurrentShareLink();
  
  const guestGreeting = personalGuestName ? formatMessageTemplate(messages.guestGreeting, { guest: personalGuestName, couple: coupleName, link: currentShareLink }) : "";
  const rsvpWhatsappText = encodeURIComponent(formatMessageTemplate(messages.rsvpWhatsappMessage, { couple: coupleName, link: currentShareLink, guest: personalGuestName }));
  const shareText = encodeURIComponent(formatMessageTemplate(messages.whatsappShareMessage, { couple: coupleName, link: currentShareLink, guest: personalGuestName }));
  const googleCalendarLink = createGoogleCalendarLink(siteData, coupleName);
  const qrImageUrl = getQrImageUrl(currentShareLink);
  const timeLeft = useCountdown(invitation.weddingDate);

  const attendingGuests = useMemo(() => guests.filter((g) => g.attendance === "Katılacağım"), [guests]);
  const totalPersonCount = attendingGuests.reduce((tot, g) => tot + Number(g.personCount || 1), 0);
  const notAttendingCount = guests.filter((g) => g.attendance === "Katılamayacağım").length;
  const approvedWishes = wishes.filter((w) => w.approved !== false);

  const { submitGuest, submitWish } = useDatabaseManager({
    guests, setGuests, wishes, setWishes, settings, showAppAlert, showAppConfirm, t, isEn
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const copyInvitationLink = async () => {
    try {
      await navigator.clipboard.writeText(currentShareLink);
      await showAppAlert(t('alerts.linkCopied'), { title: isEn ? "Copied ✅" : "Kopyalandı ✅" });
    } catch {
      await showAppAlert(t('alerts.linkCopyError'), { title: isEn ? "Copy error ⚠️" : "Kopyalama hatası ⚠️" });
    }
  };

  const handlePageClick = (e) => {
    if (window.innerWidth > 768) return;
    const target = e.target instanceof Element ? e.target : e.target.parentElement;
    if (!target) return;

    if (target.closest('.floating-actions, .glass-dock, .dock-btn')) return;
    const isInteractive = target.closest('button, a, input, textarea, select, .option-button, .lightbox-control-btn, img, iframe, .mini-map, .info-row');
    if (isInteractive) return;

    // Instagram Hikaye Mantığı (Sağa Tıkla İleri, Sola Tıkla Geri)
    if (e.clientX < window.innerWidth * 0.35) {
      if (typeof scrollToPrev === 'function') scrollToPrev();
    } else {
      if (typeof scrollToNext === 'function') scrollToNext();
    }
  };

  // Tüm bölümleri dinamik ve temiz bir sıraya alıyoruz (Sadece görünür olanlar render edilecek)
  const sections = [
    <HeroSection settings={settings} invitation={invitation} copy={copy} guestGreeting={guestGreeting} personalTableNumber={personalTableNumber} scrollToNext={scrollToNext} />,
    settings.visibility?.countdown !== false ? <Suspense fallback={<SectionLoader />}><CountdownSection copy={copy} timeLeft={timeLeft} /></Suspense> : null,
    <Suspense fallback={<SectionLoader />}><InvitationMessageSection copy={copy} invitation={invitation} /></Suspense>,
    settings.visibility?.family !== false ? <Suspense fallback={<SectionLoader />}><FamilySection copy={copy} familyInfo={familyInfo} /></Suspense> : null,
    settings.visibility?.story !== false ? <Suspense fallback={<SectionLoader />}><StorySection copy={copy} storyTimeline={storyTimeline} /></Suspense> : null,
    settings.visibility?.ceremony !== false ? <Suspense fallback={<SectionLoader />}><CeremonySection copy={copy} eventDetails={eventDetails} /></Suspense> : null,
    settings.visibility?.schedule !== false ? <Suspense fallback={<SectionLoader />}><ScheduleSection copy={copy} invitation={invitation} scheduleItems={scheduleItems} /></Suspense> : null,
    settings.visibility?.location !== false ? <Suspense fallback={<SectionLoader />}><LocationSection copy={copy} invitation={invitation} googleCalendarLink={googleCalendarLink} /></Suspense> : null,
    settings.visibility?.gallery !== false ? <Suspense fallback={<SectionLoader />}><GallerySection copy={copy} invitation={invitation} /></Suspense> : null,
    settings.visibility?.rsvp !== false ? <Suspense fallback={<SectionLoader />}><RsvpSection copy={copy} submitGuest={submitGuest} invitation={invitation} rsvpWhatsappText={rsvpWhatsappText} showIban={settings.visibility?.popupIban !== false} giftData={giftRegistry} personalTableNumber={personalTableNumber} /></Suspense> : null,
    settings.visibility?.guests !== false ? <Suspense fallback={<SectionLoader />}><GuestsListSection copy={copy} guests={guests} totalPersonCount={totalPersonCount} notAttendingCount={notAttendingCount} /></Suspense> : null,
    settings.visibility?.wishes !== false ? <Suspense fallback={<SectionLoader />}><WishesSection copy={copy} submitWish={submitWish} approvedWishes={approvedWishes} /></Suspense> : null,
    settings.visibility?.iban !== false ? <Suspense fallback={<SectionLoader />}><GiftSection giftData={giftRegistry} /></Suspense> : null,
    <Suspense fallback={<SectionLoader />}><ShareSection copy={copy} qrImageUrl={qrImageUrl} shareText={shareText} copyInvitationLink={copyInvitationLink} /></Suspense>,
    <Suspense fallback={<SectionLoader />}><FooterSection coupleName={coupleName} invitation={invitation} copy={copy} /></Suspense>
  ].filter(Boolean);

  return (
    <main 
      className="invitation-page" 
      onClick={handlePageClick}
      style={{ 
        '--hero-image': `url(${invitation.heroImage})`, 
        '--intro-image': `url(${invitation.introImage})` 
      }}
    >
      <Helmet>
        <title>{coupleName} - Düğün Davetiyesi</title>
        <meta name="description" content={invitation.message} />
        <meta property="og:title" content={`${coupleName} - Evleniyoruz!`} />
        <meta property="og:description" content={invitation.message} />
        <meta property="og:image" content={invitation.heroImage} />
        <meta property="og:url" content={currentShareLink} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Dinamik Bölüm Render İşlemi ve Animasyon Sınıfları */}
      {sections.map((Section, index) => (
        <div 
          key={index} 
          className={`slide-wrapper ${currentSlideIndex === index ? 'active-slide' : ''}`}
        >
          {Section}
        </div>
      ))}
    </main>
  );
}