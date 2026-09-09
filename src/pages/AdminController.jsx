import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import useAdminSession from '../hooks/useAdminSession';
import { useDatabaseManager } from '../hooks/useDatabaseManager';
import { useExportData } from '../hooks/useExportData';
import { normalizeText, buildPersonalLink, getQrImageUrl } from '../utils/helpers';

const AdminView = lazy(() => import('./AdminView'));

export default function AdminController() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en') || false;
  const navigate = useNavigate();

  // Zustand
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
  const adminSaveMessage = useStore((state) => state.adminSaveMessage);
  const setAdminSaveMessage = useStore((state) => state.setAdminSaveMessage);

  // State Management
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

  const [adminGuestSearch, setAdminGuestSearch] = useState("");
  const [adminGuestAttendanceFilter, setAdminGuestAttendanceFilter] = useState("all");
  const [adminGuestSideFilter, setAdminGuestSideFilter] = useState("all");
  const [adminGuestChildFilter, setAdminGuestChildFilter] = useState("all");
  const [adminWishSearch, setAdminWishSearch] = useState("");
  const [adminWishStatusFilter, setAdminWishStatusFilter] = useState("all");

  const currentShareLink = useMemo(() => adminDraft.invitation.shareLink || window.location.origin, [adminDraft.invitation.shareLink]);
  const qrImageUrl = useMemo(() => getQrImageUrl(currentShareLink), [currentShareLink]);
  const personalGuestLink = useMemo(() => buildPersonalLink(currentShareLink, personalLinkName), [currentShareLink, personalLinkName]);

  const { submitAdminPassword, sendPasswordResetEmail, completePasswordRecovery, changeAdminPassword, logoutAdmin } = useAdminSession({
    isAdminPage: true, adminEmail, adminPassword, adminUser, adminCurrentPassword, adminNewPassword, adminNewPasswordAgain,
    recoveryPassword, recoveryPasswordAgain, siteData, isAdminUnlocked, setAdminEmail, setAdminPassword, setAdminUser,
    setIsAdminUnlocked, setAdminError, setAdminLoginNotice, setShowForgotPassword, setForgotPasswordEmail,
    setForgotPasswordMessage, setAdminPasswordMessage, setAdminSaveMessage, setAdminCurrentPassword, setAdminNewPassword,
    setAdminNewPasswordAgain, setRecoveryPassword, setRecoveryPasswordAgain, setRecoveryMessage, setRecoveryLoading,
    setForgotPasswordLoading, setAdminAuthLoading, setIsPasswordRecovery, setActiveAdminTab, setSiteData, setAdminDraft,
    setGuests, setWishes, showAppConfirm, isEn
  });

  const { clearGuests, clearWishes, deleteGuest, editGuest, deleteWish, editWish, toggleWishApproval, toggleCheckIn } = useDatabaseManager({
    guests, setGuests, wishes, setWishes, settings: adminDraft.settings, showAppAlert: null, showAppConfirm, showAppPrompt, setAdminSaveMessage, t, isEn
  });

  const { exportExcel, exportCsv, exportJson } = useExportData(isEn);

  const closeAdminPage = useCallback(() => navigate("/"), [navigate]);
  const openAdminTab = useCallback((tabId) => setActiveAdminTab(tabId), [setActiveAdminTab]);

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
        isAdminUnlocked={isAdminUnlocked} isPasswordRecovery={isPasswordRecovery} showForgotPassword={showForgotPassword}
        adminEmail={adminEmail} adminPassword={adminPassword} recoveryPassword={recoveryPassword} recoveryPasswordAgain={recoveryPasswordAgain}
        recoveryLoading={recoveryLoading} recoveryMessage={recoveryMessage} forgotPasswordEmail={forgotPasswordEmail}
        forgotPasswordLoading={forgotPasswordLoading} forgotPasswordMessage={forgotPasswordMessage} adminAuthLoading={adminAuthLoading}
        adminLoginNotice={adminLoginNotice} adminError={adminError} adminSaveMessage={adminSaveMessage} activeAdminTab={activeAdminTab}
        setAdminEmail={setAdminEmail} setAdminPassword={setAdminPassword} setForgotPasswordEmail={setForgotPasswordEmail}
        setShowForgotPassword={setShowForgotPassword} setAdminError={setAdminError} setAdminLoginNotice={setAdminLoginNotice}
        setRecoveryPassword={setRecoveryPassword} setRecoveryPasswordAgain={setRecoveryPasswordAgain} setRecoveryMessage={setRecoveryMessage}
        setForgotPasswordMessage={setForgotPasswordMessage} submitAdminPassword={submitAdminPassword} completePasswordRecovery={completePasswordRecovery}
        sendPasswordResetEmail={sendPasswordResetEmail} openAdminTab={openAdminTab} logoutAdmin={logoutAdmin} closeAdminPage={closeAdminPage} 
        changeAdminPassword={changeAdminPassword} adminCurrentPassword={adminCurrentPassword} setAdminCurrentPassword={setAdminCurrentPassword} 
        adminNewPassword={adminNewPassword} setAdminNewPassword={setAdminNewPassword} adminNewPasswordAgain={adminNewPasswordAgain} 
        setAdminNewPasswordAgain={setAdminNewPasswordAgain} adminPasswordMessage={adminPasswordMessage}
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