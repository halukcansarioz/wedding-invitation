import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./styles/index.css";
import { supabase } from "./supabaseClient";
import { AppModal } from "./components/AppModal";
import { useAdminSession } from "./hooks/useAdminSession";
import { useCountdown } from "./hooks/useCountdown";
import { useAudio } from "./hooks/useAudio";
import IntroPage from "./components/invitation/IntroPage";
import InvitationView from "./pages/InvitationView";
import AdminView from "./pages/AdminView";
import {
  DEFAULT_WEDDING_MUSIC_FILE,
  DEFAULT_WEDDING_MUSIC_NAME,
  SITE_DATA_KEY,
  THEME_DEFAULT_IMAGES,
  MAX_AUDIO_FILE_SIZE,
  INITIAL_GUEST_FORM,
  INITIAL_WISH_FORM,
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
  const { i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');

  const toggleLanguage = () => {
    const newLang = isEn ? 'tr' : 'en';
    i18n.changeLanguage(newLang);
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
  const personalGuestLink = useMemo(() => buildPersonalLink(currentShareLink, personalLinkName), [currentShareLink, personalLinkName]);
  const qrImageUrl = useMemo(() => getQrImageUrl(currentShareLink), [currentShareLink]);
  const googleCalendarLink = useMemo(() => createGoogleCalendarLink(siteData, coupleName), [siteData, coupleName]);

  const timeLeft = useCountdown(invitation.weddingDate);
  const { audioRef, isMusicPlaying, startMusic, toggleMusic, stopMusic } = useAudio(invitation.musicFile);

  useEffect(() => {
    if (isAdminPage) {
      stopMusic();
    }
  }, [isAdminPage, stopMusic]);

  const showAppAlert = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setCustomAlert({ message, title: options.title || (isEn ? "Information" : "Bilgi"), resolve });
    });
  }, [isEn]);

  const showAppConfirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setCustomConfirm({ message, title: options.title || (isEn ? "Confirmation" : "Onay"), resolve });
    });
  }, [isEn]);

  const showAppPrompt = useCallback((label, defaultValue = "", options = {}) => {
    return new Promise((resolve) => {
      setCustomPrompt({ label, value: defaultValue, title: options.title || (isEn ? "Edit" : "Düzenle"), resolve, multiline: options.multiline });
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

  useEffect(() => {
    document.documentElement.lang = isEn ? "en" : "tr";
    if (!document.querySelector("meta[charset]")) {
      const meta = document.createElement("meta");
      meta.setAttribute("charset", "UTF-8");
      document.head.prepend(meta);
    }
  }, [isEn]);

  useLayoutEffect(() => {
    const currentTheme = settings.theme || "lavanta";
    document.documentElement.dataset.theme = currentTheme;
    const favicon = document.querySelector("link[rel='icon'], link[rel='shortcut icon']") || document.createElement("link");
    favicon.setAttribute("rel", "icon");
    favicon.setAttribute("type", "image/svg+xml");
    favicon.setAttribute("href", getFaviconUrl(currentTheme));
    if (!favicon.parentNode) document.head.appendChild(favicon);
  }, [settings.theme]);

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
    if (isAdminPage) return;
    const imagesToPreload = [invitation.introImage, invitation.heroImage, ...invitation.gallery].filter(Boolean);
    if (imagesToPreload.length > 0) {
      imagesToPreload.forEach((src) => { const img = new Image(); img.src = src; });
    }
  }, [invitation.introImage, invitation.heroImage, invitation.gallery, isAdminPage]);

  const openInvitation = useCallback(() => {
    setIsOpening(true);
    startMusic().catch((err) => console.log("Müzik başlatılamadı:", err));
    setTimeout(() => { setOpened(true); }, 2100);
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

  const submitGuest = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!guestForm.name.trim()) {
      await showAppAlert(isEn ? "Please enter your full name." : "Lütfen ad soyad gir.", { title: isEn ? "Missing info" : "Eksik bilgi" });
      return;
    }
    if (!isSupabaseReady()) {
      await showAppAlert(getSupabaseSetupMessage(), { title: isEn ? "Supabase connection missing" : "Supabase bağlantısı eksik" });
      return;
    }
    try {
      const { data, error } = await supabase.from("guests").insert(uiGuestToDb(guestForm)).select("*").single();
      if (error) throw error;
      setGuests((prev) => [data ? dbGuestToUi(data) : { id: `local-${Date.now()}`, ...guestForm }, ...prev]);
      setGuestForm(INITIAL_GUEST_FORM);
      
      if (guestForm.attendance === "Katılacağım") {
        await showAppAlert(isEn ? "Your RSVP has been successfully received." : "Katılım formunuz başarıyla alınmıştır. Teşekkür ederiz!", { title: isEn ? "Saved" : "Bilgileriniz Alındı" });
      }
    } catch (error) {
      console.error("Katılım kaydedilemedi:", error);
      await showAppAlert(isEn ? `Could not save RSVP. Detail: ${error?.message || "Unknown error"}` : `Katılım bildirimi kaydedilemedi. Detay: ${error?.message || "Bilinmeyen hata"}`, { title: isEn ? "Save error" : "Kayıt hatası" });
    }
  }, [guestForm, showAppAlert, isEn]);

  const submitWish = useCallback(async (e) => {
    e.preventDefault();
    if (!wishForm.name.trim() || !wishForm.message.trim()) {
      await showAppAlert(isEn ? "Please enter your name and message." : "Lütfen isim ve mesaj gir.", { title: isEn ? "Missing info" : "Eksik bilgi" });
      return;
    }
    if (!isSupabaseReady()) {
      await showAppAlert(getSupabaseSetupMessage(), { title: isEn ? "Supabase connection missing" : "Supabase bağlantısı eksik" });
      return;
    }
    const shouldPublishNow = !settings.requireWishApproval;
    try {
      const { data, error } = await supabase.from("wishes").insert({ name: wishForm.name.trim(), message: wishForm.message.trim(), approved: shouldPublishNow }).select("*").single();
      if (error) throw error;
      if (shouldPublishNow) {
        setWishes((prev) => [data ? dbWishToUi(data) : { id: `local-${Date.now()}`, ...wishForm, approved: true }, ...prev]);
      }
      setWishForm(INITIAL_WISH_FORM);
      await showAppAlert(settings.requireWishApproval ? (isEn ? "Your wish has been sent for admin approval." : "Güzel dileğin admin onayına gönderildi.") : (isEn ? "Your wish has been saved." : "Güzel dileğin kaydedildi."), { title: settings.requireWishApproval ? (isEn ? "Sent for approval" : "Onaya gönderildi") : (isEn ? "Saved" : "Kaydedildi") });
    } catch (error) {
      console.error("Mesaj kaydedilemedi:", error);
      await showAppAlert(isEn ? `Could not save message. Detail: ${error?.message || "Unknown error"}` : `Mesaj kaydedilemedi. Detay: ${error?.message || "Bilinmeyen hata"}`, { title: isEn ? "Save error" : "Kayıt hatası" });
    }
  }, [wishForm, settings.requireWishApproval, showAppAlert, isEn]);

  const copyInvitationLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentShareLink);
      await showAppAlert(isEn ? "Invitation link copied." : "Davetiye linki kopyalandı.", { title: isEn ? "Copied" : "Kopyalandı" });
    } catch {
      await showAppAlert(isEn ? "Could not copy link." : "Link kopyalanamadı.", { title: isEn ? "Copy error" : "Kopyalama hatası" });
    }
  }, [currentShareLink, showAppAlert, isEn]);

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

  const clearGuests = useCallback(async () => {
    const confirmed = await showAppConfirm(
      isEn ? "Delete all RSVP records?" : "Tüm katılım kayıtları silinsin mi?", 
      { title: isEn ? "Clear Guests" : "Katılım kayıtlarını sil" }
    );
    if (!confirmed) return;
    const { error } = await supabase.from("guests").delete().not("id", "is", null);
    if (error) { console.error("Silinemedi:", error); setAdminSaveMessage(isEn ? "Could not delete." : "Silinemedi."); return; }
    setGuests([]);
  }, [showAppConfirm, isEn]);

  const clearWishes = useCallback(async () => {
    const confirmed = await showAppConfirm(
      isEn ? "Delete all guestbook messages?" : "Tüm anı defteri mesajları silinsin mi?", 
      { title: isEn ? "Clear Guestbook" : "Anı defterini temizle" }
    );
    if (!confirmed) return;
    const { error } = await supabase.from("wishes").delete().not("id", "is", null);
    if (error) { console.error("Silinemedi:", error); setAdminSaveMessage(isEn ? "Could not delete." : "Silinemedi."); return; }
    setWishes([]);
  }, [showAppConfirm, isEn]);

  const deleteGuest = useCallback(async (guestId) => {
    const confirmed = await showAppConfirm(
      isEn ? "Delete this RSVP record?" : "Bu katılım kaydı silinsin mi?", 
      { title: isEn ? "Delete Record" : "Kaydı sil" }
    );
    if (!confirmed) return;
    const { error } = await supabase.from("guests").delete().eq("id", guestId);
    if (error) { console.error("Silinemedi:", error); setAdminSaveMessage(isEn ? "Could not delete." : "Silinemedi."); return; }
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
  }, [showAppConfirm, isEn]);

  const editGuest = useCallback(async (guestId) => {
    const guest = guests.find((item) => item.id === guestId);
    if (!guest) return;
    const title = isEn ? "Edit RSVP" : "Katılım kaydını düzenle";
    
    const name = await showAppPrompt(isEn ? "Full Name" : "Ad Soyad", guest.name || "", { title }); if (name === null) return;
    const phone = await showAppPrompt(isEn ? "Phone" : "Telefon", guest.phone || "", { title }); if (phone === null) return;
    const attendance = await showAppPrompt(isEn ? "Attendance (Katılacağım/Katılamayacağım)" : "Katılım durumu", guest.attendance || "Katılacağım", { title }); if (attendance === null) return;
    const personCount = await showAppPrompt(isEn ? "Person Count" : "Kişi sayısı", guest.personCount || "1", { title }); if (personCount === null) return;
    const side = await showAppPrompt(isEn ? "Side" : "Taraf", guest.side || "Gelin Tarafı", { title }); if (side === null) return;
    const hasChild = await showAppPrompt(isEn ? "Has children? (Evet/Hayır)" : "Çocuk var mı? Evet/Hayır", guest.hasChild || "Hayır", { title }); if (hasChild === null) return;
    const note = await showAppPrompt(isEn ? "Note" : "Not", guest.note || "", { title, multiline: true }); if (note === null) return;

    const nextGuest = { ...guest, name, phone, attendance, personCount, side, hasChild, note };
    const { error } = await supabase.from("guests").update(uiGuestToDb(nextGuest)).eq("id", guestId);
    if (error) { console.error("Güncellenemedi:", error); setAdminSaveMessage(isEn ? "Could not update." : "Güncellenemedi."); return; }
    setGuests((prev) => prev.map((item) => (item.id === guestId ? nextGuest : item)));
  }, [guests, showAppPrompt, isEn]);

  const deleteWish = useCallback(async (wishId) => {
    const confirmed = await showAppConfirm(
      isEn ? "Delete this message?" : "Bu anı defteri mesajı silinsin mi?", 
      { title: isEn ? "Delete Message" : "Mesajı sil" }
    );
    if (!confirmed) return;
    const { error } = await supabase.from("wishes").delete().eq("id", wishId);
    if (error) { console.error("Silinemedi:", error); setAdminSaveMessage(isEn ? "Could not delete." : "Silinemedi."); return; }
    setWishes((prev) => prev.filter((w) => w.id !== wishId));
  }, [showAppConfirm, isEn]);

  const editWish = useCallback(async (wishId) => {
    const wish = wishes.find((item) => item.id === wishId);
    if (!wish) return;
    const title = isEn ? "Edit Message" : "Mesajı düzenle";
    
    const name = await showAppPrompt(isEn ? "Full Name" : "Ad Soyad", wish.name || "", { title }); if (name === null) return;
    const message = await showAppPrompt(isEn ? "Message" : "Mesaj", wish.message || "", { title, multiline: true }); if (message === null) return;

    const nextWish = { ...wish, name, message };
    const { error } = await supabase.from("wishes").update(uiWishToDb(nextWish)).eq("id", wishId);
    if (error) { console.error("Güncellenemedi:", error); setAdminSaveMessage(isEn ? "Could not update." : "Güncellenemedi."); return; }
    setWishes((prev) => prev.map((item) => (item.id === wishId ? nextWish : item)));
  }, [wishes, showAppPrompt, isEn]);

  const toggleWishApproval = useCallback(async (wishId) => {
    const wish = wishes.find((item) => item.id === wishId);
    if (!wish) return;
    const nextApproved = wish.approved === false;
    const { error } = await supabase.from("wishes").update({ approved: nextApproved }).eq("id", wishId);
    if (error) { console.error("Değiştirilemedi:", error); setAdminSaveMessage(isEn ? "Could not change status." : "Değiştirilemedi."); return; }
    setWishes((prev) => prev.map((item) => (item.id === wishId ? { ...item, approved: nextApproved } : item)));
  }, [wishes, isEn]);

  const getGuestExportData = useCallback(() => {
    const headers = ["Ad Soyad", "Telefon", "Katılım Durumu", "Kişi Sayısı", "Taraf", "Çocuk", "Not"];
    const rows = guests.map((g) => ({ "Ad Soyad": g.name || "", "Telefon": g.phone || "", "Katılım Durumu": g.attendance || "", "Kişi Sayısı": g.personCount || "", "Taraf": g.side || "", "Çocuk": g.hasChild || "Hayır", "Not": g.note || "" }));
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
      data-theme={settings.theme || "lavanta"}
      style={{
        "--intro-image": `url(${invitation.introImage})`,
        "--heroVideo": invitation.heroVideo ? `url(${invitation.heroVideo})` : "none",
      }}
    >
      <audio
        key={invitation.musicFile}
        ref={audioRef}
        src={invitation.musicFile || ""}
        loop
        preload="auto"
      />
      
      {/* Özel Alert Zırhlı Modal (Siyah ekranda kalma hatası çözümü) */}
      {customAlert && (
        <div 
          onClick={() => { customAlert.resolve(true); setCustomAlert(null); }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", inset: 0, zIndex: 999999, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={{ backgroundColor: "#ffffff", borderRadius: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", width: "90%", maxWidth: "400px", textAlign: "center", padding: "34px 24px", border: "2px solid #b56c83" }}
          >
            <h3 style={{ color: "var(--rose-dark, #9f4f68)", margin: "0 0 12px", fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: "800" }}>
              {customAlert.title}
            </h3>
            <p style={{ fontSize: "17px", lineHeight: "1.6", color: "var(--text, #55303b)", marginBottom: "24px", fontFamily: "Playfair Display, serif", fontWeight: "600" }}>
              {customAlert.message}
            </p>
            <button type="button" className="main-button" onClick={() => { customAlert.resolve(true); setCustomAlert(null); }} style={{ margin: 0, minWidth: "140px" }}>
              {isEn ? "OK" : "Tamam"}
            </button>
          </div>
        </div>
      )}

      {/* Özel Confirm Zırhlı Modal */}
      {customConfirm && (
        <div 
          onClick={() => { customConfirm.resolve(false); setCustomConfirm(null); }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", inset: 0, zIndex: 999999, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={{ backgroundColor: "#ffffff", borderRadius: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", width: "90%", maxWidth: "400px", textAlign: "center", padding: "34px 24px", border: "2px solid #b56c83" }}
          >
            <h3 style={{ color: "var(--rose-dark, #9f4f68)", margin: "0 0 12px", fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: "800" }}>
              {customConfirm.title}
            </h3>
            <p style={{ fontSize: "17px", lineHeight: "1.6", color: "var(--text, #55303b)", marginBottom: "24px", fontFamily: "Playfair Display, serif", fontWeight: "600" }}>
              {customConfirm.message}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
              <button type="button" className="main-button" onClick={() => { customConfirm.resolve(true); setCustomConfirm(null); }} style={{ margin: 0, minWidth: "120px" }}>
                {isEn ? "Yes" : "Evet"}
              </button>
              <button type="button" className="secondary-button" onClick={() => { customConfirm.resolve(false); setCustomConfirm(null); }} style={{ margin: 0, minWidth: "120px" }}>
                {isEn ? "Cancel" : "Vazgeç"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Özel Prompt Zırhlı Modal */}
      {customPrompt && (
        <div 
          onClick={() => { customPrompt.resolve(null); setCustomPrompt(null); }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", inset: 0, zIndex: 999999, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
        >
          <form 
            onSubmit={(e) => { e.preventDefault(); customPrompt.resolve(customPrompt.value); setCustomPrompt(null); }}
            onClick={e => e.stopPropagation()} 
            style={{ backgroundColor: "#ffffff", borderRadius: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", width: "90%", maxWidth: "440px", textAlign: "center", padding: "34px 24px", border: "2px solid #b56c83", display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <h3 style={{ color: "var(--rose-dark, #9f4f68)", margin: "0", fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: "800" }}>
              {customPrompt.title}
            </h3>
            <p style={{ fontSize: "16px", margin: "0", color: "var(--text, #55303b)", fontFamily: "Playfair Display, serif", fontWeight: "600" }}>
              {customPrompt.label}
            </p>
            {customPrompt.multiline ? (
              <textarea 
                autoFocus 
                value={customPrompt.value} 
                onChange={e => setCustomPrompt({ ...customPrompt, value: e.target.value })} 
                style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "1.5px solid #d98ca1", outline: "none", minHeight: "100px", fontFamily: "Playfair Display, serif", fontSize: "16px" }} 
              />
            ) : (
              <input 
                autoFocus 
                value={customPrompt.value} 
                onChange={e => setCustomPrompt({ ...customPrompt, value: e.target.value })} 
                style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "1.5px solid #d98ca1", outline: "none", fontFamily: "Playfair Display, serif", fontSize: "16px" }} 
              />
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
              <button type="submit" className="main-button" style={{ margin: 0, minWidth: "120px" }}>
                {isEn ? "Save" : "Kaydet"}
              </button>
              <button type="button" className="secondary-button" onClick={() => { customPrompt.resolve(null); setCustomPrompt(null); }} style={{ margin: 0, minWidth: "120px" }}>
                {isEn ? "Cancel" : "Vazgeç"}
              </button>
            </div>
          </form>
        </div>
      )}

     {!isAdminPage && (
        <>
          {/* Hızlı Admin Giriş Butonu (Sol Üst Köşe) */}
          <div className="admin-quick-access">
            <a 
              href="#admin" 
              className="admin-btn" 
              title={isEn ? "Admin Panel" : "Yönetici Paneli"}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </a>
          </div>

          <div className="floating-actions glass-dock">
            {/* Dil Değiştirme */}
            <button
              type="button"
              className="dock-btn"
              onClick={toggleLanguage}
              title={isEn ? "Türkçe'ye Geç" : "Switch to English"}
            >
              {isEn ? 'EN' : 'TR'}
            </button>

            {/* Paylaş (İkonlu) - Sadece Admin Değilse Çıkar */}
            <a 
              className="dock-btn" 
              href={`https://wa.me/?text=${shareText}`} 
              target="_blank" 
              rel="noreferrer"
              title={isEn ? 'Share via WhatsApp' : 'WhatsApp ile Paylaş'}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </a>

            {/* Müzik Aç / Kapat - Sadece Admin Değilse Çıkar */}
            <button
              type="button"
              className="dock-btn"
              onClick={toggleMusic}
              aria-pressed={isMusicPlaying}
              title={isMusicPlaying ? (isEn ? "Mute Music" : "Müziği Kapat") : (isEn ? "Play Music" : "Müziği Aç")}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isMusicPlaying ? (
                  <>
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </>
                ) : (
                  <>
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                    <line x1="3" y1="3" x2="21" y2="21" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </>
      )}

      {isAdminPage ? (
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
        />
      ) : !opened ? (
        <IntroPage
          isOpening={isOpening}
          copy={copy}
          invitation={invitation}
          personalGuestName={personalGuestName}
          openInvitation={openInvitation}
        />
      ) : (
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
        />
      )}
    </div>
  );
}

export default App;