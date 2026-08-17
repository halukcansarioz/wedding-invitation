import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
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

  // HATA ÇÖZÜMÜ: Sadece path değil; Supabase token'ları ve eski #admin hash'lerini de yakalıyoruz
  const isAdminRoute = useMemo(() => {
    const path = location.pathname.toLowerCase();
    const hash = location.hash.toLowerCase();
    const search = location.search.toLowerCase();
    
    return path.startsWith("/admin") || 
           hash.includes("admin") || 
           search.includes("admin") || 
           hash.includes("access_token=") || 
           hash.includes("type=recovery") || 
           search.includes("reset=1");
  }, [location]);

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
        let databaseSettings = await loadSettingsFromDatabase();
        databaseSettings = databaseSettings ? normalizeSiteData(databaseSettings) : normalizeSiteData(null);
        localStorage.setItem(SITE_DATA_KEY, JSON.stringify(databaseSettings));
        
        setSiteData(databaseSettings);
        setAdminDraft(databaseSettings);
        setWishes(await loadPublishedWishesFromDatabase() || []);
        setGuests(await loadGuestsFromDatabase() || []);
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
        "--heroVideo": invitation.heroVideo ? `url(${invitation.heroVideo})` : "none",
      }}
    >
      <GlobalModals
        customAlert={customAlert} setCustomAlert={setCustomAlert}
        customConfirm={customConfirm} setCustomConfirm={setCustomConfirm}
        customPrompt={customPrompt} setCustomPrompt={setCustomPrompt} t={t}
      />
      
      {/* Şartlı render ile Supabase güvenlik akışını bozmuyoruz */}
      {isAdminRoute ? <AdminController /> : <InvitationController />}
    </div>
  );
}

export default App;