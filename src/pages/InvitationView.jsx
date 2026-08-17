import React from "react";
import {
  HeroSection,
  CountdownSection,
  InvitationMessageSection,
  FamilySection,
  CeremonySection,
  ScheduleSection,
  LocationSection,
  GallerySection,
  ShareSection,
  FooterSection,
  GiftSection,
  StorySection
} from "../components/invitation/PublicSections";
import {
  RsvpSection,
  GuestsListSection,
  WishesSection
} from "../components/invitation/InteractiveSections";

export default function InvitationView({
  siteData,
  settings,
  invitation,
  copy,
  familyInfo,
  coupleName,
  guestGreeting,
  timeLeft,
  googleCalendarLink,
  qrImageUrl,
  shareText,
  copyInvitationLink,
  guestForm,
  handleGuestChange,
  updateAttendance,
  setGuestForm,
  isAttending,
  submitGuest,
  rsvpWhatsappText,
  guests,
  totalPersonCount,
  notAttendingCount,
  wishForm,
  handleWishChange,
  submitWish,
  approvedWishes,
  scrollToNext // <-- 1. BURAYI EKLEDİK
}) {

  // <-- 2. BURAYI EKLEDİK: Ekrana tıklayınca kaydırma fonksiyonu
  const handlePageClick = (e) => {
    // Sadece mobil görünümde çalışsın
    if (window.innerWidth > 650) return;

    // Eğer tıklanan yer bir buton, link, input veya form elemanıysa kaydırma yapma
    const target = e.target;
    const isInteractive = target.closest('button, a, input, textarea, select, .dock-btn, .option-button, .lightbox-control-btn');

    if (!isInteractive && scrollToNext) {
      scrollToNext();
    }
  };

  return (
    // <-- 3. BURAYI EKLEDİK: onClick={handlePageClick}
    <main className="invitation-page" onClick={handlePageClick}>
      <HeroSection invitation={invitation} copy={copy} guestGreeting={guestGreeting} />

      {settings.visibility?.countdown !== false && (
        <CountdownSection copy={copy} timeLeft={timeLeft} />
      )}

      <InvitationMessageSection copy={copy} invitation={invitation} />

      {settings.visibility?.family !== false && (
        <FamilySection copy={copy} familyInfo={familyInfo} />
      )}

      {settings.visibility?.story !== false && (
        <StorySection copy={copy} storyTimeline={siteData.storyTimeline} />
      )}

      {settings.visibility?.ceremony !== false && (
        <CeremonySection copy={copy} eventDetails={siteData.eventDetails} />
      )}

      {settings.visibility?.schedule !== false && (
        <ScheduleSection copy={copy} invitation={invitation} scheduleItems={siteData.scheduleItems} />
      )}

      {settings.visibility?.location !== false && (
        <LocationSection copy={copy} invitation={invitation} googleCalendarLink={googleCalendarLink} />
      )}

      {settings.visibility?.gallery !== false && (
        <GallerySection copy={copy} invitation={invitation} />
      )}

      {settings.visibility?.rsvp !== false && (
        <RsvpSection
          copy={copy}
          guestForm={guestForm}
          handleGuestChange={handleGuestChange}
          updateAttendance={updateAttendance}
          setGuestForm={setGuestForm}
          isAttending={isAttending}
          submitGuest={submitGuest}
          invitation={invitation}
          rsvpWhatsappText={rsvpWhatsappText}
          showIban={settings.visibility?.popupIban !== false}
          giftData={siteData.giftRegistry}
        />
      )}

      {settings.visibility?.guests !== false && (
        <GuestsListSection
          copy={copy}
          guests={guests}
          totalPersonCount={totalPersonCount}
          notAttendingCount={notAttendingCount}
        />
      )}

      {settings.visibility?.wishes !== false && (
        <WishesSection
          copy={copy}
          wishForm={wishForm}
          handleWishChange={handleWishChange}
          submitWish={submitWish}
          approvedWishes={approvedWishes}
        />
      )}

      {settings.visibility?.iban !== false && (
        <GiftSection giftData={siteData.giftRegistry} />
      )}

      <ShareSection
        copy={copy}
        qrImageUrl={qrImageUrl}
        shareText={shareText}
        copyInvitationLink={copyInvitationLink}
      />

      <FooterSection coupleName={coupleName} invitation={invitation} copy={copy} />
    </main>
  );
}