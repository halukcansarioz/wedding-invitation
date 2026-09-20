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

  useEffect(() => {
    const syncOfflineData = async () => {
      if (!navigator.onLine || !isSupabaseReady()) return;
      
      const offlineGuests = JSON.parse(localStorage.getItem('offline_guests') || '[]');
      if (offlineGuests.length > 0) {
        for (const guest of offlineGuests) {
          await supabase.rpc('submit_guest_secure', { guest_data: guest, token: guest.token || "OFFLINE_SYNC" });
        }
        localStorage.removeItem('offline_guests');
      }

      const offlineWishes = JSON.parse(localStorage.getItem('offline_wishes') || '[]');
      if (offlineWishes.length > 0) {
        for (const wish of offlineWishes) {
          await supabase.rpc('submit_wish_secure', { 
            wish_name: wish.name, wish_message: wish.message, is_approved: wish.approved, token: wish.token || "OFFLINE_SYNC"
          });
        }
        localStorage.removeItem('offline_wishes');
      }

      const offlineCheckins = JSON.parse(localStorage.getItem('offline_checkins') || '[]');
      if (offlineCheckins.length > 0) {
        for (const checkin of offlineCheckins) {
          await supabase.from("guests").update({ has_arrived: checkin.status }).eq("id", checkin.id);
        }
        localStorage.removeItem('offline_checkins');
        setAdminSaveMessage?.(isEn ? "Offline check-ins synced!" : "Çevrimdışı kapı girişleri senkronize edildi!");
      }
    };

    window.addEventListener('online', syncOfflineData);
    return () => window.removeEventListener('online', syncOfflineData);
  }, [isEn, setAdminSaveMessage]);

  const submitGuest = useCallback(async (formData) => {
    if (formData.honeypot) return;
    
    const tempId = `temp-${Date.now()}`;
    setGuests((prev) => [{ id: tempId, ...formData }, ...prev]);

    if (!navigator.onLine) {
      const offlineGuests = JSON.parse(localStorage.getItem('offline_guests') || '[]');
      offlineGuests.push({ ...uiGuestToDb(formData), token: formData.turnstileToken || "OFFLINE_TOKEN" });
      localStorage.setItem('offline_guests', JSON.stringify(offlineGuests));
      await showAppAlert?.(isEn ? "Saved offline. Will sync automatically." : "İnternet yok. Bağlantı geldiğinde form otomatik gönderilecek.", { title: "Çevrimdışı 📶" });
      return;
    }
    
    try {
      const { data, error } = await supabase.rpc('submit_guest_secure', { guest_data: uiGuestToDb(formData), token: formData.turnstileToken || "MISSING_TOKEN" });
      if (error) throw error;
      
      setGuests((prev) => prev.map(g => g.id === tempId ? dbGuestToUi(data) : g));
      if (formData.attendance === "Katılacağım") await showAppAlert?.(t('alerts.rsvpSuccess'), { title: t('alerts.saveTitle') });
    } catch (error) {
      setGuests((prev) => prev.filter(g => g.id !== tempId));
      await showAppAlert?.(t('alerts.rsvpError', { message: error.message }), { title: t('alerts.saveErrorTitle') });
    }
  }, [setGuests, showAppAlert, t, isEn]);

  const submitWish = useCallback(async (formData) => {
    if (formData.honeypot) return;
    const shouldPublishNow = !settings?.requireWishApproval;
    const tempId = `temp-${Date.now()}`;

    if (shouldPublishNow) {
      setWishes((prev) => [{ id: tempId, ...formData, approved: true }, ...prev]);
    }

    if (!navigator.onLine) {
      const offlineWishes = JSON.parse(localStorage.getItem('offline_wishes') || '[]');
      offlineWishes.push({ name: formData.name, message: formData.message, approved: shouldPublishNow, token: formData.turnstileToken || "OFFLINE_TOKEN" });
      localStorage.setItem('offline_wishes', JSON.stringify(offlineWishes));
      return;
    }
    
    try {
      const { data, error } = await supabase.rpc('submit_wish_secure', { wish_name: formData.name, wish_message: formData.message, is_approved: shouldPublishNow, token: formData.turnstileToken || "MISSING_TOKEN" });
      if (error) throw error;
      
      if (shouldPublishNow) {
        setWishes((prev) => prev.map(w => w.id === tempId ? dbWishToUi(data) : w));
      }
      await showAppAlert?.(settings?.requireWishApproval ? t('alerts.wishSentApproval') : t('alerts.wishSaved'), { title: t('alerts.saveTitle') });
    } catch (error) {
      if (shouldPublishNow) setWishes((prev) => prev.filter(w => w.id !== tempId));
      await showAppAlert?.(t('alerts.wishError', { message: error.message }), { title: t('alerts.saveErrorTitle') });
    }
  }, [setWishes, settings?.requireWishApproval, showAppAlert, t, isEn]);

  const toggleCheckIn = useCallback(async (guestId, currentStatus) => {
    const nextStatus = !currentStatus;
    setGuests((prev) => prev.map((item) => (item.id === guestId ? { ...item, has_arrived: nextStatus } : item)));

    if (!navigator.onLine) {
      const offlineCheckins = JSON.parse(localStorage.getItem('offline_checkins') || '[]');
      const filtered = offlineCheckins.filter(c => c.id !== guestId);
      filtered.push({ id: guestId, status: nextStatus });
      localStorage.setItem('offline_checkins', JSON.stringify(filtered));
      setAdminSaveMessage?.(isEn ? "Saved offline." : "Giriş cihaza kaydedildi (Çevrimdışı).");
      return;
    }

    const { error } = await supabase.from("guests").update({ has_arrived: nextStatus }).eq("id", guestId);
    if (error) { 
      setGuests((prev) => prev.map((item) => (item.id === guestId ? { ...item, has_arrived: currentStatus } : item)));
      setAdminSaveMessage?.(isEn ? "Could not update status." : "Durum güncellenemedi."); 
    }
  }, [setGuests, setAdminSaveMessage, isEn]);

  const assignTable = useCallback(async (guestId, tableNumber) => {
    const currentGuest = guests.find(g => g.id === guestId);
    const prevTable = currentGuest?.tableNumber;

    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, tableNumber } : g));

    if (!navigator.onLine) {
      setAdminSaveMessage?.(isEn ? "Table assigned offline." : "Masa çevrimdışı atandı.");
      return;
    }

    const { error } = await supabase.from('guests').update({ table_number: tableNumber || null }).eq('id', guestId);
    if (error) {
      setGuests(prev => prev.map(g => g.id === guestId ? { ...g, tableNumber: prevTable } : g));
      setAdminSaveMessage?.(isEn ? "Error assigning table." : "Masa atanamadı.");
    }
  }, [guests, setGuests, setAdminSaveMessage, isEn]);

  const clearGuests = useCallback(async () => {}, []);
  const clearWishes = useCallback(async () => {}, []);
  const deleteGuest = useCallback(async (guestId) => {}, []);
  const editGuest = useCallback(async (guestId) => {}, []);
  const deleteWish = useCallback(async (wishId) => {}, []);
  const editWish = useCallback(async (wishId) => {}, []);
  const toggleWishApproval = useCallback(async (wishId) => {}, []);

  return { submitGuest, submitWish, clearGuests, clearWishes, deleteGuest, editGuest, deleteWish, editWish, toggleWishApproval, toggleCheckIn, assignTable };
}