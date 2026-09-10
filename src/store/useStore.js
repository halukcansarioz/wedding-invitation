import { create } from 'zustand';
import { loadStoredSiteData, normalizeSiteData } from '../utils/helpers';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import { saveSettingsToDatabase } from '../services/database';

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
    // Use useAdminStore for saving messages
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
}));

// PROP DRILLING ÇÖZÜMÜ: Yalnızca Admin Authentication ve form State'ini tutan bağımsız bir store.
export const useAdminStore = create((set) => ({
  isAdminUnlocked: false,
  adminUser: null,
  adminEmail: "",
  adminPassword: "",
  adminError: "",
  adminLoginNotice: "",
  adminSaveMessage: "",
  adminAuthLoading: false,
  showForgotPassword: false,
  forgotPasswordEmail: "",
  forgotPasswordMessage: "",
  forgotPasswordLoading: false,
  isPasswordRecovery: false,
  recoveryPassword: "",
  recoveryPasswordAgain: "",
  recoveryMessage: "",
  recoveryLoading: false,
  adminCurrentPassword: "",
  adminNewPassword: "",
  adminNewPasswordAgain: "",
  adminPasswordMessage: "",

  setIsAdminUnlocked: (status) => set({ isAdminUnlocked: status }),
  setAdminUser: (user) => set({ adminUser: user }),
  setAdminEmail: (email) => set({ adminEmail: email }),
  setAdminPassword: (pass) => set({ adminPassword: pass }),
  setAdminError: (error) => set({ adminError: error }),
  setAdminLoginNotice: (notice) => set({ adminLoginNotice: notice }),
  setAdminSaveMessage: (msg) => set({ adminSaveMessage: msg }),
  setAdminAuthLoading: (loading) => set({ adminAuthLoading: loading }),
  setShowForgotPassword: (show) => set({ showForgotPassword: show }),
  setForgotPasswordEmail: (email) => set({ forgotPasswordEmail: email }),
  setForgotPasswordMessage: (msg) => set({ forgotPasswordMessage: msg }),
  setForgotPasswordLoading: (loading) => set({ forgotPasswordLoading: loading }),
  setIsPasswordRecovery: (isRec) => set({ isPasswordRecovery: isRec }),
  setRecoveryPassword: (pass) => set({ recoveryPassword: pass }),
  setRecoveryPasswordAgain: (pass) => set({ recoveryPasswordAgain: pass }),
  setRecoveryMessage: (msg) => set({ recoveryMessage: msg }),
  setRecoveryLoading: (loading) => set({ recoveryLoading: loading }),
  setAdminCurrentPassword: (pass) => set({ adminCurrentPassword: pass }),
  setAdminNewPassword: (pass) => set({ adminNewPassword: pass }),
  setAdminNewPasswordAgain: (pass) => set({ adminNewPasswordAgain: pass }),
  setAdminPasswordMessage: (msg) => set({ adminPasswordMessage: msg }),

  clearAdminAuth: () => set({
    isAdminUnlocked: false,
    adminUser: null,
    adminPassword: "",
    adminError: "",
    showForgotPassword: false,
    forgotPasswordMessage: "",
    adminPasswordMessage: "",
    adminCurrentPassword: "",
    adminNewPassword: "",
    adminNewPasswordAgain: ""
  })
}));