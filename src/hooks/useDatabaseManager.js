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
      // RPC ile Rate Limit Kontrollü Kayıt (Supabase'de RPC fonksiyonunu oluşturduğunu varsayıyoruz)
      let { data, error } = await supabase.rpc('submit_guest_with_limit', { guest_data: dbData });
      
      if (error) {
        if (error.message === 'RATE_LIMIT_EXCEEDED') {
          throw new Error(isEn ? "Please wait a minute before submitting again." : "Lütfen yeni bir form göndermeden önce 1 dakika bekleyin.");
        }
        // Fallback: RPC çalışmazsa normal insert dene
        const fallback = await supabase.from("guests").insert(dbData).select("*").single();
        if (fallback.error) throw fallback.error;
        data = fallback.data;
      }
      
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
      let { data, error } = await supabase.from("wishes").insert({ 
        name: formData.name.trim(), 
        message: formData.message.trim(), 
        approved: shouldPublishNow 
      }).select("*").single();
      
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

  const clearGuests = useCallback(async () => { /* ... */ }, []);
  const clearWishes = useCallback(async () => { /* ... */ }, []);
  const deleteGuest = useCallback(async (guestId) => { /* ... */ }, []);
  const editGuest = useCallback(async (guestId) => { /* ... */ }, []);
  const deleteWish = useCallback(async (wishId) => { /* ... */ }, []);
  const editWish = useCallback(async (wishId) => { /* ... */ }, []);
  const toggleWishApproval = useCallback(async (wishId) => { /* ... */ }, []);

  const toggleCheckIn = useCallback(async (guestId, currentStatus) => {
    const nextStatus = !currentStatus;
    const { error } = await supabase.from("guests").update({ has_arrived: nextStatus }).eq("id", guestId);
    if (error) { setAdminSaveMessage?.(isEn ? "Could not update status." : "Durum güncellenemedi."); return; }
    setGuests((prev) => prev.map((item) => (item.id === guestId ? { ...item, has_arrived: nextStatus } : item)));
  }, [setGuests, setAdminSaveMessage, isEn]);

  return { submitGuest, submitWish, clearGuests, clearWishes, deleteGuest, editGuest, deleteWish, editWish, toggleWishApproval, toggleCheckIn };
}