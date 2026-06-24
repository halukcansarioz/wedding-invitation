import { useEffect, useRef, useState } from "react";
import "./App.css";

const INVITATION = {
  bride: "Handenur ",
  groom: "Haluk Can",
  dateText: "Gelecek Tarih",
  timeText: "19:00",
  weddingDate: "2026-09-12T19:00:00",
  venue: "Kır Bahçesi Düğün Alanı",
  address: "Gebze / Kocaeli",
  mapLink: "https://www.google.com/maps",
  shareLink: typeof window !== "undefined" ? window.location.href : "",
  whatsappNumber: "905551112233",
  introImage: "https://unsplash.com/photos/4AX70fujoxg/download?force=true&w=3840",
  heroImage: "https://unsplash.com/photos/IxKTpb8XKH0/download?force=true&w=3840",
  gallery: [
    "https://unsplash.com/photos/4AX70fujoxg/download?force=true&w=3840",
    "https://unsplash.com/photos/BQZo2Hc76p0/download?force=true&w=3840",
    "https://unsplash.com/photos/fJzmPe-a0eU/download?force=true&w=3840",
    "https://unsplash.com/photos/IxKTpb8XKH0/download?force=true&w=3840",
  ],
  message:
    "Hayatımızın en özel gününde mutluluğumuzu sizinle paylaşmak istiyoruz. Bu güzel başlangıçta sizleri de aramızda görmekten onur duyarız.",
};

const COUPLE_NAME = `${INVITATION.bride} & ${INVITATION.groom}`;

const INITIAL_GUEST_FORM = {
  name: "",
  attendance: "Katılacağım",
  personCount: "1",
  side: "Gelin Tarafı",
  note: "",
};

const INITIAL_WISH_FORM = {
  name: "",
  message: "",
};

const ATTENDANCE_OPTIONS = [
  { label: "Katılacağım", value: "Katılacağım" },
  { label: "Katılamayacağım", value: "Katılamayacağım" },
];

const PERSON_COUNT_OPTIONS = [
  { label: "1 Kişi", value: "1" },
  { label: "2 Kişi", value: "2" },
  { label: "3 Kişi", value: "3" },
  { label: "4 Kişi", value: "4" },
];

const SIDE_OPTIONS = [
  { label: "Gelin Tarafı", value: "Gelin Tarafı" },
  { label: "Damat Tarafı", value: "Damat Tarafı" },
  { label: "Ortak", value: "Ortak" },
];

const PROGRAM_ITEMS = [
  { time: "18:30", title: "Misafir Karşılama" },
  { time: "19:00", title: "Nikah Töreni" },
  { time: "20:00", title: "Yemek ve Kutlama" },
  { time: "21:00", title: "Eğlence" },
];

const loadStoredList = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const createGoogleCalendarLink = () => {
  const start = new Date(INVITATION.weddingDate);
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
  const formatDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, "");

  const title = encodeURIComponent(`${COUPLE_NAME} Düğünü`);
  const details = encodeURIComponent(INVITATION.message);
  const location = encodeURIComponent(`${INVITATION.venue}, ${INVITATION.address}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(
    start
  )}/${formatDate(end)}&details=${details}&location=${location}`;
};

