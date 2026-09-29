import { StateCreator } from 'zustand';
import { MainStoreState, AdminDraftSlice } from '../storeTypes';
import { loadStoredSiteData, normalizeSiteData } from '../../utils/helpers';
import { saveSettingsToDatabase } from '../../services/database';
import { useAdminStore } from '../useAdminStore';
import { SiteData } from '../../types';

export const createAdminDraftSlice: StateCreator<MainStoreState, [], [], AdminDraftSlice> = (set, get) => ({
  adminDraft: loadStoredSiteData() as SiteData,
  setAdminDraft: (draftOrUpdater) => set((state) => ({
    adminDraft: typeof draftOrUpdater === 'function' ? draftOrUpdater(state.adminDraft) : draftOrUpdater
  })),
  activeAdminTab: "overview",
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
});