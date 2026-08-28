import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStore } from "./store/useStore"; 
import { GlobalModals } from "./components/common/GlobalModals";
import InvitationController from "./pages/InvitationController";
import AdminController from "./pages/AdminController";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { getFaviconUrl, normalizeSiteData } from "./utils/helpers";
import { isSupabaseReady, loadSettingsFromDatabase, loadGuestsFromDatabase, loadPublishedWishesFromDatabase } from "./services/database";
import { SITE_DATA_KEY } from "./config/constants";
import "./styles/index.css";

// YENİ EKLENEN İMPORT
import { LazyMotion, domAnimation } from "framer-motion";

function App() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  
  const customAlert = useStore((state) => state.customAlert);
  const setCustomAlert = useStore((state) => state.setCustomAlert);
  const customConfirm = useStore((state) => state.customConfirm);
  const setCustomConfirm = useStore((state) => state.setCustomConfirm);
  const customPrompt = useStore((state) => state.customPrompt);
  const setCustomPrompt = useStore((state) => state.setCustomPrompt);
  const siteData = useStore((state) => state.siteData);
  const setSiteData = useStore((state) => state.setSiteData);
  const setWishes = useStore((state) => state.setWishes);
  const setGuests = useStore((state) => state.setGuests);
  const setAdminDraft = useStore((state) => state.setAdminDraft);

  const location = useLocation();
  const activeTheme = siteData.settings?.theme || "lavanta";
  const invitation = siteData.invitation;
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
    async function initDatabaseData() {
      if (!isSupabaseReady()) return;
      try {
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
    <LazyMotion features={domAnimation} strict>
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
          <Route path="/" element={
            <ErrorBoundary>
              {isAuthRecovery ? <AdminController /> : <InvitationController />}
            </ErrorBoundary>
          } />
          <Route path="/admin/*" element={
            <ErrorBoundary>
              <AdminController />
            </ErrorBoundary>
          } />
        </Routes>
      </div>
    </LazyMotion>
  );
}

export default App;