import { useCallback, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { getSupabaseSetupMessage, isSupabaseReady } from "../services/database";
import { uiGuestToDb, dbGuestToUi, dbWishToUi } from "../utils/helpers";

export function useDatabaseManager({ guests, setGuests, wishes, setWishes, settings, showAppAlert, showAppConfirm, showAppPrompt, setAdminSaveMessage, t, isEn }) {
  
  useEffect(() => {
    if (!isSupabaseReady()) return;

    const wishesChannel = supabase
      .channel("public:wishes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "wishes" }, (payload) => {
        if (payload.new && payload.new.approved) {
          setWishes((prev) => {
            if (prev.some((w) => w.id === payload.new.id)) return prev;
            return [dbWishToUi(payload.new), ...prev];
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(wishesChannel);
    };
  }, [setWishes]);

  const submitGuest = useCallback(async (formData) => {
    if (formData.honeypot) return;
    if (!isSupabaseReady()) {
      await showAppAlert?.(getSupabaseSetupMessage(), { title: t('alerts.supabaseMissingTitle') });
      return;
    }
    try {
      const dbData = uiGuestToDb(formData);
      const { data, error } = await supabase.from("guests").insert(dbData).select("*").single();
      if (error) throw error;
      
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
    if (!isSupabaseReady()) {
      await showAppAlert?.(getSupabaseSetupMessage(), { title: t('alerts.supabaseMissingTitle') });
      return;
    }
    const shouldPublishNow = !settings?.requireWishApproval;
    try {
      const { data, error } = await supabase.from("wishes").insert({ 
        name: formData.name.trim(), 
        message: formData.message.trim(), 
        approved: shouldPublishNow 
      }).select("*").single();
      
      if (error) throw error;
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

  const clearGuests = useCallback(async () => {
    const confirmed = await showAppConfirm(t('admin.clearGuestsConfirm'), { title: t('admin.clearGuestsTitle') });
    if (!confirmed) return;
    const { error } = await supabase.from("guests").delete().not("id", "is", null);
    if (error) { setAdminSaveMessage?.(t('admin.couldNotDelete')); return; }
    setGuests([]);
  }, [setGuests, setAdminSaveMessage, showAppConfirm, t]);

  const clearWishes = useCallback(async () => {
    const confirmed = await showAppConfirm(t('admin.clearWishesConfirm'), { title: t('admin.clearWishesTitle') });
    if (!confirmed) return;
    const { error } = await supabase.from("wishes").delete().not("id", "is", null);
    if (error) { setAdminSaveMessage?.(t('admin.couldNotDelete')); return; }
    setWishes([]);
  }, [setWishes, setAdminSaveMessage, showAppConfirm, t]);

  const deleteGuest = useCallback(async (guestId) => {
    const confirmed = await showAppConfirm(t('admin.deleteGuestConfirm'), { title: t('admin.deleteGuestTitle') });
    if (!confirmed) return;
    const { error } = await supabase.from("guests").delete().eq("id", guestId);
    if (error) { setAdminSaveMessage?.(t('admin.couldNotDelete')); return; }
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
  }, [setGuests, setAdminSaveMessage, showAppConfirm, t]);

  const editGuest = useCallback(async (guestId) => {
    const guest = guests.find((item) => item.id === guestId);
    if (!guest) return;
    const title = t('admin.editGuestTitle');

    const name = await showAppPrompt(t('admin.fullName'), guest.name || "", { title }); if (name === null) return;
    const phone = await showAppPrompt(t('admin.phone'), guest.phone || "", { title }); if (phone === null) return;
    const attendance = await showAppPrompt(t('admin.attendanceStatus'), guest.attendance || "Katılacağım", { title }); if (attendance === null) return;
    
    let personCountInput = await showAppPrompt(t('admin.personCount'), guest.personCount || "1", { title }); 
    if (personCountInput === null) return;
    
    let parsedCount = parseInt(personCountInput, 10);
    if (isNaN(parsedCount) || parsedCount < 0) {
      parsedCount = 1;
    }
    const personCount = String(parsedCount);

    const side = await showAppPrompt(t('admin.side'), guest.side || "Gelin Tarafı", { title }); if (side === null) return;
    const hasChild = await showAppPrompt(t('admin.hasChild'), guest.hasChild || "Hayır", { title }); if (hasChild === null) return;
    const songRequest = await showAppPrompt(t('admin.songRequest'), guest.songRequest || "", { title }); if (songRequest === null) return;
    const note = await showAppPrompt(t('admin.note'), guest.note || "", { title, multiline: true }); if (note === null) return;

    const nextGuest = { ...guest, name, phone, attendance, personCount, side, hasChild, songRequest, note };
    const { error } = await supabase.from("guests").update(uiGuestToDb(nextGuest)).eq("id", guestId);
    if (error) { setAdminSaveMessage?.(t('admin.couldNotUpdate')); return; }
    setGuests((prev) => prev.map((item) => (item.id === guestId ? nextGuest : item)));
  }, [guests, setGuests, setAdminSaveMessage, showAppPrompt, t]);

  const deleteWish = useCallback(async (wishId) => {
    const confirmed = await showAppConfirm(t('admin.deleteWishConfirm'), { title: t('admin.deleteWishTitle') });
    if (!confirmed) return;
    const { error } = await supabase.from("wishes").delete().eq("id", wishId);
    if (error) { setAdminSaveMessage?.(t('admin.couldNotDelete')); return; }
    setWishes((prev) => prev.filter((w) => w.id !== wishId));
  }, [setWishes, setAdminSaveMessage, showAppConfirm, t]);

  const editWish = useCallback(async (wishId) => {
    const wish = wishes.find((item) => item.id === wishId);
    if (!wish) return;
    const title = t('admin.editWishTitle');

    const name = await showAppPrompt(t('admin.fullName'), wish.name || "", { title }); if (name === null) return;
    const message = await showAppPrompt(t('admin.message'), wish.message || "", { title, multiline: true }); if (message === null) return;

    const nextWish = { ...wish, name, message };
    // DÜZELTME: uiWishToDb hatası çözüldü
    const { error } = await supabase.from("wishes").update({
      name: nextWish.name,
      message: nextWish.message
    }).eq("id", wishId);
    
    if (error) { setAdminSaveMessage?.(t('admin.couldNotUpdate')); return; }
    setWishes((prev) => prev.map((item) => (item.id === wishId ? nextWish : item)));
  }, [wishes, setWishes, setAdminSaveMessage, showAppPrompt, t]);

  const toggleWishApproval = useCallback(async (wishId) => {
    const wish = wishes.find((item) => item.id === wishId);
    if (!wish) return;
    const nextApproved = wish.approved === false;
    const { error } = await supabase.from("wishes").update({ approved: nextApproved }).eq("id", wishId);
    if (error) { setAdminSaveMessage?.(t('admin.couldNotChangeStatus')); return; }
    setWishes((prev) => prev.map((item) => (item.id === wishId ? { ...item, approved: nextApproved } : item)));
  }, [wishes, setWishes, setAdminSaveMessage, t]);

  return {
    submitGuest,
    submitWish,
    clearGuests,
    clearWishes,
    deleteGuest,
    editGuest,
    deleteWish,
    editWish,
    toggleWishApproval
  };
}