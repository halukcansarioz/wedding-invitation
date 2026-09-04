import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AdminLogin } from "./admin/auth/AdminLogin";

function AdminDashboard(props) {
  const { i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');

  const {
    isAdminUnlocked, closeAdminPage, toggleMusic, isMusicPlaying,
    activeAdminTab, activeTabInfo, adminTabs, openAdminTab,
    saveSiteContent, resetSiteContent, logoutAdmin, adminSaveMessage,
    renderAdminActivePanel
  } = props;

  const toggleLanguage = () => i18n.changeLanguage(isEn ? 'tr' : 'en');

  const enhancedAdminTabs = useMemo(() => {
    const tabs = [];
    (adminTabs || []).forEach(tab => {
      tabs.push(tab);
      if (tab.id === "theme") {
        tabs.push({ id: "visibility", label: isEn ? "Section Visibility" : "Bölüm Görünürlüğü", description: isEn ? "Toggle sections on page" : "Sayfadaki alanları aç/kapat" });
        tabs.push({ id: "gift", label: isEn ? "IBAN & Gift" : "IBAN & Hediye", description: isEn ? "Account and bank details" : "Hesap ve banka bilgileri" });
      }
    });
    return tabs;
  }, [adminTabs, isEn]);

  const currentTabInfo = activeTabInfo || enhancedAdminTabs.find(t => t.id === activeAdminTab);

  return (
    <main className="admin-page">
      <section className="card admin-card admin-page-card admin-shell-card">
        <div className="admin-page-header">
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px', alignItems: 'center', marginBottom: '28px', paddingTop: '24px', width: '100%' }}>
            <div />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button type="button" className="secondary-button admin-back-button" style={{ margin: 0 }} onClick={closeAdminPage}>
                {isEn ? "Back to Invitation 🏠" : "Davetiyeye Dön 🏠"}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                <button type="button" className="secondary-button" style={{ margin: 0, minHeight: '48px', padding: '0 24px' }} onClick={toggleLanguage}>
                  {isEn ? "EN" : "TR"}
                </button>
                {toggleMusic && (
                  <button
                    type="button"
                    className="secondary-button"
                    style={{ margin: 0, width: '48px', height: '48px', minHeight: '48px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
                    onClick={toggleMusic}
                    title={isMusicPlaying ? (isEn ? "Mute Music" : "Müziği Kapat") : (isEn ? "Play Music" : "Müziği Aç")}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                )}
              </div>
            </div>
          </div>
          <p className="section-label">{isEn ? "Management" : "Yönetim"}</p>
          <h2>{isEn ? "Admin Panel" : "Admin Panel"}</h2>
        </div>

        {!isAdminUnlocked ? (
          <AdminLogin {...props} isEn={isEn} />
        ) : (
          <div className="admin-layout">
            <aside className="admin-sidebar">
              <div className="admin-sidebar-title">
                <span>{isEn ? "Sections" : "Bölümler"}</span>
                <small>{isEn ? "Select area to edit" : "Düzenlemek istediğin alanı seç"}</small>
              </div>
              <div className="admin-sidebar-menu">
                {enhancedAdminTabs.map((tab) => (
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
                <div className="admin-actions-top-row">
                  <div className="admin-current-section">
                    <strong>{currentTabInfo?.label}</strong>
                    <span>{currentTabInfo?.description}</span>
                  </div>
                  
                  <div className="admin-actions-btn-group">
                    <button type="button" className="main-button" onClick={saveSiteContent}>
                      {isEn ? "Save Changes 💾" : "Değişiklikleri Kaydet 💾"}
                    </button>
                    <button type="button" className="secondary-button" onClick={resetSiteContent}>
                      {isEn ? "Reset Default 🔄" : "Varsayılana Döndür 🔄"}
                    </button>
                    <button type="button" className="secondary-button admin-logout-button" onClick={logoutAdmin}>
                      {isEn ? "Logout 🚪" : "Çıkış Yap 🚪"}
                    </button>
                  </div>
                </div>
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

export default React.memo(AdminDashboard);