import { SiteData, Guest, Wish } from '../types';

export interface CustomAlertOptions {
  title?: string;
  multiline?: boolean;
  confirmText?: string;
  tone?: 'warning' | 'danger' | 'success' | 'info';
}

export interface CustomModalState {
  title: string;
  message?: string;
  label?: string;
  value?: string;
  multiline?: boolean;
  resolve: (val: any) => void;
}

export interface UISlice {
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
}

export interface DataSlice {
  siteData: SiteData;
  setSiteData: (data: SiteData) => void;
  guests: Guest[];
  setGuests: (guests: Guest[]) => void;
  wishes: Wish[];
  setWishes: (wishes: Wish[]) => void;
}

export interface AdminDraftSlice {
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

export type MainStoreState = UISlice & DataSlice & AdminDraftSlice;