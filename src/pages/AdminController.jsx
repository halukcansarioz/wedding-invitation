import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSiteContext, useUIContext, useAdminContext } from '../context/Providers';
import useAdminSession from '../hooks/useAdminSession';
import { useDatabaseManager } from '../hooks/useDatabaseManager';
import { normalizeText, downloadTextFile, createCsv, createExcelTable, buildPersonalLink, getQrImageUrl, readImageFileAsDataUrl, normalizeSiteData, mergeSiteData, uiGuestToDb, uiWishToDb, getCurrentShareLink } from '../utils/helpers';
import { saveSettingsToDatabase, uploadMediaFile, loadGuestsFromDatabase, loadAllWishesFromDatabase } from '../services/database';
import { SITE_DATA_KEY, MAX_AUDIO_FILE_SIZE, DEFAULT_WEDDING_MUSIC_FILE, DEFAULT_WEDDING_MUSIC_NAME, THEME_DEFAULT_IMAGES } from '../config/constants';
import { supabase } from '../supabaseClient';

const AdminView = lazy(() => import('./AdminView'));

export default function AdminController() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const navigate = useNavigate();

  const { siteData, setSiteData, guests, setGuests, wishes, setWishes } = useSiteContext();
  const { showAppConfirm, showAppPrompt } = useUIContext();
  const { adminDraft, setAdminDraft, activeAdminTab, setActiveAdminTab, personalLinkName, setPersonalLinkName, dataImportText, setDataImportText } = useAdminContext();

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

  const [adminGuestSearch, setAdminGuestSearch] = useState("");
  const [adminGuestAttendanceFilter, setAdminGuestAttendanceFilter] = useState("all");
  const [adminGuestSideFilter, setAdminGuestSideFilter] = useState("all");
  const [adminGuestChildFilter, setAdminGuestChildFilter] = useState("all");
  const [adminWishSearch, setAdminWishSearch] = useState("");
  const [adminWishStatusFilter, setAdminWishStatusFilter] = useState("all");

  const currentShareLink = useMemo(() => adminDraft.invitation.shareLink || getCurrentShareLink(), [adminDraft.invitation.shareLink]);
  const qrImageUrl = useMemo(() => getQrImageUrl(currentShareLink), [currentShareLink]);
  const personalGuestLink = useMemo(() => buildPersonalLink(currentShareLink, personalLinkName), [currentShareLink, personalLinkName]);

  const attendingGuests = useMemo(() => guests.filter((g) => g.attendance === "Katılacağım"), [guests]);
  const totalPersonCount = useMemo(() => attendingGuests.reduce((tot, g) => tot + Number(g.personCount || 1), 0), [attendingGuests]);
  const notAttendingCount = useMemo(() => guests.filter((g) => g.attendance === "Katılamayacağım").length, [guests]);
  const childGuestCount = useMemo(() => attendingGuests.filter((g) => g.hasChild === "Evet").length, [attendingGuests]);
  const brideSideCount = useMemo(() => attendingGuests.filter((g) => g.side === "Gelin Tarafı").length, [attendingGuests]);
  const groomSideCount = useMemo(() => attendingGuests.filter((g) => g.side === "Damat Tarafı").length, [attendingGuests]);

  const { submitAdminPassword, sendPasswordResetEmail, completePasswordRecovery, changeAdminPassword, logoutAdmin } = useAdminSession({
    isAdminPage: true, adminEmail, adminPassword, adminUser, adminCurrentPassword, adminNewPassword, adminNewPasswordAgain,
    recoveryPassword, recoveryPasswordAgain, siteData, isAdminUnlocked, setAdminEmail, setAdminPassword, setAdminUser,
    setIsAdminUnlocked, setAdminError, setAdminLoginNotice, setShowForgotPassword, setForgotPasswordEmail,
    setForgotPasswordMessage, setAdminPasswordMessage, setAdminSaveMessage, setAdminCurrentPassword, setAdminNewPassword,
    setAdminNewPasswordAgain, setRecoveryPassword, setRecoveryPasswordAgain, setRecoveryMessage, setRecoveryLoading,
    setForgotPasswordLoading, setAdminAuthLoading, setIsPasswordRecovery, setActiveAdminTab, setSiteData, setAdminDraft,
    setGuests, setWishes, showAppConfirm, isEn
  });

  const { clearGuests, clearWishes, deleteGuest, editGuest, deleteWish, editWish, toggleWishApproval } = useDatabaseManager({
    guests, setGuests, wishes, setWishes, guestForm: null, setGuestForm: null, wishForm: null, setWishForm: null, 
    settings: adminDraft.settings, showAppAlert: null, showAppConfirm, showAppPrompt, setAdminSaveMessage, t, isEn
  });

  const closeAdminPage = useCallback(() => {
    navigate("/"); // Anasayfaya yönlendiriyoruz
  }, [navigate]);

  const openAdminTab = useCallback((tabId) => setActiveAdminTab(tabId), [setActiveAdminTab]);

  const updateDraftObject = useCallback((group, key, value) => setAdminDraft((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } })), [setAdminDraft]);

  const saveSiteContent = useCallback(async () => {
    const cleanedData = normalizeSiteData({ ...adminDraft, invitation: { ...adminDraft.invitation, gallery: adminDraft.invitation.gallery.map((img) => String(img || "").trim()).filter(Boolean) } });
    try {
      await saveSettingsToDatabase(cleanedData);
      localStorage.setItem(SITE_DATA_KEY, JSON.stringify(cleanedData));
      setSiteData(cleanedData); setAdminDraft(cleanedData);
      setAdminSaveMessage(isEn ? "Saved successfully." : "Başarıyla kaydedildi.");
      setTimeout(() => setAdminSaveMessage(""), 3000);
    } catch (error) {
      setAdminSaveMessage(isEn ? `Could not save changes.` : `Değişiklikler kaydedilemedi.`);
    }
  }, [adminDraft, isEn, setSiteData, setAdminDraft]);

  const handleThemeChange = useCallback(async (themeValue) => {
    updateDraftObject("settings", "theme", themeValue);
    const confirmed = await showAppConfirm(isEn ? "Load theme images?" : "Tema resimleri yüklensin mi?");
    if (confirmed) {
      const themeImages = THEME_DEFAULT_IMAGES[themeValue];
      if (themeImages) setAdminDraft((prev) => ({ ...prev, invitation: { ...prev.invitation, introImage: themeImages.introImage, heroImage: themeImages.heroImage, heroVideo: themeImages.heroVideo || "", gallery: themeImages.gallery } }));
    }
  }, [updateDraftObject, showAppConfirm, isEn, setAdminDraft]);

  const resetSiteContent = useCallback(async () => {
    const confirmed = await showAppConfirm(isEn ? "Reset to default?" : "Varsayılana dönsün mü?");
    if (!confirmed) return;
    const chosenDefaultTheme = adminDraft.settings.defaultTheme || "lavanta";
    const defaultData = normalizeSiteData(null);
    defaultData.settings.defaultTheme = chosenDefaultTheme;
    defaultData.settings.theme = chosenDefaultTheme;
    try {
      await saveSettingsToDatabase(defaultData);
      setSiteData(defaultData); setAdminDraft(defaultData);
      setAdminSaveMessage(isEn ? "Content reset." : "Sıfırlandı.");
    } catch (error) {
      setAdminSaveMessage(isEn ? `Could not reset.` : `Sıfırlanamadı.`);
    }
  }, [adminDraft.settings.defaultTheme, showAppConfirm, isEn, setSiteData, setAdminDraft]);

  // Medya ve Liste Güncelleme yardımcıları...
  const updateDraftImage = async (group, key, file) => { 
  if (!file) return; 
    const compressed = await optimizeImage(file);
    const url = await uploadMediaFile(compressed, "images"); 
    updateDraftObject(group, key, url); 
  };

  const clearDraftImage = (group, key) => updateDraftObject(group, key, "");
  const updateDraftMusic = async (file) => { if (!file) return; const url = await uploadMediaFile(file, "music"); setAdminDraft((prev) => ({ ...prev, invitation: { ...prev.invitation, musicFile: url, musicName: file.name } })); };
  const clearDraftMusic = () => setAdminDraft((prev) => ({ ...prev, invitation: { ...prev.invitation, musicFile: DEFAULT_WEDDING_MUSIC_FILE, musicName: DEFAULT_WEDDING_MUSIC_NAME } }));
  const updateDraftArrayItem = (arrayKey, index, key, value) => setAdminDraft((prev) => ({ ...prev, [arrayKey]: prev[arrayKey].map((item, i) => i === index ? { ...item, [key]: value } : item) }));
  const addDraftArrayItem = (arrayKey, item) => setAdminDraft((prev) => ({ ...prev, [arrayKey]: [...prev[arrayKey], item] }));
  const removeDraftArrayItem = (arrayKey, index) => setAdminDraft((prev) => ({ ...prev, [arrayKey]: prev[arrayKey].filter((_, i) => i !== index) }));
  const updateGalleryImageFile = async (index, file) => { 
    if (!file) return; 
        const compressed = await optimizeImage(file);
        const url = await uploadMediaFile(compressed, "gallery"); 
        setAdminDraft((prev) => ({ 
        ...prev, 
        invitation: { 
            ...prev.invitation, 
        gallery: prev.invitation.gallery.map((img, i) => i === index ? url : img) 
        } 
    })); 
  };  
  const updateStoryImageFile = async (index, file) => {
    if (!file) return;
    const compressed = await optimizeImage(file);
    const url = await uploadMediaFile(compressed, "story");
    updateDraftArrayItem("storyTimeline", index, "image", url);
  };
  const addGalleryItem = () => setAdminDraft((prev) => ({ ...prev, invitation: { ...prev.invitation, gallery: [...prev.invitation.gallery, ""] } }));
  const removeGalleryItem = (index) => setAdminDraft((prev) => ({ ...prev, invitation: { ...prev.invitation, gallery: prev.invitation.gallery.filter((_, idx) => idx !== index) } }));

  // Filtrelemeler
  const filteredGuests = useMemo(() => guests.filter((guest) => {
    const searchMatch = normalizeText(`${guest.name} ${guest.phone}`).includes(normalizeText(adminGuestSearch));
    const attendanceMatch = adminGuestAttendanceFilter === "all" || guest.attendance === adminGuestAttendanceFilter;
    return searchMatch && attendanceMatch;
  }), [guests, adminGuestSearch, adminGuestAttendanceFilter]);

  const filteredWishes = useMemo(() => wishes.filter((wish) => {
    const searchMatch = normalizeText(`${wish.name} ${wish.message}`).includes(normalizeText(adminWishSearch));
    const isApproved = wish.approved !== false;
    const statusMatch = adminWishStatusFilter === "all" || (adminWishStatusFilter === "approved" && isApproved) || (adminWishStatusFilter === "pending" && !isApproved);
    return searchMatch && statusMatch;
  }), [wishes, adminWishSearch, adminWishStatusFilter]);

  const copyAdminLink = useCallback(async (linkToCopy, msg) => { try { await navigator.clipboard.writeText(linkToCopy); setAdminSaveMessage(msg); } catch {} }, []);
  const downloadQrCode = () => { window.open(qrImageUrl, "_blank"); };
  
  // Import/Export fonksiyonları (Basitleştirildi)
  const exportAllDataJson = () => downloadTextFile("yedek.json", JSON.stringify({ siteData, guests, wishes }), "application/json");
  const importAllDataJson = async () => { /* Mevcut import logic */ };

  return (
    <Suspense fallback={<div className="app-loading">Yükleniyor...</div>}>
      <AdminView
        isAdminUnlocked={isAdminUnlocked} isPasswordRecovery={isPasswordRecovery} showForgotPassword={showForgotPassword}
        adminEmail={adminEmail} adminPassword={adminPassword} recoveryPassword={recoveryPassword} recoveryPasswordAgain={recoveryPasswordAgain}
        recoveryLoading={recoveryLoading} recoveryMessage={recoveryMessage} forgotPasswordEmail={forgotPasswordEmail}
        forgotPasswordLoading={forgotPasswordLoading} forgotPasswordMessage={forgotPasswordMessage} adminAuthLoading={adminAuthLoading}
        adminLoginNotice={adminLoginNotice} adminError={adminError} adminSaveMessage={adminSaveMessage} activeAdminTab={activeAdminTab}
        setAdminEmail={setAdminEmail} setAdminPassword={setAdminPassword} setForgotPasswordEmail={setForgotPasswordEmail}
        setShowForgotPassword={setShowForgotPassword} setAdminError={setAdminError} setAdminLoginNotice={setAdminLoginNotice}
        setRecoveryPassword={setRecoveryPassword} setRecoveryPasswordAgain={setRecoveryPasswordAgain} setRecoveryMessage={setRecoveryMessage}
        setForgotPasswordMessage={setForgotPasswordMessage} submitAdminPassword={submitAdminPassword} completePasswordRecovery={completePasswordRecovery}
        sendPasswordResetEmail={sendPasswordResetEmail} openAdminTab={openAdminTab} saveSiteContent={saveSiteContent} resetSiteContent={resetSiteContent}
        logoutAdmin={logoutAdmin} closeAdminPage={closeAdminPage} adminDraft={adminDraft} updateDraftObject={updateDraftObject}
        handleThemeChange={handleThemeChange} changeAdminPassword={changeAdminPassword} adminCurrentPassword={adminCurrentPassword}
        setAdminCurrentPassword={setAdminCurrentPassword} adminNewPassword={adminNewPassword} setAdminNewPassword={setAdminNewPassword}
        adminNewPasswordAgain={adminNewPasswordAgain} setAdminNewPasswordAgain={setAdminNewPasswordAgain} adminPasswordMessage={adminPasswordMessage}
        removeDraftArrayItem={removeDraftArrayItem} updateDraftArrayItem={updateDraftArrayItem} addDraftArrayItem={addDraftArrayItem}
        updateDraftImage={updateDraftImage} clearDraftImage={clearDraftImage} updateDraftMusic={updateDraftMusic} clearDraftMusic={clearDraftMusic}
        updateGalleryImageFile={updateGalleryImageFile} removeGalleryItem={removeGalleryItem} addGalleryItem={addGalleryItem}
        guests={guests} totalPersonCount={totalPersonCount} notAttendingCount={notAttendingCount} childGuestCount={childGuestCount}
        brideSideCount={brideSideCount} groomSideCount={groomSideCount} adminGuestSearch={adminGuestSearch} setAdminGuestSearch={setAdminGuestSearch}
        adminGuestAttendanceFilter={adminGuestAttendanceFilter} setAdminGuestAttendanceFilter={setAdminGuestAttendanceFilter}
        adminGuestSideFilter={adminGuestSideFilter} setAdminGuestSideFilter={setAdminGuestSideFilter} adminGuestChildFilter={adminGuestChildFilter}
        setAdminGuestChildFilter={setAdminGuestChildFilter} filteredGuests={filteredGuests} editGuest={editGuest} deleteGuest={deleteGuest}
        clearGuests={clearGuests} wishes={wishes} adminWishSearch={adminWishSearch} setAdminWishSearch={setAdminWishSearch}
        adminWishStatusFilter={adminWishStatusFilter} setAdminWishStatusFilter={setAdminWishStatusFilter} filteredWishes={filteredWishes}
        toggleWishApproval={toggleWishApproval} editWish={editWish} deleteWish={deleteWish} clearWishes={clearWishes}
        qrImageUrl={qrImageUrl} downloadQrCode={downloadQrCode} copyAdminLink={copyAdminLink} currentShareLink={currentShareLink}
        personalLinkName={personalLinkName} setPersonalLinkName={setPersonalLinkName} personalGuestLink={personalGuestLink}
        exportAllDataJson={exportAllDataJson} dataImportText={dataImportText} setDataImportText={setDataImportText} importAllDataJson={importAllDataJson}
        updateStoryImageFile={updateStoryImageFile}
      />
    </Suspense>
  );
}