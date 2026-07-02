import { useEffect } from "react";
import { supabase } from "../supabaseClient";
import {
  getReadableAuthError,
  getSupabaseSetupMessage,
  isSupabaseReady,
  loadSettingsFromDatabase,
  loadGuestsFromDatabase,
  loadAllWishesFromDatabase,
} from "../services/database";
import {
  normalizeSiteData,
  touchAdminSession,
  clearAdminSessionTimestamp,
  isAdminSessionFresh,
  getAdminRedirectUrl,
} from "../utils/helpers";
import { ADMIN_ACTIVITY_EVENTS, SITE_DATA_KEY } from "../config/constants";

export function useAdminSession({
  isAdminPage,
  adminEmail,
  adminPassword,
  adminUser,
  adminCurrentPassword,
  adminNewPassword,
  adminNewPasswordAgain,
  recoveryPassword,
  recoveryPasswordAgain,
  siteData,
  isAdminUnlocked,
  setAdminEmail,
  setAdminPassword,
  setAdminUser,
  setIsAdminUnlocked,
  setAdminError,
  setAdminLoginNotice,
  setShowForgotPassword,
  setForgotPasswordEmail,
  setForgotPasswordMessage,
  setAdminPasswordMessage,
  setAdminSaveMessage,
  setAdminCurrentPassword,
  setAdminNewPassword,
  setAdminNewPasswordAgain,
  setRecoveryPassword,
  setRecoveryPasswordAgain,
  setRecoveryMessage,
  setRecoveryLoading,
  setForgotPasswordLoading,
  setAdminAuthLoading,
  setIsPasswordRecovery,
  setActiveAdminTab,
  setSiteData,
  setAdminDraft,
  setGuests,
  setWishes,
  showAppConfirm,
}) {
  useEffect(() => {
    if (!isAdminPage || !isSupabaseReady()) return undefined;

    const loadSessionForAdmin = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Admin oturumu kontrol edilemedi:", error);
          setAdminError(getReadableAuthError(error));
          return;
        }

        if (!session?.user) {
          clearAdminSessionTimestamp();
          setAdminUser(null);
          setIsAdminUnlocked(false);
          setAdminPassword("");
          setAdminError("");
          setAdminLoginNotice("Admin paneline girmek için giriş yapmalısın.");
          return;
        }

        if (!isAdminSessionFresh()) {
          clearAdminSessionTimestamp();
          setAdminUser(null);
          setIsAdminUnlocked(false);
          setAdminPassword("");
          setAdminError("");
          setAdminLoginNotice("Güvenlik için oturum süren doldu. Lütfen tekrar giriş yap.");
          return;
        }

        touchAdminSession();
        setAdminUser(session.user);
        setAdminPassword("");
        setAdminError("");
        setAdminLoginNotice("Oturumun devam ediyor. Yeniden giriş yapmana gerek yok.");
        setIsAdminUnlocked(true);

        const [databaseSettings, adminGuests, adminWishes] = await Promise.all([
          loadSettingsFromDatabase(),
          loadGuestsFromDatabase(),
          loadAllWishesFromDatabase(),
        ]);

        if (databaseSettings) {
          const normalizedDatabaseSettings = normalizeSiteData(databaseSettings);
          setSiteData(normalizedDatabaseSettings);
          setAdminDraft(normalizedDatabaseSettings);
        }

        setGuests(adminGuests);
        setWishes(adminWishes);
      } catch (error) {
        console.error("Supabase oturumu kontrol edilemedi:", error);
        setAdminError(getReadableAuthError(error));
      }
    };

    loadSessionForAdmin();
  }, [isAdminPage, setAdminDraft, setAdminError, setAdminLoginNotice, setAdminPassword, setAdminUser, setGuests, setIsAdminUnlocked, setSiteData, setWishes]);

  useEffect(() => {
    if (!isAdminPage || !isAdminUnlocked) return undefined;

    const markActivity = () => touchAdminSession();

    const checkSessionTimeout = async () => {
      if (isAdminSessionFresh()) return;

      try {
        if (isSupabaseReady()) {
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error("Admin oturumu kapatılamadı:", error);
      }

      clearAdminSessionTimestamp();
      setAdminUser(null);
      setIsAdminUnlocked(false);
      setActiveAdminTab("general");
      setAdminPassword("");
      setAdminError("");
      setAdminSaveMessage("");
      setAdminPasswordMessage("");
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
      setForgotPasswordMessage("");
      setAdminLoginNotice("Oturum süren doldu. Güvenlik için tekrar giriş yapmalısın.");
    };

    markActivity();
    ADMIN_ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, markActivity, { passive: true });
    });

    const timeoutCheckInterval = window.setInterval(checkSessionTimeout, 60 * 1000);

    return () => {
      ADMIN_ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity);
      });
      window.clearInterval(timeoutCheckInterval);
    };
  }, [isAdminPage, isAdminUnlocked, setActiveAdminTab, setAdminError, setAdminLoginNotice, setAdminPassword, setAdminPasswordMessage, setAdminSaveMessage, setAdminUser, setForgotPasswordEmail, setForgotPasswordMessage, setIsAdminUnlocked, setShowForgotPassword]);

  const submitAdminPassword = async (e) => {
    e.preventDefault();
    setAdminError("");
    setAdminLoginNotice("");
    setAdminAuthLoading(true);

    try {
      if (!isSupabaseReady()) {
        setAdminError(getSupabaseSetupMessage());
        return;
      }

      if (!adminEmail.trim() || !adminPassword.trim()) {
        setAdminError("Lütfen admin e-posta ve şifresini gir.");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail.trim(),
        password: adminPassword,
      });

      if (error) {
        console.error("Admin girişi başarısız:", error);
        setAdminError(getReadableAuthError(error));
        return;
      }

      touchAdminSession();
      setAdminUser(data.user);
      setIsAdminUnlocked(true);
      setActiveAdminTab("general");
      setIsPasswordRecovery(false);
      setShowForgotPassword(false);
      setForgotPasswordMessage("");
      setAdminPassword("");

      const [databaseSettings, adminGuests, adminWishes] = await Promise.all([
        loadSettingsFromDatabase(),
        loadGuestsFromDatabase(),
        loadAllWishesFromDatabase(),
      ]);

      if (databaseSettings) {
        const normalizedDatabaseSettings = normalizeSiteData(databaseSettings);
        setSiteData(normalizedDatabaseSettings);
        setAdminDraft(normalizedDatabaseSettings);
        localStorage.setItem(SITE_DATA_KEY, JSON.stringify(normalizedDatabaseSettings));
      } else {
        setAdminDraft(normalizeSiteData(siteData));
      }

      setGuests(adminGuests);
      setWishes(adminWishes);
    } catch (error) {
      console.error("Admin girişinde bağlantı hatası:", error);
      setAdminError(getReadableAuthError(error));
    } finally {
      setAdminAuthLoading(false);
    }
  };

  const sendPasswordResetEmail = async (e) => {
    e.preventDefault();
    setForgotPasswordMessage("");
    setAdminError("");
    setForgotPasswordLoading(true);

    try {
      if (!isSupabaseReady()) {
        setForgotPasswordMessage(getSupabaseSetupMessage());
        return;
      }

      const email = (adminEmail || "").trim();

      if (!email) {
        setForgotPasswordMessage("Şifre sıfırlama linki için admin e-postanı yazmalısın.");
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getAdminRedirectUrl(),
      });

      if (error) {
        console.error("Şifre sıfırlama e-postası gönderilemedi:", error);
        setForgotPasswordMessage(getReadableAuthError(error));
        return;
      }

      setForgotPasswordMessage(
        `Şifre sıfırlama linki ${email} adresine gönderildi. Link çalışmazsa Supabase > Authentication > URL Configuration bölümüne şu adresi ekle: ${getAdminRedirectUrl()}`
      );
    } catch (error) {
      console.error("Şifre sıfırlama bağlantı hatası:", error);
      setForgotPasswordMessage(getReadableAuthError(error));
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const completePasswordRecovery = async (e) => {
    e.preventDefault();
    setRecoveryMessage("");
    setRecoveryLoading(true);

    try {
      if (recoveryPassword.trim().length < 6) {
        setRecoveryMessage("Yeni şifre en az 6 karakter olmalı.");
        return;
      }

      if (recoveryPassword !== recoveryPasswordAgain) {
        setRecoveryMessage("Yeni şifreler aynı değil.");
        return;
      }

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setRecoveryMessage(getReadableAuthError(exchangeError));
            return;
          }
        }
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setRecoveryMessage(getReadableAuthError(sessionError));
        return;
      }

      if (!sessionData.session?.user) {
        setRecoveryMessage("Şifre sıfırlama oturumu bulunamadı. Linkin süresi dolmuş olabilir; tekrar 'Şifremi unuttum' linki gönder.");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: recoveryPassword,
      });

      if (error) {
        console.error("Şifre sıfırlama tamamlanamadı:", error);
        setRecoveryMessage(getReadableAuthError(error));
        return;
      }

      const recoveredEmail = sessionData.session.user?.email || adminEmail;
      const { error: signOutError } = await supabase.auth.signOut();
      clearAdminSessionTimestamp();

      if (signOutError) {
        console.error("Şifre sıfırlandı ama oturum kapatılamadı:", signOutError);
      }

      setRecoveryPassword("");
      setRecoveryPasswordAgain("");
      setRecoveryMessage("");
      setIsPasswordRecovery(false);
      setShowForgotPassword(false);
      setAdminUser(null);
      setAdminEmail(recoveredEmail);
      setAdminPassword("");
      setIsAdminUnlocked(false);
      setAdminLoginNotice("Şifren güncellendi. Güvenlik için oturum kapatıldı; yeni şifrenle tekrar giriş yap.");

      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `${window.location.pathname}?admin=1`);
      }
    } catch (error) {
      console.error("Şifre sıfırlama bağlantı hatası:", error);
      setRecoveryMessage(getReadableAuthError(error));
    } finally {
      setRecoveryLoading(false);
    }
  };

  const changeAdminPassword = async (e) => {
    e.preventDefault();
    setAdminPasswordMessage("");

    const email = adminUser?.email || adminEmail;

    if (!email) {
      setAdminPasswordMessage("Admin e-posta bilgisi bulunamadı. Çıkış yapıp tekrar giriş yap.");
      return;
    }

    if (!adminCurrentPassword.trim()) {
      setAdminPasswordMessage("Mevcut şifreyi yazmalısın.");
      return;
    }

    if (adminNewPassword.trim().length < 6) {
      setAdminPasswordMessage("Yeni şifre en az 6 karakter olmalı.");
      return;
    }

    if (adminNewPassword !== adminNewPasswordAgain) {
      setAdminPasswordMessage("Yeni şifreler aynı değil.");
      return;
    }

    const { error: reLoginError } = await supabase.auth.signInWithPassword({
      email,
      password: adminCurrentPassword,
    });

    if (reLoginError) {
      console.error("Mevcut şifre doğrulanamadı:", reLoginError);
      setAdminPasswordMessage(getReadableAuthError(reLoginError));
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: adminNewPassword });

    if (error) {
      console.error("Admin şifresi güncellenemedi:", error);
      setAdminPasswordMessage(getReadableAuthError(error));
      return;
    }

    const { error: signOutError } = await supabase.auth.signOut();
    clearAdminSessionTimestamp();

    if (signOutError) {
      console.error("Şifre değişti ama oturum kapatılamadı:", signOutError);
      setAdminPasswordMessage("Şifre güncellendi fakat oturum otomatik kapatılamadı. Lütfen sayfayı yenileyip yeni şifrenle giriş yap.");
      return;
    }

    setAdminCurrentPassword("");
    setAdminNewPassword("");
    setAdminNewPasswordAgain("");
    setAdminPassword("");
    clearAdminSessionTimestamp();
    setAdminUser(null);
    setIsAdminUnlocked(false);
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setForgotPasswordMessage("");
    setAdminPasswordMessage("");
    setAdminSaveMessage("");
    setAdminError("");
    setAdminLoginNotice("Admin şifresi güncellendi. Güvenlik için oturum kapatıldı. Yeni şifrenle tekrar giriş yapmalısın.");
  };

  const performAdminSignOut = async () => {
    try {
      if (!isSupabaseReady()) return true;

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Admin çıkışı yapılamadı:", error);
        setAdminSaveMessage(getReadableAuthError(error));
        return false;
      }

      return true;
    } catch (error) {
      console.error("Admin çıkışı bağlantı hatası:", error);
      setAdminSaveMessage(getReadableAuthError(error));
      return false;
    }
  };

  const logoutAdmin = async () => {
    const confirmed = await showAppConfirm("Admin panelden çıkış yapmak istiyor musun?", { title: "Çıkış yap", confirmText: "Çıkış Yap", tone: "warning" });
    if (!confirmed) return;

    const signedOut = await performAdminSignOut();
    if (!signedOut) return;

    clearAdminSessionTimestamp();
    setAdminUser(null);
    setIsAdminUnlocked(false);
    setActiveAdminTab("general");
    setAdminPassword("");
    setAdminError("");
    setAdminSaveMessage("");
    setAdminPasswordMessage("");
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setForgotPasswordMessage("");
    setAdminLoginNotice("Çıkış yapıldı. Admin paneline girmek için tekrar giriş yapmalısın.");
  };

  return {
    submitAdminPassword,
    sendPasswordResetEmail,
    completePasswordRecovery,
    changeAdminPassword,
    logoutAdmin,
    performAdminSignOut,
  };
}

export default useAdminSession;
