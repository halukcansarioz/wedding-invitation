import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAdminStore } from '../store/useAdminStore';
import { useAdminSession } from '../hooks/useAdminSession';
import { useDatabaseManager } from '../hooks/useDatabaseManager';
import { useExportData } from '../hooks/useExportData';
import { normalizeText, buildPersonalLink, getQrImageUrl } from '../utils/helpers';
import { restoreBackupToDatabase } from '../services/database'; 
import '../styles/admin.css';

const AdminView = lazy(() => import('./AdminView'));

export default function AdminController() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en') || false;
  const navigate = useNavigate();

  // Zustand State Bağlantıları
  const siteData = useStore((state) => state.siteData);
  const guests = useStore((state) => state.guests);
  const setGuests = useStore((state) => state.setGuests);
  const wishes = useStore((state) => state.wishes);
  const setWishes = useStore((state) => state.setWishes);
  
  const showAppConfirm = useStore((state) => state.showAppConfirm);
  const showAppPrompt = useStore((state) => state.showAppPrompt);
  const showAppAlert = useStore((state) => state.showAppAlert);
  
  const adminDraft = useStore((state) => state.adminDraft);
  const setAdminDraft = useStore((state) => state.setAdminDraft); // EKLENDİ: Taslağı sıfırlamak için
  const personalLinkName = useStore((state) => state.personalLinkName);
  const setPersonalLinkName = useStore((state) => state.setPersonalLinkName);
  const dataImportText = useStore((state) => state.dataImportText);
  const setDataImportText = useStore((state) => state.setDataImportText);
  
  const setAdminSaveMessage = useAdminStore((state) => state.setAdminSaveMessage);

  // Yerel Filtreleme State'leri
  const [adminGuestSearch, setAdminGuestSearch] = useState("");
  const [adminGuestAttendanceFilter, setAdminGuestAttendanceFilter] = useState("all");
  const [adminGuestSideFilter, setAdminGuestSideFilter] = useState("all");
  const [adminGuestChildFilter, setAdminGuestChildFilter] = useState("all");
  const [adminWishSearch, setAdminWishSearch] = useState("");
  const [adminWishStatusFilter, setAdminWishStatusFilter] = useState("all");

  const currentShareLink = useMemo(() => adminDraft.invitation.shareLink || window.location.origin, [adminDraft.invitation.shareLink]);
  const qrImageUrl = useMemo(() => getQrImageUrl(currentShareLink), [currentShareLink]);
  const personalGuestLink = useMemo(() => buildPersonalLink(currentShareLink, personalLinkName), [currentShareLink, personalLinkName]);

  const { submitAdminPassword, sendPasswordResetEmail, completePasswordRecovery, changeAdminPassword, logoutAdmin } = useAdminSession({ isAdminPage: true, isEn });

  const { clearGuests, clearWishes, deleteGuest, editGuest, deleteWish, editWish, toggleWishApproval, toggleCheckIn, assignTable } = useDatabaseManager({
    guests, setGuests, wishes, setWishes, settings: adminDraft.settings, showAppAlert, showAppConfirm, showAppPrompt, setAdminSaveMessage, t, isEn
  });

  const { exportExcel, exportCsv, exportJson } = useExportData(isEn);

  // EKLENDİ VE DÜZELTİLDİ: Çıkış yaparken hayalet temayı temizle
  const closeAdminPage = useCallback(() => {
    document.documentElement.setAttribute('data-theme', siteData.settings?.theme || "lavanta");
    navigate("/");
  }, [navigate, siteData.settings?.theme]);

  // EKLENDİ: "Varsayılana Döndür" (Değişiklikleri İptal Et) Butonunun İşlevi
  const resetSiteContent = useCallback(async () => {
    const confirmed = await showAppConfirm(
      isEn 
        ? "Discard all unsaved changes and revert to the latest saved version?" 
        : "Kaydedilmemiş tüm değişiklikleri iptal edip son kaydedilen sürüme dönmek istiyor musunuz?",
      { title: isEn ? "Discard Changes" : "Değişiklikleri İptal Et", tone: "warning" }
    );
    
    if (confirmed) {
      setAdminDraft(siteData); // Taslağı, veritabanından gelen asıl veriye eşitler
      document.documentElement.setAttribute('data-theme', siteData.settings?.theme || "lavanta"); // Temayı aslına döndürür
      setAdminSaveMessage(isEn ? "Changes discarded." : "Tüm değişiklikler iptal edildi.");
      setTimeout(() => setAdminSaveMessage(""), 3000);
    }
  }, [siteData, setAdminDraft, showAppConfirm, setAdminSaveMessage, isEn]);

  // JSON İçe Aktarma
  const importAllDataJson = async () => {
    if (!dataImportText || !dataImportText.trim()) {
      showAppAlert(isEn ? "Please paste the backup JSON content." : "Lütfen JSON yedeğini metin kutusuna yapıştırın.", { title: isEn ? "Error" : "Hata" });
      return;
    }
    try {
      const parsedData = JSON.parse(dataImportText);
      const confirmed = await showAppConfirm(
        isEn ? "Restore this backup? Current data will be overwritten." : "Bu yedeği geri yüklemek istediğinize emin misiniz? Mevcut verilerin üzerine yazılacaktır.",
        { title: isEn ? "Restore Backup" : "Yedeği Geri Yükle", tone: "danger" }
      );
      if (!confirmed) return;

      await restoreBackupToDatabase(parsedData);
      setAdminSaveMessage(isEn ? "Backup restored! Please refresh." : "Yedek yüklendi! Lütfen sayfayı yenileyin.");
      setDataImportText("");
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      showAppAlert(isEn ? "Invalid JSON." : "Geçersiz JSON formatı.", { title: isEn ? "Error" : "Hata" });
    }
  };

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

  const copyAdminLink = useCallback(async (linkToCopy, msg) => { try { await navigator.clipboard.writeText(linkToCopy); setAdminSaveMessage(msg); } catch {} }, [setAdminSaveMessage]);
  const downloadQrCode = () => { window.open(qrImageUrl, "_blank"); };

  return (
    <Suspense fallback={<div className="app-loading">Yükleniyor...</div>}>
      <AdminView
        submitAdminPassword={submitAdminPassword} 
        completePasswordRecovery={completePasswordRecovery}
        sendPasswordResetEmail={sendPasswordResetEmail} 
        changeAdminPassword={changeAdminPassword} 
        logoutAdmin={logoutAdmin} 
        
        closeAdminPage={closeAdminPage} 
        resetSiteContent={resetSiteContent} // EKLENDİ: Artık buton işlevsel!
        
        guests={guests} adminGuestSearch={adminGuestSearch} setAdminGuestSearch={setAdminGuestSearch}
        adminGuestAttendanceFilter={adminGuestAttendanceFilter} setAdminGuestAttendanceFilter={setAdminGuestAttendanceFilter}
        adminGuestSideFilter={adminGuestSideFilter} setAdminGuestSideFilter={setAdminGuestSideFilter} adminGuestChildFilter={adminGuestChildFilter}
        setAdminGuestChildFilter={setAdminGuestChildFilter} filteredGuests={filteredGuests} editGuest={editGuest} deleteGuest={deleteGuest}
        clearGuests={clearGuests} wishes={wishes} adminWishSearch={adminWishSearch} setAdminWishSearch={setAdminWishSearch}
        adminWishStatusFilter={adminWishStatusFilter} setAdminWishStatusFilter={setAdminWishStatusFilter} filteredWishes={filteredWishes}
        toggleWishApproval={toggleWishApproval} editWish={editWish} deleteWish={deleteWish} clearWishes={clearWishes}
        qrImageUrl={qrImageUrl} downloadQrCode={downloadQrCode} copyAdminLink={copyAdminLink} currentShareLink={currentShareLink}
        personalLinkName={personalLinkName} setPersonalLinkName={setPersonalLinkName} personalGuestLink={personalGuestLink}
        
        exportAllDataJson={() => exportJson({ siteData, guests, wishes }, "yedek.json")} 
        dataImportText={dataImportText} setDataImportText={setDataImportText} importAllDataJson={importAllDataJson}
        exportGuestsExcel={() => exportExcel(filteredGuests, "guests", "misafirler.xls")} exportGuestsCsv={() => exportCsv(filteredGuests, "guests", "misafirler.csv")} 
        exportWishesExcel={() => exportExcel(filteredWishes, "wishes", "mesajlar.xls")} exportWishesCsv={() => exportCsv(filteredWishes, "wishes", "mesajlar.csv")} 
        toggleCheckIn={toggleCheckIn} assignTable={assignTable}
      />
    </Suspense>
  );
}