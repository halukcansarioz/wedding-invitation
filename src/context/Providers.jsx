import React, { createContext, useContext, useState, useCallback } from 'react';
import { loadStoredSiteData } from '../utils/helpers';
import { INITIAL_GUEST_FORM, INITIAL_WISH_FORM } from '../config/constants';

// 3 Ayrı Context: Performans (gereksiz re-render) optimizasyonu için parçalandı.
export const SiteContext = createContext();
export const UIContext = createContext();
export const AdminContext = createContext();

export const Providers = ({ children }) => {
  // 1. SİTE VERİLERİ (Global site içeriği, davetliler ve mesajlar)
  const [siteData, setSiteData] = useState(() => loadStoredSiteData());
  const [guests, setGuests] = useState([]);
  const [wishes, setWishes] = useState([]);

  // 2. UI VE FORM VERİLERİ (Modallar, zarf açılışı ve kullanıcı formları)
  const [opened, setOpened] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [guestForm, setGuestForm] = useState(INITIAL_GUEST_FORM);
  const [wishForm, setWishForm] = useState(INITIAL_WISH_FORM);

  const [customAlert, setCustomAlert] = useState(null);
  const [customConfirm, setCustomConfirm] = useState(null);
  const [customPrompt, setCustomPrompt] = useState(null);

  // Modal fonksiyonlarını global state'te tanımlıyoruz ki her Controller rahatça erişebilsin
  const showAppAlert = useCallback((message, options = {}) => {
    return new Promise((resolve) => setCustomAlert({ message, title: options.title || "Bilgi ℹ️", resolve }));
  }, []);

  const showAppConfirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => setCustomConfirm({ message, title: options.title || "Onay 🤔", resolve }));
  }, []);

  const showAppPrompt = useCallback((label, defaultValue = "", options = {}) => {
    return new Promise((resolve) => setCustomPrompt({ label, value: defaultValue, title: options.title || "Düzenle ✏️", resolve, multiline: options.multiline }));
  }, []);

  // 3. ADMIN VERİLERİ (Sadece panelde kullanılacak geçici taslak ve navigasyon stateleri)
  const [adminDraft, setAdminDraft] = useState(() => loadStoredSiteData());
  const [activeAdminTab, setActiveAdminTab] = useState("general");
  const [personalLinkName, setPersonalLinkName] = useState("");
  const [dataImportText, setDataImportText] = useState("");

  return (
    <SiteContext.Provider value={{ siteData, setSiteData, guests, setGuests, wishes, setWishes }}>
      <UIContext.Provider value={{
        opened, setOpened, isOpening, setIsOpening, guestForm, setGuestForm, wishForm, setWishForm,
        customAlert, setCustomAlert, customConfirm, setCustomConfirm, customPrompt, setCustomPrompt,
        showAppAlert, showAppConfirm, showAppPrompt
      }}>
        <AdminContext.Provider value={{ adminDraft, setAdminDraft, activeAdminTab, setActiveAdminTab, personalLinkName, setPersonalLinkName, dataImportText, setDataImportText }}>
          {children}
        </AdminContext.Provider>
      </UIContext.Provider>
    </SiteContext.Provider>
  );
};

export const useSiteContext = () => useContext(SiteContext);
export const useUIContext = () => useContext(UIContext);
export const useAdminContext = () => useContext(AdminContext);