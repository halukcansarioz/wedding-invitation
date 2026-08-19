import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUIContext, useSiteContext, useAdminContext } from "./context/Providers";
import { GlobalModals } from "./components/common/GlobalModals";
import InvitationController from "./pages/InvitationController";
import AdminController from "./pages/AdminController";
import { getFaviconUrl, normalizeSiteData } from "./utils/helpers";
import { isSupabaseReady, loadSettingsFromDatabase, loadGuestsFromDatabase, loadPublishedWishesFromDatabase } from "./services/database";
import { SITE_DATA_KEY } from "./config/constants";
import "./styles/index.css";

function App() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  
  const { customAlert, setCustomAlert, customConfirm, setCustomConfirm, customPrompt, setCustomPrompt } = useUIContext();
  const { siteData, setSiteData, setWishes, setGuests } = useSiteContext();
  const { setAdminDraft } = useAdminContext();
  const location = useLocation();
  
  const activeTheme = siteData.settings?.theme || "lavanta";
  const invitation = siteData.invitation;

  // Supabase şifre sıfırlama token'larını yakalamak için güvenli kontrol
  const isAuthRecovery = location.hash.includes("access_token=") || location.hash.includes("type=recovery");

  useEffect(() => {
    document.documentElement.lang = isEn ? "en" : "tr";
    document.documentElement.dataset.theme = activeTheme;
    const favicon = document.querySelector("link[rel='icon']") || document.createElement("link");
    favicon.rel = "icon"; 
    favicon.type = "image/svg+xml"; 
    favicon.href = getFaviconUrl(activeTheme);
    if (!favicon.parentNode) document.head.appendChild(favicon);
  }, [isEn, activeTheme]);

  useEffect(() => {
    document.title = `${invitation.bride} & ${invitation.groom} | ${isEn ? "Wedding Invitation" : "Düğün Davetiyesi"}`;
  }, [invitation.bride, invitation.groom, isEn]);

  useEffect(() => {
    async function initDatabaseData() {
      if (!isSupabaseReady()) return;
      try {
        // PERFORMANS OPTİMİZASYONU: Ağ istekleri sırayla değil, Promise.all ile paralel yapılıyor
        const [dbSettings, dbWishes, dbGuests] = await Promise.all([
          loadSettingsFromDatabase(),
          loadPublishedWishesFromDatabase(),
          loadGuestsFromDatabase()
        ]);

        const normalizedSettings = dbSettings ? normalizeSiteData(dbSettings) : normalizeSiteData(null);
        localStorage.setItem(SITE_DATA_KEY, JSON.stringify(normalizedSettings));
        
        setSiteData(normalizedSettings);
        setAdminDraft(normalizedSettings);
        setWishes(dbWishes || []);
        setGuests(dbGuests || []);
      } catch (error) {
        console.error("Veritabanından veriler okunamadı:", error);
      }
    }
    initDatabaseData();
  }, [setSiteData, setAdminDraft, setWishes, setGuests]);

  return (
    <div 
      className="app" 
      lang={isEn ? "en" : "tr"} 
      data-theme={activeTheme}
      style={{
        "--intro-image": `url(${invitation.introImage})`,
        "--hero-image": `url(${invitation.heroImage})`,
        "--heroVideo": invitation.heroVideo ? `url(${invitation.heroVideo})` : "none",
      }}
    >
      <GlobalModals
        customAlert={customAlert} setCustomAlert={setCustomAlert}
        customConfirm={customConfirm} setCustomConfirm={setCustomConfirm}
        customPrompt={customPrompt} setCustomPrompt={setCustomPrompt} t={t}
      />
      
      <Routes>
        <Route path="/" element={isAuthRecovery ? <AdminController /> : <InvitationController />} />
        <Route path="/admin/*" element={<AdminController />} />
      </Routes>
    </div>
  );
}

export default App;