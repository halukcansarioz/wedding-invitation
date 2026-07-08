import React from "react";
import { OptionGroup } from "../common/UIComponents";
import {
  NOTE_MAX_LENGTH,
  WISH_MAX_LENGTH,
  ATTENDANCE_OPTIONS,
  PERSON_COUNT_OPTIONS,
  SIDE_OPTIONS,
  CHILD_OPTIONS
} from "../../config/constants";

export function RsvpSection({ copy, guestForm, handleGuestChange, updateAttendance, setGuestForm, isAttending, submitGuest, invitation, rsvpWhatsappText }) {
  return (
    <section className="card rsvp-card">
      <p className="section-label">{copy.rsvpLabel}</p>
      <h2>{copy.rsvpTitle}</h2>
      <p>{copy.rsvpText}</p>
      <form className="rsvp-form" onSubmit={submitGuest}>
        <input name="name" value={guestForm.name} onChange={handleGuestChange} placeholder="Ad Soyad" />
        <input name="phone" type="tel" value={guestForm.phone} onChange={handleGuestChange} placeholder="Telefon Numaranız" maxLength="20" />
        <OptionGroup onChange={updateAttendance} options={ATTENDANCE_OPTIONS} value={guestForm.attendance} />
        <OptionGroup
          disabled={!isAttending}
          onChange={(personCount) => setGuestForm((prev) => ({ ...prev, personCount }))}
          options={PERSON_COUNT_OPTIONS}
          value={guestForm.personCount}
        />
        <OptionGroup
          disabled={!isAttending}
          onChange={(side) => setGuestForm((prev) => ({ ...prev, side }))}
          options={SIDE_OPTIONS}
          value={guestForm.side}
        />
        <OptionGroup
          disabled={!isAttending}
          onChange={(hasChild) => setGuestForm((prev) => ({ ...prev, hasChild }))}
          options={CHILD_OPTIONS}
          value={guestForm.hasChild}
        />
        <div className="field-with-counter">
          <textarea name="note" value={guestForm.note} onChange={handleGuestChange} placeholder="Notunuz" maxLength={NOTE_MAX_LENGTH}></textarea>
          <span>{guestForm.note.length}/{NOTE_MAX_LENGTH}</span>
        </div>
        <button type="submit" className="main-button form-button">Katılımı Gönder</button>
      </form>
      <a
        className="secondary-button whatsapp-button"
        href={`https://wa.me/${invitation.whatsappNumber?.replace(/\D/g, "")}?text=${rsvpWhatsappText}`}
        target="_blank"
        rel="noreferrer"
      >
        WhatsApp ile Bildir
      </a>
    </section>
  );
}

export function GuestsListSection({ copy, guests, totalPersonCount, notAttendingCount }) {
  return (
    <section className="card">
      <p className="section-label">{copy.guestsLabel}</p>
      <h2>{copy.guestsTitle}</h2>
      <div className="guest-stats">
        <div><strong>{guests.length}</strong><span>Toplam Yanıt</span></div>
        <div><strong>{totalPersonCount}</strong><span>Katılacak Kişi</span></div>
        <div><strong>{notAttendingCount}</strong><span>Katılamayacak</span></div>
      </div>
      <div className="guest-list">
        {guests.length === 0 ? (
          <p className="empty-text">Henüz katılım bildirimi yok.</p>
        ) : (
          guests.slice(0, 6).map((guest) => (
            <div className="guest-item" key={guest.id}>
              <div>
                <strong>{guest.name}</strong>
                <span>{guest.side} · {guest.personCount} kişi · Çocuk: {guest.hasChild || "Hayır"}</span>
                {guest.phone && <small>{guest.phone}</small>}
              </div>
              <em>{guest.attendance}</em>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function WishesSection({ copy, wishForm, handleWishChange, submitWish, approvedWishes }) {
  return (
    <section className="card">
      <p className="section-label">{copy.wishesLabel}</p>
      <h2>{copy.wishesTitle}</h2>
      <form className="wish-form" onSubmit={submitWish}>
        <input name="name" value={wishForm.name} onChange={handleWishChange} placeholder="Ad Soyad" />
        <div className="field-with-counter">
          <textarea name="message" value={wishForm.message} onChange={handleWishChange} placeholder="Mesajınız" maxLength={WISH_MAX_LENGTH}></textarea>
          <span>{wishForm.message.length}/{WISH_MAX_LENGTH}</span>
        </div>
        <button type="submit" className="main-button form-button">Mesajı Gönder</button>
      </form>
      <div className="wish-list">
        {approvedWishes.length === 0 ? (
          <p className="empty-text">Henüz güzel dilek yok.</p>
        ) : (
          approvedWishes.slice(0, 4).map((wish) => (
            <div className="wish-item" key={wish.id}>
              <p>"{wish.message}"</p>
              <strong>{wish.name}</strong>
            </div>
          ))
        )}
      </div>
    </section>
  );
}