import React from "react";
import { useStore } from "../store/useStore";
import { ResponsiveSlideShow } from "../components/common/ResponsiveSlideShow";
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
  RsvpSection,
  WishesSection,
  GuestsListSection,
  GuestCameraSection,
  SmartAlbumSection,
  FooterSection
} from "../components/invitation/sections";

export default function InvitationView(props) {
  const siteData = useStore((state) => state.siteData);
  const { settings, invitation, copy, eventDetails, scheduleItems, storyTimeline, familyInfo, giftRegistry } = siteData;
  
  const v = settings?.visibility || {};

  return (
    <ResponsiveSlideShow>
      <HeroSection {...props} invitation={invitation} copy={copy} settings={settings} />
      
      {v.countdown && <CountdownSection {...props} copy={copy} timeLeft={props.timeLeft} />}
      
      <InvitationMessageSection {...props} copy={copy} invitation={invitation} />
      
      {v.family && <FamilySection {...props} copy={copy} familyInfo={familyInfo} />}
      
      {v.story && <StorySection {...props} copy={copy} storyTimeline={storyTimeline} />}
      
      {v.ceremony && <CeremonySection {...props} copy={copy} eventDetails={eventDetails} />}
      
      {v.schedule && <ScheduleSection {...props} copy={copy} invitation={invitation} scheduleItems={scheduleItems} />}
      
      {v.location && <LocationSection {...props} copy={copy} invitation={invitation} />}
      
      {v.gallery && <GallerySection {...props} copy={copy} invitation={invitation} />}
      
      {v.guests && <GuestCameraSection {...props} />}
      
      {v.guests && <SmartAlbumSection {...props} />}
      
      {v.rsvp && <RsvpSection {...props} copy={copy} invitation={invitation} />}
      
      {v.wishes && <WishesSection {...props} copy={copy} />}
      
      {v.iban && <GiftSection {...props} giftData={giftRegistry} />}
      
      <ShareSection {...props} copy={copy} />
      
      <FooterSection {...props} coupleName={`${invitation.bride} & ${invitation.groom}`} invitation={invitation} copy={copy} />
    </ResponsiveSlideShow>
  );
}