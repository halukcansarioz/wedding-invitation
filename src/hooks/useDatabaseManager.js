import { useCallback, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { getSupabaseSetupMessage, isSupabaseReady } from "../services/database";
import { uiGuestToDb, dbGuestToUi, dbWishToUi } from "../utils/helpers";

export function useDatabaseManager({ guests, setGuests, wishes, setWishes, settings, showAppAlert, showAppConfirm, showAppPrompt, setAdminSaveMessage, t, isEn }) {
  
  useEffect(() => {
    if (!isSupabaseReady()) return;

    const wishesChannel = supabase.channel("public:wishes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "wishes" }, (payload) => {
        if (payload.new && payload.new.approved) {
          setWishes((prev) => prev.some(w => w.id === payload.new.id) ? prev : [dbWishToUi(payload.new), ...prev]);
        }
      }).subscribe();

    const guestsChannel = supabase.channel("public:guests")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "guests" }, (payload) => {
        if (payload.new) {
          setGuests((prev) => prev.some(g => g.id === payload.new.id) ? prev : [dbGuestToUi(payload.new), ...prev]);
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "guests" }, (payload) => {
        if (payload.new) {
          setGuests((prev) => prev.map(g => g.id === payload.new.id ? dbGuestToUi(payload.new) : g));
        }
      }).subscribe();

    return () => {
      supabase.removeChannel(wishesChannel);
      supabase.removeChannel(guestsChannel);
    };
  }, [setWishes, setGuests]);

  const submitGuest = useCallback(async (formData) => {
    if (formData.honeypot) return;
    
    const lastRsvpTime = localStorage.getItem("last_rsvp_time");
    if (lastRsvpTime && Date.now() - parseInt(lastRsvpTime, 10) < 60000) {
      await showAppAlert?.(isEn ? "Please wait a minute before submitting again." : "Lütfen yeni bir form göndermeden önce 1 dakika bekleyin.", { title: t('alerts.errorTitle') });
      return;
    }

    if (!isSupabaseReady()) {
      await showAppAlert?.(getSupabaseSetupMessage(), { title: t('alerts.supabaseMissingTitle') });
      return;
    }
    
    try {
      const dbData = uiGuestToDb(formData);
      // GÜVENLİK GÜNCELLEMESİ: Tabloya insert yerine doğrudan korumalı fonksiyon (RPC) çağrılıyor.
      const token = "DUMMY_CAPTCHA_TOKEN"; // Gelecekte Captcha eklendiğinde buraya yerleştirilecek.
      const { data, error } = await supabase.rpc('submit_guest_secure', { guest_data: dbData, token: token });

      if (error) throw error;
      
      localStorage.setItem("last_rsvp_time", Date.now().toString());
      setGuests((prev) => [data ? dbGuestToUi(data) : { id: `local-${Date.now()}`, ...formData }, ...prev]);

      if (formData.attendance === "Katılacağım") {
        await showAppAlert?.(t('alerts.rsvpSuccess'), { title: t('alerts.saveTitle') });
      }
    } catch (error) {
      console.error("Katılım kaydedilemedi:", error);
      const errorMsg = error?.message || (isEn ? "Unknown error" : "Bilinmeyen hata");
      await showAppAlert?.(t('alerts.rsvpError', { message: errorMsg }), { title: t('alerts.saveErrorTitle') });
    }
  }, [setGuests, showAppAlert, t, isEn]);

  const submitWish = useCallback(async (formData) => {
    if (formData.honeypot) return;
    
    const lastWishTime = localStorage.getItem("last_wish_time");
    if (lastWishTime && Date.now() - parseInt(lastWishTime, 10) < 60000) {
      await showAppAlert?.(isEn ? "Please wait a minute before submitting again." : "Lütfen yeni bir mesaj göndermeden önce 1 dakika bekleyin.", { title: t('alerts.errorTitle') });
      return;
    }

    if (!isSupabaseReady()) {
      await showAppAlert?.(getSupabaseSetupMessage(), { title: t('alerts.supabaseMissingTitle') });
      return;
    }
    const shouldPublishNow = !settings?.requireWishApproval;
    try {
      // GÜVENLİK GÜNCELLEMESİ: Tabloya insert yerine doğrudan korumalı fonksiyon (RPC) çağrılıyor.
      const token = "DUMMY_CAPTCHA_TOKEN"; 
      const { data, error } = await supabase.rpc('submit_wish_secure', { 
        wish_name: formData.name.trim(), 
        wish_message: formData.message.trim(), 
        is_approved: shouldPublishNow,
        token: token
      });
      
      if (error) throw error;
      
      localStorage.setItem("last_wish_time", Date.now().toString());
      if (shouldPublishNow) {
        setWishes((prev) => {
          if (data && prev.some(w => w.id === data.id)) return prev;
          return [data ? dbWishToUi(data) : { id: `local-${Date.now()}`, ...formData, approved: true }, ...prev];
        });
      }
      await showAppAlert?.(settings?.requireWishApproval ? t('alerts.wishSentApproval') : t('alerts.wishSaved'), { 
        title: settings?.requireWishApproval ? t('alerts.saveTitle') : t('alerts.saveTitle') 
      });
    } catch (error) {
      console.error("Mesaj kaydedilemedi:", error);
      const errorMsg = error?.message || (isEn ? "Unknown error" : "Bilinmeyen hata");
      await showAppAlert?.(t('alerts.wishError', { message: errorMsg }), { title: t('alerts.saveErrorTitle') });
    }
  }, [setWishes, settings?.requireWishApproval, showAppAlert, t, isEn]);

  const clearGuests = useCallback(async () => { /* Supabase delete methods */ }, []);
  const clearWishes = useCallback(async () => { /* Supabase delete methods */ }, []);
  const deleteGuest = useCallback(async (guestId) => { /* Supabase delete methods */ }, []);
  const editGuest = useCallback(async (guestId) => { /* Supabase update methods */ }, []);
  const deleteWish = useCallback(async (wishId) => { /* Supabase delete methods */ }, []);
  const editWish = useCallback(async (wishId) => { /* Supabase update methods */ }, []);
  const toggleWishApproval = useCallback(async (wishId) => { /* Supabase update methods */ }, []);

  const toggleCheckIn = useCallback(async (guestId, currentStatus) => {
    const nextStatus = !currentStatus;
    
    setGuests((prev) => prev.map((item) => (item.id === guestId ? { ...item, has_arrived: nextStatus } : item)));

    const { error } = await supabase.from("guests").update({ has_arrived: nextStatus }).eq("id", guestId);
    
    if (error) { 
      setGuests((prev) => prev.map((item) => (item.id === guestId ? { ...item, has_arrived: currentStatus } : item)));
      setAdminSaveMessage?.(isEn ? "Could not update status." : "Durum güncellenemedi."); 
      return; 
    }
  }, [setGuests, setAdminSaveMessage, isEn]);

  return { submitGuest, submitWish, clearGuests, clearWishes, deleteGuest, editGuest, deleteWish, editWish, toggleWishApproval, toggleCheckIn };
}