import { create } from 'zustand';
import { loadStoredSiteData } from '../utils/helpers';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';

export const useStore = create((set, get) => ({
  siteData: loadStoredSiteData(),
  setSiteData: (data) => set({ siteData: data }),
  guests: [],
  setGuests: (guests) => set({ guests }),
  wishes: [],
  setWishes: (wishes) => set({ wishes }),

  opened: false,
  setOpened: (opened) => set({ opened }),
  isOpening: false,
  setIsOpening: (isOpening) => set({ isOpening }),

  customAlert: null,
  setCustomAlert: (alert) => set({ customAlert: alert }),
  showAppAlert: (message, options = {}) => new Promise((resolve) => {
    const isError = options.title?.includes("Hata") || options.title?.includes("Error") || message.includes("hata");
    if (isError) toast.error(message);
    else toast.success(message);
    resolve(true);
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

  adminDraft: loadStoredSiteData(),
  setAdminDraft: (draftOrUpdater) => set((state) => ({
    adminDraft: typeof draftOrUpdater === 'function' ? draftOrUpdater(state.adminDraft) : draftOrUpdater
  })),
  activeAdminTab: "general",
  setActiveAdminTab: (tab) => set({ activeAdminTab: tab }),
  personalLinkName: "",
  setPersonalLinkName: (name) => set({ personalLinkName: name }),
  dataImportText: "",
  setDataImportText: (text) => set({ dataImportText: text }),
}));

export const useContentStore = create((set, get) => ({
  currentLang: 'tr',
  content: loadStoredSiteData(),
  
  setLang: async (lang) => {
    set({ currentLang: lang });
    await get().fetchContent(lang);
  },

  fetchContent: async (lang) => {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('lang_code', lang)
      .single();

    if (!error && data) {
      set({ content: data });
    }
  }
}));