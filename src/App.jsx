import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./styles/index.css";
import { supabase } from "./supabaseClient";
import {
  AdminField,
  AdminTextarea,
  AdminSelect,
  AdminCheckbox,
  AppModal,
  AdminImageField,
  AdminMusicField,
  AdminSection,
} from "./components/AdminUI";
import AdminDashboard from "./components/AdminDashboard";
import { useAdminSession } from "./hooks/useAdminSession";
import {
  DEFAULT_SHARE_LINK,
  DEFAULT_WEDDING_MUSIC_FILE,
  DEFAULT_WEDDING_MUSIC_NAME,
  ADMIN_ACTIVITY_EVENTS,
  NOTE_MAX_LENGTH,
  WISH_MAX_LENGTH,
  SITE_DATA_KEY,
  THEMES,
  THEME_DEFAULT_IMAGES,
  MAX_AUDIO_FILE_SIZE,
  INITIAL_GUEST_FORM,
  INITIAL_WISH_FORM,
  ATTENDANCE_OPTIONS,
  PERSON_COUNT_OPTIONS,
  SIDE_OPTIONS,
  CHILD_OPTIONS
} from "./config/constants";
import {
  getFaviconUrl,
  getCurrentShareLink,
  loadStoredSiteData,
  createGoogleCalendarLink,
  readImageFileAsDataUrl,
  formatMessageTemplate,
  normalizeText,
  downloadTextFile,
  createCsv,
  createExcelTable,
  getGuestNameFromUrl,
  buildPersonalLink,
  getQrImageUrl,
  isAdminRouteActive,
  getAdminRedirectUrl,
  touchAdminSession,
  clearAdminSessionTimestamp,
  isAdminSessionFresh,
  uiGuestToDb,
  dbGuestToUi,
  uiWishToDb,
  normalizeSiteData,
  mergeSiteData
} from "./utils/helpers";
import {
  getSupabaseSetupMessage,
  getReadableAuthError,
  isSupabaseReady,
  loadSettingsFromDatabase,
  saveSettingsToDatabase,
  loadPublishedWishesFromDatabase,
  loadGuestsFromDatabase,
  loadAllWishesFromDatabase,
  uploadMediaFile
} from "./services/database";

