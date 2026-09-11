import React, { useMemo, useEffect, lazy, Suspense } from "react";
import { useStore } from "../store/useStore";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useCountdown } from "../hooks/useCountdown";
import { useDatabaseManager } from "../hooks/useDatabaseManager";
import { formatMessageTemplate, getCurrentShareLink, createGoogleCalendarLink, getGuestNameFromUrl, getTableFromUrl, getQrImageUrl } from "../utils/helpers";

// SADECE GÖRÜNÜR İLK COMPONENT STATİK İMPORT EDİLİR
import { HeroSection } from "../components/invitation/sections";

// DİĞERLERİ LAZY LOAD EDİLİR
const CountdownSection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.CountdownSection })));
const InvitationMessageSection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.InvitationMessageSection })));
const FamilySection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.FamilySection })));
const CeremonySection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.CeremonySection })));
const ScheduleSection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.ScheduleSection })));
const LocationSection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.LocationSection })));
const GallerySection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.GallerySection })));
const ShareSection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.ShareSection })));
const FooterSection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.FooterSection })));
const GiftSection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.GiftSection })));
const StorySection = lazy(() => import("../components/invitation/sections").then(m => ({ default: m.StorySection })));
const RsvpSection = lazy(() => import("../components/invitation/sections/RsvpSection").then(m => ({ default: m.RsvpSection })));
const GuestsListSection = lazy(() => import("../components/invitation/sections/GuestsListSection").then(m => ({ default: m.GuestsListSection })));
const WishesSection = lazy(() => import("../components/invitation/sections/WishesSection").then(m => ({ default: m.WishesSection })));

// Skeleton Loader Component (Tembel yüklenen alanlar için)
const SectionLoader = () => <div style={{ minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}></div>;

export default function InvitationView({ scrollToNext, scrollToPrev }) {
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

    if (e.clientX < window.innerWidth * 0.35) {
      if (typeof scrollToPrev === 'function') scrollToPrev();
    } else {
      if (typeof scrollToNext === 'function') scrollToNext();
    }
  };

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

      <div className="slide-wrapper">
        <HeroSection invitation={invitation} copy={copy} guestGreeting={guestGreeting} personalTableNumber={personalTableNumber} scrollToNext={scrollToNext} />
      </div>
      
      {settings.visibility?.countdown !== false && (
        <div className="slide-wrapper">
          <Suspense fallback={<SectionLoader />}>
            <CountdownSection copy={copy} timeLeft={timeLeft} />
          </Suspense>
        </div>
      )}
      
      <div className="slide-wrapper">
        <Suspense fallback={<SectionLoader />}>
          <InvitationMessageSection copy={copy} invitation={invitation} />
        </Suspense>
      </div>
      
      {settings.visibility?.family !== false && (
        <div className="slide-wrapper">
          <Suspense fallback={<SectionLoader />}>
            <FamilySection copy={copy} familyInfo={familyInfo} />
          </Suspense>
        </div>
      )}
      
      {settings.visibility?.story !== false && (
        <div className="slide-wrapper">
          <Suspense fallback={<SectionLoader />}>
            <StorySection copy={copy} storyTimeline={storyTimeline} />
          </Suspense>
        </div>
      )}
      
      {settings.visibility?.ceremony !== false && (
        <div className="slide-wrapper">
          <Suspense fallback={<SectionLoader />}>
            <CeremonySection copy={copy} eventDetails={eventDetails} />
          </Suspense>
        </div>
      )}
      
      {settings.visibility?.schedule !== false && (
        <div className="slide-wrapper">
          <Suspense fallback={<SectionLoader />}>
            <ScheduleSection copy={copy} invitation={invitation} scheduleItems={scheduleItems} />
          </Suspense>
        </div>
      )}
      
      {settings.visibility?.location !== false && (
        <div className="slide-wrapper">
          <Suspense fallback={<SectionLoader />}>
            <LocationSection copy={copy} invitation={invitation} googleCalendarLink={googleCalendarLink} />
          </Suspense>
        </div>
      )}
      
      {settings.visibility?.gallery !== false && (
        <div className="slide-wrapper">
          <Suspense fallback={<SectionLoader />}>
            <GallerySection copy={copy} invitation={invitation} />
          </Suspense>
        </div>
      )}
      
      {settings.visibility?.rsvp !== false && (
        <div className="slide-wrapper">
          <Suspense fallback={<SectionLoader />}>
            <RsvpSection copy={copy} submitGuest={submitGuest} invitation={invitation} rsvpWhatsappText={rsvpWhatsappText} showIban={settings.visibility?.popupIban !== false} giftData={giftRegistry} personalTableNumber={personalTableNumber} />
          </Suspense>
        </div>
      )}
      
      {settings.visibility?.guests !== false && (
        <div className="slide-wrapper">
          <Suspense fallback={<SectionLoader />}>
            <GuestsListSection copy={copy} guests={guests} totalPersonCount={totalPersonCount} notAttendingCount={notAttendingCount} />
          </Suspense>
        </div>
      )}
      
      {settings.visibility?.wishes !== false && (
        <div className="slide-wrapper">
          <Suspense fallback={<SectionLoader />}>
            <WishesSection copy={copy} submitWish={submitWish} approvedWishes={approvedWishes} />
          </Suspense>
        </div>
      )}
      
      {settings.visibility?.iban !== false && (
        <div className="slide-wrapper">
          <Suspense fallback={<SectionLoader />}>
            <GiftSection giftData={giftRegistry} />
          </Suspense>
        </div>
      )}
      
      <div className="slide-wrapper">
        <Suspense fallback={<SectionLoader />}>
          <ShareSection copy={copy} qrImageUrl={qrImageUrl} shareText={shareText} copyInvitationLink={copyInvitationLink} />
        </Suspense>
      </div>
      
      <div className="slide-wrapper">
        <Suspense fallback={<SectionLoader />}>
          <FooterSection coupleName={coupleName} invitation={invitation} copy={copy} />
        </Suspense>
      </div>
    </main>
  );
}