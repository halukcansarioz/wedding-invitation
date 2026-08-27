import { create } from 'zustand';
import { loadStoredSiteData } from '../utils/helpers';

export const useStore = create((set) => ({
  // --- SİTE VERİLERİ (SiteContext Yerine) ---
  siteData: loadStoredSiteData(),
  setSiteData: (data) => set({ siteData: data }),
  guests: [],
  setGuests: (guests) => set({ guests }),
  wishes: [],
  setWishes: (wishes) => set({ wishes }),

  // --- ARAYÜZ KONTROLLERİ (UIContext Yerine) ---
  opened: false,
  setOpened: (opened) => set({ opened }),
  isOpening: false,
  setIsOpening: (isOpening) => set({ isOpening }),
  
  customAlert: null,
  setCustomAlert: (alert) => set({ customAlert: alert }),
  showAppAlert: (message, options = {}) => new Promise((resolve) => {
    set({ customAlert: { message, title: options.title || "Bilgi ℹ️", resolve } });
  }),
  
  customConfirm: null,
  setCustomConfirm: (confirm) => set({ customConfirm: confirm }),
  showAppConfirm: (message, options = {}) => new Promise((resolve) => {
    set({ customConfirm: { message, title: options.title || "Onay 🤔", resolve } });
  }),

  customPrompt: null,
  setCustomPrompt: (prompt) => set({ customPrompt: prompt }),
  showAppPrompt: (label, defaultValue = "", options = {}) => new Promise((resolve) => {
    set({ customPrompt: { label, value: defaultValue, title: options.title || "Düzenle ✏️", resolve, multiline: options.multiline } });
  }),

  // --- ADMİN PANELİ (AdminContext Yerine) ---
  adminDraft: loadStoredSiteData(),
  setAdminDraft: (draftOrUpdater) => set((state) => ({
    adminDraft: typeof draftOrUpdater === 'function' ? draftOrUpdater(state.adminDraft) : draftOrUpdater
  })),
  activeAdminTab: "general",
  setActiveAdminTab: (tab) => set({ activeAdminTab: tab }),
  personalLinkName: "",
  setPersonalLinkName: (name) => set({ personalLinkName: name }),
  dataImportText: "",
  setDataImportText: (text) => set({ dataImportText: text })
}));