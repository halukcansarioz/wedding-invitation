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
  FooterSection
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
  isMusicPlaying,
  toggleMusic
}) {
  return (
    <>
      <div className="floating-actions">
        <a className="share-button" href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer">
          Paylaş
        </a>

        <button
          type="button"
          className={`music-toggle-button ${isMusicPlaying ? "music-on" : "music-off"}`}
          onClick={toggleMusic}
          aria-pressed={isMusicPlaying}
          aria-label={isMusicPlaying ? "Müziği Kapat" : "Müziği Aç"}
          title={isMusicPlaying ? "Müziği Kapat" : "Müziği Aç"}
        >
          <svg viewBox="0 0 24 24" width="25" height="25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 9V15H8L13 19V5L8 9H4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            {isMusicPlaying ? (
              <>
                <path d="M16 9C17 10 17 14 16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M18.5 7C21 10 21 14 18.5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M17 9L21 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M21 9L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      <main className="invitation-page">
        <HeroSection invitation={invitation} copy={copy} guestGreeting={guestGreeting} />

        {settings.visibility?.countdown !== false && (
          <CountdownSection copy={copy} timeLeft={timeLeft} />
        )}

        <InvitationMessageSection copy={copy} invitation={invitation} />

        {settings.visibility?.family !== false && (
          <FamilySection copy={copy} familyInfo={familyInfo} />
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

        <ShareSection
          copy={copy}
          qrImageUrl={qrImageUrl}
          shareText={shareText}
          copyInvitationLink={copyInvitationLink}
        />

        <FooterSection coupleName={coupleName} invitation={invitation} copy={copy} />
      </main>
    </>
  );
}