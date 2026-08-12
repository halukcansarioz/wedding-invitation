import { Suspense, lazy, useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./styles/index.css";
import { supabase } from "./supabaseClient";
import { useAdminSession } from "./hooks/useAdminSession";
import { useCountdown } from "./hooks/useCountdown";
import { useAudio } from "./hooks/useAudio";
import { useDatabaseManager } from "./hooks/useDatabaseManager";
import IntroPage from "./components/invitation/IntroPage";
import { GlobalModals } from "./components/common/GlobalModals";
import FloatingMenu from "./components/common/FloatingMenu";

const InvitationView = lazy(() => import("./pages/InvitationView"));
const AdminView = lazy(() => import("./pages/AdminView"));

import {
  DEFAULT_WEDDING_MUSIC_FILE,
  DEFAULT_WEDDING_MUSIC_NAME,
  SITE_DATA_KEY,
  THEME_DEFAULT_IMAGES,
  MAX_AUDIO_FILE_SIZE,
  INITIAL_GUEST_FORM,
  INITIAL_WISH_FORM
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
  clearAdminSessionTimestamp,
  uiGuestToDb,
  dbGuestToUi,
  uiWishToDb,
  dbWishToUi,
  normalizeSiteData,
  mergeSiteData
} from "./utils/helpers";
import {
  getSupabaseSetupMessage,
  isSupabaseReady,
  loadSettingsFromDatabase,
  saveSettingsToDatabase,
  loadPublishedWishesFromDatabase,
  loadGuestsFromDatabase,
  loadAllWishesFromDatabase,
  uploadMediaFile
} from "./services/database";

function App() {
  const { t, i18n } = useTranslation(); 
  const isEn = i18n.language.startsWith('en');

  const toggleLanguage = () => {
    i18n.changeLanguage(isEn ? 'tr' : 'en');
  };

  const [siteData, setSiteData] = useState(() => loadStoredSiteData());
  const [adminDraft, setAdminDraft] = useState(() => loadStoredSiteData());
  const [opened, setOpened] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
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
  
  const [customAlert, setCustomAlert] = useState(null);
  const [customConfirm, setCustomConfirm] = useState(null);
  const [customPrompt, setCustomPrompt] = useState(null);

  const invitation = useMemo(() => siteData.invitation, [siteData.invitation]);
  const familyInfo = useMemo(() => siteData.familyInfo, [siteData.familyInfo]);
  const copy = useMemo(() => siteData.copy, [siteData.copy]);
  const settings = useMemo(() => siteData.settings, [siteData.settings]);
  const messages = useMemo(() => siteData.messages, [siteData.messages]);
  const coupleName = useMemo(() => `${invitation.bride} & ${invitation.groom}`, [invitation.bride, invitation.groom]);
  const personalGuestName = useMemo(() => getGuestNameFromUrl(), []);
  
  const isAttending = useMemo(() => guestForm.attendance === "Katılacağım", [guestForm.attendance]);
  const attendingGuests = useMemo(() => guests.filter((g) => g.attendance === "Katılacağım"), [guests]);
  const totalPersonCount = useMemo(() => attendingGuests.reduce((tot, g) => tot + Number(g.personCount || 1), 0), [attendingGuests]);
  const notAttendingCount = useMemo(() => guests.filter((g) => g.attendance === "Katılamayacağım").length, [guests]);
  const childGuestCount = useMemo(() => attendingGuests.filter((g) => g.hasChild === "Evet").length, [attendingGuests]);
  const brideSideCount = useMemo(() => attendingGuests.filter((g) => g.side === "Gelin Tarafı").length, [attendingGuests]);
  const groomSideCount = useMemo(() => attendingGuests.filter((g) => g.side === "Damat Tarafı").length, [attendingGuests]);
  const approvedWishes = useMemo(() => wishes.filter((w) => w.approved !== false), [wishes]);
  
  const currentShareLink = useMemo(() => invitation.shareLink || getCurrentShareLink(), [invitation.shareLink]);
  const guestGreeting = useMemo(() => personalGuestName ? formatMessageTemplate(messages.guestGreeting, { guest: personalGuestName, couple: coupleName, link: currentShareLink }) : "", [personalGuestName, messages.guestGreeting, coupleName, currentShareLink]);
  const shareText = useMemo(() => encodeURIComponent(formatMessageTemplate(messages.whatsappShareMessage, { couple: coupleName, link: currentShareLink, guest: personalGuestName })), [messages.whatsappShareMessage, coupleName, currentShareLink, personalGuestName]);
  const rsvpWhatsappText = useMemo(() => encodeURIComponent(formatMessageTemplate(messages.rsvpWhatsappMessage, { couple: coupleName, link: currentShareLink, guest: personalGuestName })), [messages.rsvpWhatsappMessage, coupleName, currentShareLink, personalGuestName]);
  const qrImageUrl = useMemo(() => getQrImageUrl(currentShareLink), [currentShareLink]);
  const googleCalendarLink = useMemo(() => createGoogleCalendarLink(siteData, coupleName), [siteData, coupleName]);
  const personalGuestLink = useMemo(() => buildPersonalLink(currentShareLink, personalLinkName), [currentShareLink, personalLinkName]);

  const timeLeft = useCountdown(invitation.weddingDate);
  const { audioRef, isMusicPlaying, startMusic, toggleMusic, stopMusic } = useAudio(invitation.musicFile);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);

  const scrollToNext = useCallback(() => {
    const isMobile = window.innerWidth <= 650;
    const sections = Array.from(document.querySelectorAll('.invitation-page > section, .invitation-page > footer'));
    
    if (isMobile) {
      if (currentSlideIndex < sections.length - 1) {
        setCurrentSlideIndex((prev) => prev + 1);
      }
    } else {
      const currentScroll = window.scrollY;
      const nextSection = sections.find(sec => {
        const rect = sec.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        return absoluteTop > currentScroll + (window.innerHeight * 0.5);
      });

      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (sections.length > 0) {
        sections[sections.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentSlideIndex]);

  const scrollToPrev = useCallback(() => {
    const isMobile = window.innerWidth <= 650;
    const sections = Array.from(document.querySelectorAll('.invitation-page > section, .invitation-page > footer'));
    
    if (isMobile) {
      if (currentSlideIndex > 0) {
        setCurrentSlideIndex((prev) => prev - 1);
      }
    } else {
      const currentScroll = window.scrollY;
      const prevSection = [...sections].reverse().find(sec => {
        const rect = sec.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        return absoluteTop < currentScroll - (window.innerHeight * 0.1); 
      });

      if (prevSection) {
        prevSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentSlideIndex]);

  const handleWheel = useCallback((e) => {
    if (isAdminPage || !opened || isScrollingRef.current) return;
    
    if (window.innerWidth <= 650) {
      if (e.deltaY > 0) scrollToNext();
      else scrollToPrev();

      isScrollingRef.current = true;
      setTimeout(() => { isScrollingRef.current = false; }, 600);
    }
  }, [isAdminPage, opened, scrollToNext, scrollToPrev]);

  const handleTouchStart = useCallback((e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartYRef.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (isAdminPage || !opened || isScrollingRef.current || !e.changedTouches || e.changedTouches.length === 0) return;

    if (window.innerWidth <= 650) {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartYRef.current - touchEndY;

      if (Math.abs(diff) > 40) {
        if (diff > 0) scrollToNext(); 
        else scrollToPrev(); 

        isScrollingRef.current = true;
        setTimeout(() => { isScrollingRef.current = false; }, 600);
      }
    }
  }, [isAdminPage, opened, scrollToNext, scrollToPrev]);

  useEffect(() => {
    if (isAdminPage || !opened) return;

    const checkAndApplyClasses = () => {
      const sections = document.querySelectorAll('.invitation-page > section, .invitation-page > footer');
      if (!sections.length) {
        setTimeout(checkAndApplyClasses, 50);
        return;
      }

      if (window.innerWidth <= 650) {
        sections.forEach((sec, idx) => {
          if (idx === currentSlideIndex) sec.classList.add('active-slide');
          else sec.classList.remove('active-slide');
        });

        setShowScrollTop(currentSlideIndex > 0);
        setShowScrollDown(currentSlideIndex < sections.length - 1);
      }
    };

    checkAndApplyClasses();
    
    const handleScroll = () => {
      if (window.innerWidth > 650) {
        setShowScrollTop(window.scrollY > 100);
        const isAtBottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 100;
        setShowScrollDown(!isAtBottom);
      }
    };

    if (window.innerWidth > 650) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      setShowScrollDown(true); 
      setTimeout(handleScroll, 800); 
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentSlideIndex, isAdminPage, opened]);

  useEffect(() => {
    if (isAdminPage) stopMusic();
  }, [isAdminPage, stopMusic]);

  const showAppAlert = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setCustomAlert({ message, title: options.title || (isEn ? "Information ℹ️" : "Bilgi ℹ️"), resolve });
    });
  }, [isEn]);

  const showAppConfirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setCustomConfirm({ message, title: options.title || (isEn ? "Confirmation 🤔" : "Onay 🤔"), resolve });
    });
  }, [isEn]);

  const showAppPrompt = useCallback((label, defaultValue = "", options = {}) => {
    return new Promise((resolve) => {
      setCustomPrompt({ label, value: defaultValue, title: options.title || (isEn ? "Edit ✏️" : "Düzenle ✏️"), resolve, multiline: options.multiline });
    });
  }, [isEn]);

  const {
    submitAdminPassword, sendPasswordResetEmail, completePasswordRecovery,
    changeAdminPassword, logoutAdmin, performAdminSignOut,
  } = useAdminSession({
    isAdminPage, adminEmail, adminPassword, adminUser, adminCurrentPassword,
    adminNewPassword, adminNewPasswordAgain, recoveryPassword, recoveryPasswordAgain,
    siteData, isAdminUnlocked, setAdminEmail, setAdminPassword, setAdminUser,
    setIsAdminUnlocked, setAdminError, setAdminLoginNotice, setShowForgotPassword,
    setForgotPasswordEmail, setForgotPasswordMessage, setAdminPasswordMessage,
    setAdminSaveMessage, setAdminCurrentPassword, setAdminNewPassword,
    setAdminNewPasswordAgain, setRecoveryPassword, setRecoveryPasswordAgain,
    setRecoveryMessage, setRecoveryLoading, setForgotPasswordLoading,
    setAdminAuthLoading, setIsPasswordRecovery, setActiveAdminTab,
    setSiteData, setAdminDraft, setGuests, setWishes, showAppConfirm, isEn
  });

  const {
    submitGuest, submitWish, clearGuests, clearWishes, deleteGuest, 
    editGuest, deleteWish, editWish, toggleWishApproval
  } = useDatabaseManager({
    guests, setGuests, wishes, setWishes, guestForm, setGuestForm, 
    wishForm, setWishForm, settings, showAppAlert, showAppConfirm, 
    showAppPrompt, setAdminSaveMessage, t, isEn
  });

  useEffect(() => {
    document.documentElement.lang = isEn ? "en" : "tr";
  }, [isEn]);

  const activeTheme = (isAdminPage ? adminDraft.settings?.theme : settings.theme) || "lavanta";

  useEffect(() => {
    document.documentElement.dataset.theme = activeTheme;
    const favicon = document.querySelector("link[rel='icon'], link[rel='shortcut icon']") || document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/svg+xml";
    favicon.href = getFaviconUrl(activeTheme);
    if (!favicon.parentNode) document.head.appendChild(favicon);
  }, [activeTheme]);

  useEffect(() => {
    document.title = `${invitation.bride} & ${invitation.groom} | ${isEn ? "Wedding Invitation" : "Düğün Davetiyesi"}`;
  }, [invitation.bride, invitation.groom, isEn]);
  
  useEffect(() => {
    const syncAdminPage = () => {
      const adminRouteActive = isAdminRouteActive();
      setIsAdminPage(adminRouteActive);
      if (!adminRouteActive) {
        setAdminPassword(""); setAdminError(""); setAdminLoginNotice("");
        setShowForgotPassword(false); setForgotPasswordEmail(""); setForgotPasswordMessage("");
        setIsPasswordRecovery(false); setRecoveryPassword(""); setRecoveryPasswordAgain("");
        setRecoveryMessage(""); setAdminCurrentPassword(""); setAdminNewPassword("");
        setAdminNewPasswordAgain(""); setAdminPasswordMessage(""); setAdminSaveMessage("");
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        const recoveryRouteActive = typeof window !== "undefined" &&
          (window.location.search.includes("reset=1") || window.location.search.includes("type=recovery") ||
            window.location.hash.includes("type=recovery") || window.location.hash.includes("access_token="));
        if (!recoveryRouteActive) return;
        setIsAdminPage(true); setIsPasswordRecovery(true); setShowForgotPassword(false);
        setAdminError(""); setForgotPasswordMessage(""); setAdminUser(session?.user || null);
        setAdminEmail(session?.user?.email || adminEmail); setIsAdminUnlocked(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [adminEmail]);

  useEffect(() => {
    async function initDatabaseData() {
      if (!isSupabaseReady()) {
        console.warn("Supabase bağlantısı eksik, varsayılan/yerel veriler kullanılıyor.");
        return;
      }

      try {
        let databaseSettings = await loadSettingsFromDatabase();
        if (!databaseSettings) {
          const defaultData = normalizeSiteData(null);
          await saveSettingsToDatabase(defaultData).catch(console.error);
          databaseSettings = defaultData;
        }

        const normalizedDatabaseSettings = normalizeSiteData(databaseSettings);
        localStorage.setItem(SITE_DATA_KEY, JSON.stringify(normalizedDatabaseSettings));

        setSiteData(normalizedDatabaseSettings);
        setAdminDraft(normalizedDatabaseSettings);

        const publishedWishes = await loadPublishedWishesFromDatabase();
        setWishes(publishedWishes || []);

        const dbGuests = await loadGuestsFromDatabase();
        setGuests(dbGuests || []);
      } catch (error) {
        console.error("Veritabanından veriler okunamadı:", error);
      }
    }

    initDatabaseData();
  }, []);

  useEffect(() => {
    if (isAdminPage) return;
    const imagesToPreload = [invitation.introImage, invitation.heroImage, ...invitation.gallery].filter(Boolean);
    if (imagesToPreload.length > 0) {
      imagesToPreload.forEach((src) => { const img = new Image(); img.src = src; });
    }
  }, [invitation.introImage, invitation.heroImage, invitation.gallery, isAdminPage]);

  const openInvitation = useCallback(() => {
    setIsOpening(true);
    startMusic().catch((err) => console.log("Müzik başlatılamadı:", err));
    setTimeout(() => { setOpened(true); }, 4000);
  }, [startMusic]);

  const handleGuestChange = useCallback((e) => {
    const { name, value } = e.target;
    setGuestForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleWishChange = useCallback((e) => {
    const { name, value } = e.target;
    setWishForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const updateAttendance = useCallback((attendance) => {
    setGuestForm((prev) => ({
      ...prev, 
      attendance,
      personCount: attendance === "Katılacağım" ? (prev.personCount === "0" ? "1" : prev.personCount) : "0",
      side: attendance === "Katılacağım" ? (prev.side === "-" ? "Gelin Tarafı" : prev.side) : "-",
      hasChild: attendance === "Katılacağım" ? (prev.hasChild === "-" ? "Hayır" : prev.hasChild) : "-",
    }));
  }, []);
  
  const copyInvitationLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentShareLink);
      await showAppAlert(t('alerts.linkCopied'), { title: isEn ? "Copied ✅" : "Kopyalandı ✅" });
    } catch {
      await showAppAlert(t('alerts.linkCopyError'), { title: isEn ? "Copy error ⚠️" : "Kopyalama hatası ⚠️" });
    }
  }, [currentShareLink, showAppAlert, t, isEn]);

  const copyAdminLink = useCallback(async (linkToCopy, successMessage) => {
    try { await navigator.clipboard.writeText(linkToCopy); setAdminSaveMessage(successMessage || (isEn ? "Link copied." : "Link kopyalandı.")); } catch { setAdminSaveMessage(isEn ? "Could not copy link." : "Link kopyalanamadı."); }
  }, [isEn]);

  const updateDraftObject = useCallback((group, key, value) => {
    setAdminDraft((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }));
  }, []);

  const updateDraftImage = useCallback(async (group, key, file) => {
    try {
      if (!file) return;
      const compressedDataUrl = await readImageFileAsDataUrl(file);
      const compressedBlob = await (await fetch(compressedDataUrl)).blob();
      const compressedFile = new File([compressedBlob], file.name, { type: "image/jpeg" });
      const url = await uploadMediaFile(compressedFile, "images");
      updateDraftObject(group, key, url);
      setAdminSaveMessage(isEn ? "Image uploaded. Click Save Changes." : "Görsel yüklendi. Değişiklikleri Kaydet butonuna bas.");
    } catch (error) {
      console.error("Görsel yüklenemedi:", error);
      setAdminSaveMessage(error.message || (isEn ? "Failed to upload image." : "Görsel yüklenemedi."));
    }
  }, [updateDraftObject, isEn]);

  const clearDraftImage = useCallback((group, key) => {
    updateDraftObject(group, key, "");
    setAdminSaveMessage(isEn ? "Image removed. Save changes to apply." : "Görsel kaldırıldı. Canlı sayfaya yansıtmak için kaydet.");
  }, [updateDraftObject, isEn]);

  const updateDraftMusic = useCallback(async (file) => {
    try {
      if (!file) return;
      if (file.size > MAX_AUDIO_FILE_SIZE) {
        setAdminSaveMessage(isEn ? "Music file is too large. Must be under 4 MB." : "Müzik dosyası çok büyük. 4 MB altında olmalı.");
        return;
      }
      const url = await uploadMediaFile(file, "music");
      setAdminDraft((prev) => ({ ...prev, invitation: { ...prev.invitation, musicFile: url, musicName: file.name || (isEn ? "Uploaded music" : "Yüklenen müzik") } }));
      setAdminSaveMessage(isEn ? "Music uploaded. Save changes to apply." : "Müzik yüklendi. Canlı sayfada çalması için Kaydet'e bas.");
    } catch (error) {
      console.error("Müzik yüklenemedi:", error);
      setAdminSaveMessage(error.message || (isEn ? "Failed to upload music." : "Müzik yüklenemedi."));
    }
  }, [isEn]);

  const clearDraftMusic = useCallback(() => {
    setAdminDraft((prev) => ({ ...prev, invitation: { ...prev.invitation, musicFile: DEFAULT_WEDDING_MUSIC_FILE, musicName: DEFAULT_WEDDING_MUSIC_NAME } }));
    setAdminSaveMessage(isEn ? "Custom music removed. Save changes to apply." : "Özel müzik kaldırıldı. Canlı sayfaya yansıtmak için kaydet.");
  }, [isEn]);

  const updateDraftArrayItem = useCallback((arrayKey, index, key, value) => {
    setAdminDraft((prev) => ({ ...prev, [arrayKey]: prev[arrayKey].map((item, itemIdx) => itemIdx === index ? { ...item, [key]: value } : item) }));
  }, []);

  const addDraftArrayItem = useCallback((arrayKey, item) => {
    setAdminDraft((prev) => ({ ...prev, [arrayKey]: [...prev[arrayKey], item] }));
  }, []);

  const removeDraftArrayItem = useCallback((arrayKey, index) => {
    setAdminDraft((prev) => ({ ...prev, [arrayKey]: prev[arrayKey].filter((_, itemIdx) => itemIdx !== index) }));
  }, []);

  const updateGalleryItem = useCallback((index, value) => {
    setAdminDraft((prev) => ({ ...prev, invitation: { ...prev.invitation, gallery: prev.invitation.gallery.map((img, idx) => idx === index ? value : img) } }));
  }, []);

  const updateGalleryImageFile = useCallback(async (index, file) => {
    try {
      if (!file) return;
      const compressedDataUrl = await readImageFileAsDataUrl(file);
      const compressedBlob = await (await fetch(compressedDataUrl)).blob();
      const compressedFile = new File([compressedBlob], file.name, { type: "image/jpeg" });
      const url = await uploadMediaFile(compressedFile, "gallery");
      updateGalleryItem(index, url);
      setAdminSaveMessage(isEn ? "Gallery image uploaded. Click Save Changes." : "Galeri görseli yüklendi. Değişiklikleri Kaydet butonuna bas.");
    } catch (error) {
      console.error("Galeri görseli yüklenemedi:", error);
      setAdminSaveMessage(error.message || (isEn ? "Failed to upload gallery image." : "Galeri görseli yüklenemedi."));
    }
  }, [updateGalleryItem, isEn]);

  const addGalleryItem = useCallback(() => {
    setAdminDraft((prev) => ({ ...prev, invitation: { ...prev.invitation, gallery: [...prev.invitation.gallery, ""] } }));
  }, []);

  const removeGalleryItem = useCallback((index) => {
    setAdminDraft((prev) => ({ ...prev, invitation: { ...prev.invitation, gallery: prev.invitation.gallery.filter((_, idx) => idx !== index) } }));
  }, []);

  const saveSiteContent = useCallback(async () => {
    const cleanedData = normalizeSiteData({ ...adminDraft, invitation: { ...adminDraft.invitation, gallery: adminDraft.invitation.gallery.map((img) => String(img || "").trim()).filter(Boolean) } });
    try {
      await saveSettingsToDatabase(cleanedData);
      localStorage.setItem(SITE_DATA_KEY, JSON.stringify(cleanedData));
      setSiteData(cleanedData); setAdminDraft(cleanedData);
      setAdminSaveMessage(isEn ? "All content saved to Supabase successfully." : "Davetiyedeki tüm içerikler başarıyla Supabase'e kaydedildi.");
      setTimeout(() => setAdminSaveMessage(""), 3000);
    } catch (error) {
      console.error("Ayarlar kaydedilemedi:", error);
      setAdminSaveMessage(isEn ? `Could not save changes. Detail: ${error?.message || "Supabase error"}` : `Değişiklikler kaydedilemedi. Detay: ${error?.message || "Supabase hatası"}`);
    }
  }, [adminDraft, isEn]);

  const handleThemeChange = useCallback(async (themeValue) => {
    updateDraftObject("settings", "theme", themeValue);
    const confirmed = await showAppConfirm(
      isEn 
        ? "Load default theme images and video?\n(Your current intro and gallery images will be replaced)"
        : "Seçtiğiniz temaya uygun varsayılan davetiye resimleri ve videosu yüklensin mi?\n(Mevcut ana ekran ve galeri görselleriniz değişecektir)",
      { 
        title: isEn ? "Load Theme Media" : "Tema Medyalarını Yükle", 
      }
    );
    if (confirmed) {
      const themeImages = THEME_DEFAULT_IMAGES[themeValue];
      if (themeImages) {
        setAdminDraft((prev) => ({ ...prev, invitation: { ...prev.invitation, introImage: themeImages.introImage, heroImage: themeImages.heroImage, heroVideo: themeImages.heroVideo || "", gallery: themeImages.gallery } }));
      }
    }
  }, [updateDraftObject, showAppConfirm, isEn]);

  const resetSiteContent = useCallback(async () => {
    const confirmed = await showAppConfirm(
      isEn ? "Reset editable fields to default?" : "Davetiyedeki düzenlenebilir alanlar varsayılan hale dönsün mü?", 
      { title: isEn ? "Reset to Default" : "Varsayılana döndür" }
    );
    if (!confirmed) return;
    const chosenDefaultTheme = adminDraft.settings.defaultTheme || "lavanta";
    const defaultData = normalizeSiteData(null);
    defaultData.settings.defaultTheme = chosenDefaultTheme;
    defaultData.settings.theme = chosenDefaultTheme;
    if (typeof THEME_DEFAULT_IMAGES !== "undefined" && THEME_DEFAULT_IMAGES[chosenDefaultTheme]) {
      const themeImages = THEME_DEFAULT_IMAGES[chosenDefaultTheme];
      defaultData.invitation.introImage = themeImages.introImage;
      defaultData.invitation.heroImage = themeImages.heroImage;
      defaultData.invitation.heroVideo = themeImages.heroVideo || "";
      defaultData.invitation.gallery = themeImages.gallery;
    }
    try {
      await saveSettingsToDatabase(defaultData);
      localStorage.setItem(SITE_DATA_KEY, JSON.stringify(defaultData));
      setSiteData(defaultData); setAdminDraft(defaultData);
      setAdminSaveMessage(isEn ? "Content reset to default theme settings." : "Davetiyedeki içerikler seçtiğiniz varsayılan temaya göre sıfırlandı.");
    } catch (error) {
      console.error("Varsayılan ayarlar kaydedilemedi:", error);
      setAdminSaveMessage(isEn ? `Could not save default settings. Detail: ${error?.message || "Supabase error"}` : `Varsayılan ayarlar kaydedilemedi. Detay: ${error?.message || "Supabase hatası"}`);
    }
  }, [adminDraft.settings.defaultTheme, showAppConfirm, isEn]);

  const getGuestExportData = useCallback(() => {
    const headers = ["Ad Soyad", "Telefon", "Katılım Durumu", "Kişi Sayısı", "Taraf", "Çocuk", "Müzik İsteği", "Not"];
    const rows = guests.map((g) => ({ "Ad Soyad": g.name || "", "Telefon": g.phone || "", "Katılım Durumu": g.attendance || "", "Kişi Sayısı": g.personCount || "", "Taraf": g.side || "", "Çocuk": g.hasChild || "Hayır", "Müzik İsteği": g.songRequest || "", "Not": g.note || "" }));
    return { headers, rows };
  }, [guests]);

  const getWishExportData = useCallback(() => {
    const headers = ["Ad Soyad", "Mesaj", "Durum"];
    const rows = wishes.map((w) => ({ "Ad Soyad": w.name || "", "Mesaj": w.message || "", "Durum": w.approved === false ? "Onay Bekliyor" : "Yayında" }));
    return { headers, rows };
  }, [wishes]);

  const exportGuestsCsv = useCallback(() => { const { headers, rows } = getGuestExportData(); downloadTextFile("katilim-listesi.csv", createCsv(headers, rows), "text/csv;charset=utf-8"); }, [getGuestExportData]);
  const exportGuestsExcel = useCallback(() => { const { headers, rows } = getGuestExportData(); downloadTextFile("katilim-listesi.xls", createExcelTable("Katılım Listesi", headers, rows), "application/vnd.ms-excel;charset=utf-8"); }, [getGuestExportData]);
  const exportWishesCsv = useCallback(() => { const { headers, rows } = getWishExportData(); downloadTextFile("ani-defteri.csv", createCsv(headers, rows), "text/csv;charset=utf-8"); }, [getWishExportData]);
  const exportWishesExcel = useCallback(() => { const { headers, rows } = getWishExportData(); downloadTextFile("ani-defteri.xls", createExcelTable("Anı Defteri Mesajları", headers, rows), "application/vnd.ms-excel;charset=utf-8"); }, [getWishExportData]);
  const exportAllDataJson = useCallback(() => { const data = { siteData, guests, wishes, exportedAt: new Date().toISOString() }; downloadTextFile("dugun-davetiyesi-yedek.json", JSON.stringify(data, null, 2), "application/json;charset=utf-8"); }, [siteData, guests, wishes]);

  const importAllDataJson = useCallback(async () => {
    const confirmed = await showAppConfirm(
      isEn 
        ? "WARNING: This action will DELETE all current settings and records, replacing them with the backup. Are you sure?" 
        : "DİKKAT: Bu işlem mevcut tüm ayarları ve kayıtları SİLECEK ve yerine yedeği yükleyecektir. Emin misiniz?", 
      { title: isEn ? "Restore Backup" : "Yedeği Geri Yükle" }
    );
    if (!confirmed) return;
    try {
      const parsed = JSON.parse(dataImportText);
      if (!parsed || typeof parsed !== "object") throw new Error(isEn ? "Not a valid backup object." : "Geçerli bir yedek nesnesi değil.");
      if (parsed.siteData) {
        const nextSiteData = mergeSiteData(parsed.siteData);
        await saveSettingsToDatabase(nextSiteData);
        localStorage.setItem(SITE_DATA_KEY, JSON.stringify(nextSiteData));
        setSiteData(nextSiteData); setAdminDraft(nextSiteData);
      }
      if (Array.isArray(parsed.guests)) {
        await supabase.from("guests").delete().not("id", "is", null);
        const guestRows = parsed.guests.map(uiGuestToDb);
        if (guestRows.length > 0) await supabase.from("guests").insert(guestRows);
        setGuests(await loadGuestsFromDatabase());
      }
      if (Array.isArray(parsed.wishes)) {
        await supabase.from("wishes").delete().not("id", "is", null);
        const wishRows = parsed.wishes.map(uiWishToDb);
        if (wishRows.length > 0) await supabase.from("wishes").insert(wishRows);
        setWishes(await loadAllWishesFromDatabase());
      }
      setDataImportText(""); setAdminSaveMessage(isEn ? "Backup imported successfully." : "Yedek başarıyla aktarıldı.");
    } catch (error) {
      console.error("İçe aktarılamadı:", error);
      setAdminSaveMessage(isEn ? `Import failed. Detail: ${error?.message || "Error"}` : `İçe aktarılamadı. Detay: ${error?.message || "Hata"}`);
    }
  }, [dataImportText, showAppConfirm, isEn]);

  const downloadQrCode = useCallback(async () => {
    try {
      const response = await fetch(qrImageUrl);
      if (!response.ok) throw new Error(isEn ? "Download failed." : "İndirilemedi.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = "dugun-davetiye-qr.png";
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Hata:", error);
      window.open(qrImageUrl, "_blank", "noopener,noreferrer");
      setAdminSaveMessage(isEn ? "QR opened in new tab. Right click to save." : "QR kod yeni sekmede açıldı. Sağ tıklayıp kaydedebilirsin.");
    }
  }, [qrImageUrl, isEn]);

  const closeAdminPage = useCallback(async () => {
    const signedOut = await performAdminSignOut();
    if (!signedOut) return;
    clearAdminSessionTimestamp();
    setIsAdminPage(false); setIsAdminUnlocked(false); setAdminUser(null);
    setAdminPassword(""); setAdminError(""); setAdminLoginNotice("");
    setShowForgotPassword(false); setForgotPasswordEmail(""); setForgotPasswordMessage("");
    setIsPasswordRecovery(false); setRecoveryPassword(""); setRecoveryPasswordAgain("");
    setRecoveryMessage(""); setAdminSaveMessage(""); setOpened(true);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("admin"); url.searchParams.delete("reset"); url.searchParams.delete("type");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, [performAdminSignOut]);

  const openAdminTab = useCallback((tabId) => {
    setActiveAdminTab(tabId);
  }, []);

  const filteredGuests = useMemo(() =>
    guests.filter((guest) => {
      const searchMatch = normalizeText(`${guest.name} ${guest.phone} ${guest.note} ${guest.side}`).includes(normalizeText(adminGuestSearch));
      const attendanceMatch = adminGuestAttendanceFilter === "all" || guest.attendance === adminGuestAttendanceFilter;
      const sideMatch = adminGuestSideFilter === "all" || guest.side === adminGuestSideFilter;
      const childMatch = adminGuestChildFilter === "all" || (guest.hasChild || "Hayır") === adminGuestChildFilter;
      return searchMatch && attendanceMatch && sideMatch && childMatch;
    }),
    [guests, adminGuestSearch, adminGuestAttendanceFilter, adminGuestSideFilter, adminGuestChildFilter]
  );

  const filteredWishes = useMemo(() =>
    wishes.filter((wish) => {
      const searchMatch = normalizeText(`${wish.name} ${wish.message}`).includes(normalizeText(adminWishSearch));
      const isApproved = wish.approved !== false;
      const statusMatch = adminWishStatusFilter === "all" || (adminWishStatusFilter === "approved" && isApproved) || (adminWishStatusFilter === "pending" && !isApproved);
      return searchMatch && statusMatch;
    }),
    [wishes, adminWishSearch, adminWishStatusFilter]
  );

  return (
    <div
      className="app"
      lang={isEn ? "en" : "tr"}
      data-theme={activeTheme}
      style={{
        "--intro-image": `url(${invitation.introImage})`,
        "--heroVideo": invitation.heroVideo ? `url(${invitation.heroVideo})` : "none",
      }}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <audio
        key={invitation.musicFile}
        ref={audioRef}
        src={invitation.musicFile || ""}
        loop
        preload="auto"
      />
      
      <GlobalModals 
        customAlert={customAlert} 
        setCustomAlert={setCustomAlert} 
        customConfirm={customConfirm} 
        setCustomConfirm={setCustomConfirm} 
        customPrompt={customPrompt} 
        setCustomPrompt={setCustomPrompt} 
        t={t} 
      />

     {!isAdminPage && opened && (
        <FloatingMenu 
          isEn={isEn}
          toggleLanguage={toggleLanguage}
          shareText={shareText}
          toggleMusic={toggleMusic}
          isMusicPlaying={isMusicPlaying}
          showScrollDown={showScrollDown}
          scrollToNext={scrollToNext}
          showScrollTop={showScrollTop}
          scrollToPrev={scrollToPrev}
        />
      )}

      {isAdminPage ? (
        <Suspense fallback={<div className="app-loading">Yükleniyor...</div>}>
          <AdminView
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
            adminDraft={adminDraft}
            updateDraftObject={updateDraftObject}
            handleThemeChange={handleThemeChange}
            changeAdminPassword={changeAdminPassword}
            adminCurrentPassword={adminCurrentPassword}
            setAdminCurrentPassword={setAdminCurrentPassword}
            adminNewPassword={adminNewPassword}
            setAdminNewPassword={setAdminNewPassword}
            adminNewPasswordAgain={adminNewPasswordAgain}
            setAdminNewPasswordAgain={setAdminNewPasswordAgain}
            adminPasswordMessage={adminPasswordMessage}
            removeDraftArrayItem={removeDraftArrayItem}
            updateDraftArrayItem={updateDraftArrayItem}
            addDraftArrayItem={addDraftArrayItem}
            updateDraftImage={updateDraftImage}
            clearDraftImage={clearDraftImage}
            updateDraftMusic={updateDraftMusic}
            clearDraftMusic={clearDraftMusic}
            updateGalleryImageFile={updateGalleryImageFile}
            removeGalleryItem={removeGalleryItem}
            addGalleryItem={addGalleryItem}
            guests={guests}
            totalPersonCount={totalPersonCount}
            notAttendingCount={notAttendingCount}
            childGuestCount={childGuestCount}
            brideSideCount={brideSideCount}
            groomSideCount={groomSideCount}
            adminGuestSearch={adminGuestSearch}
            setAdminGuestSearch={setAdminGuestSearch}
            adminGuestAttendanceFilter={adminGuestAttendanceFilter}
            setAdminGuestAttendanceFilter={setAdminGuestAttendanceFilter}
            adminGuestSideFilter={adminGuestSideFilter}
            setAdminGuestSideFilter={setAdminGuestSideFilter}
            adminGuestChildFilter={adminGuestChildFilter}
            setAdminGuestChildFilter={setAdminGuestChildFilter}
            exportGuestsExcel={exportGuestsExcel}
            exportGuestsCsv={exportGuestsCsv}
            filteredGuests={filteredGuests}
            editGuest={editGuest}
            deleteGuest={deleteGuest}
            clearGuests={clearGuests}
            wishes={wishes}
            adminWishSearch={adminWishSearch}
            setAdminWishSearch={setAdminWishSearch}
            adminWishStatusFilter={adminWishStatusFilter}
            setAdminWishStatusFilter={setAdminWishStatusFilter}
            exportWishesExcel={exportWishesExcel}
            exportWishesCsv={exportWishesCsv}
            filteredWishes={filteredWishes}
            toggleWishApproval={toggleWishApproval}
            editWish={editWish}
            deleteWish={deleteWish}
            clearWishes={clearWishes}
            qrImageUrl={qrImageUrl}
            downloadQrCode={downloadQrCode}
            copyAdminLink={copyAdminLink}
            currentShareLink={currentShareLink}
            personalLinkName={personalLinkName}
            setPersonalLinkName={setPersonalLinkName}
            personalGuestLink={personalGuestLink}
            exportAllDataJson={exportAllDataJson}
            dataImportText={dataImportText}
            setDataImportText={setDataImportText}
            importAllDataJson={importAllDataJson}
            toggleMusic={toggleMusic}
            isMusicPlaying={isMusicPlaying}
            scrollToNext={scrollToNext}
          />
        </Suspense>
      ) : !opened ? (
        <>
          <IntroPage
            isOpening={isOpening}
            copy={copy}
            invitation={invitation}
            personalGuestName={personalGuestName}
            openInvitation={openInvitation}
          />
          <FloatingMenu 
            isEn={isEn}
            toggleLanguage={toggleLanguage}
            shareText={shareText}
            toggleMusic={toggleMusic}
            isMusicPlaying={isMusicPlaying}
            showScrollDown={showScrollDown}
            scrollToNext={scrollToNext}
            showScrollTop={showScrollTop}
            scrollToPrev={scrollToPrev}
          />
        </>
) : (
        <Suspense fallback={<div className="app-loading">Yükleniyor...</div>}>
          <InvitationView
            siteData={siteData}
            settings={settings}
            invitation={invitation}
            copy={copy}
            familyInfo={familyInfo}
            coupleName={coupleName}
            guestGreeting={guestGreeting}
            timeLeft={timeLeft}
            googleCalendarLink={googleCalendarLink}
            qrImageUrl={qrImageUrl}
            shareText={shareText}
            copyInvitationLink={copyInvitationLink}
            guestForm={guestForm}
            handleGuestChange={handleGuestChange}
            updateAttendance={updateAttendance}
            setGuestForm={setGuestForm}
            isAttending={isAttending}
            submitGuest={submitGuest}
            rsvpWhatsappText={rsvpWhatsappText}
            guests={guests}
            totalPersonCount={totalPersonCount}
            notAttendingCount={notAttendingCount}
            wishForm={wishForm}
            handleWishChange={handleWishChange}
            submitWish={submitWish}
            approvedWishes={approvedWishes}
            
            // AŞAĞIDAKİ SATIRI EKLEMELİSİN:
            scrollToNext={scrollToNext} 
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;