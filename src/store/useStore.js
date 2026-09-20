import { create } from 'zustand';
import { loadStoredSiteData, normalizeSiteData } from '../utils/helpers';
import toast from 'react-hot-toast';
import { saveSettingsToDatabase } from '../services/database';
import { useAdminStore } from './useAdminStore';

// --- 1. UI (ARAYÜZ) MODÜLÜ ---
// Modallar, uyarılar ve ekran açılış durumlarını yönetir.
const createUISlice = (set) => ({
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
});

// --- 2. DATA (VERİ) MODÜLÜ ---
// Misafir listesi, anı defteri ve canlı sitenin içerik verilerini yönetir.
const createDataSlice = (set) => ({
  siteData: loadStoredSiteData(),
  setSiteData: (data) => set({ siteData: data }),
  guests: [],
  setGuests: (guests) => set({ guests }),
  wishes: [],
  setWishes: (wishes) => set({ wishes }),
});

// --- 3. ADMIN DRAFT (TASLAK) MODÜLÜ ---
// Yönetici panelindeki henüz kaydedilmemiş değişiklikleri ve sekmeleri yönetir.
const createAdminDraftSlice = (set, get) => ({
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

  updateDraftObject: (group, key, value) => set((state) => ({
    adminDraft: {
      ...state.adminDraft,
      [group]: {
        ...state.adminDraft[group],
        [key]: value
      }
    }
  })),

  updateDraftArrayItem: (arrayKey, index, key, value) => set((state) => ({
    adminDraft: {
      ...state.adminDraft,
      [arrayKey]: state.adminDraft[arrayKey].map((item, i) => i === index ? { ...item, [key]: value } : item)
    }
  })),

  addDraftArrayItem: (arrayKey, item) => set((state) => ({
    adminDraft: {
      ...state.adminDraft,
      [arrayKey]: [...state.adminDraft[arrayKey], item]
    }
  })),

  removeDraftArrayItem: (arrayKey, index) => set((state) => ({
    adminDraft: {
      ...state.adminDraft,
      [arrayKey]: state.adminDraft[arrayKey].filter((_, i) => i !== index)
    }
  })),

  moveDraftArrayItem: (arrayKey, index, direction) => set((state) => {
    const newArray = [...(state.adminDraft[arrayKey] || [])];
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
        gallery: adminDraft.invitation.gallery.map((img) => String(img || "").trim()).filter(Boolean) 
      } 
    });
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
});

// === ANA STORE BİRLEŞTİRME ===
// Bu yapı sayesinde projedeki diğer hiçbir dosyadaki importları değiştirmenize gerek kalmaz!
export const useStore = create((...a) => ({
  ...createUISlice(...a),
  ...createDataSlice(...a),
  ...createAdminDraftSlice(...a)
}));