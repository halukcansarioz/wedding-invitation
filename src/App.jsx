import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

function App() {
  const audioRef = useRef(null);

  const invitation = {
    bride: "Handenur",
    groom: "Haluk Can",
    dateText: "Gelecek Tarih",
    timeText: "19:00",
    weddingDate: "2026-09-12T19:00:00",
    venue: "Kır Bahçesi Düğün Alanı",
    address: "Gebze / Kocaeli",
    mapLink: "https://www.google.com/maps",
    shareLink: window.location.href,
    whatsappNumber: "905551112233",

    introImage:
      "https://unsplash.com/photos/4AX70fujoxg/download?force=true&w=3840",

    heroImage:
      "https://unsplash.com/photos/IxKTpb8XKH0/download?force=true&w=3840",

    gallery: [
      "https://unsplash.com/photos/4AX70fujoxg/download?force=true&w=3840",
      "https://unsplash.com/photos/BQZo2Hc76p0/download?force=true&w=3840",
      "https://unsplash.com/photos/fJzmPe-a0eU/download?force=true&w=3840",
      "https://unsplash.com/photos/IxKTpb8XKH0/download?force=true&w=3840",
    ],

    message:
      "Hayatımızın en özel gününde mutluluğumuzu sizinle paylaşmak istiyoruz. Bu güzel başlangıçta sizleri de aramızda görmekten onur duyarız.",
  };

  const [opened, setOpened] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [guestForm, setGuestForm] = useState({
    name: "",
    attendance: "Katılacağım",
    personCount: 1,
    side: "Gelin Tarafı",
    note: "",
  });

  const [wishForm, setWishForm] = useState({
    name: "",
    message: "",
  });

  const [guests, setGuests] = useState([]);
  const [wishes, setWishes] = useState([]);

  useEffect(() => {
  const imageUrls = [
    invitation.introImage,
    invitation.heroImage,
    ...invitation.gallery,
  ];

  imageUrls.forEach((src) => {
    const img = new Image();
    img.src = src;
    });
  }, []);

  const coupleName = `${invitation.bride} & ${invitation.groom}`;

  useEffect(() => {
    const savedGuests = localStorage.getItem("wedding-guests");
    const savedWishes = localStorage.getItem("wedding-wishes");

    if (savedGuests) {
      setGuests(JSON.parse(savedGuests));
    }

    if (savedWishes) {
      setWishes(JSON.parse(savedWishes));
    }
  }, []);

  useEffect(() => {
    const targetDate = new Date(invitation.weddingDate);

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const attendingGuests = guests.filter(
    (guest) => guest.attendance === "Katılacağım"
  );

  const totalPersonCount = attendingGuests.reduce(
    (total, guest) => total + Number(guest.personCount || 1),
    0
  );

  const notAttendingCount = guests.filter(
    (guest) => guest.attendance === "Katılamayacağım"
  ).length;

  const shareText = useMemo(() => {
    return encodeURIComponent(
      `${coupleName} düğün davetiyesi 💍\n${invitation.shareLink}`
    );
  }, [coupleName, invitation.shareLink]);

  const rsvpWhatsappText = useMemo(() => {
    return encodeURIComponent(
      `Merhaba, ${coupleName} düğün davetiyenizi aldım. Katılım durumumu bildirmek istiyorum.`
    );
  }, [coupleName]);

  const googleCalendarLink = useMemo(() => {
    const start = new Date(invitation.weddingDate);
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);

    const formatDate = (date) =>
      date.toISOString().replace(/-|:|\.\d+/g, "");

    const title = encodeURIComponent(`${coupleName} Düğünü`);
    const details = encodeURIComponent(invitation.message);
    const location = encodeURIComponent(
      `${invitation.venue}, ${invitation.address}`
    );

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(
      start
    )}/${formatDate(end)}&details=${details}&location=${location}`;
  }, []);

  const openInvitation = () => {
    setOpened(true);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsMusicPlaying(true))
          .catch(() => setIsMusicPlaying(false));
      }
    }, 500);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => setIsMusicPlaying(false));
    }
  };

  const handleGuestChange = (e) => {
    const { name, value } = e.target;

    setGuestForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWishChange = (e) => {
    const { name, value } = e.target;

    setWishForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitGuest = (e) => {
    e.preventDefault();

    if (!guestForm.name.trim()) {
      alert("Lütfen ad soyad gir.");
      return;
    }

    const newGuest = {
      id: Date.now(),
      ...guestForm,
      createdAt: new Date().toLocaleString("tr-TR"),
    };

    const updatedGuests = [newGuest, ...guests];

    setGuests(updatedGuests);
    localStorage.setItem("wedding-guests", JSON.stringify(updatedGuests));

    setGuestForm({
      name: "",
      attendance: "Katılacağım",
      personCount: 1,
      side: "Gelin Tarafı",
      note: "",
    });

    alert("Katılım bildirimin kaydedildi.");
  };

  const submitWish = (e) => {
    e.preventDefault();

    if (!wishForm.name.trim() || !wishForm.message.trim()) {
      alert("Lütfen isim ve mesaj gir.");
      return;
    }

    const newWish = {
      id: Date.now(),
      ...wishForm,
      createdAt: new Date().toLocaleString("tr-TR"),
    };

    const updatedWishes = [newWish, ...wishes];

    setWishes(updatedWishes);
    localStorage.setItem("wedding-wishes", JSON.stringify(updatedWishes));

    setWishForm({
      name: "",
      message: "",
    });

    alert("Güzel dileğin kaydedildi.");
  };

  const copyInvitationLink = async () => {
    try {
      await navigator.clipboard.writeText(invitation.shareLink);
      alert("Davetiye linki kopyalandı.");
    } catch {
      alert("Link kopyalanamadı.");
    }
  };

  function CustomSelect({ value, options, onChange }) {
    const [open, setOpen] = useState(false);

    const selectedOption = options.find(
      (option) => String(option.value) === String(value)
    );

    return (
      <div className={`custom-select ${open ? "open" : ""}`}>
        <button
          type="button"
          className="custom-select-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
        >
          <span>{selectedOption?.label}</span>
          <span className="custom-select-arrow">⌄</span>
        </button>

        {open && (
          <div
            className="custom-select-menu"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.preventDefault()}
          >
            {options.map((option) => (
              <button
                type="button"
                key={option.value}
                className={
                  String(option.value) === String(value)
                    ? "custom-select-option selected"
                    : "custom-select-option"
                }
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  onChange(option.value);

                  setTimeout(() => {
                    setOpen(false);
                  }, 80);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const OptionGroup = ({ value, options, onChange, disabled = false }) => {
    return (
      <div className={disabled ? "option-group disabled" : "option-group"}>
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            disabled={disabled}
            className={
              String(value) === String(option.value)
                ? "option-button active"
                : "option-button"
            }
            onClick={() => {
              if (disabled) return;
              onChange(option.value);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  };

  const isAttending = guestForm.attendance === "Katılacağım";

  return (
    <div
      className="app"
      style={{
        "--intro-image": `url(${invitation.introImage})`,
        "--hero-image": `url(${invitation.heroImage})`,
      }}
    >
      <audio ref={audioRef} src="/music.mp3" loop />

      {!opened ? (
        <section className="intro-page">
          <div className="ribbon ribbon-left"></div>
          <div className="ribbon ribbon-right"></div>

          <div className="intro-card">
            <div className="leaf-mark">🌿</div>

            <p className="intro-small">Düğün Davetiyesi</p>

            <h1 className="couple-title">
              <span>{invitation.bride}</span>
              <em>&</em>
              <span>{invitation.groom}</span>
            </h1>

            <p className="intro-text">
              Sevgiyle başlayan hikayemizin en özel gününe davetlisiniz.
            </p>

            <button className="open-button" onClick={openInvitation}>
              Daveti Aç
            </button>
          </div>
        </section>
      ) : (
        <>
          <div className="floating-actions">
            <button onClick={toggleMusic}>
              {isMusicPlaying ? "Müziği Durdur" : "Müzik Aç"}
            </button>

            <a
              href={`https://wa.me/?text=${shareText}`}
              target="_blank"
              rel="noreferrer"
            >
              Paylaş
            </a>
          </div>

          <main className="invitation-page">
            <section className="hero-section">
              <div className="hero-content">
                <p className="small-title">Biz Evleniyoruz</p>

                <h1 className="couple-title">
                  <span>{invitation.bride}</span>
                  <em>&</em>
                  <span>{invitation.groom}</span>
                </h1>

                <p className="hero-date">{invitation.dateText}</p>
                <p className="hero-time">Saat {invitation.timeText}</p>
              </div>
            </section>

            <section className="countdown-section">
              <p className="section-label">Geri Sayım</p>
              <h2>Düğünümüze Kalan Süre</h2>

              <div className="countdown-grid">
                <div className="count-box">
                  <strong>{timeLeft.days}</strong>
                  <span>Gün</span>
                </div>

                <div className="count-box">
                  <strong>{timeLeft.hours}</strong>
                  <span>Saat</span>
                </div>

                <div className="count-box">
                  <strong>{timeLeft.minutes}</strong>
                  <span>Dakika</span>
                </div>

                <div className="count-box">
                  <strong>{timeLeft.seconds}</strong>
                  <span>Saniye</span>
                </div>
              </div>
            </section>

            <section className="card invitation-card">
              <p className="section-label">Davet</p>
              <h2>Mutluluğumuza Ortak Olur Musunuz?</h2>
              <p>{invitation.message}</p>
            </section>

            <section className="card">
              <p className="section-label">Tarih ve Konum</p>
              <h2>Düğün Bilgileri</h2>

              <div className="info-list">
                <div className="info-row">
                  <span>Tarih</span>
                  <strong>{invitation.dateText}</strong>
                </div>

                <div className="info-row">
                  <span>Saat</span>
                  <strong>{invitation.timeText}</strong>
                </div>

                <div className="info-row">
                  <span>Yer</span>
                  <strong>{invitation.venue}</strong>
                </div>

                <div className="info-row">
                  <span>Adres</span>
                  <strong>{invitation.address}</strong>
                </div>
              </div>

              <div className="mini-map">
                <iframe
                  title="Düğün Konumu"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    `${invitation.venue} ${invitation.address}`
                  )}&z=15&output=embed`}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="button-group">
                <a
                  className="main-button"
                  href={invitation.mapLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Konuma Git
                </a>

                <a
                  className="secondary-button"
                  href={googleCalendarLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Takvime Ekle
                </a>
              </div>
            </section>

            <section className="card">
              <p className="section-label">Program</p>
              <h2>Akış</h2>

              <div className="timeline">
                <div className="timeline-item">
                  <span>18:30</span>
                  <p>Misafir Karşılama</p>
                </div>

                <div className="timeline-item">
                  <span>19:00</span>
                  <p>Nikah Töreni</p>
                </div>

                <div className="timeline-item">
                  <span>20:00</span>
                  <p>Yemek ve Kutlama</p>
                </div>

                <div className="timeline-item">
                  <span>21:00</span>
                  <p>Eğlence</p>
                </div>
              </div>
            </section>

            <section className="card gallery-card">
              <p className="section-label">Fotoğraflar</p>
              <h2>Kır Düğünü Atmosferi</h2>

              <div className="gallery-grid">
                {invitation.gallery.map((image, index) => (
                  <img key={index} src={image} alt={`Galeri ${index + 1}`} />
                ))}
              </div>
            </section>

            <section className="card rsvp-card">
              <p className="section-label">Katılım</p>
              <h2>Katılım Bildirimi</h2>
              <p>
                Katılıp katılamayacağınızı bildirerek planlamamıza yardımcı
                olabilirsiniz.
              </p>

              <form className="rsvp-form" onSubmit={submitGuest}>
                <input
                  name="name"
                  value={guestForm.name}
                  onChange={handleGuestChange}
                  placeholder="Ad Soyad"
                />

                <OptionGroup
                  value={guestForm.attendance}
                  options={[
                    { label: "Katılacağım", value: "Katılacağım" },
                    { label: "Katılamayacağım", value: "Katılamayacağım" },
                  ]}
                  onChange={(value) =>
                    setGuestForm((prev) => ({
                      ...prev,
                      attendance: value,
                      personCount: value === "Katılacağım" ? "1" : "0",
                      side: value === "Katılacağım" ? "Gelin Tarafı" : "-",
                    }))
                  }
                />

                <OptionGroup
                  disabled={!isAttending}
                  value={guestForm.personCount}
                  options={[
                    { label: "1 Kişi", value: "1" },
                    { label: "2 Kişi", value: "2" },
                    { label: "3 Kişi", value: "3" },
                    { label: "4 Kişi", value: "4" },
                  ]}
                  onChange={(value) =>
                    setGuestForm((prev) => ({
                      ...prev,
                      personCount: value,
                    }))
                  }
                />

                <OptionGroup
                  disabled={!isAttending}
                  value={guestForm.side}
                  options={[
                    { label: "Gelin Tarafı", value: "Gelin Tarafı" },
                    { label: "Damat Tarafı", value: "Damat Tarafı" },
                    { label: "Ortak", value: "Ortak" },
                  ]}
                  onChange={(value) =>
                    setGuestForm((prev) => ({
                      ...prev,
                      side: value,
                    }))
                  }
                />

                <textarea
                  name="note"
                  value={guestForm.note}
                  onChange={handleGuestChange}
                  placeholder="Notunuz"
                ></textarea>

                <button type="submit" className="main-button form-button">
                  Katılımı Gönder
                </button>
              </form>

              <a
                className="secondary-button whatsapp-button"
                href={`https://wa.me/${invitation.whatsappNumber}?text=${rsvpWhatsappText}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp ile Bildir
              </a>
            </section>

            <section className="card guest-panel">
              <p className="section-label">Misafirler</p>
              <h2>Misafir Listesi</h2>

              <div className="guest-stats">
                <div>
                  <strong>{guests.length}</strong>
                  <span>Toplam Yanıt</span>
                </div>

                <div>
                  <strong>{totalPersonCount}</strong>
                  <span>Katılacak Kişi</span>
                </div>

                <div>
                  <strong>{notAttendingCount}</strong>
                  <span>Katılamayacak</span>
                </div>
              </div>

              <div className="guest-list">
                {guests.length === 0 ? (
                  <p className="empty-text">Henüz katılım bildirimi yok.</p>
                ) : (
                  guests.slice(0, 6).map((guest) => (
                    <div className="guest-item" key={guest.id}>
                      <div>
                        <strong>{guest.name}</strong>
                        <span>
                          {guest.side} · {guest.personCount} kişi
                        </span>
                      </div>

                      <em>{guest.attendance}</em>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="card">
              <p className="section-label">Anı Defteri</p>
              <h2>Güzel Dilekleriniz</h2>

              <form className="wish-form" onSubmit={submitWish}>
                <input
                  name="name"
                  value={wishForm.name}
                  onChange={handleWishChange}
                  placeholder="Ad Soyad"
                />

                <textarea
                  name="message"
                  value={wishForm.message}
                  onChange={handleWishChange}
                  placeholder="Mesajınız"
                ></textarea>

                <button type="submit" className="main-button form-button">
                  Mesajı Gönder
                </button>
              </form>

              <div className="wish-list">
                {wishes.length === 0 ? (
                  <p className="empty-text">Henüz güzel dilek yok.</p>
                ) : (
                  wishes.slice(0, 4).map((wish) => (
                    <div className="wish-item" key={wish.id}>
                      <p>“{wish.message}”</p>
                      <strong>{wish.name}</strong>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="card share-card">
              <p className="section-label">Paylaş</p>
              <h2>Davetiyeyi Paylaş</h2>
              <p>Davetiyemizi sevdiklerinizle paylaşabilirsiniz.</p>

              <div className="button-group">
                <a
                  className="main-button"
                  href={`https://wa.me/?text=${shareText}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp ile Paylaş
                </a>

                <button className="secondary-button" onClick={copyInvitationLink}>
                  Linki Kopyala
                </button>
              </div>
            </section>

            <footer className="footer">
              <p>{coupleName}</p>
              <span>{invitation.dateText}</span>
              <small>Made with love</small>
            </footer>
          </main>
        </>
      )}
    </div>
  );
}

export default App;