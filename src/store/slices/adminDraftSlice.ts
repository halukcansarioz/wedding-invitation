import { StateCreator } from 'zustand';
import { produce } from 'immer';
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

  updateDraftObject: (group, key, value) => set(produce((state: MainStoreState) => {
    if (state.adminDraft[group]) {
      (state.adminDraft[group] as any)[key] = value;
    }
  })),

  updateDraftArrayItem: (arrayKey, index, key, value) => set(produce((state: MainStoreState) => {
    const arrayTarget = state.adminDraft[arrayKey] as any[];
    if (arrayTarget && arrayTarget[index]) {
      arrayTarget[index][key] = value;
    }
  })),

  addDraftArrayItem: (arrayKey, item) => set(produce((state: MainStoreState) => {
    if (!state.adminDraft[arrayKey]) {
      (state.adminDraft[arrayKey] as any) = [];
    }
    (state.adminDraft[arrayKey] as any[]).push(item);
  })),

  removeDraftArrayItem: (arrayKey, index) => set(produce((state: MainStoreState) => {
    const arrayTarget = state.adminDraft[arrayKey] as any[];
    if (arrayTarget) {
      arrayTarget.splice(index, 1);
    }
  })),

  moveDraftArrayItem: (arrayKey, index, direction) => set(produce((state: MainStoreState) => {
    const arrayTarget = state.adminDraft[arrayKey] as any[];
    if (!arrayTarget) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= arrayTarget.length) return;
    
    // Immer ile yer değiştirme işlemi
    const temp = arrayTarget[index];
    arrayTarget[index] = arrayTarget[newIndex];
    arrayTarget[newIndex] = temp;
  })),

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