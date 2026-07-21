import React from "react";
import { useTranslation } from "react-i18next";

function AdminDashboard({
  isAdminUnlocked,
  isPasswordRecovery,
  showForgotPassword,
  adminEmail,
  adminPassword,
  recoveryPassword,
  recoveryPasswordAgain,
  recoveryLoading,
  recoveryMessage,
  forgotPasswordEmail,
  forgotPasswordLoading,
  forgotPasswordMessage,
  adminAuthLoading,
  adminLoginNotice,
  adminError,
  adminSaveMessage,
  activeAdminTab,
  activeTabInfo,
  adminTabs,
  setAdminEmail,
  setAdminPassword,
  setForgotPasswordEmail,
  setShowForgotPassword,
  setAdminError,
  setAdminLoginNotice,
  setRecoveryPassword,
  setRecoveryPasswordAgain,
  setRecoveryMessage,
  setForgotPasswordMessage,
  submitAdminPassword,
  completePasswordRecovery,
  sendPasswordResetEmail,
  openAdminTab,
  saveSiteContent,
  resetSiteContent,
  logoutAdmin,
  closeAdminPage,
  renderAdminActivePanel,
}) {
  const { i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');

  const toggleLanguage = () => {
    i18n.changeLanguage(isEn ? 'tr' : 'en');
  };

  // Sol menü sekmeleri için otomatik çeviri sözlüğü
  const translateTab = (id, field, fallback) => {
    if (!isEn) return fallback;
    const translations = {
      general: { label: "General", desc: "Main invitation details" },
      theme: { label: "Theme & Layout", desc: "Colors and visibility" },
      security: { label: "Security", desc: "Admin panel password" },
      messages: { label: "Messages", desc: "WhatsApp and greetings" },
      copy: { label: "Headings", desc: "Page titles and descriptions" },
      family: { label: "Family", desc: "Parents' information" },
      ceremony: { label: "Ceremony", desc: "Event locations and times" },
      schedule: { label: "Schedule", desc: "Wedding day timeline" },
      gallery: { label: "Gallery", desc: "Images and music" },
      guests: { label: "Guests", desc: "Manage RSVP list" },
      wishes: { label: "Guestbook", desc: "Manage guest messages" },
      qr: { label: "QR Code", desc: "Download and share QR" },
      personalLink: { label: "Personal Link", desc: "Special guest links" },
      data: { label: "Data & Backup", desc: "Export Excel/CSV & Backup" }
    };
    return translations[id]?.[field] || fallback;
  };

  return (
    <main className="admin-page">
      <section className="card admin-card admin-page-card admin-shell-card">
        <div className="admin-page-header">
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px', alignItems: 'center', marginBottom: '28px', paddingTop: '16px', width: '100%' }}>
            <div></div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button type="button" className="secondary-button admin-back-button" style={{ margin: 0 }} onClick={closeAdminPage}>
                {isEn ? "Back to Invitation" : "Davetiyeye Dön"}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="secondary-button" style={{ margin: 0, minHeight: '56px', padding: '0 24px' }} onClick={toggleLanguage}>
                {isEn ? "EN" : "TR"}
              </button>
            </div>
          </div>

          <p className="section-label">{isEn ? "Management" : "Yönetim"}</p>
          <h2>{isEn ? "Admin Panel" : "Admin Panel"}</h2>
          <p>
            {isEn 
              ? "You can select the section you want to edit from the left menu to access all settings quickly."
              : "Sol taraftan düzenlemek istediğiniz bölümü seçebilirsiniz. Böylece sayfanın en altındaki bölümlere tek tek kaydırmadan ulaşabilirsiniz."}
          </p>
        </div>

        {!isAdminUnlocked ? (
          isPasswordRecovery ? (
            <form className="admin-login admin-recovery-form" onSubmit={completePasswordRecovery}>
              <p className="admin-login-note">
                {isEn ? "Password reset link opened. Set your new admin password." : "Şifre sıfırlama linki açıldı. Yeni admin şifreni belirle."}
              </p>
              <input
                type="password"
                value={recoveryPassword}
                onChange={(e) => setRecoveryPassword(e.target.value)}
                placeholder={isEn ? "New password" : "Yeni şifre"}
              />
              <input
                type="password"
                value={recoveryPasswordAgain}
                onChange={(e) => setRecoveryPasswordAgain(e.target.value)}
                placeholder={isEn ? "New password again" : "Yeni şifre tekrar"}
              />
              <button className="main-button" type="submit" disabled={recoveryLoading}>
                {recoveryLoading ? (isEn ? "Saving..." : "Kaydediliyor...") : (isEn ? "Save New Password" : "Yeni Şifreyi Kaydet")}
              </button>
              {recoveryMessage && <span className="admin-login-message">{recoveryMessage}</span>}
            </form>
          ) : showForgotPassword ? (
            <form className="admin-login admin-forgot-form" onSubmit={sendPasswordResetEmail}>
              <p className="admin-login-note">
                {isEn ? "Enter your admin email. Supabase will send a reset link." : "Admin e-postanı yaz. Supabase sana şifre sıfırlama linki gönderecek."}
              </p>
              <input
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder={isEn ? "Admin email" : "Admin e-posta"}
              />
              <button className="main-button" type="submit" disabled={forgotPasswordLoading}>
                {forgotPasswordLoading ? (isEn ? "Sending..." : "Gönderiliyor...") : (isEn ? "Send Reset Link" : "Sıfırlama Linki Gönder")}
              </button>
              <button
                type="button"
                className="admin-link-button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordMessage("");
                }}
              >
                {isEn ? "Back to login" : "Giriş ekranına dön"}
              </button>
              {forgotPasswordMessage && <span className="admin-login-message">{forgotPasswordMessage}</span>}
            </form>
          ) : (
            <form className="admin-login" onSubmit={submitAdminPassword}>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder={isEn ? "Admin email" : "Admin e-posta"}
              />
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder={isEn ? "Admin password" : "Admin şifresi"}
              />
              <button className="main-button" type="submit" disabled={adminAuthLoading}>
                {adminAuthLoading ? (isEn ? "Checking..." : "Giriş kontrol ediliyor...") : (isEn ? "Login" : "Giriş Yap")}
              </button>
              <button
                type="button"
                className="admin-link-button"
                onClick={() => {
                  setForgotPasswordEmail(adminEmail);
                  setShowForgotPassword(true);
                  setAdminError("");
                  setAdminLoginNotice("");
                }}
              >
                {isEn ? "Forgot password?" : "Şifremi unuttum"}
              </button>
              {adminLoginNotice && <span className="admin-login-message success">{adminLoginNotice}</span>}
              {adminError && <span className="admin-login-message error">{adminError}</span>}
              <small className="admin-login-note">
                {isEn 
                  ? "Note: This system uses Supabase Auth. Use the email/password from your Supabase Authentication > Users section." 
                  : "Not: Bu sistem Supabase Auth kullanır. Supabase Authentication > Users bölümündeki admin e-posta/şifresiyle giriş yapılır."}
              </small>
            </form>
          )
        ) : (
          <div className="admin-layout">
            <aside className="admin-sidebar" aria-label="Admin bölüm menüsü">
              <div className="admin-sidebar-title">
                <span>{isEn ? "Sections" : "Bölümler"}</span>
                <small>{isEn ? "Select area to edit" : "Düzenlemek istediğin alanı seç"}</small>
              </div>
              <div></div>

              <div className="admin-sidebar-menu">
                {adminTabs.map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    className={activeAdminTab === tab.id ? "admin-nav-button active" : "admin-nav-button"}
                    onClick={() => openAdminTab(tab.id)}
                  >
                    <span>{translateTab(tab.id, "label", tab.label)}</span>
                    <small>{translateTab(tab.id, "desc", tab.description)}</small>
                  </button>
                ))}
              </div>
            </aside>

            <div className="admin-main-panel">
              <div className="admin-actions-sticky">
                <div className="admin-current-section">
                  <strong>{translateTab(activeTabInfo?.id, "label", activeTabInfo?.label)}</strong>
                  <span>{translateTab(activeTabInfo?.id, "desc", activeTabInfo?.description)}</span>
                </div>
                <button type="button" className="main-button" onClick={saveSiteContent}>
                  {isEn ? "Save Changes" : "Değişiklikleri Kaydet"}
                </button>
                <button type="button" className="secondary-button" onClick={resetSiteContent}>
                  {isEn ? "Reset Default" : "Varsayılana Döndür"}
                </button>
                <button type="button" className="secondary-button admin-logout-button" onClick={logoutAdmin}>
                  {isEn ? "Logout" : "Çıkış Yap"}
                </button>
                {adminSaveMessage && <span className="admin-save-message">{adminSaveMessage}</span>}
              </div>

              <div className="admin-editor admin-editor-single">
                {renderAdminActivePanel()}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;