function OptionGroup({ value, options, onChange, disabled = false }) {
  return (
    <div className={disabled ? "option-group disabled" : "option-group"}>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          disabled={disabled}
          className={String(value) === String(option.value) ? "option-button active" : "option-button"}
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
}

function App() {
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const musicIntervalRef = useRef(null);
  const musicGainRef = useRef(null);
  const modalResolverRef = useRef(null);

  const [siteData, setSiteData] = useState(() => loadStoredSiteData());
  const [adminDraft, setAdminDraft] = useState(() => loadStoredSiteData());
  const [opened, setOpened] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [guestForm, setGuestForm] = useState(INITIAL_GUEST_FORM);
  const [wishForm, setWishForm] = useState(INITIAL_WISH_FORM);
  const [guests, setGuests] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [isAdminPage, setIsAdminPage] = useState(() => isAdminRouteActive());
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryPasswordAgain, setRecoveryPasswordAgain] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminLoginNotice, setAdminLoginNotice] = useState("");
  const [adminCurrentPassword, setAdminCurrentPassword] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminNewPasswordAgain, setAdminNewPasswordAgain] = useState("");
  const [adminPasswordMessage, setAdminPasswordMessage] = useState("");
  const [adminSaveMessage, setAdminSaveMessage] = useState("");
  const [activeAdminTab, setActiveAdminTab] = useState("general");
  const [adminGuestSearch, setAdminGuestSearch] = useState("");
  const [adminGuestAttendanceFilter, setAdminGuestAttendanceFilter] = useState("all");
  const [adminGuestSideFilter, setAdminGuestSideFilter] = useState("all");
  const [adminGuestChildFilter, setAdminGuestChildFilter] = useState("all");
  const [adminWishSearch, setAdminWishSearch] = useState("");
  const [adminWishStatusFilter, setAdminWishStatusFilter] = useState("all");
  const [personalLinkName, setPersonalLinkName] = useState("");
  const [dataImportText, setDataImportText] = useState("");
  const [appModal, setAppModal] = useState(null);

  const invitation = siteData.invitation;
  const familyInfo = siteData.familyInfo;
  const copy = siteData.copy;
  const settings = siteData.settings;
  const messages = siteData.messages;
  const coupleName = `${invitation.bride} & ${invitation.groom}`;
  const personalGuestName = getGuestNameFromUrl();
  const isAttending = guestForm.attendance === "Katılacağım";

  useEffect(() => {
      document.documentElement.lang = "tr";

      if (!document.querySelector("meta[charset]")) {
        const meta = document.createElement("meta");
        meta.setAttribute("charset", "UTF-8");
        document.head.prepend(meta);
      }
    }, []);

  useLayoutEffect(() => {
      const currentTheme = settings.theme || "lavanta"; 
      
      document.documentElement.dataset.theme = currentTheme;

      const favicon =
        document.querySelector("link[rel='icon'], link[rel='shortcut icon']") ||
        document.createElement("link");

      favicon.setAttribute("rel", "icon");
      favicon.setAttribute("type", "image/svg+xml");
      favicon.setAttribute("href", getFaviconUrl(currentTheme));

      if (!favicon.parentNode) {
        document.head.appendChild(favicon);
      }
    }, [settings.theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme || "rose";
  }, [settings.theme]);

  useEffect(() => {
    const syncAdminPage = () => {
      const adminRouteActive = isAdminRouteActive();

      setIsAdminPage(adminRouteActive);

      if (!adminRouteActive) {
        setAdminPassword("");
        setAdminError("");
        setAdminLoginNotice("");
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
        setForgotPasswordMessage("");
        setIsPasswordRecovery(false);
        setRecoveryPassword("");
        setRecoveryPasswordAgain("");
        setRecoveryMessage("");
        setAdminCurrentPassword("");
        setAdminNewPassword("");
        setAdminNewPasswordAgain("");
        setAdminPasswordMessage("");
        setAdminSaveMessage("");
      }
    };

    syncAdminPage();
    window.addEventListener("hashchange", syncAdminPage);
    window.addEventListener("popstate", syncAdminPage);
    return () => {
      window.removeEventListener("hashchange", syncAdminPage);
      window.removeEventListener("popstate", syncAdminPage);
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseReady()) return undefined;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        const recoveryRouteActive =
          typeof window !== "undefined" &&
          (window.location.search.includes("reset=1") ||
            window.location.search.includes("type=recovery") ||
            window.location.hash.includes("type=recovery") ||
            window.location.hash.includes("access_token="));

        if (!recoveryRouteActive) return;

        setIsAdminPage(true);
        setIsPasswordRecovery(true);
        setShowForgotPassword(false);
        setAdminError("");
        setForgotPasswordMessage("");
        setAdminUser(session?.user || null);
        setAdminEmail(session?.user?.email || adminEmail);
        setIsAdminUnlocked(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [adminEmail]);

  const resolveAppModal = (result) => {
    const resolver = modalResolverRef.current;
    modalResolverRef.current = null;
    setAppModal(null);

    if (resolver) {
      resolver(result);
    }
  };

  const openAppModal = (config) => {
    return new Promise((resolve) => {
      modalResolverRef.current = resolve;
      setAppModal({ tone: "info", closeOnBackdrop: false, ...config });
    });
  };

  const showAppAlert = async (message, options = {}) => {
    await openAppModal({
      type: "alert",
      title: options.title || "Bilgi",
      message,
      tone: options.tone || "info",
      icon: options.icon,
      confirmText: options.confirmText || "Tamam",
    });
    return true;
  };

  const showAppConfirm = async (message, options = {}) => {
    return Boolean(
      await openAppModal({
        type: "confirm",
        title: options.title || "Onay gerekiyor",
        message,
        tone: options.tone || "warning",
        icon: options.icon || "?",
        confirmText: options.confirmText || "Evet",
        cancelText: options.cancelText || "Vazgeç",
      })
    );
  };

  const showAppPrompt = async (label, defaultValue = "", options = {}) => {
    return openAppModal({
      type: "prompt",
      title: options.title || "Bilgi düzenle",
      message: label,
      inputValue: defaultValue,
      placeholder: options.placeholder || label,
      multiline: Boolean(options.multiline),
      tone: options.tone || "info",
      icon: options.icon || "✎",
      confirmText: options.confirmText || "Kaydet",
      cancelText: options.cancelText || "Vazgeç",
    });
  };

  const {
    submitAdminPassword,
    sendPasswordResetEmail,
    completePasswordRecovery,
    changeAdminPassword,
    logoutAdmin,
    performAdminSignOut,
  } = useAdminSession({
    isAdminPage,
    adminEmail,
    adminPassword,
    adminUser,
    adminCurrentPassword,
    adminNewPassword,
    adminNewPasswordAgain,
    recoveryPassword,
    recoveryPasswordAgain,
    siteData,
    isAdminUnlocked,
    setAdminEmail,
    setAdminPassword,
    setAdminUser,
    setIsAdminUnlocked,
    setAdminError,
    setAdminLoginNotice,
    setShowForgotPassword,
    setForgotPasswordEmail,
    setForgotPasswordMessage,
    setAdminPasswordMessage,
    setAdminSaveMessage,
    setAdminCurrentPassword,
    setAdminNewPassword,
    setAdminNewPasswordAgain,
    setRecoveryPassword,
    setRecoveryPasswordAgain,
    setRecoveryMessage,
    setRecoveryLoading,
    setForgotPasswordLoading,
    setAdminAuthLoading,
    setIsPasswordRecovery,
    setActiveAdminTab,
    setSiteData,
    setAdminDraft,
    setGuests,
    setWishes,
    showAppConfirm,
  });

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      if (musicIntervalRef.current) {
        clearTimeout(musicIntervalRef.current);
        musicIntervalRef.current = null;
      }

      if (musicGainRef.current) {
        musicGainRef.current.disconnect();
        musicGainRef.current = null;
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
  const childGuestCount = attendingGuests.filter((guest) => guest.hasChild === "Evet").length;
  const brideSideCount = attendingGuests.filter((guest) => guest.side === "Gelin Tarafı").length;
  const groomSideCount = attendingGuests.filter((guest) => guest.side === "Damat Tarafı").length;

  const approvedWishes = wishes.filter((wish) => wish.approved !== false);
  const currentShareLink = invitation.shareLink || getCurrentShareLink();
  const guestGreeting = personalGuestName
    ? formatMessageTemplate(messages.guestGreeting, { guest: personalGuestName, couple: coupleName, link: currentShareLink })
    : "";
  const shareText = encodeURIComponent(
    formatMessageTemplate(messages.whatsappShareMessage, { couple: coupleName, link: currentShareLink, guest: personalGuestName })
  );
  const rsvpWhatsappText = encodeURIComponent(
    formatMessageTemplate(messages.rsvpWhatsappMessage, { couple: coupleName, link: currentShareLink, guest: personalGuestName })
  );
  const personalGuestLink = buildPersonalLink(currentShareLink, personalLinkName);
  const qrImageUrl = getQrImageUrl(currentShareLink);
  const googleCalendarLink = createGoogleCalendarLink(siteData, coupleName);

  useEffect(() => {
    [invitation.introImage, invitation.heroImage, ...invitation.gallery]
      .filter(Boolean)
      .forEach((src) => {
        const img = new Image();
        img.src = src;
      });
  }, [invitation.introImage, invitation.heroImage, invitation.gallery]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.load();
  }, [invitation.musicFile]);

  useEffect(() => {
    const loadInitialData = async () => {
      const databaseSettings = await loadSettingsFromDatabase();

      if (databaseSettings) {
        const normalizedDatabaseSettings = normalizeSiteData(databaseSettings);

        setSiteData(normalizedDatabaseSettings);
        setAdminDraft(normalizedDatabaseSettings);

        localStorage.setItem(SITE_DATA_KEY, JSON.stringify(normalizedDatabaseSettings));
      }

      const publishedWishes = await loadPublishedWishesFromDatabase();
      setWishes(publishedWishes);
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const targetDate = new Date(invitation.weddingDate);

    const updateCountdown = () => {
      const diff = targetDate - new Date();

      if (Number.isNaN(diff) || diff <= 0) {
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
  }, [invitation.weddingDate]);

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (musicIntervalRef.current) {
      clearTimeout(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }

    if (musicGainRef.current) {
      musicGainRef.current.disconnect();
      musicGainRef.current = null;
    }

    setIsMusicPlaying(false);
  };

  const startGeneratedMusic = async () => {
    if (musicIntervalRef.current) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      throw new Error("Bu tarayıcı Web Audio API desteklemiyor.");
    }

    const audioContext = audioContextRef.current || new AudioContext();

    audioContextRef.current = audioContext;
    await audioContext.resume();

    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.06, audioContext.currentTime);
    masterGain.connect(audioContext.destination);
    musicGainRef.current = masterGain;

    const weddingMelody = [
      { frequency: 523.25, duration: 0.55 }, // C5
      { frequency: 659.25, duration: 0.55 }, // E5
      { frequency: 783.99, duration: 0.85 }, // G5
      { frequency: 659.25, duration: 0.55 }, // E5
      { frequency: 698.46, duration: 0.55 }, // F5
      { frequency: 783.99, duration: 1.05 }, // G5

      { frequency: 523.25, duration: 0.55 }, // C5
      { frequency: 587.33, duration: 0.55 }, // D5
      { frequency: 659.25, duration: 0.85 }, // E5
      { frequency: 587.33, duration: 0.55 }, // D5
      { frequency: 523.25, duration: 1.05 }, // C5

      { frequency: 659.25, duration: 0.55 }, // E5
      { frequency: 783.99, duration: 0.55 }, // G5
      { frequency: 880.0, duration: 0.85 },  // A5
      { frequency: 783.99, duration: 0.55 }, // G5
      { frequency: 659.25, duration: 1.1 },  // E5

      { frequency: 523.25, duration: 0.6 },  // C5
      { frequency: 659.25, duration: 0.6 },  // E5
      { frequency: 783.99, duration: 1.25 }, // G5
    ];

    let noteIndex = 0;

    const playNote = () => {
      if (!musicGainRef.current) return;

      const note = weddingMelody[noteIndex % weddingMelody.length];
      const now = audioContext.currentTime;

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(note.frequency, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.32, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.duration);

      oscillator.connect(gain);
      gain.connect(masterGain);

      oscillator.start(now);
      oscillator.stop(now + note.duration + 0.05);

      noteIndex += 1;

      musicIntervalRef.current = window.setTimeout(
        playNote,
        note.duration * 1000 + 90
      );
    };

    playNote();
  };

  const startMusic = async () => {
    try {
      if (invitation.musicFile && audioRef.current) {
        if (musicIntervalRef.current) {
          clearTimeout(musicIntervalRef.current);
          musicIntervalRef.current = null;
        }

        if (musicGainRef.current) {
          musicGainRef.current.disconnect();
          musicGainRef.current = null;
        }

        try {
          audioRef.current.volume = 0.15;
          await audioRef.current.play();
          setIsMusicPlaying(true);
          return;
        } catch (audioError) {
          console.log("Müzik dosyası çalınamadı, yedek melodi deneniyor:", audioError);

          if (invitation.musicFile !== DEFAULT_WEDDING_MUSIC_FILE) {
            throw audioError;
          }
        }
      }

      await startGeneratedMusic();
      setIsMusicPlaying(true);
    } catch (error) {
      setIsMusicPlaying(false);
      console.log("Müzik başlatılamadı:", error);
    }
  };

  const openInvitation = () => {
    setIsOpening(true); 
    
    startMusic().catch((err) => console.log("Müzik başlatılamadı:", err));

    setTimeout(() => {
      setOpened(true);
    }, 2100); 
  };


  const toggleMusic = async () => {
    if (isMusicPlaying) {
      stopMusic();
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
      hasChild: attendance === "Katılacağım" ? prev.hasChild : "Hayır",
    }));
  };

  const submitGuest = async (e) => {
    e.preventDefault();

    if (!guestForm.name.trim()) {
      await showAppAlert("Lütfen ad soyad gir.", { title: "Eksik bilgi", tone: "warning", icon: "!" });
      return;
    }

    if (!isSupabaseReady()) {
      await showAppAlert(getSupabaseSetupMessage(), { title: "Supabase bağlantısı eksik", tone: "danger", icon: "!" });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("guests")
        .insert(uiGuestToDb(guestForm))
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      setGuests((prev) => [
        data ? dbGuestToUi(data) : { id: `local-${Date.now()}`, ...guestForm },
        ...prev,
      ]);

      setGuestForm(INITIAL_GUEST_FORM);
      await showAppAlert("Katılım bildirimin kaydedildi.", { title: "Kaydedildi", tone: "success", icon: "✓" });
    } catch (error) {
      console.error("Katılım kaydedilemedi:", error);
      await showAppAlert(
        `Katılım bildirimi kaydedilemedi. Supabase guests tablosu insert/select RLS policy'lerini kontrol et. Detay: ${error?.message || "Bilinmeyen hata"}`,
        { title: "Kayıt hatası", tone: "danger", icon: "!" }
      );
    }
  };

  const submitWish = async (e) => {
    e.preventDefault();

    if (!wishForm.name.trim() || !wishForm.message.trim()) {
      await showAppAlert("Lütfen isim ve mesaj gir.", { title: "Eksik bilgi", tone: "warning", icon: "!" });
      return;
    }

    if (!isSupabaseReady()) {
      await showAppAlert(getSupabaseSetupMessage(), { title: "Supabase bağlantısı eksik", tone: "danger", icon: "!" });
      return;
    }

    const shouldPublishNow = !settings.requireWishApproval;

    try {
      const { data, error } = await supabase
        .from("wishes")
        .insert({
          name: wishForm.name.trim(),
          message: wishForm.message.trim(),
          approved: shouldPublishNow,
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      if (shouldPublishNow) {
        setWishes((prev) => [
          data ? dbWishToUi(data) : { id: `local-${Date.now()}`, ...wishForm, approved: true },
          ...prev,
        ]);
      }

      setWishForm(INITIAL_WISH_FORM);
      await showAppAlert(settings.requireWishApproval ? "Güzel dileğin admin onayına gönderildi." : "Güzel dileğin kaydedildi.", { title: settings.requireWishApproval ? "Onaya gönderildi" : "Kaydedildi", tone: "success", icon: "✓" });
    } catch (error) {
      console.error("Mesaj kaydedilemedi:", error);
      await showAppAlert(
        `Mesaj kaydedilemedi. Supabase wishes tablosu insert/select RLS policy'lerini kontrol et. Detay: ${error?.message || "Bilinmeyen hata"}`,
        { title: "Kayıt hatası", tone: "danger", icon: "!" }
      );
    }
  };

  const copyInvitationLink = async () => {
    try {
      await navigator.clipboard.writeText(currentShareLink);
      await showAppAlert("Davetiye linki kopyalandı.", { title: "Kopyalandı", tone: "success", icon: "✓" });
    } catch {
      await showAppAlert("Link kopyalanamadı.", { title: "Kopyalama hatası", tone: "danger", icon: "!" });
    }
  };

  const copyAdminLink = async (linkToCopy, successMessage = "Link kopyalandı.") => {
    try {
      await navigator.clipboard.writeText(linkToCopy);
      setAdminSaveMessage(successMessage);
    } catch {
      setAdminSaveMessage("Link kopyalanamadı.");
    }
  };

  const updateDraftObject = (group, key, value) => {
    setAdminDraft((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value,
      },
    }));
  };


  const updateDraftImage = async (group, key, file) => {
    try {
      if (!file) return;
      
      const compressedDataUrl = await readImageFileAsDataUrl(file);
      const compressedBlob = await (await fetch(compressedDataUrl)).blob();
      const compressedFile = new File([compressedBlob], file.name, { type: "image/jpeg" });

      const url = await uploadMediaFile(compressedFile, "images");
      updateDraftObject(group, key, url);
      setAdminSaveMessage("Görsel küçültüldü ve Supabase Storage'a yüklendi. Canlı sayfaya yansıtmak için Değişiklikleri Kaydet butonuna bas.");
    } catch (error) {
      console.error("Görsel yüklenemedi:", error);
      setAdminSaveMessage(error.message || "Görsel yüklenemedi.");
    }
  };

  const clearDraftImage = (group, key) => {
    updateDraftObject(group, key, "");
    setAdminSaveMessage("Görsel kaldırıldı. Canlı sayfaya yansıtmak için kaydet.");
  };

  const updateDraftMusic = async (file) => {
    try {
      if (!file) return;

      if (file.size > MAX_AUDIO_FILE_SIZE) {
        setAdminSaveMessage("Müzik dosyası çok büyük. Lütfen 4 MB altında bir MP3/M4A dosyası seçin.");
        return;
      }

      const url = await uploadMediaFile(file, "music");
      setAdminDraft((prev) => ({
        ...prev,
        invitation: {
          ...prev.invitation,
          musicFile: url,
          musicName: file.name || "Yüklenen müzik",
        },
      }));
      setAdminSaveMessage("Müzik Supabase Storage'a yüklendi. Canlı sayfada çalması için Değişiklikleri Kaydet butonuna bas.");
    } catch (error) {
      console.error("Müzik yüklenemedi:", error);
      setAdminSaveMessage(error.message || "Müzik yüklenemedi.");
    }
  };

  const clearDraftMusic = () => {
    setAdminDraft((prev) => ({
      ...prev,
      invitation: {
        ...prev.invitation,
        musicFile: DEFAULT_WEDDING_MUSIC_FILE,
        musicName: DEFAULT_WEDDING_MUSIC_NAME,
      },
    }));
    setAdminSaveMessage(
      "Özel müzik kaldırıldı. Varsayılan evlilik müziği kullanılacak. Canlı sayfaya yansıtmak için kaydet."
    );
  };

  const updateDraftArrayItem = (arrayKey, index, key, value) => {
    setAdminDraft((prev) => ({
      ...prev,
      [arrayKey]: prev[arrayKey].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addDraftArrayItem = (arrayKey, item) => {
    setAdminDraft((prev) => ({
      ...prev,
      [arrayKey]: [...prev[arrayKey], item],
    }));
  };

  const removeDraftArrayItem = (arrayKey, index) => {
    setAdminDraft((prev) => ({
      ...prev,
      [arrayKey]: prev[arrayKey].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updateGalleryItem = (index, value) => {
    setAdminDraft((prev) => ({
      ...prev,
      invitation: {
        ...prev.invitation,
        gallery: prev.invitation.gallery.map((image, imageIndex) =>
          imageIndex === index ? value : image
        ),
      },
    }));
  };


  const updateGalleryImageFile = async (index, file) => {
    try {
      if (!file) return;
      
      const compressedDataUrl = await readImageFileAsDataUrl(file);
      const compressedBlob = await (await fetch(compressedDataUrl)).blob();
      const compressedFile = new File([compressedBlob], file.name, { type: "image/jpeg" });

      const url = await uploadMediaFile(compressedFile, "gallery");
      updateGalleryItem(index, url);
      setAdminSaveMessage("Galeri görseli küçültüldü ve yüklendi. Canlı sayfada görünmesi için Değişiklikleri Kaydet butonuna bas.");
    } catch (error) {
      console.error("Galeri görseli yüklenemedi:", error);
      setAdminSaveMessage(error.message || "Galeri görseli yüklenemedi.");
    }
  };

  const addGalleryItem = () => {
    setAdminDraft((prev) => ({
      ...prev,
      invitation: {
        ...prev.invitation,
        gallery: [...prev.invitation.gallery, ""],
      },
    }));
  };

  const removeGalleryItem = (index) => {
    setAdminDraft((prev) => ({
      ...prev,
      invitation: {
        ...prev.invitation,
        gallery: prev.invitation.gallery.filter((_, imageIndex) => imageIndex !== index),
      },
    }));
  };

  const saveSiteContent = async () => {
    const cleanedData = normalizeSiteData({
      ...adminDraft,
      invitation: {
        ...adminDraft.invitation,
        gallery: adminDraft.invitation.gallery.map((image) => String(image || "").trim()).filter(Boolean),
      },
    });

    try {
      await saveSettingsToDatabase(cleanedData);
      localStorage.setItem(SITE_DATA_KEY, JSON.stringify(cleanedData));
      setSiteData(cleanedData);
      setAdminDraft(cleanedData);
      setAdminSaveMessage("Davetiyedeki yazılar, bilgiler ve görseller Supabase'e kaydedildi.");
      setTimeout(() => setAdminSaveMessage(""), 3000);
    } catch (error) {
      console.error("Ayarlar kaydedilemedi:", error);
      setAdminSaveMessage(`Değişiklikler kaydedilemedi. Detay: ${error?.message || "Supabase ayarlarını ve admin yetkisini kontrol et."}`);
    }
  };

  const handleThemeChange = async (themeValue) => {
    updateDraftObject("settings", "theme", themeValue);

    const confirmed = await showAppConfirm(
      "Seçtiğiniz temaya uygun varsayılan davetiye resimleri yüklensin mi?\n(Mevcut ana ekran ve galeri resimleriniz değişecektir)",
      { 
        title: "Tema Resimlerini Yükle", 
        confirmText: "Evet, Resimleri Yükle", 
        cancelText: "Hayır, Sadece Tema Değişsin",
        tone: "info"
      }
    );

    if (confirmed) {
      const themeImages = THEME_DEFAULT_IMAGES[themeValue];
      
      if (themeImages) {
        setAdminDraft((prev) => ({
          ...prev,
          invitation: {
            ...prev.invitation,
            introImage: themeImages.introImage,
            heroImage: themeImages.heroImage,
            gallery: themeImages.gallery,
          }
        }));
        setAdminSaveMessage("Tema resimleri uygulandı. Sayfada kalıcı olması için sağ üstten 'Değişiklikleri Kaydet' butonuna basmalısın.");
      }
    }
  };

  const resetSiteContent = async () => {
    const confirmed = await showAppConfirm("Davetiyedeki düzenlenebilir alanlar varsayılan hale dönsün mü?", { title: "Varsayılana döndür", confirmText: "Döndür", tone: "warning" });
    if (!confirmed) return;

    const chosenDefaultTheme = adminDraft.settings.defaultTheme || "lavanta";
    const defaultData = normalizeSiteData(null);
    defaultData.settings.defaultTheme = chosenDefaultTheme;
    defaultData.settings.theme = chosenDefaultTheme;

    if (typeof THEME_DEFAULT_IMAGES !== "undefined" && THEME_DEFAULT_IMAGES[chosenDefaultTheme]) {
      const themeImages = THEME_DEFAULT_IMAGES[chosenDefaultTheme];
      defaultData.invitation.introImage = themeImages.introImage;
      defaultData.invitation.heroImage = themeImages.heroImage;
      defaultData.invitation.gallery = themeImages.gallery;
    }

    try {
      await saveSettingsToDatabase(defaultData);
      localStorage.setItem(SITE_DATA_KEY, JSON.stringify(defaultData));
      setSiteData(defaultData);
      setAdminDraft(defaultData);
      setAdminSaveMessage("Davetiyedeki içerikler seçtiğiniz varsayılan temaya göre başarıyla sıfırlandı.");
    } catch (error) {
      console.error("Varsayılan ayarlar kaydedilemedi:", error);
      setAdminSaveMessage(`Varsayılan ayarlar kaydedilemedi. Detay: ${error?.message || "Supabase hatası"}`);
    }
  };

  const clearGuests = async () => {
    const confirmed = await showAppConfirm("Tüm katılım kayıtları silinsin mi?", { title: "Katılım kayıtlarını sil", confirmText: "Sil", tone: "danger", icon: "!" });
    if (!confirmed) return;

    const { error } = await supabase.from("guests").delete().not("id", "is", null);

    if (error) {
      console.error("Katılım kayıtları silinemedi:", error);
      setAdminSaveMessage("Katılım kayıtları silinemedi.");
      return;
    }

    setGuests([]);
  };

  const clearWishes = async () => {
    const confirmed = await showAppConfirm("Tüm anı defteri mesajları silinsin mi?", { title: "Anı defterini temizle", confirmText: "Sil", tone: "danger", icon: "!" });
    if (!confirmed) return;

    const { error } = await supabase.from("wishes").delete().not("id", "is", null);

    if (error) {
      console.error("Anı defteri mesajları silinemedi:", error);
      setAdminSaveMessage("Anı defteri mesajları silinemedi.");
      return;
    }

    setWishes([]);
  };

  const deleteGuest = async (guestId) => {
    const confirmed = await showAppConfirm("Bu katılım kaydı silinsin mi?", { title: "Kaydı sil", confirmText: "Sil", tone: "danger", icon: "!" });
    if (!confirmed) return;

    const { error } = await supabase.from("guests").delete().eq("id", guestId);

    if (error) {
      console.error("Katılım kaydı silinemedi:", error);
      setAdminSaveMessage("Katılım kaydı silinemedi.");
      return;
    }

    setGuests((prev) => prev.filter((guest) => guest.id !== guestId));
  };

  const editGuest = async (guestId) => {
    const guest = guests.find((item) => item.id === guestId);
    if (!guest) return;

    const name = await showAppPrompt("Ad Soyad", guest.name || "", { title: "Katılım kaydını düzenle" });
    if (name === null) return;
    const phone = await showAppPrompt("Telefon", guest.phone || "", { title: "Katılım kaydını düzenle" });
    if (phone === null) return;
    const attendance = await showAppPrompt("Katılım durumu", guest.attendance || "Katılacağım", { title: "Katılım kaydını düzenle" });
    if (attendance === null) return;
    const personCount = await showAppPrompt("Kişi sayısı", guest.personCount || "1", { title: "Katılım kaydını düzenle" });
    if (personCount === null) return;
    const side = await showAppPrompt("Taraf", guest.side || "Gelin Tarafı", { title: "Katılım kaydını düzenle" });
    if (side === null) return;
    const hasChild = await showAppPrompt("Çocuk var mı? Evet/Hayır", guest.hasChild || "Hayır", { title: "Katılım kaydını düzenle" });
    if (hasChild === null) return;
    const note = await showAppPrompt("Not", guest.note || "", { title: "Katılım kaydını düzenle", multiline: true });
    if (note === null) return;

    const nextGuest = { ...guest, name, phone, attendance, personCount, side, hasChild, note };
    const { error } = await supabase
      .from("guests")
      .update(uiGuestToDb(nextGuest))
      .eq("id", guestId);

    if (error) {
      console.error("Katılım kaydı güncellenemedi:", error);
      setAdminSaveMessage("Katılım kaydı güncellenemedi.");
      return;
    }

    setGuests((prev) => prev.map((item) => (item.id === guestId ? nextGuest : item)));
  };

  const deleteWish = async (wishId) => {
    const confirmed = await showAppConfirm("Bu anı defteri mesajı silinsin mi?", { title: "Mesajı sil", confirmText: "Sil", tone: "danger", icon: "!" });
    if (!confirmed) return;

    const { error } = await supabase.from("wishes").delete().eq("id", wishId);

    if (error) {
      console.error("Anı defteri mesajı silinemedi:", error);
      setAdminSaveMessage("Anı defteri mesajı silinemedi.");
      return;
    }

    setWishes((prev) => prev.filter((wish) => wish.id !== wishId));
  };

  const editWish = async (wishId) => {
    const wish = wishes.find((item) => item.id === wishId);
    if (!wish) return;

    const name = await showAppPrompt("Ad Soyad", wish.name || "", { title: "Anı defteri mesajını düzenle" });
    if (name === null) return;
    const message = await showAppPrompt("Mesaj", wish.message || "", { title: "Anı defteri mesajını düzenle", multiline: true });
    if (message === null) return;

    const nextWish = { ...wish, name, message };
    const { error } = await supabase
      .from("wishes")
      .update(uiWishToDb(nextWish))
      .eq("id", wishId);

    if (error) {
      console.error("Anı defteri mesajı güncellenemedi:", error);
      setAdminSaveMessage("Anı defteri mesajı güncellenemedi.");
      return;
    }

    setWishes((prev) => prev.map((item) => (item.id === wishId ? nextWish : item)));
  };

  const toggleWishApproval = async (wishId) => {
    const wish = wishes.find((item) => item.id === wishId);
    if (!wish) return;

    const nextApproved = wish.approved === false;
    const { error } = await supabase
      .from("wishes")
      .update({ approved: nextApproved })
      .eq("id", wishId);

    if (error) {
      console.error("Mesaj onay durumu değiştirilemedi:", error);
      setAdminSaveMessage("Mesaj onay durumu değiştirilemedi.");
      return;
    }

    setWishes((prev) =>
      prev.map((item) => (item.id === wishId ? { ...item, approved: nextApproved } : item))
    );
  };

  const getGuestExportData = () => {
    const headers = ["Ad Soyad", "Telefon", "Katılım Durumu", "Kişi Sayısı", "Taraf", "Çocuk", "Not"];
    const rows = guests.map((guest) => ({
      "Ad Soyad": guest.name || "",
      "Telefon": guest.phone || "",
      "Katılım Durumu": guest.attendance || "",
      "Kişi Sayısı": guest.personCount || "",
      "Taraf": guest.side || "",
      "Çocuk": guest.hasChild || "Hayır",
      "Not": guest.note || "",
    }));
    return { headers, rows };
  };

  const getWishExportData = () => {
    const headers = ["Ad Soyad", "Mesaj", "Durum"];
    const rows = wishes.map((wish) => ({
      "Ad Soyad": wish.name || "",
      "Mesaj": wish.message || "",
      "Durum": wish.approved === false ? "Onay Bekliyor" : "Yayında",
    }));
    return { headers, rows };
  };

  const exportGuestsCsv = () => {
    const { headers, rows } = getGuestExportData();
    downloadTextFile("katilim-listesi.csv", createCsv(headers, rows), "text/csv;charset=utf-8");
  };

  const exportGuestsExcel = () => {
    const { headers, rows } = getGuestExportData();
    downloadTextFile(
      "katilim-listesi.xls",
      createExcelTable("Katılım Listesi", headers, rows),
      "application/vnd.ms-excel;charset=utf-8"
    );
  };

  const exportWishesCsv = () => {
    const { headers, rows } = getWishExportData();
    downloadTextFile("ani-defteri.csv", createCsv(headers, rows), "text/csv;charset=utf-8");
  };

  const exportWishesExcel = () => {
    const { headers, rows } = getWishExportData();
    downloadTextFile(
      "ani-defteri.xls",
      createExcelTable("Anı Defteri Mesajları", headers, rows),
      "application/vnd.ms-excel;charset=utf-8"
    );
  };

  const exportAllDataJson = () => {
    const data = {
      siteData,
      guests,
      wishes,
      exportedAt: new Date().toISOString(),
    };
    downloadTextFile("dugun-davetiyesi-yedek.json", JSON.stringify(data, null, 2), "application/json;charset=utf-8");
  };

  const importAllDataJson = async () => {
    const confirmed = await showAppConfirm("DİKKAT: Bu işlem mevcut tüm davetiye ayarlarını, katılım kayıtlarını ve anı defteri mesajlarını SİLECEK ve yerine yedeği yükleyecektir. Emin misiniz?", { title: "Yedeği Geri Yükle", confirmText: "Evet, Geri Yükle", tone: "danger", icon: "!" });
    if (!confirmed) return;
    try {
      const parsed = JSON.parse(dataImportText);

      if (!parsed || typeof parsed !== "object") {
        throw new Error("JSON içeriği geçerli bir yedek nesnesi değil.");
      }

      if (parsed.siteData) {
        const nextSiteData = mergeSiteData(parsed.siteData);
        await saveSettingsToDatabase(nextSiteData);
        setSiteData(nextSiteData);
        setAdminDraft(nextSiteData);
      }

      if (Array.isArray(parsed.guests)) {
        const deleteResult = await supabase.from("guests").delete().not("id", "is", null);
        if (deleteResult.error) throw deleteResult.error;

        const guestRows = parsed.guests.map(uiGuestToDb);
        if (guestRows.length > 0) {
          const insertResult = await supabase.from("guests").insert(guestRows);
          if (insertResult.error) throw insertResult.error;
        }
        setGuests(await loadGuestsFromDatabase());
      }

      if (Array.isArray(parsed.wishes)) {
        const deleteResult = await supabase.from("wishes").delete().not("id", "is", null);
        if (deleteResult.error) throw deleteResult.error;

        const wishRows = parsed.wishes.map(uiWishToDb);
        if (wishRows.length > 0) {
          const insertResult = await supabase.from("wishes").insert(wishRows);
          if (insertResult.error) throw insertResult.error;
        }
        setWishes(await loadAllWishesFromDatabase());
      }

      setDataImportText("");
      setAdminSaveMessage("Yedek başarıyla Supabase'e aktarıldı.");
    } catch (error) {
      console.error("Yedek içe aktarılamadı:", error);
      setAdminSaveMessage(`Yedek içe aktarılamadı. Detay: ${error?.message || "JSON formatını ve Supabase yetkilerini kontrol et."}`);
    }
  };

  const downloadQrCode = async () => {
    try {
      const response = await fetch(qrImageUrl);
      if (!response.ok) throw new Error("QR kod indirilemedi.");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "dugun-davetiye-qr.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("QR kod indirilemedi:", error);
      window.open(qrImageUrl, "_blank", "noopener,noreferrer");
      setAdminSaveMessage("QR kod yeni sekmede açıldı. Görsele sağ tıklayıp kaydedebilirsin.");
    }
  };

  const closeAdminPage = async () => {
    const signedOut = await performAdminSignOut();
    if (!signedOut) return;

    clearAdminSessionTimestamp();
    setIsAdminPage(false);
    setIsAdminUnlocked(false);
    setAdminUser(null);
    setAdminPassword("");
    setAdminError("");
    setAdminLoginNotice("");
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setForgotPasswordMessage("");
    setIsPasswordRecovery(false);
    setRecoveryPassword("");
    setRecoveryPasswordAgain("");
    setRecoveryMessage("");
    setAdminSaveMessage("");
    setOpened(true);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("admin");
      url.searchParams.delete("reset");
      url.searchParams.delete("type");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  };

  const openAdminTab = (tabId) => {
    setActiveAdminTab(tabId);

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        document.querySelector(".admin-main-panel")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 40);
    }
  };

  const renderAdminPage = () => {
    const adminTabs = [
      { id: "general", label: "Genel Bilgiler", description: "İsim, tarih, mekan, linkler" },
      { id: "theme", label: "Tema", description: "Renk teması ve anı defteri onayı" },
      { id: "security", label: "Admin Şifresi", description: "Panel giriş şifresini değiştir" },
      { id: "messages", label: "WhatsApp Mesajları", description: "Paylaşım, katılım ve özel davetli metinleri" },
      { id: "copy", label: "Başlıklar", description: "Sayfadaki yazı ve başlıklar" },
      { id: "family", label: "Aile Bilgileri", description: "Gelin ve damat aileleri" },
      { id: "ceremony", label: "Nikah / Düğün", description: "Nikah ve eğlence ayrımı" },
      { id: "schedule", label: "Düğün Takvimi", description: "Saat saat akış" },
      { id: "gallery", label: "Görsel / Müzik", description: "Ana ekran görselleri, galeri ve müzik" },
      { id: "guests", label: "Katılım Formu Kayıtları", description: "Ad, telefon, kişi, çocuk ve not bilgileri" },
      { id: "wishes", label: "Anı Defteri Formu", description: "Ad soyad ve mesaj kayıtları" },
      { id: "qr", label: "QR Kod", description: "Davetiye QR kodu ve genel paylaşım linki" },
      { id: "personalLink", label: "Özel Link", description: "Davetliye özel isimli link oluşturma" },
      { id: "data", label: "Veri Yedeği", description: "Excel / CSV ve JSON yedek alma" },
    ];

    const activeTabInfo = adminTabs.find((tab) => tab.id === activeAdminTab) || adminTabs[0];
    const filteredGuests = guests.filter((guest) => {
      const searchMatch = normalizeText(`${guest.name} ${guest.phone} ${guest.note} ${guest.side}`).includes(normalizeText(adminGuestSearch));
      const attendanceMatch = adminGuestAttendanceFilter === "all" || guest.attendance === adminGuestAttendanceFilter;
      const sideMatch = adminGuestSideFilter === "all" || guest.side === adminGuestSideFilter;
      const childMatch = adminGuestChildFilter === "all" || (guest.hasChild || "Hayır") === adminGuestChildFilter;
      return searchMatch && attendanceMatch && sideMatch && childMatch;
    });
    const filteredWishes = wishes.filter((wish) => {
      const searchMatch = normalizeText(`${wish.name} ${wish.message}`).includes(normalizeText(adminWishSearch));
      const isApproved = wish.approved !== false;
      const statusMatch =
        adminWishStatusFilter === "all" ||
        (adminWishStatusFilter === "approved" && isApproved) ||
        (adminWishStatusFilter === "pending" && !isApproved);
      return searchMatch && statusMatch;
    });

    const renderAdminActivePanel = () => {
      switch (activeAdminTab) {
        case "general":
          return (
            <AdminSection title="Genel Davetiye Bilgileri">
              <div className="admin-visibility-card">
                <AdminCheckbox
                  checked={adminDraft.settings.visibility?.countdown ?? false}
                  label="Geri Sayım bölümünü davetiyede göster"
                  onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, countdown: v })}
                />
                <AdminCheckbox
                  checked={adminDraft.settings.visibility?.location ?? false}
                  label="Tarih ve Konum (Harita) bölümünü davetiyede göster"
                  onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, location: v })}
                />
              </div>
              <div className="admin-edit-grid">
                <AdminField
                  label="Gelin adı"
                  onChange={(value) => updateDraftObject("invitation", "bride", value)}
                  value={adminDraft.invitation.bride}
                />
                <AdminField
                  label="Damat adı"
                  onChange={(value) => updateDraftObject("invitation", "groom", value)}
                  value={adminDraft.invitation.groom}
                />
                <AdminField
                  label="Görünen tarih"
                  onChange={(value) => updateDraftObject("invitation", "dateText", value)}
                  value={adminDraft.invitation.dateText}
                />
                <AdminField
                  label="Saat"
                  onChange={(value) => updateDraftObject("invitation", "timeText", value)}
                  value={adminDraft.invitation.timeText}
                />
                <AdminField
                  label="Geri sayım tarihi"
                  onChange={(value) => updateDraftObject("invitation", "weddingDate", value)}
                  value={adminDraft.invitation.weddingDate}
                  placeholder="2026-09-12T19:00:00"
                />
                <AdminField
                  label="WhatsApp numarası"
                  onChange={(value) => updateDraftObject("invitation", "whatsappNumber", value)}
                  value={adminDraft.invitation.whatsappNumber}
                />
                <AdminField
                  label="Mekan adı"
                  onChange={(value) => updateDraftObject("invitation", "venue", value)}
                  value={adminDraft.invitation.venue}
                />
                <AdminField
                  label="Adres"
                  onChange={(value) => updateDraftObject("invitation", "address", value)}
                  value={adminDraft.invitation.address}
                />
                <AdminField
                  label="Harita linki"
                  onChange={(value) => updateDraftObject("invitation", "mapLink", value)}
                  value={adminDraft.invitation.mapLink}
                />
                <AdminField
                  label="Paylaşım linki"
                  onChange={(value) => updateDraftObject("invitation", "shareLink", value)}
                  value={adminDraft.invitation.shareLink}
                  placeholder={getCurrentShareLink()}
                />
                <AdminTextarea
                  label="Ana davet metni"
                  onChange={(value) => updateDraftObject("invitation", "message", value)}
                  value={adminDraft.invitation.message}
                />
              </div>
            </AdminSection>
          );

        case "theme":
          return (
            <AdminSection title="Tema ve Yayın Ayarları">
              <p className="admin-help-text">
                Tema değiştiğinde butonlar, kartlar, yazı renkleri, arka planlar ve ana görsellerin üzerindeki renk katmanı aynı temaya göre değişir. Koyu tema da buradan seçilebilir.
              </p>

              <div className="theme-picker-grid">
                {THEMES.map((theme) => (
                  <button
                    type="button"
                    key={theme.value}
                    className={adminDraft.settings.theme === theme.value ? "theme-option-card active" : "theme-option-card"}
                    data-theme-preview={theme.value}
                    onClick={() => handleThemeChange(theme.value)}
                  >
                    <span className="theme-swatch" aria-hidden="true"></span>
                    <strong>{theme.label}</strong>
                    <small>{adminDraft.settings.theme === theme.value ? "Seçili tema" : "Bu temayı kullan"}</small>
                  </button>
                ))}
              </div>

              <div className="admin-theme-check-row">
                <AdminCheckbox
                  checked={adminDraft.settings.requireWishApproval}
                  label="Anı defteri mesajları admin onayından sonra yayınlansın"
                  onChange={(value) => updateDraftObject("settings", "requireWishApproval", value)}
                />
              </div>

              <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
                <h4 style={{ marginBottom: "12px", color: "var(--text-h)" }}>Bölüm Görünürlüğü (Aç/Kapat)</h4>
                <p className="admin-help-text" style={{ marginBottom: "16px" }}>
                  Davetiyenizde görünmesini istemediğiniz bölümleri buradan kapatabilirsiniz. Kapattığınız bölümler sayfadan tamamen gizlenir.
                </p>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                  <AdminCheckbox
                    checked={adminDraft.settings.visibility?.countdown ?? false}
                    label="Geri Sayım"
                    onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, countdown: v })}
                  />
                  <AdminCheckbox
                    checked={adminDraft.settings.visibility?.family ?? false}
                    label="Aile Bilgileri"
                    onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, family: v })}
                  />
                  <AdminCheckbox
                    checked={adminDraft.settings.visibility?.ceremony ?? false}
                    label="Nikah / Düğün Detayları"
                    onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, ceremony: v })}
                  />
                  <AdminCheckbox
                    checked={adminDraft.settings.visibility?.schedule ?? false}
                    label="Düğün Takvimi (Akış)"
                    onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, schedule: v })}
                  />
                  <AdminCheckbox
                    checked={adminDraft.settings.visibility?.location ?? false}
                    label="Tarih ve Harita"
                    onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, location: v })}
                  />
                  <AdminCheckbox
                    checked={adminDraft.settings.visibility?.gallery ?? false}
                    label="Fotoğraf Galerisi"
                    onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, gallery: v })}
                  />
                  <AdminCheckbox
                    checked={adminDraft.settings.visibility?.rsvp ?? false}
                    label="Katılım (LCV) Formu"
                    onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, rsvp: v })}
                  />
                  <AdminCheckbox
                    checked={adminDraft.settings.visibility?.guests ?? false}
                    label="Misafir Listesi"
                    onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, guests: v })}
                  />
                  <AdminCheckbox
                    checked={adminDraft.settings.visibility?.wishes ?? false}
                    label="Anı Defteri Formu"
                    onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, wishes: v })}
                  />
                </div>
              </div>
            </AdminSection>
          );

        case "security":
          return (
            <AdminSection title="Admin Panel Şifresi">
              <p className="admin-help-text">
                Admin panel Supabase Auth ile korunur. Buradan giriş yaptığın admin kullanıcısının şifresini güncellersin. Şifre değişince güvenlik için oturum kapatılır ve yeni şifreyle tekrar giriş yapılır.
              </p>

              <form className="admin-password-form" onSubmit={changeAdminPassword}>
                <div className="admin-edit-grid">
                  <AdminField
                    label="Mevcut şifre"
                    onChange={setAdminCurrentPassword}
                    placeholder="Mevcut admin şifresi"
                    type="password"
                    value={adminCurrentPassword}
                  />
                  <AdminField
                    label="Yeni şifre"
                    onChange={setAdminNewPassword}
                    placeholder="Yeni şifre"
                    type="password"
                    value={adminNewPassword}
                  />
                  <AdminField
                    label="Yeni şifre tekrar"
                    onChange={setAdminNewPasswordAgain}
                    placeholder="Yeni şifreyi tekrar yaz"
                    type="password"
                    value={adminNewPasswordAgain}
                  />
                </div>

                <div className="admin-password-actions">
                  <button type="submit" className="main-button">Şifreyi Güncelle</button>
                  {adminPasswordMessage && <span className="admin-password-message">{adminPasswordMessage}</span>}
                </div>
              </form>
            </AdminSection>
          );

        case "messages":
          return (
            <AdminSection title="WhatsApp ve Özel Davetli Mesajları">
              <p className="admin-help-text">
                Kullanabileceğin değişkenler: {"{couple}"} çift adını, {"{link}"} davetiye linkini, {"{guest}"} özel davetli adını yazar.
              </p>
              <div className="admin-edit-grid">
                <AdminTextarea
                  label="WhatsApp paylaşım mesajı"
                  onChange={(value) => updateDraftObject("messages", "whatsappShareMessage", value)}
                  value={adminDraft.messages.whatsappShareMessage}
                />
                <AdminTextarea
                  label="WhatsApp katılım bildirimi mesajı"
                  onChange={(value) => updateDraftObject("messages", "rsvpWhatsappMessage", value)}
                  value={adminDraft.messages.rsvpWhatsappMessage}
                />
                <AdminTextarea
                  label="Kişiye özel davetli karşılama metni"
                  onChange={(value) => updateDraftObject("messages", "guestGreeting", value)}
                  value={adminDraft.messages.guestGreeting}
                />
              </div>
            </AdminSection>
          );

        case "copy":
          return (
            <AdminSection title="Sayfadaki Başlık ve Açıklamalar">
              <div className="admin-edit-grid">
                {Object.entries(adminDraft.copy).map(([key, value]) => (
                  key.toLowerCase().includes("text") || key.toLowerCase().includes("description") ? (
                    <AdminTextarea
                      key={key}
                      label={key}
                      onChange={(nextValue) => updateDraftObject("copy", key, nextValue)}
                      value={value}
                    />
                  ) : (
                    <AdminField
                      key={key}
                      label={key}
                      onChange={(nextValue) => updateDraftObject("copy", key, nextValue)}
                      value={value}
                    />
                  )
                ))}
              </div>
            </AdminSection>
          );

        case "family":
          return (
            <AdminSection title="Aile Bilgileri">
              
              <div className="admin-visibility-card">
                <AdminCheckbox
                  checked={adminDraft.settings.visibility?.family ?? false}
                  label="Aile Bilgileri bölümünü davetiyede göster"
                  onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, family: v })}
                />
              </div>

              <div className="admin-edit-grid">
                <AdminField
                  label="Gelin ailesi başlığı"
                  onChange={(value) => updateDraftObject("familyInfo", "brideFamilyTitle", value)}
                  value={adminDraft.familyInfo.brideFamilyTitle}
                />
                <AdminField
                  label="Gelin ailesi adı"
                  onChange={(value) => updateDraftObject("familyInfo", "brideFamilyName", value)}
                  value={adminDraft.familyInfo.brideFamilyName}
                />
                <AdminField
                  label="Damat ailesi başlığı"
                  onChange={(value) => updateDraftObject("familyInfo", "groomFamilyTitle", value)}
                  value={adminDraft.familyInfo.groomFamilyTitle}
                />
                <AdminField
                  label="Damat ailesi adı"
                  onChange={(value) => updateDraftObject("familyInfo", "groomFamilyName", value)}
                  value={adminDraft.familyInfo.groomFamilyName}
                />
                <AdminTextarea
                  label="Aile açıklaması"
                  onChange={(value) => updateDraftObject("familyInfo", "text", value)}
                  value={adminDraft.familyInfo.text}
                />
              </div>
            </AdminSection>
          );

        case "ceremony":
          return (
            <AdminSection title="Nikah / Düğün Ayrımı">
              <div className="admin-visibility-card">
                <AdminCheckbox
                  checked={adminDraft.settings.visibility?.ceremony ?? false}
                  label="Nikah / Düğün bölümünü davetiyede göster"
                  onChange={(v) =>
                    updateDraftObject("settings", "visibility", {
                      ...adminDraft.settings.visibility,
                      ceremony: v,
                    })
                  }
                />
              </div>

              <div className="admin-repeat-list">
                {adminDraft.eventDetails.map((event, index) => (
                  <div className="admin-repeat-item" key={`event-${index}`}>
                    <div className="admin-repeat-title">
                      <strong>Etkinlik {index + 1}</strong>
                      <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => removeDraftArrayItem("eventDetails", index)}>
                        Sil
                      </button>
                    </div>
                    <div className="admin-edit-grid">
                      <AdminField
                        label="Başlık"
                        onChange={(value) =>
                          updateDraftArrayItem("eventDetails", index, "label", value)
                        }
                        value={event.label}
                      />
                      <AdminField
                        label="Saat"
                        onChange={(value) =>
                          updateDraftArrayItem("eventDetails", index, "time", value)
                        }
                        value={event.time}
                      />
                      <AdminField
                        label="Yer"
                        onChange={(value) =>
                          updateDraftArrayItem("eventDetails", index, "location", value)
                        }
                        value={event.location}
                      />
                      <AdminTextarea
                        label="Açıklama"
                        onChange={(value) =>
                          updateDraftArrayItem("eventDetails", index, "description", value)
                        }
                        value={event.description}
                      />
                    </div>
                  </div>
                ))}
                <button type="button" className="secondary-button admin-add-button" onClick={() => addDraftArrayItem("eventDetails", { label: "Yeni Etkinlik", time: "", location: "", description: "" })}>
                  Yeni Etkinlik Ekle
                </button>
              </div>
            </AdminSection>
          );

        case "schedule":

          return (
            <AdminSection title="Düğün Takvimi / Akış">

              <div className="admin-visibility-card">
                <AdminCheckbox
                  checked={adminDraft.settings.visibility?.schedule ?? false}
                  label="Düğün Takvimi bölümünü davetiyede göster"
                  onChange={(v) =>
                    updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, schedule: v })
                  }
                />
              </div>

              <div className="admin-repeat-list">
                {adminDraft.scheduleItems.map((item, index) => (
                  <div className="admin-repeat-item" key={`schedule-${index}`}>
                    <div className="admin-repeat-title">
                      <strong>Akış {index + 1}</strong>
                      <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => removeDraftArrayItem("scheduleItems", index)}>
                        Sil
                      </button>
                    </div>
                    <div className="admin-edit-grid">
                      <AdminField
                        label="Saat"
                        onChange={(value) => updateDraftArrayItem("scheduleItems", index, "time", value)}
                        value={item.time}
                      />
                      <AdminField
                        label="Başlık"
                        onChange={(value) => updateDraftArrayItem("scheduleItems", index, "title", value)}
                        value={item.title}
                      />
                      <AdminTextarea
                        label="Açıklama"
                        onChange={(value) => updateDraftArrayItem("scheduleItems", index, "description", value)}
                        value={item.description}
                      />
                    </div>
                  </div>
                ))}
                <button type="button" className="secondary-button admin-add-button" onClick={() => addDraftArrayItem("scheduleItems", { time: "", title: "Yeni Akış", description: "" })}>
                  Yeni Akış Ekle
                </button>
              </div>
            </AdminSection>
          );

        case "gallery":
          return (
            <AdminSection title="Görsel Yönetimi">

              <div className="admin-visibility-card">
                <AdminCheckbox
                  checked={adminDraft.settings.visibility?.gallery ?? false}
                  label="Fotoğraf Galerisi bölümünü davetiyede göster"
                  onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, gallery: v })}
                />
              </div>

              <div className="admin-edit-grid">
                <AdminImageField
                  label="Açılış ekranı resmi"
                  onFileSelect={(e) => updateDraftImage("invitation", "introImage", e.target.files?.[0])}
                  value={adminDraft.invitation.introImage}
                  onClear={() => clearDraftImage("invitation", "introImage")}
                />
                <AdminImageField
                  label="Ana ekran büyük resmi"
                  onFileSelect={(e) => updateDraftImage("invitation", "heroImage", e.target.files?.[0])}
                  value={adminDraft.invitation.heroImage}
                  onClear={() => clearDraftImage("invitation", "heroImage")}
                />
                <AdminMusicField
                  fileName={adminDraft.invitation.musicName}
                  onFileSelect={(e) => updateDraftMusic(e.target.files?.[0])}
                  value={adminDraft.invitation.musicFile}
                  onClear={clearDraftMusic}
                />
              </div>

              <div className="admin-repeat-list admin-gallery-list">
                {adminDraft.invitation.gallery.map((image, index) => (
                  <div className="admin-gallery-upload-row" key={`gallery-${index}`}>
                    <AdminImageField
                      label={`Galeri ${index + 1}`}
                      onFileSelect={(e) => updateGalleryImageFile(index, e.target.files?.[0])}
                      value={image}
                      onClear={() => updateGalleryItem(index, "")}
                    />
                    <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => removeGalleryItem(index)}>
                      Galeriden Sil
                    </button>
                  </div>
                ))}
                <button type="button" className="secondary-button admin-add-button" onClick={addGalleryItem}>
                  Yeni Görsel Alanı Ekle
                </button>
              </div>
            </AdminSection>
          );

        case "guests":
          return (
            <AdminSection title="Katılım Formu Kayıtları">
              
              <div className="admin-visibility-card">
                <AdminCheckbox
                  checked={adminDraft.settings.visibility?.rsvp ?? false}
                  label="Katılım (LCV) Formunu davetiyede göster"
                  onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, rsvp: v })}
                />
                <AdminCheckbox
                  checked={adminDraft.settings.visibility?.guests ?? false}
                  label="Misafir Listesini davetiyede göster"
                  onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, guests: v })}
                />
              </div>

              <div className="admin-stats admin-stats-inside">
                <div><strong>{guests.length}</strong><span>Toplam Yanıt</span></div>
                <div><strong>{totalPersonCount}</strong><span>Katılacak Kişi</span></div>
                <div><strong>{notAttendingCount}</strong><span>Katılamayacak</span></div>
                <div><strong>{childGuestCount}</strong><span>Çocuklu Yanıt</span></div>
                <div><strong>{brideSideCount}</strong><span>Gelin Tarafı</span></div>
                <div><strong>{groomSideCount}</strong><span>Damat Tarafı</span></div>
              </div>

              <div className="admin-toolbar">
                <input value={adminGuestSearch} onChange={(e) => setAdminGuestSearch(e.target.value)} placeholder="Kayıtlarda ara" />
                <AdminDropdown
                  label="Katılımlar"
                  value={adminGuestAttendanceFilter}
                  onChange={setAdminGuestAttendanceFilter}
                  options={[
                    { label: "Katılacağım", value: "Katılacağım" },
                    { label: "Katılamayacağım", value: "Katılamayacağım" },
                    { label: "Tüm Katılımlar", value: "all" },
                  ]}
                />
                <AdminDropdown
                  label="Taraflar"
                  value={adminGuestSideFilter}
                  onChange={setAdminGuestSideFilter}
                  options={[
                    { label: "Damat Tarafı", value: "Damat Tarafı" },
                    { label: "Gelin Tarafı", value: "Gelin Tarafı" },
                    { label: "Ortak", value: "Ortak" },
                    { label: "Tüm Taraflar", value: "all" },
                  ]}
                />
                <AdminDropdown
                  label="Çocuk filtresi"
                  value={adminGuestChildFilter}
                  onChange={setAdminGuestChildFilter}
                  options={[
                    { label: "Evet", value: "Evet" },
                    { label: "Hayır", value: "Hayır" },
                    { label: "Tümü", value: "all" },
                  ]}
                />
                <button type="button" className="secondary-button" onClick={exportGuestsExcel}>Excel İndir</button>
                <button type="button" className="secondary-button" onClick={exportGuestsCsv}>CSV İndir</button>
              </div>

              <div className="admin-list admin-list-full">
                {filteredGuests.length === 0 ? (
                  <p className="empty-text">Bu filtreye uygun kayıt yok.</p>
                ) : (
                  filteredGuests.map((guest) => (
                    <div className="admin-row" key={guest.id}>
                      <strong>{guest.name}</strong>
                      <span>{guest.attendance} · {guest.personCount} kişi · {guest.side}</span>
                      <span>Telefon: {guest.phone || "-"}</span>
                      <span>Çocuk: {guest.hasChild || "Hayır"}</span>
                      {guest.note && <em>Not: {guest.note}</em>}
                      <div className="admin-row-actions">
                        <button type="button" className="secondary-button small-admin-button" onClick={() => editGuest(guest.id)}>Düzenle</button>
                        <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => deleteGuest(guest.id)}>Sil</button>
                      </div>
                    </div>
                  ))
                )}
                <button type="button" className="secondary-button danger-button" onClick={clearGuests}>
                  Katılım Kayıtlarını Temizle
                </button>
              </div>
            </AdminSection>
          );

        case "wishes":
          return (
            <AdminSection title="Anı Defteri Formu Mesajları">

              <div className="admin-visibility-card">
                <AdminCheckbox
                  checked={adminDraft.settings.visibility?.wishes ?? false}
                  label="Anı Defteri bölümünü davetiyede göster"
                  onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, wishes: v })}
                />
              </div>
              
              <div className="admin-toolbar">
                <input value={adminWishSearch} onChange={(e) => setAdminWishSearch(e.target.value)} placeholder="Mesajlarda ara" />
                <AdminDropdown
                  label="Onay Durumu"
                  value={adminWishStatusFilter}
                  onChange={setAdminWishStatusFilter}
                  options={[
                    { label: "Tüm mesajlar", value: "all" },
                    { label: "Yayında", value: "approved" },
                    { label: "Onay bekliyor", value: "pending" },
                  ]}
                />
                <button type="button" className="secondary-button" onClick={exportWishesExcel}>Excel İndir</button>
                <button type="button" className="secondary-button" onClick={exportWishesCsv}>CSV İndir</button>
              </div>

              <div className="admin-list admin-list-full">
                {filteredWishes.length === 0 ? (
                  <p className="empty-text">Bu filtreye uygun mesaj yok.</p>
                ) : (
                  filteredWishes.map((wish) => (
                    <div className="admin-row" key={wish.id}>
                      <strong>{wish.name}</strong>
                      <span>Durum: {wish.approved === false ? "Onay bekliyor" : "Yayında"}</span>
                      <em>{wish.message}</em>
                      <div className="admin-row-actions">
                        <button type="button" className="secondary-button small-admin-button" onClick={() => toggleWishApproval(wish.id)}>
                          {wish.approved === false ? "Onayla" : "Yayından Kaldır"}
                        </button>
                        <button type="button" className="secondary-button small-admin-button" onClick={() => editWish(wish.id)}>Düzenle</button>
                        <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => deleteWish(wish.id)}>Sil</button>
                      </div>
                    </div>
                  ))
                )}
                <button type="button" className="secondary-button danger-button" onClick={clearWishes}>
                  Mesajları Temizle
                </button>
              </div>
            </AdminSection>
          );

        case "qr":
          return (
            <AdminSection title="QR Kod">
              <p className="admin-help-text">
                Bu bölüm sadece genel davetiye QR kodu içindir. Davetliye özel isimli link oluşturmak için sol menüden “Özel Link” bölümünü aç.
              </p>

              <div className="admin-qr-panel qr-only-panel">
                <div>
                  <span>Genel Davetiye QR Kodu</span>
                  <img src={qrImageUrl} alt="Davetiye QR kodu" />
                  <div className="admin-qr-actions">
                    <button type="button" className="secondary-button" onClick={downloadQrCode}>QR Kodu İndir</button>
                    <button type="button" className="secondary-button" onClick={() => copyAdminLink(currentShareLink, "Davetiye linki kopyalandı.")}>Linki Kopyala</button>
                  </div>
                </div>
                <div className="admin-link-preview-box">
                  <span>QR kodun açacağı link</span>
                  <input value={currentShareLink} readOnly />
                  <small>Bu link genel davetiye linkidir; davetli adı içermez.</small>
                </div>
              </div>
            </AdminSection>
          );

        case "personalLink":
          return (
            <AdminSection title="Kişiye Özel Davetli Linki">
              <p className="admin-help-text">
                Buradan davetliye özel link oluşturabilirsin. Link açıldığında ana sayfada davetli adına özel karşılama metni gösterilir.
              </p>

              <div className="admin-personal-link-box personal-link-standalone">
                <AdminField label="Davetli adı" onChange="{setPersonalLinkName}" placeholder="Örn. Ahmet Yılmaz" value="{personalLinkName}"/>
                <input value={personalGuestLink} readOnly />
                <button type="button" className="secondary-button" onClick={() => copyAdminLink(personalGuestLink, "Kişiye özel link kopyalandı.")}>Özel Linki Kopyala</button>
              </div>
            </AdminSection>
          );

        case "data":
          return (
            <AdminSection title="Veri İndirme ve Yedekleme">
              <p className="admin-help-text">
                Katılım ve anı defteri kayıtlarını Excel veya CSV olarak indirebilirsin. JSON yedek ise tüm davetiye ayarlarını, kayıtları ve görsel/müzik verilerini saklar.
              </p>

              <div className="admin-export-grid">
                <div className="admin-export-card">
                  <strong>Katılım Formu</strong>
                  <span>Ad, telefon, katılım, kişi sayısı, taraf, çocuk ve not bilgileri.</span>
                  <div className="admin-export-actions">
                    <button type="button" className="secondary-button" onClick={exportGuestsExcel}>Excel İndir</button>
                    <button type="button" className="secondary-button" onClick={exportGuestsCsv}>CSV İndir</button>
                  </div>
                </div>

                <div className="admin-export-card">
                  <strong>Anı Defteri</strong>
                  <span>İsim, mesaj ve yayın/onay durumları.</span>
                  <div className="admin-export-actions">
                    <button type="button" className="secondary-button" onClick={exportWishesExcel}>Excel İndir</button>
                    <button type="button" className="secondary-button" onClick={exportWishesCsv}>CSV İndir</button>
                  </div>
                </div>

                <div className="admin-export-card">
                  <strong>Tüm Davetiye Yedeği</strong>
                  <span>Davetiye içerikleri, tema, görseller, müzik, kayıtlar ve mesajlar.</span>
                  <button type="button" className="main-button" onClick={exportAllDataJson}>Tüm Veriyi JSON İndir</button>
                </div>
              </div>

              <div className="admin-import-box">
                <AdminTextarea label="JSON yedeğini buraya yapıştır" onChange="{setDataImportText}" placeholder="Yedek JSON içeriği" value="{dataImportText}"/>
                <button type="button" className="secondary-button" onClick={importAllDataJson}>JSON Yedeğini Geri Yükle</button>
              </div>
            </AdminSection>
          );

        default:
          return null;
      }
    };

    return (
      <AdminDashboard
        isAdminUnlocked={isAdminUnlocked}
        isPasswordRecovery={isPasswordRecovery}
        showForgotPassword={showForgotPassword}
        adminEmail={adminEmail}
        adminPassword={adminPassword}
        recoveryPassword={recoveryPassword}
        recoveryPasswordAgain={recoveryPasswordAgain}
        recoveryLoading={recoveryLoading}
        recoveryMessage={recoveryMessage}
        forgotPasswordEmail={forgotPasswordEmail}
        forgotPasswordLoading={forgotPasswordLoading}
        forgotPasswordMessage={forgotPasswordMessage}
        adminAuthLoading={adminAuthLoading}
        adminLoginNotice={adminLoginNotice}
        adminError={adminError}
        adminSaveMessage={adminSaveMessage}
        activeAdminTab={activeAdminTab}
        activeTabInfo={activeTabInfo}
        adminTabs={adminTabs}
        setAdminEmail={setAdminEmail}
        setAdminPassword={setAdminPassword}
        setForgotPasswordEmail={setForgotPasswordEmail}
        setShowForgotPassword={setShowForgotPassword}
        setAdminError={setAdminError}
        setAdminLoginNotice={setAdminLoginNotice}
        setRecoveryPassword={setRecoveryPassword}
        setRecoveryPasswordAgain={setRecoveryPasswordAgain}
        setRecoveryMessage={setRecoveryMessage}
        setForgotPasswordMessage={setForgotPasswordMessage}
        submitAdminPassword={submitAdminPassword}
        completePasswordRecovery={completePasswordRecovery}
        sendPasswordResetEmail={sendPasswordResetEmail}
        openAdminTab={openAdminTab}
        saveSiteContent={saveSiteContent}
        resetSiteContent={resetSiteContent}
        logoutAdmin={logoutAdmin}
        closeAdminPage={closeAdminPage}
        renderAdminActivePanel={renderAdminActivePanel}
      />
    );
  };

  return (
    <div
      className="app"
      lang="tr"
      data-theme={settings.theme || "lavanta"}
      style={{
        "--intro-image": `url(${invitation.introImage})`,
        "--hero-image": `url(${invitation.heroImage})`,
      }}
    >
      <audio
        key={invitation.musicFile}
        ref={audioRef}
        src={invitation.musicFile || ""}
        loop
        preload="auto"
        onPlay={() => setIsMusicPlaying(true)}
        onPause={() => setIsMusicPlaying(false)}
        onEnded={() => setIsMusicPlaying(false)}
      />
      <AppModal modal={appModal} onInputChange={(value) => setAppModal((prev) => (prev ? { ...prev, inputValue: value } : prev))}
        onConfirm={(value) => resolveAppModal(value)}
        onCancel={() => resolveAppModal(appModal?.type === "prompt" ? null : false)}
      />

      {isAdminPage ? (
        renderAdminPage()
      ) : !opened ? (
            <section className={`intro-page ${isOpening ? "opening" : ""}`}>
            <div className="petal-layer" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, index) => (
              <span key={index}></span>
            ))}
          </div>

          <div className="ribbon ribbon-left"></div>
          <div className="ribbon ribbon-right"></div>

          {/* ZARF KONTEYNERİ */}
          <div className="envelope-container">
            <div className="envelope-back"></div>

            {/* Davetiye Kartımız (Zarfın içinde) */}
            <div className="intro-card">
              <div className="leaf-mark" aria-hidden="true"></div>
              <p className="intro-small">{copy.introLabel}</p>

              <h1 className="couple-title">
                <span>{invitation.bride}</span>
                <em>&</em>
                <span>{invitation.groom}</span>
              </h1>

              <p className="intro-text">{copy.introText}</p>
              {guestGreeting && <p className="guest-greeting">{guestGreeting}</p>}
            </div>

            <div className="envelope-front"></div>
            <div className="envelope-flap"></div>

            <button className="envelope-seal" onClick={openInvitation}>
              {copy.openButton}
            </button>
          </div>
        </section>
      ) : (
        <>
          <div className="floating-actions">
            <a
              className="share-button"
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noreferrer"
            >
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
                      <section className="hero-section">
                        <div className="hero-content">
                          <p className="small-title">{copy.heroLabel}</p>
                          <h1 className="couple-title">
                            <span>{invitation.bride}</span>
                            <em>&</em>
                            <span>{invitation.groom}</span>
                          </h1>
                          <p className="hero-date">{invitation.dateText}</p>
                          <p className="hero-time">Saat {invitation.timeText}</p>
                          {guestGreeting && <p className="hero-guest-greeting">{guestGreeting}</p>}
                        </div>
                      </section>

                      {settings.visibility?.countdown !== false && (
                        <section className="countdown-section">
                          <p className="section-label">{copy.countdownLabel}</p>
                          <h2>{copy.countdownTitle}</h2>
                          <div className="countdown-grid">
                            <div className="count-box countdown-animated"><strong>{timeLeft.days}</strong><span>Gün</span></div>
                            <div className="count-box countdown-animated"><strong>{timeLeft.hours}</strong><span>Saat</span></div>
                            <div className="count-box countdown-animated"><strong>{timeLeft.minutes}</strong><span>Dakika</span></div>
                            <div className="count-box countdown-animated"><strong>{timeLeft.seconds}</strong><span>Saniye</span></div>
                          </div>
                        </section>
                      )}

                      <section className="card invitation-card">
                        <p className="section-label">{copy.invitationLabel}</p>
                        <h2>{copy.invitationTitle}</h2>
                        <p>{invitation.message}</p>
                      </section>

                      {settings.visibility?.family !== false && (
                        <section className="card family-card">
                          <p className="section-label">{copy.familyLabel}</p>
                          <h2>{copy.familyTitle}</h2>
                          <p>{familyInfo.text}</p>
                          <div className="family-grid">
                            <div>
                              <span>{familyInfo.brideFamilyTitle}</span>
                              <strong>{familyInfo.brideFamilyName}</strong>
                            </div>
                            <div>
                              <span>{familyInfo.groomFamilyTitle}</span>
                              <strong>{familyInfo.groomFamilyName}</strong>
                            </div>
                          </div>
                        </section>
                      )}

                      {settings.visibility?.ceremony !== false && (
                        <section className="card ceremony-card">
                          <p className="section-label">{copy.ceremonyLabel}</p>
                          <h2>{copy.ceremonyTitle}</h2>
                          <div className="ceremony-grid">
                            {siteData.eventDetails.map((event, index) => (
                              <div className="ceremony-item" key={`${event.label}-${index}`}>
                                <span>{event.label}</span>
                                <strong>{event.time}</strong>
                                <p>{event.description}</p>
                                <em>{event.location}</em>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {settings.visibility?.schedule !== false && (
                        <section className="card schedule-card">
                          <p className="section-label">{copy.scheduleLabel}</p>
                          <h2>{invitation.dateText}</h2>
                          <div className="schedule-list">
                            {siteData.scheduleItems.map((item, index) => (
                              <div className="schedule-item" key={`${item.time}-${index}`}>
                                <strong>{item.time}</strong>
                                <div>
                                  <span>{item.title}</span>
                                  <p>{item.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {settings.visibility?.location !== false && (
                        <section className="card">
                          <p className="section-label">{copy.locationLabel}</p>
                          <h2>{copy.locationTitle}</h2>
                          <div className="info-list">
                            <div className="info-row"><span>Tarih</span><strong>{invitation.dateText}</strong></div>
                            <div className="info-row"><span>Saat</span><strong>{invitation.timeText}</strong></div>
                            <div className="info-row"><span>Yer</span><strong>{invitation.venue}</strong></div>
                            <div className="info-row"><span>Adres</span><strong>{invitation.address}</strong></div>
                          </div>
                          <div className="mini-map">
                            <iframe
                              title="Düğün Konumu"
                              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${invitation.venue} ${invitation.address}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                              loading="lazy"
                              allowFullScreen
                              referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                          </div>
                          <div className="button-group">
                            <a className="main-button" href={invitation.mapLink} target="_blank" rel="noreferrer">Konuma Git</a>
                            <a className="secondary-button" href={googleCalendarLink} target="_blank" rel="noreferrer">Takvime Ekle</a>
                          </div>
                        </section>
                      )}

                      {settings.visibility?.gallery !== false && (
                        <section className="card">
                          <p className="section-label">{copy.galleryLabel}</p>
                          <h2>{copy.galleryTitle}</h2>
                          <div className="gallery-grid">
                            {invitation.gallery.map((image, index) => (
                              <img key={`${image}-${index}`} src={image} alt={`Galeri ${index + 1}`} loading="lazy" />
                            ))}
                          </div>
                        </section>
                      )}

                      {settings.visibility?.rsvp !== false && (
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
                            href={`https://wa.me/${invitation.whatsappNumber?.replace(/\D/g, "")}?text=${encodeURIComponent(rsvpWhatsappText)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            WhatsApp ile Bildir
                          </a>
                        </section>
                      )}

                      {settings.visibility?.guests !== false && (
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
                      )}

                      {settings.visibility?.wishes !== false && (
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
                                  <p>“{wish.message}”</p>
                                  <strong>{wish.name}</strong>
                                </div>
                              ))
                            )}
                          </div>
                        </section>
                      )}

                      <section className="card">
                        <p className="section-label">{copy.shareLabel}</p>
                        <h2>{copy.shareTitle}</h2>
                        <p>{copy.shareDescription}</p>
                        <div className="qr-public-card">
                          <img src={qrImageUrl} alt="Davetiye QR kodu" loading="lazy" />
                          <span>QR kod ile hızlıca paylaşabilirsiniz.</span>
                        </div>
                        <div className="button-group">
                          <a className="main-button" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer">WhatsApp ile Paylaş</a>
                          <button className="secondary-button" onClick={copyInvitationLink}>Linki Kopyala</button>
                        </div>
                      </section>

                      <footer className="footer">
                        <p>{coupleName}</p>
                        <span>{invitation.dateText}</span>
                        <small>{copy.thanksText}</small>
                        <small>{copy.footerSmall}</small>
                      </footer>
          </main>
        </>
      )}
    </div>
  );
}

export default App;