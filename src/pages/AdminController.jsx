import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStore, useAdminStore } from '../store/useStore';
import { useAdminSession } from '../hooks/useAdminSession';
import { useDatabaseManager } from '../hooks/useDatabaseManager';
import { useExportData } from '../hooks/useExportData';
import { normalizeText, buildPersonalLink, getQrImageUrl } from '../utils/helpers';
import '../styles/admin.css';

const AdminView = lazy(() => import('./AdminView'));

export default function AdminController() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en') || false;
  const navigate = useNavigate();

  // Zustand Store'lar
  const siteData = useStore((state) => state.siteData);
  const guests = useStore((state) => state.guests);
  const setGuests = useStore((state) => state.setGuests);
  const wishes = useStore((state) => state.wishes);
  const setWishes = useStore((state) => state.setWishes);
  const showAppConfirm = useStore((state) => state.showAppConfirm);
  const showAppPrompt = useStore((state) => state.showAppPrompt);
  
  const adminDraft = useStore((state) => state.adminDraft);
  const personalLinkName = useStore((state) => state.personalLinkName);
  const setPersonalLinkName = useStore((state) => state.setPersonalLinkName);
  const dataImportText = useStore((state) => state.dataImportText);
  const setDataImportText = useStore((state) => state.setDataImportText);
  
  const setAdminSaveMessage = useAdminStore((state) => state.setAdminSaveMessage);

  // Lokal Form & Filtre Durumları
  const [adminGuestSearch, setAdminGuestSearch] = useState("");
  const [adminGuestAttendanceFilter, setAdminGuestAttendanceFilter] = useState("all");
  const [adminGuestSideFilter, setAdminGuestSideFilter] = useState("all");
  const [adminGuestChildFilter, setAdminGuestChildFilter] = useState("all");
  const [adminWishSearch, setAdminWishSearch] = useState("");
  const [adminWishStatusFilter, setAdminWishStatusFilter] = useState("all");

  const currentShareLink = useMemo(() => adminDraft.invitation.shareLink || window.location.origin, [adminDraft.invitation.shareLink]);
  const qrImageUrl = useMemo(() => getQrImageUrl(currentShareLink), [currentShareLink]);
  const personalGuestLink = useMemo(() => buildPersonalLink(currentShareLink, personalLinkName), [currentShareLink, personalLinkName]);

  // Auth Methodları
  const { submitAdminPassword, sendPasswordResetEmail, completePasswordRecovery, changeAdminPassword, logoutAdmin } = useAdminSession({ isAdminPage: true, isEn });

  const { clearGuests, clearWishes, deleteGuest, editGuest, deleteWish, editWish, toggleWishApproval, toggleCheckIn } = useDatabaseManager({
    guests, setGuests, wishes, setWishes, settings: adminDraft.settings, showAppAlert: null, showAppConfirm, showAppPrompt, setAdminSaveMessage, t, isEn
  });

  const { exportExcel, exportCsv, exportJson } = useExportData(isEn);

  const closeAdminPage = useCallback(() => navigate("/"), [navigate]);

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
        
        guests={guests} adminGuestSearch={adminGuestSearch} setAdminGuestSearch={setAdminGuestSearch}
        adminGuestAttendanceFilter={adminGuestAttendanceFilter} setAdminGuestAttendanceFilter={setAdminGuestAttendanceFilter}
        adminGuestSideFilter={adminGuestSideFilter} setAdminGuestSideFilter={setAdminGuestSideFilter} adminGuestChildFilter={adminGuestChildFilter}
        setAdminGuestChildFilter={setAdminGuestChildFilter} filteredGuests={filteredGuests} editGuest={editGuest} deleteGuest={deleteGuest}
        clearGuests={clearGuests} wishes={wishes} adminWishSearch={adminWishSearch} setAdminWishSearch={setAdminWishSearch}
        adminWishStatusFilter={adminWishStatusFilter} setAdminWishStatusFilter={setAdminWishStatusFilter} filteredWishes={filteredWishes}
        toggleWishApproval={toggleWishApproval} editWish={editWish} deleteWish={deleteWish} clearWishes={clearWishes}
        qrImageUrl={qrImageUrl} downloadQrCode={downloadQrCode} copyAdminLink={copyAdminLink} currentShareLink={currentShareLink}
        personalLinkName={personalLinkName} setPersonalLinkName={setPersonalLinkName} personalGuestLink={personalGuestLink}
        exportAllDataJson={() => exportJson({ siteData, guests, wishes }, "yedek.json")} dataImportText={dataImportText} setDataImportText={setDataImportText} 
        exportGuestsExcel={() => exportExcel(filteredGuests, "guests", "misafirler.xls")} exportGuestsCsv={() => exportCsv(filteredGuests, "guests", "misafirler.csv")} 
        exportWishesExcel={() => exportExcel(filteredWishes, "wishes", "mesajlar.xls")} exportWishesCsv={() => exportCsv(filteredWishes, "wishes", "mesajlar.csv")} 
        toggleCheckIn={toggleCheckIn} 
      />
    </Suspense>
  );
}