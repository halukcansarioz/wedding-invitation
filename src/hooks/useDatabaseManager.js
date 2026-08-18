import { useCallback } from "react";
import { supabase } from "../supabaseClient";
import { getSupabaseSetupMessage, isSupabaseReady } from "../services/database";
import { uiGuestToDb, dbGuestToUi, uiWishToDb, dbWishToUi } from "../utils/helpers";
import { INITIAL_GUEST_FORM, INITIAL_WISH_FORM } from "../config/constants";

export function useDatabaseManager({ guests, setGuests, wishes, setWishes, settings, showAppAlert, showAppConfirm, showAppPrompt, setAdminSaveMessage, t, isEn }) {
  const submitGuest = useCallback(async (formData) => {
      if (!isSupabaseReady()) {
        await showAppAlert(getSupabaseSetupMessage(), { title: t('alerts.supabaseMissingTitle') });
        return;
      }
      try {
        const dbData = uiGuestToDb(formData);
        const { data, error } = await supabase.from("guests").insert(dbData).select("*").single();
        if (error) throw error;
        
        setGuests((prev) => [data ? dbGuestToUi(data) : { id: `local-${Date.now()}`, ...formData }, ...prev]);

        if (formData.attendance === "Katılacağım") {
          await showAppAlert(t('alerts.rsvpSuccess'), { title: t('alerts.saveTitle') });
        }
      } catch (error) {
        console.error("Katılım kaydedilemedi:", error);
        const errorMsg = error?.message || (isEn ? "Unknown error" : "Bilinmeyen hata");
        await showAppAlert(t('alerts.rsvpError', { message: errorMsg }), { title: t('alerts.saveErrorTitle') });
      }
    }, [setGuests, showAppAlert, t, isEn]);

  const submitWish = useCallback(async (formData) => {
    if (!isSupabaseReady()) {
      await showAppAlert(getSupabaseSetupMessage(), { title: t('alerts.supabaseMissingTitle') });
      return;
    }
    const shouldPublishNow = !settings.requireWishApproval;
    try {
      const { data, error } = await supabase.from("wishes").insert({ name: formData.name.trim(), message: formData.message.trim(), approved: shouldPublishNow }).select("*").single();
      if (error) throw error;
      if (shouldPublishNow) {
        setWishes((prev) => [data ? dbWishToUi(data) : { id: `local-${Date.now()}`, ...formData, approved: true }, ...prev]);
      }
      await showAppAlert(settings.requireWishApproval ? t('alerts.wishSentApproval') : t('alerts.wishSaved'), { title: settings.requireWishApproval ? (isEn ? "Sent for approval" : "Onaya gönderildi") : t('alerts.saveTitle') });
    } catch (error) {
      console.error("Mesaj kaydedilemedi:", error);
      const errorMsg = error?.message || (isEn ? "Unknown error" : "Bilinmeyen hata");
      await showAppAlert(t('alerts.wishError', { message: errorMsg }), { title: t('alerts.saveErrorTitle') });
    }
  }, [setWishes, settings.requireWishApproval, showAppAlert, t, isEn]);

  const clearGuests = useCallback(async () => {
    const confirmed = await showAppConfirm(
      isEn ? "Delete all RSVP records?" : "Tüm katılım kayıtları silinsin mi?",
      { title: isEn ? "Clear Guests" : "Katılım kayıtlarını sil" }
    );
    if (!confirmed) return;
    const { error } = await supabase.from("guests").delete().not("id", "is", null);
    if (error) { console.error("Silinemedi:", error); setAdminSaveMessage(isEn ? "Could not delete." : "Silinemedi."); return; }
    setGuests([]);
  }, [setGuests, setAdminSaveMessage, showAppConfirm, isEn]);

  const clearWishes = useCallback(async () => {
    const confirmed = await showAppConfirm(
      isEn ? "Delete all guestbook messages?" : "Tüm anı defteri mesajları silinsin mi?",
      { title: isEn ? "Clear Guestbook" : "Anı defterini temizle" }
    );
    if (!confirmed) return;
    const { error } = await supabase.from("wishes").delete().not("id", "is", null);
    if (error) { console.error("Silinemedi:", error); setAdminSaveMessage(isEn ? "Could not delete." : "Silinemedi."); return; }
    setWishes([]);
  }, [setWishes, setAdminSaveMessage, showAppConfirm, isEn]);

  const deleteGuest = useCallback(async (guestId) => {
    const confirmed = await showAppConfirm(
      isEn ? "Delete this RSVP record?" : "Bu katılım kaydı silinsin mi?",
      { title: isEn ? "Delete Record" : "Kaydı sil" }
    );
    if (!confirmed) return;
    const { error } = await supabase.from("guests").delete().eq("id", guestId);
    if (error) { console.error("Silinemedi:", error); setAdminSaveMessage(isEn ? "Could not delete." : "Silinemedi."); return; }
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
  }, [setGuests, setAdminSaveMessage, showAppConfirm, isEn]);

  const editGuest = useCallback(async (guestId) => {
    const guest = guests.find((item) => item.id === guestId);
    if (!guest) return;
    const title = isEn ? "Edit RSVP" : "Katılım kaydını düzenle";

    const name = await showAppPrompt(isEn ? "Full Name" : "Ad Soyad", guest.name || "", { title }); if (name === null) return;
    const phone = await showAppPrompt(isEn ? "Phone" : "Telefon", guest.phone || "", { title }); if (phone === null) return;
    const attendance = await showAppPrompt(isEn ? "Attendance (Katılacağım/Katılamayacağım)" : "Katılım durumu", guest.attendance || "Katılacağım", { title }); if (attendance === null) return;
    
    // DÜZELTME: Girilen kişi sayısının sayı olup olmadığını kontrol ediyoruz
    let personCountInput = await showAppPrompt(isEn ? "Person Count" : "Kişi sayısı", guest.personCount || "1", { title }); 
    if (personCountInput === null) return;
    
    let parsedCount = parseInt(personCountInput, 10);
    if (isNaN(parsedCount) || parsedCount < 0) {
      parsedCount = 1; // Eğer metin girildiyse varsayılan olarak 1 al
    }
    const personCount = String(parsedCount);

    const side = await showAppPrompt(isEn ? "Side" : "Taraf", guest.side || "Gelin Tarafı", { title }); if (side === null) return;
    const hasChild = await showAppPrompt(isEn ? "Has children? (Evet/Hayır)" : "Çocuk var mı? Evet/Hayır", guest.hasChild || "Hayır", { title }); if (hasChild === null) return;
    const songRequest = await showAppPrompt(isEn ? "Song Request" : "Müzik isteği", guest.songRequest || "", { title }); if (songRequest === null) return;
    const note = await showAppPrompt(isEn ? "Note" : "Not", guest.note || "", { title, multiline: true }); if (note === null) return;

    const nextGuest = { ...guest, name, phone, attendance, personCount, side, hasChild, songRequest, note };
    const { error } = await supabase.from("guests").update(uiGuestToDb(nextGuest)).eq("id", guestId);
    if (error) { console.error("Güncellenemedi:", error); setAdminSaveMessage(isEn ? "Could not update." : "Güncellenemedi."); return; }
    setGuests((prev) => prev.map((item) => (item.id === guestId ? nextGuest : item)));
  }, [guests, setGuests, setAdminSaveMessage, showAppPrompt, isEn]);

  const deleteWish = useCallback(async (wishId) => {
    const confirmed = await showAppConfirm(
      isEn ? "Delete this message?" : "Bu anı defteri mesajı silinsin mi?",
      { title: isEn ? "Delete Message" : "Mesajı sil" }
    );
    if (!confirmed) return;
    const { error } = await supabase.from("wishes").delete().eq("id", wishId);
    if (error) { console.error("Silinemedi:", error); setAdminSaveMessage(isEn ? "Could not delete." : "Silinemedi."); return; }
    setWishes((prev) => prev.filter((w) => w.id !== wishId));
  }, [setWishes, setAdminSaveMessage, showAppConfirm, isEn]);

  const editWish = useCallback(async (wishId) => {
    const wish = wishes.find((item) => item.id === wishId);
    if (!wish) return;
    const title = isEn ? "Edit Message" : "Mesajı düzenle";

    const name = await showAppPrompt(isEn ? "Full Name" : "Ad Soyad", wish.name || "", { title }); if (name === null) return;
    const message = await showAppPrompt(isEn ? "Message" : "Mesaj", wish.message || "", { title, multiline: true }); if (message === null) return;

    const nextWish = { ...wish, name, message };
    const { error } = await supabase.from("wishes").update(uiWishToDb(nextWish)).eq("id", wishId);
    if (error) { console.error("Güncellenemedi:", error); setAdminSaveMessage(isEn ? "Could not update." : "Güncellenemedi."); return; }
    setWishes((prev) => prev.map((item) => (item.id === wishId ? nextWish : item)));
  }, [wishes, setWishes, setAdminSaveMessage, showAppPrompt, isEn]);

  const toggleWishApproval = useCallback(async (wishId) => {
    const wish = wishes.find((item) => item.id === wishId);
    if (!wish) return;
    const nextApproved = wish.approved === false;
    const { error } = await supabase.from("wishes").update({ approved: nextApproved }).eq("id", wishId);
    if (error) { console.error("Değiştirilemedi:", error); setAdminSaveMessage(isEn ? "Could not change status." : "Değiştirilemedi."); return; }
    setWishes((prev) => prev.map((item) => (item.id === wishId ? { ...item, approved: nextApproved } : item)));
  }, [wishes, setWishes, setAdminSaveMessage, isEn]);

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