import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AdminStoreState {
  isAdminUnlocked: boolean;
  adminUser: User | null;
  adminEmail: string;
  adminPassword: string;
  adminError: string;
  adminLoginNotice: string;
  adminSaveMessage: string;
  adminAuthLoading: boolean;
  showForgotPassword: boolean;
  forgotPasswordEmail: string;
  forgotPasswordMessage: string;
  forgotPasswordLoading: boolean;
  isPasswordRecovery: boolean;
  recoveryPassword: string;
  recoveryPasswordAgain: string;
  recoveryMessage: string;
  recoveryLoading: boolean;
  adminCurrentPassword: string;
  adminNewPassword: string;
  adminNewPasswordAgain: string;
  adminPasswordMessage: string;
}

interface AdminStoreActions {
  setIsAdminUnlocked: (status: boolean) => void;
  setAdminUser: (user: User | null) => void;
  setAdminEmail: (email: string) => void;
  setAdminPassword: (pass: string) => void;
  setAdminError: (error: string) => void;
  setAdminLoginNotice: (notice: string) => void;
  setAdminSaveMessage: (msg: string) => void;
  setAdminAuthLoading: (loading: boolean) => void;
  setShowForgotPassword: (show: boolean) => void;
  setForgotPasswordEmail: (email: string) => void;
  setForgotPasswordMessage: (msg: string) => void;
  setForgotPasswordLoading: (loading: boolean) => void;
  setIsPasswordRecovery: (isRec: boolean) => void;
  setRecoveryPassword: (pass: string) => void;
  setRecoveryPasswordAgain: (pass: string) => void;
  setRecoveryMessage: (msg: string) => void;
  setRecoveryLoading: (loading: boolean) => void;
  setAdminCurrentPassword: (pass: string) => void;
  setAdminNewPassword: (pass: string) => void;
  setAdminNewPasswordAgain: (pass: string) => void;
  setAdminPasswordMessage: (msg: string) => void;
  clearAdminAuth: () => void;
}

export const useAdminStore = create<AdminStoreState & AdminStoreActions>((set) => ({
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