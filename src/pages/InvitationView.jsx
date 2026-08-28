import React, { useMemo } from "react";
import { useStore } from "../store/useStore";
import { useTranslation } from "react-i18next";
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
  const isEn = i18n.language.startsWith('en');

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
    if (window.innerWidth > 650) return;
    const isInteractive = e.target.closest('button, a, input, textarea, select, .dock-btn, .option-button, .lightbox-control-btn, img, iframe, .mini-map, .info-row');
    if (!isInteractive) {
      e.clientX < window.innerWidth * 0.35 ? scrollToPrev() : scrollToNext();
    }
  };

  return (
    <main className="invitation-page" onClick={handlePageClick}>
      <HeroSection invitation={invitation} copy={copy} guestGreeting={guestGreeting} personalTableNumber={personalTableNumber} scrollToNext={scrollToNext} />
      {settings.visibility?.countdown !== false && <CountdownSection copy={copy} timeLeft={timeLeft} />}
      <InvitationMessageSection copy={copy} invitation={invitation} />
      {settings.visibility?.family !== false && <FamilySection copy={copy} familyInfo={familyInfo} />}
      {settings.visibility?.story !== false && <StorySection copy={copy} storyTimeline={storyTimeline} />}
      {settings.visibility?.ceremony !== false && <CeremonySection copy={copy} eventDetails={eventDetails} />}
      {settings.visibility?.schedule !== false && <ScheduleSection copy={copy} invitation={invitation} scheduleItems={scheduleItems} />}
      {settings.visibility?.location !== false && <LocationSection copy={copy} invitation={invitation} googleCalendarLink={googleCalendarLink} />}
      {settings.visibility?.gallery !== false && <GallerySection copy={copy} invitation={invitation} />}
      {settings.visibility?.rsvp !== false && <RsvpSection copy={copy} submitGuest={submitGuest} invitation={invitation} rsvpWhatsappText={rsvpWhatsappText} showIban={settings.visibility?.popupIban !== false} giftData={giftRegistry} personalTableNumber={personalTableNumber} />}
      {settings.visibility?.guests !== false && <GuestsListSection copy={copy} guests={guests} totalPersonCount={totalPersonCount} notAttendingCount={notAttendingCount} />}
      {settings.visibility?.wishes !== false && <WishesSection copy={copy} submitWish={submitWish} approvedWishes={approvedWishes} />}
      {settings.visibility?.iban !== false && <GiftSection giftData={giftRegistry} />}
      <ShareSection copy={copy} qrImageUrl={qrImageUrl} shareText={shareText} copyInvitationLink={copyInvitationLink} />
      <FooterSection coupleName={coupleName} invitation={invitation} copy={copy} />
    </main>
  );
}