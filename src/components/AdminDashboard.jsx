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
  return (
    <main className="admin-page">
      <section className="card admin-card admin-page-card admin-shell-card">
        <div className="admin-page-header">
          <button type="button" className="secondary-button admin-back-button" onClick={closeAdminPage}>
            Davetiyeye Dön
          </button>

          <p className="section-label">Yönetim</p>
          <h2>Admin Panel</h2>
          <p>
            Sol taraftan düzenlemek istediğiniz bölümü seçebilirsiniz. Böylece sayfanın en altındaki bölümlere tek tek kaydırmadan ulaşabilirsiniz.
          </p>
        </div>

        {!isAdminUnlocked ? (
          isPasswordRecovery ? (
            <form className="admin-login admin-recovery-form" onSubmit={completePasswordRecovery}>
              <p className="admin-login-note">
                Şifre sıfırlama linki açıldı. Yeni admin şifreni belirle.
              </p>
              <input
                type="password"
                value={recoveryPassword}
                onChange={(e) => setRecoveryPassword(e.target.value)}
                placeholder="Yeni şifre"
              />
              <input
                type="password"
                value={recoveryPasswordAgain}
                onChange={(e) => setRecoveryPasswordAgain(e.target.value)}
                placeholder="Yeni şifre tekrar"
              />
              <button className="main-button" type="submit" disabled={recoveryLoading}>
                {recoveryLoading ? "Kaydediliyor..." : "Yeni Şifreyi Kaydet"}
              </button>
              {recoveryMessage && <span className="admin-login-message">{recoveryMessage}</span>}
            </form>
          ) : showForgotPassword ? (
            <form className="admin-login admin-forgot-form" onSubmit={sendPasswordResetEmail}>
              <p className="admin-login-note">
                Admin e-postanı yaz. Supabase sana şifre sıfırlama linki gönderecek.
              </p>
              <input
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="Admin e-posta"
              />
              <button className="main-button" type="submit" disabled={forgotPasswordLoading}>
                {forgotPasswordLoading ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
              </button>
              <button
                type="button"
                className="admin-link-button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordMessage("");
                }}
              >
                Giriş ekranına dön
              </button>
              {forgotPasswordMessage && <span className="admin-login-message">{forgotPasswordMessage}</span>}
            </form>
          ) : (
            <form className="admin-login" onSubmit={submitAdminPassword}>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="Admin e-posta"
              />
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Admin şifresi"
              />
              <button className="main-button" type="submit" disabled={adminAuthLoading}>
                {adminAuthLoading ? "Giriş kontrol ediliyor..." : "Giriş Yap"}
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
                Şifremi unuttum
              </button>
              {adminLoginNotice && <span className="admin-login-message success">{adminLoginNotice}</span>}
              {adminError && <span className="admin-login-message error">{adminError}</span>}
              <small className="admin-login-note">
                Not: Bu sistem Supabase Auth kullanır. Eski 1234 şifresiyle değil, Supabase Authentication &gt; Users bölümündeki admin e-posta/şifresiyle giriş yapılır. Failed to fetch görürsen .env.local içindeki Supabase URL / anon key değerlerini ve sunucuyu yeniden başlattığını kontrol et.
              </small>
            </form>
          )
        ) : (
          <div className="admin-layout">
            <aside className="admin-sidebar" aria-label="Admin bölüm menüsü">
              <div className="admin-sidebar-title">
                <span>Bölümler</span>
                <small>Düzenlemek istediğin alanı seç</small>
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
                    <span>{tab.label}</span>
                    <small>{tab.description}</small>
                  </button>
                ))}
              </div>
            </aside>

            <div className="admin-main-panel">
              <div className="admin-actions-sticky">
                <div className="admin-current-section">
                  <strong>{activeTabInfo.label}</strong>
                  <span>{activeTabInfo.description}</span>
                </div>
                <button type="button" className="main-button" onClick={saveSiteContent}>
                  Değişiklikleri Kaydet
                </button>
                <button type="button" className="secondary-button" onClick={resetSiteContent}>
                  Varsayılana Döndür
                </button>
                <button type="button" className="secondary-button admin-logout-button" onClick={logoutAdmin}>
                  Çıkış Yap
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
