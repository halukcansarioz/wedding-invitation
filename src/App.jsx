import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./styles/index.css";
import { supabase } from "./supabaseClient";
import { AppModal } from "./components/AdminUI";
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
  const [appModal, setAppModal] = useState(null);

  const modalResolverRef = useRef(null);

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
  const { audioRef, isMusicPlaying, startMusic, toggleMusic } = useAudio(invitation.musicFile);

  const resolveAppModal = useCallback((result) => {
    const resolver = modalResolverRef.current;
    modalResolverRef.current = null;
    setAppModal(null);
    if (resolver) resolver(result);
  }, []);

  const openAppModal = useCallback((config) => {
    return new Promise((resolve) => {
      modalResolverRef.current = resolve;
      setAppModal({ tone: "info", closeOnBackdrop: false, ...config });
    });
  }, []);

  const showAppAlert = useCallback(async (message, options = {}) => {
    await openAppModal({ type: "alert", title: options.title || "Bilgi", message, tone: options.tone || "info", icon: options.icon, confirmText: options.confirmText || "Tamam" });
    return true;
  }, [openAppModal]);

  const showAppConfirm = useCallback(async (message, options = {}) => {
    return Boolean(await openAppModal({ type: "confirm", title: options.title || "Onay gerekiyor", message, tone: options.tone || "warning", icon: options.icon || "?", confirmText: options.confirmText || "Evet", cancelText: options.cancelText || "Vazgeç" }));
  }, [openAppModal]);

  const showAppPrompt = useCallback(async (label, defaultValue = "", options = {}) => {
    return openAppModal({ type: "prompt", title: options.title || "Bilgi düzenle", message: label, inputValue: defaultValue, placeholder: options.placeholder || label, multiline: Boolean(options.multiline), tone: options.tone || "info", icon: options.icon || "✎", confirmText: options.confirmText || "Kaydet", cancelText: options.cancelText || "Vazgeç" });
  }, [openAppModal]);

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
    setSiteData, setAdminDraft, setGuests, setWishes, showAppConfirm,
  });

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
      ...prev, attendance,
      personCount: attendance === "Katılacağım" ? "1" : "0",
      side: attendance === "Katılacağım" ? "Gelin Tarafı" : "-",
      hasChild: attendance === "Katılacağım" ? prev.hasChild : "Hayır",
    }));
  }, []);

  const submitGuest = useCallback(async (e) => {
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
      const { data, error } = await supabase.from("guests").insert(uiGuestToDb(guestForm)).select("*").single();
      if (error) throw error;
      setGuests((prev) => [data ? dbGuestToUi(data) : { id: `local-${Date.now()}`, ...guestForm }, ...prev]);
      setGuestForm(INITIAL_GUEST_FORM);
      await showAppAlert("Katılım bildirimin kaydedildi.", { title: "Kaydedildi", tone: "success", icon: "✓" });
    } catch (error) {
      console.error("Katılım kaydedilemedi:", error);
      await showAppAlert(`Katılım bildirimi kaydedilemedi. Detay: ${error?.message || "Bilinmeyen hata"}`, { title: "Kayıt hatası", tone: "danger", icon: "!" });
    }
  }, [guestForm, showAppAlert]);

  const submitWish = useCallback(async (e) => {
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
      const { data, error } = await supabase.from("wishes").insert({ name: wishForm.name.trim(), message: wishForm.message.trim(), approved: shouldPublishNow }).select("*").single();
      if (error) throw error;
      if (shouldPublishNow) {
        setWishes((prev) => [data ? dbWishToUi(data) : { id: `local-${Date.now()}`, ...wishForm, approved: true }, ...prev]);
      }
      setWishForm(INITIAL_WISH_FORM);
      await showAppAlert(settings.requireWishApproval ? "Güzel dileğin admin onayına gönderildi." : "Güzel dileğin kaydedildi.", { title: settings.requireWishApproval ? "Onaya gönderildi" : "Kaydedildi", tone: "success", icon: "✓" });
    } catch (error) {
      console.error("Mesaj kaydedilemedi:", error);
      await showAppAlert(`Mesaj kaydedilemedi. Detay: ${error?.message || "Bilinmeyen hata"}`, { title: "Kayıt hatası", tone: "danger", icon: "!" });
    }
  }, [wishForm, settings.requireWishApproval, showAppAlert]);

  const copyInvitationLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentShareLink);
      await showAppAlert("Davetiye linki kopyalandı.", { title: "Kopyalandı", tone: "success", icon: "✓" });
    } catch {
      await showAppAlert("Link kopyalanamadı.", { title: "Kopyalama hatası", tone: "danger", icon: "!" });
    }
  }, [currentShareLink, showAppAlert]);

  const copyAdminLink = useCallback(async (linkToCopy, successMessage = "Link kopyalandı.") => {
    try { await navigator.clipboard.writeText(linkToCopy); setAdminSaveMessage(successMessage); } catch { setAdminSaveMessage("Link kopyalanamadı."); }
  }, []);

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
      setAdminSaveMessage("Görsel yüklendi. Değişiklikleri Kaydet butonuna bas.");
    } catch (error) {
      console.error("Görsel yüklenemedi:", error);
      setAdminSaveMessage(error.message || "Görsel yüklenemedi.");
    }
  }, [updateDraftObject]);

  const clearDraftImage = useCallback((group, key) => {
    updateDraftObject(group, key, "");
    setAdminSaveMessage("Görsel kaldırıldı. Canlı sayfaya yansıtmak için kaydet.");
  }, [updateDraftObject]);

  const updateDraftMusic = useCallback(async (file) => {
    try {
      if (!file) return;
      if (file.size > MAX_AUDIO_FILE_SIZE) {
        setAdminSaveMessage("Müzik dosyası çok büyük. 4 MB altında olmalı.");
        return;
      }
      const url = await uploadMediaFile(file, "music");
      setAdminDraft((prev) => ({ ...prev, invitation: { ...prev.invitation, musicFile: url, musicName: file.name || "Yüklenen müzik" } }));
      setAdminSaveMessage("Müzik yüklendi. Canlı sayfada çalması için Kaydet'e bas.");
    } catch (error) {
      console.error("Müzik yüklenemedi:", error);
      setAdminSaveMessage(error.message || "Müzik yüklenemedi.");
    }
  }, []);

  const clearDraftMusic = useCallback(() => {
    setAdminDraft((prev) => ({ ...prev, invitation: { ...prev.invitation, musicFile: DEFAULT_WEDDING_MUSIC_FILE, musicName: DEFAULT_WEDDING_MUSIC_NAME } }));
    setAdminSaveMessage("Özel müzik kaldırıldı. Canlı sayfaya yansıtmak için kaydet.");
  }, []);

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
      setAdminSaveMessage("Galeri görseli yüklendi. Değişiklikleri Kaydet butonuna bas.");
    } catch (error) {
      console.error("Galeri görseli yüklenemedi:", error);
      setAdminSaveMessage(error.message || "Galeri görseli yüklenemedi.");
    }
  }, [updateGalleryItem]);

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
      setAdminSaveMessage("Davetiyedeki tüm içerikler başarıyla Supabase'e kaydedildi.");
      setTimeout(() => setAdminSaveMessage(""), 3000);
    } catch (error) {
      console.error("Ayarlar kaydedilemedi:", error);
      setAdminSaveMessage(`Değişiklikler kaydedilemedi. Detay: ${error?.message || "Supabase hatası"}`);
    }
  }, [adminDraft]);

  const handleThemeChange = useCallback(async (themeValue) => {
    updateDraftObject("settings", "theme", themeValue);
    const confirmed = await showAppConfirm(
      "Seçtiğiniz temaya uygun varsayılan davetiye resimleri ve videosu yüklensin mi?\n(Mevcut ana ekran ve galeri görselleriniz değişecektir)",
      { title: "Tema Medyalarını Yükle", confirmText: "Evet, Yükle", cancelText: "Hayır, Sadece Tema Değişsin", tone: "info" }
    );
    if (confirmed) {
      const themeImages = THEME_DEFAULT_IMAGES[themeValue];
      if (themeImages) {
        setAdminDraft((prev) => ({ ...prev, invitation: { ...prev.invitation, introImage: themeImages.introImage, heroImage: themeImages.heroImage, heroVideo: themeImages.heroVideo || "", gallery: themeImages.gallery } }));
      }
    }
  }, [updateDraftObject, showAppConfirm]);

  const resetSiteContent = useCallback(async () => {
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
      defaultData.invitation.heroVideo = themeImages.heroVideo || "";
      defaultData.invitation.gallery = themeImages.gallery;
    }
    try {
      await saveSettingsToDatabase(defaultData);
      localStorage.setItem(SITE_DATA_KEY, JSON.stringify(defaultData));
      setSiteData(defaultData); setAdminDraft(defaultData);
      setAdminSaveMessage("Davetiyedeki içerikler seçtiğiniz varsayılan temaya göre sıfırlandı.");
    } catch (error) {
      console.error("Varsayılan ayarlar kaydedilemedi:", error);
      setAdminSaveMessage(`Varsayılan ayarlar kaydedilemedi. Detay: ${error?.message || "Supabase hatası"}`);
    }
  }, [adminDraft.settings.defaultTheme, showAppConfirm]);

  const clearGuests = useCallback(async () => {
    const confirmed = await showAppConfirm("Tüm katılım kayıtları silinsin mi?", { title: "Katılım kayıtlarını sil", confirmText: "Sil", tone: "danger", icon: "!" });
    if (!confirmed) return;
    const { error } = await supabase.from("guests").delete().not("id", "is", null);
    if (error) { console.error("Silinemedi:", error); setAdminSaveMessage("Silinemedi."); return; }
    setGuests([]);
  }, [showAppConfirm]);

  const clearWishes = useCallback(async () => {
    const confirmed = await showAppConfirm("Tüm anı defteri mesajları silinsin mi?", { title: "Anı defterini temizle", confirmText: "Sil", tone: "danger", icon: "!" });
    if (!confirmed) return;
    const { error } = await supabase.from("wishes").delete().not("id", "is", null);
    if (error) { console.error("Silinemedi:", error); setAdminSaveMessage("Silinemedi."); return; }
    setWishes([]);
  }, [showAppConfirm]);

  const deleteGuest = useCallback(async (guestId) => {
    const confirmed = await showAppConfirm("Bu katılım kaydı silinsin mi?", { title: "Kaydı sil", confirmText: "Sil", tone: "danger", icon: "!" });
    if (!confirmed) return;
    const { error } = await supabase.from("guests").delete().eq("id", guestId);
    if (error) { console.error("Silinemedi:", error); setAdminSaveMessage("Silinemedi."); return; }
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
  }, [showAppConfirm]);

  const editGuest = useCallback(async (guestId) => {
    const guest = guests.find((item) => item.id === guestId);
    if (!guest) return;
    const name = await showAppPrompt("Ad Soyad", guest.name || "", { title: "Katılım kaydını düzenle" }); if (name === null) return;
    const phone = await showAppPrompt("Telefon", guest.phone || "", { title: "Katılım kaydını düzenle" }); if (phone === null) return;
    const attendance = await showAppPrompt("Katılım durumu", guest.attendance || "Katılacağım", { title: "Katılım kaydını düzenle" }); if (attendance === null) return;
    const personCount = await showAppPrompt("Kişi sayısı", guest.personCount || "1", { title: "Katılım kaydını düzenle" }); if (personCount === null) return;
    const side = await showAppPrompt("Taraf", guest.side || "Gelin Tarafı", { title: "Katılım kaydını düzenle" }); if (side === null) return;
    const hasChild = await showAppPrompt("Çocuk var mı? Evet/Hayır", guest.hasChild || "Hayır", { title: "Katılım kaydını düzenle" }); if (hasChild === null) return;
    const note = await showAppPrompt("Not", guest.note || "", { title: "Katılım kaydını düzenle", multiline: true }); if (note === null) return;

    const nextGuest = { ...guest, name, phone, attendance, personCount, side, hasChild, note };
    const { error } = await supabase.from("guests").update(uiGuestToDb(nextGuest)).eq("id", guestId);
    if (error) { console.error("Güncellenemedi:", error); setAdminSaveMessage("Güncellenemedi."); return; }
    setGuests((prev) => prev.map((item) => (item.id === guestId ? nextGuest : item)));
  }, [guests, showAppPrompt]);

  const deleteWish = useCallback(async (wishId) => {
    const confirmed = await showAppConfirm("Bu anı defteri mesajı silinsin mi?", { title: "Mesajı sil", confirmText: "Sil", tone: "danger", icon: "!" });
    if (!confirmed) return;
    const { error } = await supabase.from("wishes").delete().eq("id", wishId);
    if (error) { console.error("Silinemedi:", error); setAdminSaveMessage("Silinemedi."); return; }
    setWishes((prev) => prev.filter((w) => w.id !== wishId));
  }, [showAppConfirm]);

  const editWish = useCallback(async (wishId) => {
    const wish = wishes.find((item) => item.id === wishId);
    if (!wish) return;
    const name = await showAppPrompt("Ad Soyad", wish.name || "", { title: "Mesajı düzenle" }); if (name === null) return;
    const message = await showAppPrompt("Mesaj", wish.message || "", { title: "Mesajı düzenle", multiline: true }); if (message === null) return;

    const nextWish = { ...wish, name, message };
    const { error } = await supabase.from("wishes").update(uiWishToDb(nextWish)).eq("id", wishId);
    if (error) { console.error("Güncellenemedi:", error); setAdminSaveMessage("Güncellenemedi."); return; }
    setWishes((prev) => prev.map((item) => (item.id === wishId ? nextWish : item)));
  }, [wishes, showAppPrompt]);

  const toggleWishApproval = useCallback(async (wishId) => {
    const wish = wishes.find((item) => item.id === wishId);
    if (!wish) return;
    const nextApproved = wish.approved === false;
    const { error } = await supabase.from("wishes").update({ approved: nextApproved }).eq("id", wishId);
    if (error) { console.error("Değiştirilemedi:", error); setAdminSaveMessage("Değiştirilemedi."); return; }
    setWishes((prev) => prev.map((item) => (item.id === wishId ? { ...item, approved: nextApproved } : item)));
  }, [wishes]);

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
    const confirmed = await showAppConfirm("DİKKAT: Bu işlem mevcut tüm ayarları ve kayıtları SİLECEK ve yerine yedeği yükleyecektir. Emin misiniz?", { title: "Yedeği Geri Yükle", confirmText: "Evet, Geri Yükle", tone: "danger", icon: "!" });
    if (!confirmed) return;
    try {
      const parsed = JSON.parse(dataImportText);
      if (!parsed || typeof parsed !== "object") throw new Error("Geçerli bir yedek nesnesi değil.");
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
      setDataImportText(""); setAdminSaveMessage("Yedek başarıyla aktarıldı.");
    } catch (error) {
      console.error("İçe aktarılamadı:", error);
      setAdminSaveMessage(`İçe aktarılamadı. Detay: ${error?.message || "Hata"}`);
    }
  }, [dataImportText, showAppConfirm]);

  const downloadQrCode = useCallback(async () => {
    try {
      const response = await fetch(qrImageUrl);
      if (!response.ok) throw new Error("İndirilemedi.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = "dugun-davetiye-qr.png";
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Hata:", error);
      window.open(qrImageUrl, "_blank", "noopener,noreferrer");
      setAdminSaveMessage("QR kod yeni sekmede açıldı. Sağ tıklayıp kaydedebilirsin.");
    }
  }, [qrImageUrl]);

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
      lang="tr"
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
      
      <AppModal
        modal={appModal}
        onInputChange={(value) => setAppModal((prev) => (prev ? { ...prev, inputValue: value } : prev))}
        onConfirm={(value) => resolveAppModal(value)}
        onCancel={() => resolveAppModal(appModal?.type === "prompt" ? null : false)}
      />

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
          isMusicPlaying={isMusicPlaying}
          toggleMusic={toggleMusic}
        />
      )}
    </div>
  );
}

export default App;