function OptionGroup({ value, options, onChange, disabled = false }) {
  return (
    <div className={disabled ? "option-group disabled" : "option-group"}>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          disabled={disabled}
          className={String(value) === String(option.value) ? "option-button active" : "option-button"}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function App() {
  const audioContextRef = useRef(null);
  const musicIntervalRef = useRef(null);
  const musicGainRef = useRef(null);
  
  const [opened, setOpened] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [guestForm, setGuestForm] = useState(INITIAL_GUEST_FORM);
  const [wishForm, setWishForm] = useState(INITIAL_WISH_FORM);
  const [guests, setGuests] = useState([]);
  const [wishes, setWishes] = useState([]);

  const isAttending = guestForm.attendance === "Katılacağım";

  useEffect(() => {
  return () => {
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current);
    }

    if (
      audioContextRef.current &&
      audioContextRef.current.state !== "closed"
    ) {
      audioContextRef.current.close();
        }
      };
  }, []);

  const attendingGuests = guests.filter((guest) => guest.attendance === "Katılacağım");
  const totalPersonCount = attendingGuests.reduce(
    (total, guest) => total + Number(guest.personCount || 1),
    0
  );
  const notAttendingCount = guests.filter(
    (guest) => guest.attendance === "Katılamayacağım"
  ).length;

  const shareText = encodeURIComponent(
    `${COUPLE_NAME} düğün davetiyesi 💍\n${INVITATION.shareLink}`
  );
  const rsvpWhatsappText = encodeURIComponent(
    `Merhaba, ${COUPLE_NAME} düğün davetiyenizi aldım. Katılım durumumu bildirmek istiyorum.`
  );
  const googleCalendarLink = createGoogleCalendarLink();

  useEffect(() => {
    [INVITATION.introImage, INVITATION.heroImage, ...INVITATION.gallery].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    setGuests(loadStoredList("wedding-guests"));
    setWishes(loadStoredList("wedding-wishes"));
  }, []);

  useEffect(() => {
    const targetDate = new Date(INVITATION.weddingDate);

    const updateCountdown = () => {
      const diff = targetDate - new Date();

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

    const openInvitation = async () => {
      setOpened(true);
      await startMusic();
    };
    const startMusic = async () => {
    if (musicIntervalRef.current) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = audioContextRef.current || new AudioContext();

      audioContextRef.current = audioContext;
      await audioContext.resume();

      const masterGain = audioContext.createGain();
      masterGain.gain.setValueAtTime(0.16, audioContext.currentTime);
      masterGain.connect(audioContext.destination);
      musicGainRef.current = masterGain;

      const notes = [
        392.0, 440.0, 523.25, 659.25,
        523.25, 440.0, 392.0, 329.63,
      ];

      let noteIndex = 0;

      const playNote = () => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(
          notes[noteIndex % notes.length],
          audioContext.currentTime
        );

        gain.gain.setValueAtTime(0, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.92, audioContext.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          audioContext.currentTime + 0.55
        );

        oscillator.connect(gain);
        gain.connect(masterGain);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.6);

        noteIndex += 1;
      };

      playNote();
      musicIntervalRef.current = setInterval(playNote, 650);
      setIsMusicPlaying(true);
    } catch (error) {
      setIsMusicPlaying(false);
      console.log("Müzik başlatılamadı:", error);
    }
  };

  const toggleMusic = async () => {
    if (isMusicPlaying) {
      if (musicIntervalRef.current) {
        clearInterval(musicIntervalRef.current);
        musicIntervalRef.current = null;
      }

      if (musicGainRef.current) {
        musicGainRef.current.disconnect();
        musicGainRef.current = null;
      }

      setIsMusicPlaying(false);
    } else {
      await startMusic();
    }
  };

  const handleGuestChange = (e) => {
    const { name, value } = e.target;
    setGuestForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleWishChange = (e) => {
    const { name, value } = e.target;
    setWishForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateAttendance = (attendance) => {
    setGuestForm((prev) => ({
      ...prev,
      attendance,
      personCount: attendance === "Katılacağım" ? "1" : "0",
      side: attendance === "Katılacağım" ? "Gelin Tarafı" : "-",
    }));
  };

  const saveList = (key, list, setter) => {
    setter(list);
    localStorage.setItem(key, JSON.stringify(list));
  };

  const submitGuest = (e) => {
    e.preventDefault();

    if (!guestForm.name.trim()) {
      alert("Lütfen ad soyad gir.");
      return;
    }

    const updatedGuests = [{ id: Date.now(), ...guestForm }, ...guests];
    saveList("wedding-guests", updatedGuests, setGuests);
    setGuestForm(INITIAL_GUEST_FORM);
    alert("Katılım bildirimin kaydedildi.");
  };

  const submitWish = (e) => {
    e.preventDefault();

    if (!wishForm.name.trim() || !wishForm.message.trim()) {
      alert("Lütfen isim ve mesaj gir.");
      return;
    }

    const updatedWishes = [{ id: Date.now(), ...wishForm }, ...wishes];
    saveList("wedding-wishes", updatedWishes, setWishes);
    setWishForm(INITIAL_WISH_FORM);
    alert("Güzel dileğin kaydedildi.");
  };

  const copyInvitationLink = async () => {
    try {
      await navigator.clipboard.writeText(INVITATION.shareLink);
      alert("Davetiye linki kopyalandı.");
    } catch {
      alert("Link kopyalanamadı.");
    }
  };

  return (
    <div
      className="app"
      style={{
        "--intro-image": `url(${INVITATION.introImage})`,
        "--hero-image": `url(${INVITATION.heroImage})`,
      }}
    >

      {!opened ? (
        <section className="intro-page">
          <div className="ribbon ribbon-left"></div>
          <div className="ribbon ribbon-right"></div>

          <div className="intro-card">
            <div className="leaf-mark" aria-hidden="true"></div>
            <p className="intro-small">Düğün Davetiyesi</p>

            <h1 className="couple-title">
              <span>{INVITATION.bride}</span>
              <em>&</em>
              <span>{INVITATION.groom}</span>
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
          <a
            className="share-button"
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noreferrer"
          >
            Paylaş
          </a>

          <button
            className="music-toggle-button"
            onClick={toggleMusic}
            aria-label={isMusicPlaying ? "Müziği Kapat" : "Müziği Aç"}
            title={isMusicPlaying ? "Müziği Kapat" : "Müziği Aç"}
          >
            <svg
              viewBox="0 0 24 24"
              width="25"
              height="25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 9V15H8L13 19V5L8 9H4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {isMusicPlaying ? (
                <>
                  <path
                    d="M17 9L21 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M21 9L17 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <>
                  <path
                    d="M16 9C17 10 17 14 16 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18.5 7C21 10 21 14 18.5 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </button>
        </div>

          <main className="invitation-page">
            <section className="hero-section">
              <div className="hero-content">
                <p className="small-title">Biz Evleniyoruz</p>

                <h1 className="couple-title">
                  <span>{INVITATION.bride}</span>
                  <em>&</em>
                  <span>{INVITATION.groom}</span>
                </h1>

                <p className="hero-date">{INVITATION.dateText}</p>
                <p className="hero-time">Saat {INVITATION.timeText}</p>
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
              <p>{INVITATION.message}</p>
            </section>

            <section className="card">
              <p className="section-label">Tarih ve Konum</p>
              <h2>Düğün Bilgileri</h2>

              <div className="info-list">
                <div className="info-row">
                  <span>Tarih</span>
                  <strong>{INVITATION.dateText}</strong>
                </div>
                <div className="info-row">
                  <span>Saat</span>
                  <strong>{INVITATION.timeText}</strong>
                </div>
                <div className="info-row">
                  <span>Yer</span>
                  <strong>{INVITATION.venue}</strong>
                </div>
                <div className="info-row">
                  <span>Adres</span>
                  <strong>{INVITATION.address}</strong>
                </div>
              </div>

              <div className="mini-map">
                <iframe
                  title="Düğün Konumu"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    `${INVITATION.venue} ${INVITATION.address}`
                  )}&z=15&output=embed`}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="button-group">
                <a className="main-button" href={INVITATION.mapLink} target="_blank" rel="noreferrer">
                  Konuma Git
                </a>
                <a className="secondary-button" href={googleCalendarLink} target="_blank" rel="noreferrer">
                  Takvime Ekle
                </a>
              </div>
            </section>

            <section className="card">
              <p className="section-label">Program</p>
              <h2>Akış</h2>

              <div className="timeline">
                {PROGRAM_ITEMS.map((item) => (
                  <div className="timeline-item" key={item.time}>
                    <span>{item.time}</span>
                    <p>{item.title}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <p className="section-label">Fotoğraflar</p>
              <h2>Kır Düğünü Atmosferi</h2>

              <div className="gallery-grid">
                {INVITATION.gallery.map((image, index) => (
                  <img key={image} src={image} alt={`Galeri ${index + 1}`} />
                ))}
              </div>
            </section>

            <section className="card rsvp-card">
              <p className="section-label">Katılım</p>
              <h2>Katılım Bildirimi</h2>
              <p>Katılıp katılamayacağınızı bildirerek planlamamıza yardımcı olabilirsiniz.</p>

              <form className="rsvp-form" onSubmit={submitGuest}>
                <input
                  name="name"
                  value={guestForm.name}
                  onChange={handleGuestChange}
                  placeholder="Ad Soyad"
                />

                <OptionGroup
                  value={guestForm.attendance}
                  options={ATTENDANCE_OPTIONS}
                  onChange={updateAttendance}
                />

                <OptionGroup
                  disabled={!isAttending}
                  value={guestForm.personCount}
                  options={PERSON_COUNT_OPTIONS}
                  onChange={(personCount) => setGuestForm((prev) => ({ ...prev, personCount }))}
                />

                <OptionGroup
                  disabled={!isAttending}
                  value={guestForm.side}
                  options={SIDE_OPTIONS}
                  onChange={(side) => setGuestForm((prev) => ({ ...prev, side }))}
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
                href={`https://wa.me/${INVITATION.whatsappNumber}?text=${rsvpWhatsappText}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp ile Bildir
              </a>
            </section>

            <section className="card">
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

            <section className="card">
              <p className="section-label">Paylaş</p>
              <h2>Davetiyeyi Paylaş</h2>
              <p>Davetiyemizi sevdiklerinizle paylaşabilirsiniz.</p>

              <div className="button-group">
                <a className="main-button" href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer">
                  WhatsApp ile Paylaş
                </a>
                <button className="secondary-button" onClick={copyInvitationLink}>
                  Linki Kopyala
                </button>
              </div>
            </section>

            <footer className="footer">
              <p>{COUPLE_NAME}</p>
              <span>{INVITATION.dateText}</span>
              <small>Made with love</small>
            </footer>
          </main>
        </>
      )}
    </div>
  );
}

export default App;
