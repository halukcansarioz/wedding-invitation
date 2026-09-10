import { useEffect } from "react";
import { supabase } from "../supabaseClient";
import { getReadableAuthError, getSupabaseSetupMessage, isSupabaseReady, loadSettingsFromDatabase, loadGuestsFromDatabase, loadAllWishesFromDatabase } from "../services/database";
import { normalizeSiteData, touchAdminSession, clearAdminSessionTimestamp, isAdminSessionFresh, getAdminRedirectUrl } from "../utils/helpers";
import { ADMIN_ACTIVITY_EVENTS, SITE_DATA_KEY } from "../config/constants";
import { useStore, useAdminStore } from "../store/useStore";

export function useAdminSession({ isAdminPage, isEn }) {
  const adminStore = useAdminStore();
  const mainStore = useStore();

  useEffect(() => {
    if (!isAdminPage || !isSupabaseReady()) return undefined;

    const loadSessionForAdmin = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          adminStore.setAdminError(getReadableAuthError(error));
          return;
        }

        if (!session?.user) {
          clearAdminSessionTimestamp();
          adminStore.setAdminUser(null);
          adminStore.setIsAdminUnlocked(false);
          adminStore.setAdminPassword("");
          adminStore.setAdminError("");
          adminStore.setAdminLoginNotice(isEn ? "Please log in to access the admin panel." : "Admin paneline girmek için giriş yapmalısın.");
          return;
        }

        if (!isAdminSessionFresh()) {
          clearAdminSessionTimestamp();
          adminStore.setAdminUser(null);
          adminStore.setIsAdminUnlocked(false);
          adminStore.setAdminPassword("");
          adminStore.setAdminError("");
          adminStore.setAdminLoginNotice(isEn ? "Session expired for security. Please log in again." : "Güvenlik için oturum süren doldu. Lütfen tekrar giriş yap.");
          return;
        }

        touchAdminSession();
        adminStore.setAdminUser(session.user);
        adminStore.setAdminPassword("");
        adminStore.setAdminError("");
        adminStore.setAdminLoginNotice(isEn ? "Session is active. No need to log in again." : "Oturumun devam ediyor. Yeniden giriş yapmana gerek yok.");
        adminStore.setIsAdminUnlocked(true);

        const [databaseSettings, adminGuests, adminWishes] = await Promise.all([
          loadSettingsFromDatabase(),
          loadGuestsFromDatabase(),
          loadAllWishesFromDatabase(),
        ]);

        if (databaseSettings) {
          const normalizedSettings = normalizeSiteData(databaseSettings);
          mainStore.setSiteData(normalizedSettings);
          mainStore.setAdminDraft(normalizedSettings);
        }

        mainStore.setGuests(adminGuests);
        mainStore.setWishes(adminWishes);
      } catch (error) {
        adminStore.setAdminError(getReadableAuthError(error));
      }
    };

    loadSessionForAdmin();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        clearAdminSessionTimestamp();
        adminStore.setAdminUser(null);
        adminStore.setIsAdminUnlocked(false);
      } else if (event === 'SIGNED_IN' && session) {
        touchAdminSession();
        adminStore.setAdminUser(session.user);
        adminStore.setIsAdminUnlocked(true);
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminPage, isEn]);

  useEffect(() => {
    if (!isAdminPage || !adminStore.isAdminUnlocked) return undefined;

    const markActivity = () => touchAdminSession();

    const checkSessionTimeout = async () => {
      if (isAdminSessionFresh()) return;

      if (isSupabaseReady()) await supabase.auth.signOut();

      clearAdminSessionTimestamp();
      adminStore.clearAdminAuth();
      mainStore.setActiveAdminTab("general");
      adminStore.setAdminLoginNotice(isEn ? "Session expired for security. Please log in again." : "Oturum süren doldu. Güvenlik için tekrar giriş yapmalısın.");
    };

    markActivity();
    ADMIN_ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, markActivity, { passive: true }));
    const timeoutCheckInterval = window.setInterval(checkSessionTimeout, 60 * 1000);

    return () => {
      ADMIN_ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, markActivity));
      window.clearInterval(timeoutCheckInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminPage, adminStore.isAdminUnlocked, isEn]);

  // Eylemler (Zustand getState ile state anlık olarak çekilir ve prop drilling ihtiyacı kalmaz)
  const submitAdminPassword = async (e) => {
    e.preventDefault();
    const { setAdminError, setAdminLoginNotice, setAdminAuthLoading, setAdminUser, setIsAdminUnlocked, setIsPasswordRecovery, setShowForgotPassword, setForgotPasswordMessage, setAdminPassword, adminEmail, adminPassword } = useAdminStore.getState();
    const { setSiteData, setAdminDraft, setGuests, setWishes, setActiveAdminTab, siteData } = useStore.getState();

    setAdminError("");
    setAdminLoginNotice("");
    setAdminAuthLoading(true);

    try {
      if (!isSupabaseReady()) { setAdminError(getSupabaseSetupMessage()); return; }
      if (!adminEmail.trim() || !adminPassword.trim()) { setAdminError(isEn ? "Please enter admin email and password." : "Lütfen admin e-posta ve şifresini gir."); return; }

      const { data, error } = await supabase.auth.signInWithPassword({ email: adminEmail.trim(), password: adminPassword });
      if (error) { setAdminError(getReadableAuthError(error)); return; }

      touchAdminSession();
      setAdminUser(data.user);
      setIsAdminUnlocked(true);
      setActiveAdminTab("general");
      setIsPasswordRecovery(false);
      setShowForgotPassword(false);
      setForgotPasswordMessage("");
      setAdminPassword("");

      const [databaseSettings, adminGuests, adminWishes] = await Promise.all([loadSettingsFromDatabase(), loadGuestsFromDatabase(), loadAllWishesFromDatabase()]);

      if (databaseSettings) {
        const normalized = normalizeSiteData(databaseSettings);
        setSiteData(normalized);
        setAdminDraft(normalized);
        localStorage.setItem(SITE_DATA_KEY, JSON.stringify(normalized));
      } else {
        setAdminDraft(normalizeSiteData(siteData));
      }
      setGuests(adminGuests);
      setWishes(adminWishes);
    } catch (error) {
      setAdminError(getReadableAuthError(error));
    } finally {
      setAdminAuthLoading(false);
    }
  };

  const sendPasswordResetEmail = async (e) => {
    e.preventDefault();
    const { adminEmail, setForgotPasswordMessage, setAdminError, setForgotPasswordLoading } = useAdminStore.getState();
    setForgotPasswordMessage("");
    setAdminError("");
    setForgotPasswordLoading(true);

    try {
      if (!isSupabaseReady()) { setForgotPasswordMessage(getSupabaseSetupMessage()); return; }
      const email = (adminEmail || "").trim();
      if (!email) { setForgotPasswordMessage(isEn ? "Please enter admin email to reset password." : "Şifre sıfırlama linki için admin e-postanı yazmalısın."); return; }

      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: getAdminRedirectUrl() });
      if (error) { setForgotPasswordMessage(getReadableAuthError(error)); return; }

      setForgotPasswordMessage(isEn ? `Password reset link sent to ${email}.` : `Şifre sıfırlama linki ${email} adresine gönderildi.`);
    } catch (error) {
      setForgotPasswordMessage(getReadableAuthError(error));
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const completePasswordRecovery = async (e) => {
    e.preventDefault();
    const { recoveryPassword, recoveryPasswordAgain, adminEmail, setRecoveryMessage, setRecoveryLoading, setRecoveryPassword, setRecoveryPasswordAgain, setIsPasswordRecovery, setShowForgotPassword, setAdminUser, setAdminEmail, setAdminPassword, setIsAdminUnlocked, setAdminLoginNotice, clearAdminAuth } = useAdminStore.getState();
    setRecoveryMessage("");
    setRecoveryLoading(true);

    try {
      if (recoveryPassword.trim().length < 6) { setRecoveryMessage(isEn ? "New password must be at least 6 characters." : "Yeni şifre en az 6 karakter olmalı."); return; }
      if (recoveryPassword !== recoveryPasswordAgain) { setRecoveryMessage(isEn ? "Passwords do not match." : "Yeni şifreler aynı değil."); return; }

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) { setRecoveryMessage(getReadableAuthError(exchangeError)); return; }
        }
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.user) {
        setRecoveryMessage(isEn ? "Recovery session not found." : "Şifre sıfırlama oturumu bulunamadı."); return;
      }

      const { error } = await supabase.auth.updateUser({ password: recoveryPassword });
      if (error) { setRecoveryMessage(getReadableAuthError(error)); return; }

      const recoveredEmail = sessionData.session.user?.email || adminEmail;
      await supabase.auth.signOut();
      clearAdminSessionTimestamp();

      clearAdminAuth();
      setAdminEmail(recoveredEmail);
      setAdminLoginNotice(isEn ? "Password updated. Session closed for security; log in with your new password." : "Şifren güncellendi. Güvenlik için yeni şifrenle tekrar giriş yap.");

      if (typeof window !== "undefined") window.history.replaceState(null, "", `${window.location.pathname}?admin=1`);
    } catch (error) {
      setRecoveryMessage(getReadableAuthError(error));
    } finally {
      setRecoveryLoading(false);
    }
  };

  const changeAdminPassword = async (e) => {
    e.preventDefault();
    const { adminUser, adminEmail, adminCurrentPassword, adminNewPassword, adminNewPasswordAgain, setAdminPasswordMessage, clearAdminAuth, setAdminLoginNotice } = useAdminStore.getState();
    setAdminPasswordMessage("");

    const email = adminUser?.email || adminEmail;
    if (!email) { setAdminPasswordMessage(isEn ? "Admin email not found." : "Admin e-posta bilgisi bulunamadı."); return; }
    if (!adminCurrentPassword.trim()) { setAdminPasswordMessage(isEn ? "Enter current password." : "Mevcut şifreyi yazmalısın."); return; }
    if (adminNewPassword.trim().length < 6) { setAdminPasswordMessage(isEn ? "New password must be at least 6 characters." : "Yeni şifre en az 6 karakter olmalı."); return; }
    if (adminNewPassword !== adminNewPasswordAgain) { setAdminPasswordMessage(isEn ? "Passwords do not match." : "Yeni şifreler aynı değil."); return; }

    const { error: reLoginError } = await supabase.auth.signInWithPassword({ email, password: adminCurrentPassword });
    if (reLoginError) { setAdminPasswordMessage(getReadableAuthError(reLoginError)); return; }

    const { error } = await supabase.auth.updateUser({ password: adminNewPassword });
    if (error) { setAdminPasswordMessage(getReadableAuthError(error)); return; }

    const { error: signOutError } = await supabase.auth.signOut();
    clearAdminSessionTimestamp();

    if (signOutError) {
      setAdminPasswordMessage(isEn ? "Password updated but session couldn't close." : "Şifre güncellendi fakat oturum otomatik kapatılamadı. Lütfen sayfayı yenile.");
      return;
    }

    clearAdminAuth();
    setAdminLoginNotice(isEn ? "Password updated. Log in again with your new password." : "Admin şifresi güncellendi. Yeni şifrenle tekrar giriş yapmalısın.");
  };

  const logoutAdmin = async () => {
    const { showAppConfirm, setActiveAdminTab } = useStore.getState();
    const { clearAdminAuth, setAdminLoginNotice, setAdminSaveMessage } = useAdminStore.getState();

    const confirmed = await showAppConfirm(
      isEn ? "Are you sure you want to log out of the admin panel?" : "Admin panelden çıkış yapmak istiyor musun?", 
      { title: isEn ? "Log Out" : "Çıkış yap", confirmText: isEn ? "Log Out" : "Çıkış Yap", tone: "warning" }
    );
    if (!confirmed) return;

    try {
      if (isSupabaseReady()) await supabase.auth.signOut();
    } catch (error) {
      setAdminSaveMessage(getReadableAuthError(error)); return;
    }

    clearAdminSessionTimestamp();
    clearAdminAuth();
    setActiveAdminTab("general");
    setAdminLoginNotice(isEn ? "Logged out. Please log in again to access the admin panel." : "Çıkış yapıldı. Admin paneline girmek için tekrar giriş yapmalısın.");
  };

  return { submitAdminPassword, sendPasswordResetEmail, completePasswordRecovery, changeAdminPassword, logoutAdmin };
}