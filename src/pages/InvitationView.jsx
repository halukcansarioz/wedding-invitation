import React, { useMemo } from "react";
import { useStore } from "../store/useStore";
import { useGuestsQuery } from "../hooks/useGuestsQuery";
import { useWishesQuery } from "../hooks/useWishesQuery";
import { formatMessageTemplate, getQrImageUrl } from "../utils/helpers";
import {
  HeroSection,
  CountdownSection,
  InvitationMessageSection,
  FamilySection,
  StorySection,
  CeremonySection,
  ScheduleSection,
  LocationSection,
  GallerySection,
  ShareSection,
  GiftSection,
  FooterSection,
  RsvpSection,
  WishesSection,
  GuestsListSection,
  GuestCameraSection,
  SmartAlbumSection
} from "../components/invitation/sections";

export default function InvitationView({ scrollToNext, scrollToPrev, currentSlideIndex }) {
  const siteData = useStore((state) => state.siteData);
  const guests = useStore((state) => state.guests);
  const { addGuest } = useGuestsQuery();
  const { wishes, addWish } = useWishesQuery();

  const { invitation, copy, familyInfo, settings, giftRegistry, eventDetails, scheduleItems, storyTimeline, messages } = siteData;
  const visibility = settings.visibility || {};

  const coupleName = `${invitation.bride} & ${invitation.groom}`;
  const rsvpWhatsappText = encodeURIComponent(formatMessageTemplate(messages.rsvpWhatsappMessage, { couple: coupleName }));
  const shareText = encodeURIComponent(formatMessageTemplate(messages.whatsappShareMessage, { couple: coupleName, link: invitation.shareLink }));
  const qrImageUrl = getQrImageUrl(invitation.shareLink);
  const guestGreetingText = formatMessageTemplate(messages.guestGreeting, { guest: "", couple: coupleName }).replace("Sevgili ,", "").trim();

  const personalTableNumber = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("table") : "";

  return (
    <main className="invitation-page">
      <HeroSection 
        invitation={invitation} 
        copy={copy} 
        guestGreeting={guestGreetingText} 
        personalTableNumber={personalTableNumber} 
        scrollToNext={scrollToNext} 
        settings={settings}
      />

      <div className="content-wrapper">
        {visibility.countdown && !settings.isPostWedding && <CountdownSection copy={copy} timeLeft={{ days: 0, hours: 0, minutes: 0, seconds: 0 }} />}
        
        <InvitationMessageSection copy={copy} invitation={invitation} />
        
        {visibility.family && <FamilySection copy={copy} familyInfo={familyInfo} />}
        
        {visibility.story && <StorySection copy={copy} storyTimeline={storyTimeline} />}
        
        {visibility.ceremony && !settings.isPostWedding && <CeremonySection copy={copy} eventDetails={eventDetails} />}
        
        {visibility.schedule && !settings.isPostWedding && <ScheduleSection copy={copy} invitation={invitation} scheduleItems={scheduleItems} />}
        
        {visibility.location && !settings.isPostWedding && <LocationSection copy={copy} invitation={invitation} />}
        
        {/* Düğün Sonrası Akıllı Albüm (AI Yüz Tanıma) */}
        {settings.isPostWedding && <SmartAlbumSection />}

        {visibility.gallery && (
          <>
            <GallerySection copy={copy} invitation={invitation} />
            <GuestCameraSection />
          </>
        )}
        
        {visibility.rsvp && !settings.isPostWedding && (
          <RsvpSection 
            copy={copy} 
            submitGuest={addGuest} 
            invitation={invitation} 
            rsvpWhatsappText={rsvpWhatsappText} 
            showIban={visibility.popupIban} 
            giftData={giftRegistry} 
            personalTableNumber={personalTableNumber}
          />
        )}
        
        {visibility.guests && !settings.isPostWedding && <GuestsListSection copy={copy} guests={guests} />}
        
        {visibility.wishes && <WishesSection copy={copy} submitWish={addWish} approvedWishes={wishes} />}
        
        {visibility.iban && <GiftSection giftData={giftRegistry} />}
        
        <ShareSection copy={copy} qrImageUrl={qrImageUrl} shareText={shareText} />
      </div>

      <FooterSection coupleName={coupleName} invitation={invitation} copy={copy} />
    </main>
  );
}