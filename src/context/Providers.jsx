import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { loadStoredSiteData } from '../utils/helpers';

export const SiteContext = createContext();
export const UIContext = createContext();
export const AdminContext = createContext();

export const Providers = ({ children }) => {
  const [siteData, setSiteData] = useState(() => loadStoredSiteData());
  const [guests, setGuests] = useState([]);
  const [wishes, setWishes] = useState([]);

  const [opened, setOpened] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const [customAlert, setCustomAlert] = useState(null);
  const [customConfirm, setCustomConfirm] = useState(null);
  const [customPrompt, setCustomPrompt] = useState(null);

  const showAppAlert = useCallback((message, options = {}) => {
    return new Promise((resolve) => setCustomAlert({ message, title: options.title || "Bilgi ℹ️", resolve }));
  }, []);

  const showAppConfirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => setCustomConfirm({ message, title: options.title || "Onay 🤔", resolve }));
  }, []);

  const showAppPrompt = useCallback((label, defaultValue = "", options = {}) => {
    return new Promise((resolve) => setCustomPrompt({ label, value: defaultValue, title: options.title || "Düzenle ✏️", resolve, multiline: options.multiline }));
  }, []);

  const [adminDraft, setAdminDraft] = useState(() => loadStoredSiteData());
  const [activeAdminTab, setActiveAdminTab] = useState("general");
  const [personalLinkName, setPersonalLinkName] = useState("");
  const [dataImportText, setDataImportText] = useState("");

  const siteContextValue = useMemo(() => ({ 
    siteData, setSiteData, guests, setGuests, wishes, setWishes 
  }), [siteData, guests, wishes]);

  const uiContextValue = useMemo(() => ({
    opened, setOpened, isOpening, setIsOpening,
    customAlert, setCustomAlert, customConfirm, setCustomConfirm, customPrompt, setCustomPrompt,
    showAppAlert, showAppConfirm, showAppPrompt
  }), [opened, isOpening, customAlert, customConfirm, customPrompt, showAppAlert, showAppConfirm, showAppPrompt]);

  const adminContextValue = useMemo(() => ({
    adminDraft, setAdminDraft, activeAdminTab, setActiveAdminTab, personalLinkName, setPersonalLinkName, dataImportText, setDataImportText
  }), [adminDraft, activeAdminTab, personalLinkName, dataImportText]);

  return (
    <SiteContext.Provider value={siteContextValue}>
      <UIContext.Provider value={uiContextValue}>
        <AdminContext.Provider value={adminContextValue}>
          {children}
        </AdminContext.Provider>
      </UIContext.Provider>
    </SiteContext.Provider>
  );
};

export const useSiteContext = () => useContext(SiteContext);
export const useUIContext = () => useContext(UIContext);
export const useAdminContext = () => useContext(AdminContext);