import React, { useMemo } from "react";
import { useStore } from "../store/useStore";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useCountdown } from "../hooks/useCountdown";
import { useDatabaseManager } from "../hooks/useDatabaseManager";
import { formatMessageTemplate, getCurrentShareLink, createGoogleCalendarLink, getGuestNameFromUrl, getTableFromUrl, getQrImageUrl } from "../utils/helpers";
import {
  HeroSection, CountdownSection, InvitationMessageSection, FamilySection,
  CeremonySection, ScheduleSection, LocationSection, GallerySection,
  ShareSection, FooterSection, GiftSection, StorySection
} from "../components/invitation/PublicSections";
import {
  RsvpSection, GuestsListSection, WishesSection
} from "../components/invitation/InteractiveSections";

export default function InvitationView({ scrollToNext, scrollToPrev }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en') || false;

  // Zustand Store Bağlantıları
  const siteData = useStore((state) => state.siteData);
  const guests = useStore((state) => state.guests);
  const wishes = useStore((state) => state.wishes);
  const setGuests = useStore((state) => state.setGuests);
  const setWishes = useStore((state) => state.setWishes);
  const showAppAlert = useStore((state) => state.showAppAlert);
  const showAppConfirm = useStore((state) => state.showAppConfirm);

  // Türetilmiş Veriler
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

  const copyInvitationLink = async () => {
    try {
      await navigator.clipboard.writeText(currentShareLink);
      await showAppAlert(t('alerts.linkCopied'), { title: isEn ? "Copied ✅" : "Kopyalandı ✅" });
    } catch {
      await showAppAlert(t('alerts.linkCopyError'), { title: isEn ? "Copy error ⚠️" : "Kopyalama hatası ⚠️" });
    }
  };

  const handlePageClick = (e) => {
    // Hem mobilde hem desktop'ta tıkla-kaydır özelliği aktif
    const isInteractive = e.target.closest('button, a, input, textarea, select, .dock-btn, .option-button, .lightbox-control-btn, img, iframe, .mini-map, .info-row');
    if (!isInteractive) {
      e.clientX < window.innerWidth * 0.35 ? scrollToPrev() : scrollToNext();
    }
  };

return (
    <main className="invitation-page" onClick={handlePageClick}>
      {/* Dinamik SEO ve OG Etiketleri */}
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
        <div className="slide-wrapper"><CountdownSection copy={copy} timeLeft={timeLeft} /></div>
      )}
      
      <div className="slide-wrapper">
        <InvitationMessageSection copy={copy} invitation={invitation} />
      </div>
      
      {settings.visibility?.family !== false && (
        <div className="slide-wrapper"><FamilySection copy={copy} familyInfo={familyInfo} /></div>
      )}
      
      {settings.visibility?.story !== false && (
        <div className="slide-wrapper"><StorySection copy={copy} storyTimeline={storyTimeline} /></div>
      )}
      
      {settings.visibility?.ceremony !== false && (
        <div className="slide-wrapper"><CeremonySection copy={copy} eventDetails={eventDetails} /></div>
      )}
      
      {settings.visibility?.schedule !== false && (
        <div className="slide-wrapper"><ScheduleSection copy={copy} invitation={invitation} scheduleItems={scheduleItems} /></div>
      )}
      
      {settings.visibility?.location !== false && (
        <div className="slide-wrapper"><LocationSection copy={copy} invitation={invitation} googleCalendarLink={googleCalendarLink} /></div>
      )}
      
      {settings.visibility?.gallery !== false && (
        <div className="slide-wrapper"><GallerySection copy={copy} invitation={invitation} /></div>
      )}
      
      {settings.visibility?.rsvp !== false && (
        <div className="slide-wrapper"><RsvpSection copy={copy} submitGuest={submitGuest} invitation={invitation} rsvpWhatsappText={rsvpWhatsappText} showIban={settings.visibility?.popupIban !== false} giftData={giftRegistry} personalTableNumber={personalTableNumber} /></div>
      )}
      
      {settings.visibility?.guests !== false && (
        <div className="slide-wrapper"><GuestsListSection copy={copy} guests={guests} totalPersonCount={totalPersonCount} notAttendingCount={notAttendingCount} /></div>
      )}
      
      {settings.visibility?.wishes !== false && (
        <div className="slide-wrapper"><WishesSection copy={copy} submitWish={submitWish} approvedWishes={approvedWishes} /></div>
      )}
      
      {settings.visibility?.iban !== false && (
        <div className="slide-wrapper"><GiftSection giftData={giftRegistry} /></div>
      )}
      
      <div className="slide-wrapper">
        <ShareSection copy={copy} qrImageUrl={qrImageUrl} shareText={shareText} copyInvitationLink={copyInvitationLink} />
      </div>
      
      <div className="slide-wrapper">
        <FooterSection coupleName={coupleName} invitation={invitation} copy={copy} />
      </div>
    </main>
  );
}