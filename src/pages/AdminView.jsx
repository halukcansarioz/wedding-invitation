import React from "react";
import AdminDashboard from "../components/AdminDashboard";
import { renderAdminActivePanel } from "../components/admin/AdminTabPanels";

export default function AdminView(props) {
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

  const activeTabInfo = adminTabs.find((tab) => tab.id === props.activeAdminTab) || adminTabs[0];

  return (
    <AdminDashboard
      isAdminUnlocked={props.isAdminUnlocked}
      isPasswordRecovery={props.isPasswordRecovery}
      showForgotPassword={props.showForgotPassword}
      adminEmail={props.adminEmail}
      adminPassword={props.adminPassword}
      recoveryPassword={props.recoveryPassword}
      recoveryPasswordAgain={props.recoveryPasswordAgain}
      recoveryLoading={props.recoveryLoading}
      recoveryMessage={props.recoveryMessage}
      forgotPasswordEmail={props.forgotPasswordEmail}
      forgotPasswordLoading={props.forgotPasswordLoading}
      forgotPasswordMessage={props.forgotPasswordMessage}
      adminAuthLoading={props.adminAuthLoading}
      adminLoginNotice={props.adminLoginNotice}
      adminError={props.adminError}
      adminSaveMessage={props.adminSaveMessage}
      activeAdminTab={props.activeAdminTab}
      activeTabInfo={activeTabInfo}
      adminTabs={adminTabs}
      setAdminEmail={props.setAdminEmail}
      setAdminPassword={props.setAdminPassword}
      setForgotPasswordEmail={props.setForgotPasswordEmail}
      setShowForgotPassword={props.setShowForgotPassword}
      setAdminError={props.setAdminError}
      setAdminLoginNotice={props.setAdminLoginNotice}
      setRecoveryPassword={props.setRecoveryPassword}
      setRecoveryPasswordAgain={props.setRecoveryPasswordAgain}
      setRecoveryMessage={props.setRecoveryMessage}
      setForgotPasswordMessage={props.setForgotPasswordMessage}
      submitAdminPassword={props.submitAdminPassword}
      completePasswordRecovery={props.completePasswordRecovery}
      sendPasswordResetEmail={props.sendPasswordResetEmail}
      openAdminTab={props.openAdminTab}
      saveSiteContent={props.saveSiteContent}
      resetSiteContent={props.resetSiteContent}
      logoutAdmin={props.logoutAdmin}
      closeAdminPage={props.closeAdminPage}
      renderAdminActivePanel={() => renderAdminActivePanel(props)}
    />
  );
}