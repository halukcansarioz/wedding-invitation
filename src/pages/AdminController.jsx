import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import useAdminSession from '../hooks/useAdminSession';
import { useDatabaseManager } from '../hooks/useDatabaseManager';
import { 
  normalizeText, 
  downloadTextFile, 
  createCsv, 
  createExcelTable, 
  buildPersonalLink, 
  getQrImageUrl, 
  normalizeSiteData, 
  getCurrentShareLink 
} from '../utils/helpers';
import { 
  saveSettingsToDatabase, 
  uploadMediaFile, 
  deleteMediaFile, 
  restoreBackupToDatabase 
} from '../services/database';
import { optimizeImage } from '../utils/imageOptimizer';
import { 
  SITE_DATA_KEY, 
  DEFAULT_WEDDING_MUSIC_FILE, 
  DEFAULT_WEDDING_MUSIC_NAME, 
  THEME_DEFAULT_IMAGES 
} from '../config/constants';

const AdminView = lazy(() => import('./AdminView'));

export default function AdminController() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en') || false;
  const navigate = useNavigate();

  // ZUSTAND'DAN VERİLERİ VE FONKSİYONLARI ÇEKİYORUZ
  const siteData = useStore((state) => state.siteData);
  const setSiteData = useStore((state) => state.setSiteData);
  const guests = useStore((state) => state.guests);
  const setGuests = useStore((state) => state.setGuests);
  const wishes = useStore((state) => state.wishes);
  const setWishes = useStore((state) => state.setWishes);
  const showAppConfirm = useStore((state) => state.showAppConfirm);
  const showAppPrompt = useStore((state) => state.showAppPrompt);
  const adminDraft = useStore((state) => state.adminDraft);
  const setAdminDraft = useStore((state) => state.setAdminDraft);
  const activeAdminTab = useStore((state) => state.activeAdminTab);
  const setActiveAdminTab = useStore((state) => state.setActiveAdminTab);
  const personalLinkName = useStore((state) => state.personalLinkName);
  const setPersonalLinkName = useStore((state) => state.setPersonalLinkName);
  const dataImportText = useStore((state) => state.dataImportText);
  const setDataImportText = useStore((state) => state.setDataImportText);

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

  // toggleCheckIn EKLENDİ
  const { clearGuests, clearWishes, deleteGuest, editGuest, deleteWish, editWish, toggleWishApproval, toggleCheckIn } = useDatabaseManager({
    guests, setGuests, wishes, setWishes, settings: adminDraft.settings, 
    showAppAlert: null, showAppConfirm, showAppPrompt, setAdminSaveMessage, t, isEn
  });

  const closeAdminPage = useCallback(() => {
    navigate("/"); 
  }, [navigate]);

  const openAdminTab = useCallback((tabId) => setActiveAdminTab(tabId), [setActiveAdminTab]);

  const updateDraftObject = useCallback((group, key, value) => {
    setAdminDraft((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }));
  }, [setAdminDraft]);

  const saveSiteContent = useCallback(async () => {
    const cleanedData = normalizeSiteData({ 
      ...adminDraft, 
      invitation: { 
        ...adminDraft.invitation, 
        gallery: adminDraft.invitation.gallery.map((img) => String(img || "").trim()).filter(Boolean) 
      } 
    });
    try {
      await saveSettingsToDatabase(cleanedData);
      localStorage.setItem(SITE_DATA_KEY, JSON.stringify(cleanedData));
      setSiteData(cleanedData); 
      setAdminDraft(cleanedData);
      setAdminSaveMessage(isEn ? "Saved successfully." : "Başarıyla kaydedildi.");
      setTimeout(() => setAdminSaveMessage(""), 3000);
    } catch (error) {
      setAdminSaveMessage(isEn ? `Could not save changes.` : `Değişiklikler kaydedilemedi.`);
    }
  }, [adminDraft, isEn, setSiteData, setAdminDraft]);

  const handleThemeChange = useCallback(async (themeValue) => {
    updateDraftObject("settings", "theme", themeValue);
    const confirmed = await showAppConfirm(isEn ? "Load theme images and apply changes?" : "Tema değiştirilsin ve otomatik kaydedilsin mi?");
    if (confirmed) {
      const themeImages = THEME_DEFAULT_IMAGES[themeValue];
      if (themeImages) {
        setAdminDraft((prev) => {
          const newState = { 
            ...prev, 
            settings: { ...prev.settings, theme: themeValue }, 
            invitation: { 
              ...prev.invitation, 
              introImage: themeImages.introImage, 
              heroImage: themeImages.heroImage, 
              heroVideo: themeImages.heroVideo || "", 
              gallery: themeImages.gallery 
            } 
          };
          saveSettingsToDatabase(newState).then(() => {
             localStorage.setItem(SITE_DATA_KEY, JSON.stringify(newState));
             setSiteData(newState);
             setAdminSaveMessage(isEn ? "Theme applied and saved." : "Tema uygulandı ve kaydedildi.");
             setTimeout(() => setAdminSaveMessage(""), 3000);
          });
          return newState;
        });
      }
    }
  }, [updateDraftObject, showAppConfirm, isEn, setSiteData, setAdminDraft]);

  const resetSiteContent = useCallback(async () => {
    const confirmed = await showAppConfirm(isEn ? "Reset to default?" : "Varsayılana dönsün mü?");
    if (!confirmed) return;
    const chosenDefaultTheme = adminDraft.settings.defaultTheme || "lavanta";
    const defaultData = normalizeSiteData(null);
    defaultData.settings.defaultTheme = chosenDefaultTheme;
    defaultData.settings.theme = chosenDefaultTheme;
    try {
      await saveSettingsToDatabase(defaultData);
      setSiteData(defaultData); 
      setAdminDraft(defaultData);
      setAdminSaveMessage(isEn ? "Content reset." : "Sıfırlandı.");
    } catch (error) {
      setAdminSaveMessage(isEn ? `Could not reset.` : `Sıfırlanamadı.`);
    }
  }, [adminDraft.settings.defaultTheme, showAppConfirm, isEn, setSiteData, setAdminDraft]);

  const updateDraftImage = async (group, key, file) => { 
    if (!file) return; 
    const compressed = optimizeImage ? await optimizeImage(file) : file;
    const url = await uploadMediaFile(compressed, "images"); 
    updateDraftObject(group, key, url); 
  };

  const updateDraftVideo = async (group, key, file) => { 
    if (!file) return; 
    const url = await uploadMediaFile(file, "media"); 
    updateDraftObject(group, key, url); 
  };

  const clearDraftImage = async (group, key) => { 
    await deleteMediaFile(adminDraft[group][key]);
    updateDraftObject(group, key, ""); 
  };  

  const clearDraftVideo = async (group, key) => { 
    await deleteMediaFile(adminDraft[group][key]);
    updateDraftObject(group, key, ""); 
  };

  const clearDraftMusic = async () => {
    await deleteMediaFile(adminDraft.invitation?.musicFile);
    setAdminDraft((prev) => ({ 
      ...prev, 
      invitation: { 
        ...prev.invitation, 
        musicFile: DEFAULT_WEDDING_MUSIC_FILE, 
        musicName: DEFAULT_WEDDING_MUSIC_NAME 
      } 
    }));
  };

  const updateDraftMusic = async (file) => { 
    if (!file) return; 
    const url = await uploadMediaFile(file, "music"); 
    setAdminDraft((prev) => ({ 
      ...prev, 
      invitation: { 
        ...prev.invitation, 
        musicFile: url, 
        musicName: file.name 
      } 
    })); 
  };
  
  const updateDraftArrayItem = (arrayKey, index, key, value) => {
    setAdminDraft((prev) => ({ 
      ...prev, 
      [arrayKey]: prev[arrayKey].map((item, i) => i === index ? { ...item, [key]: value } : item) 
    }));
  };

  const addDraftArrayItem = (arrayKey, item) => {
    setAdminDraft((prev) => ({ ...prev, [arrayKey]: [...prev[arrayKey], item] }));
  };

  const removeDraftArrayItem = (arrayKey, index) => {
    setAdminDraft((prev) => ({ ...prev, [arrayKey]: prev[arrayKey].filter((_, i) => i !== index) }));
  };
  
  const updateGalleryImageFile = async (index, file) => { 
    if (!file) return; 
    const compressed = optimizeImage ? await optimizeImage(file) : file;
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
    const compressed = optimizeImage ? await optimizeImage(file) : file;
    const url = await uploadMediaFile(compressed, "story"); 
    updateDraftArrayItem("storyTimeline", index, "image", url);
  };
  
  const addGalleryItem = () => {
    setAdminDraft((prev) => ({ ...prev, invitation: { ...prev.invitation, gallery: [...prev.invitation.gallery, ""] } }));
  };

  const removeGalleryItem = async (index) => {
    await deleteMediaFile(adminDraft.invitation.gallery[index]);
    setAdminDraft((prev) => ({ 
      ...prev, 
      invitation: { 
        ...prev.invitation, 
        gallery: prev.invitation.gallery.filter((_, idx) => idx !== index) 
      } 
    }));
  };

  const moveDraftArrayItem = useCallback((arrayKey, index, direction) => {
    setAdminDraft((prev) => {
      const arr = [...prev[arrayKey]];
      if (direction === -1 && index > 0) {
        [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      } else if (direction === 1 && index < arr.length - 1) {
        [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      }
      return { ...prev, [arrayKey]: arr };
    });
  }, [setAdminDraft]);

  const filteredGuests = useMemo(() => guests.filter((guest) => {
    const searchMatch = normalizeText(`${guest.name} ${guest.phone}`).includes(normalizeText(adminGuestSearch));
    const attendanceMatch = adminGuestAttendanceFilter === "all" || guest.attendance === adminGuestAttendanceFilter;
    const sideMatch = adminGuestSideFilter === "all" || guest.side === adminGuestSideFilter;
    const childMatch = adminGuestChildFilter === "all" || guest.hasChild === adminGuestChildFilter;
    return searchMatch && attendanceMatch && sideMatch && childMatch;
  }), [guests, adminGuestSearch, adminGuestAttendanceFilter, adminGuestSideFilter, adminGuestChildFilter]);

  const filteredWishes = useMemo(() => wishes.filter((wish) => {
    const searchMatch = normalizeText(`${wish.name} ${wish.message}`).includes(normalizeText(adminWishSearch));
    const isApproved = wish.approved !== false;
    const statusMatch = adminWishStatusFilter === "all" || (adminWishStatusFilter === "approved" && isApproved) || (adminWishStatusFilter === "pending" && !isApproved);
    return searchMatch && statusMatch;
  }), [wishes, adminWishSearch, adminWishStatusFilter]);

  const exportGuestsExcel = useCallback(() => {
    const html = createExcelTable(filteredGuests, "guests", isEn);
    downloadTextFile("misafirler.xls", html, "application/vnd.ms-excel");
  }, [filteredGuests, isEn]);

  const exportGuestsCsv = useCallback(() => {
    const csv = createCsv(filteredGuests, "guests", isEn);
    downloadTextFile("misafirler.csv", csv, "text/csv;charset=utf-8;");
  }, [filteredGuests, isEn]);

  const exportWishesExcel = useCallback(() => {
    const html = createExcelTable(filteredWishes, "wishes", isEn);
    downloadTextFile("mesajlar.xls", html, "application/vnd.ms-excel");
  }, [filteredWishes, isEn]);

  const exportWishesCsv = useCallback(() => {
    const csv = createCsv(filteredWishes, "wishes", isEn);
    downloadTextFile("mesajlar.csv", csv, "text/csv;charset=utf-8;");
  }, [filteredWishes, isEn]);

  const copyAdminLink = useCallback(async (linkToCopy, msg) => { 
    try { 
      await navigator.clipboard.writeText(linkToCopy); 
      setAdminSaveMessage(msg); 
    } catch {} 
  }, []);

  const downloadQrCode = () => { 
    window.open(qrImageUrl, "_blank"); 
  };
  
  const exportAllDataJson = () => {
    downloadTextFile("yedek.json", JSON.stringify({ siteData, guests, wishes }), "application/json");
  };
  
  const importAllDataJson = async () => {
    try {
      if (!dataImportText.trim()) {
        setAdminSaveMessage(isEn ? "Please paste JSON data." : "Lütfen JSON verisini yapıştırın.");
        return;
      }
      const parsed = JSON.parse(dataImportText);
      const confirmed = await showAppConfirm(
        isEn ? "Are you sure you want to overwrite all settings, guests, and messages with this backup?" : "Tüm ayarlar, misafirler ve mesajlar silinip bu yedek üzerine yazılacak. Emin misin?"
      );
      
      if (!confirmed) return;

      setAdminSaveMessage(isEn ? "Restoring backup..." : "Yedek yükleniyor...");
      
      await restoreBackupToDatabase(parsed);
      
      if (parsed.siteData) {
        const cleanedData = normalizeSiteData(parsed.siteData);
        localStorage.setItem(SITE_DATA_KEY, JSON.stringify(cleanedData));
        setSiteData(cleanedData);
        setAdminDraft(cleanedData);
      }
      if (parsed.guests) setGuests(parsed.guests);
      if (parsed.wishes) setWishes(parsed.wishes);
      
      setDataImportText("");
      setAdminSaveMessage(isEn ? "Backup imported successfully." : "Yedek başarıyla yüklendi.");
      setTimeout(() => setAdminSaveMessage(""), 3000);
    } catch (error) {
      console.error("Yedek yükleme hatası:", error);
      setAdminSaveMessage(isEn ? "Invalid JSON file or backup error." : "Geçersiz JSON formatı veya yükleme hatası.");
    }
  };

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
        exportGuestsExcel={exportGuestsExcel} exportGuestsCsv={exportGuestsCsv} 
        exportWishesExcel={exportWishesExcel} exportWishesCsv={exportWishesCsv} 
        updateStoryImageFile={updateStoryImageFile}
        moveDraftArrayItem={moveDraftArrayItem}
        updateDraftVideo={updateDraftVideo}
        clearDraftVideo={clearDraftVideo}
        toggleCheckIn={toggleCheckIn} 
      />
    </Suspense>
  );
}