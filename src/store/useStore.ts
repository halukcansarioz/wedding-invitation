import { create } from 'zustand';
import { loadStoredSiteData, normalizeSiteData } from '../utils/helpers';
import toast from 'react-hot-toast';
import { saveSettingsToDatabase } from '../services/database';
import { useAdminStore } from './useAdminStore';
import { SiteData, Guest, Wish } from '../types';

interface CustomAlertOptions {
  title?: string;
  multiline?: boolean;
  confirmText?: string;
  tone?: 'warning' | 'danger' | 'success' | 'info';
}

interface CustomModalState {
  title: string;
  message?: string;
  label?: string;
  value?: string;
  multiline?: boolean;
  resolve: (val: any) => void;
}

interface MainStoreState {
  // UI Slice
  opened: boolean;
  setOpened: (opened: boolean) => void;
  isOpening: boolean;
  setIsOpening: (isOpening: boolean) => void;
  customAlert: CustomModalState | null;
  setCustomAlert: (alert: CustomModalState | null) => void;
  showAppAlert: (message: string, options?: CustomAlertOptions) => Promise<boolean>;
  customConfirm: CustomModalState | null;
  setCustomConfirm: (confirm: CustomModalState | null) => void;
  showAppConfirm: (message: string, options?: CustomAlertOptions) => Promise<boolean>;
  customPrompt: CustomModalState | null;
  setCustomPrompt: (prompt: CustomModalState | null) => void;
  showAppPrompt: (label: string, defaultValue?: string, options?: CustomAlertOptions) => Promise<string | null>;

  // Data Slice
  siteData: SiteData;
  setSiteData: (data: SiteData) => void;
  guests: Guest[];
  setGuests: (guests: Guest[]) => void;
  wishes: Wish[];
  setWishes: (wishes: Wish[]) => void;

  // Admin Draft Slice
  adminDraft: SiteData;
  setAdminDraft: (draftOrUpdater: SiteData | ((prev: SiteData) => SiteData)) => void;
  activeAdminTab: string;
  setActiveAdminTab: (tab: string) => void;
  personalLinkName: string;
  setPersonalLinkName: (name: string) => void;
  dataImportText: string;
  setDataImportText: (text: string) => void;
  updateDraftObject: <K extends keyof SiteData>(group: K, key: string, value: any) => void;
  updateDraftArrayItem: <K extends keyof SiteData>(arrayKey: K, index: number, key: string, value: any) => void;
  addDraftArrayItem: <K extends keyof SiteData>(arrayKey: K, item: any) => void;
  removeDraftArrayItem: <K extends keyof SiteData>(arrayKey: K, index: number) => void;
  moveDraftArrayItem: <K extends keyof SiteData>(arrayKey: K, index: number, direction: number) => void;
  saveSiteContent: (isEn: boolean) => Promise<void>;
}

export const useStore = create<MainStoreState>((set, get) => ({
  // UI Slice Implementation
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

  // Data Slice Implementation
  siteData: loadStoredSiteData() as SiteData,
  setSiteData: (data) => set({ siteData: data }),
  guests: [],
  setGuests: (guests) => set({ guests }),
  wishes: [],
  setWishes: (wishes) => set({ wishes }),

  // Admin Draft Slice Implementation
  adminDraft: loadStoredSiteData() as SiteData,
  setAdminDraft: (draftOrUpdater) => set((state) => ({
    adminDraft: typeof draftOrUpdater === 'function' ? draftOrUpdater(state.adminDraft) : draftOrUpdater
  })),
  activeAdminTab: "general",
  setActiveAdminTab: (tab) => set({ activeAdminTab: tab }),
  personalLinkName: "",
  setPersonalLinkName: (name) => set({ personalLinkName: name }),
  dataImportText: "",
  setDataImportText: (text) => set({ dataImportText: text }),

  updateDraftObject: (group, key, value) => set((state) => ({
    adminDraft: {
      ...state.adminDraft,
      [group]: {
        ...(state.adminDraft[group] as Record<string, any>),
        [key]: value
      }
    }
  })),

  updateDraftArrayItem: (arrayKey, index, key, value) => set((state) => {
    const arrayTarget = (state.adminDraft[arrayKey] || []) as any[];
    return {
      adminDraft: {
        ...state.adminDraft,
        [arrayKey]: arrayTarget.map((item, i) => i === index ? { ...item, [key]: value } : item)
      }
    };
  }),

  addDraftArrayItem: (arrayKey, item) => set((state) => {
    const arrayTarget = (state.adminDraft[arrayKey] || []) as any[];
    return {
      adminDraft: {
        ...state.adminDraft,
        [arrayKey]: [...arrayTarget, item]
      }
    };
  }),

  removeDraftArrayItem: (arrayKey, index) => set((state) => {
    const arrayTarget = (state.adminDraft[arrayKey] || []) as any[];
    return {
      adminDraft: {
        ...state.adminDraft,
        [arrayKey]: arrayTarget.filter((_, i) => i !== index)
      }
    };
  }),

  moveDraftArrayItem: (arrayKey, index, direction) => set((state) => {
    const newArray = [...((state.adminDraft[arrayKey] || []) as any[])];
    if (index + direction < 0 || index + direction >= newArray.length) return state;
    const temp = newArray[index];
    newArray[index] = newArray[index + direction];
    newArray[index + direction] = temp;
    return {
      adminDraft: {
        ...state.adminDraft,
        [arrayKey]: newArray
      }
    };
  }),

  saveSiteContent: async (isEn) => {
    const { adminDraft, setSiteData, setAdminDraft } = get();
    const { setAdminSaveMessage } = useAdminStore.getState();
    const cleanedData = normalizeSiteData({ 
      ...adminDraft, 
      invitation: { 
        ...adminDraft.invitation, 
        gallery: ((adminDraft.invitation.gallery as string[]) || []).map((img) => String(img || "").trim()).filter(Boolean) 
      } 
    }) as SiteData;
    
    try {
      await saveSettingsToDatabase(cleanedData);
      localStorage.setItem("wedding-site-data", JSON.stringify(cleanedData));
      setSiteData(cleanedData); 
      setAdminDraft(cleanedData);
      setAdminSaveMessage(isEn ? "Saved successfully." : "Başarıyla kaydedildi.");
      setTimeout(() => setAdminSaveMessage(""), 3000);
    } catch (error) {
      setAdminSaveMessage(isEn ? `Could not save changes.` : `Değişiklikler kaydedilemedi.`);
    }
  }
}));