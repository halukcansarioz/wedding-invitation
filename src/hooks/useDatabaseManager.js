import { useCallback, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { getSupabaseSetupMessage, isSupabaseReady } from "../services/database";
import { uiGuestToDb, dbGuestToUi, dbWishToUi } from "../utils/helpers";
import { useAdminStore } from "../store/useAdminStore"; // EKLENDİ: Admin durumunu kontrol etmek için

export function useDatabaseManager({ guests, setGuests, wishes, setWishes, settings, showAppAlert, showAppConfirm, showAppPrompt, setAdminSaveMessage, t, isEn }) {
  
  useEffect(() => {
    if (!isSupabaseReady()) return;

    const wishesChannel = supabase.channel("public:wishes")
      .on("postgres_changes", { event: "*", schema: "public", table: "wishes" }, (payload) => {
        const isAdmin = useAdminStore.getState().isAdminUnlocked; // EKLENDİ: Anlık admin kontrolü
        
        if (payload.eventType === "INSERT") {
          // Adminse hepsini, değilse sadece onaylıları anında gör
          if (payload.new.approved || isAdmin) {
            setWishes((prev) => prev.some(w => w.id === payload.new.id) ? prev : [dbWishToUi(payload.new), ...prev]);
          }
        } else if (payload.eventType === "UPDATE") {
          if (isAdmin) {
             setWishes((prev) => prev.map(w => w.id === payload.new.id ? dbWishToUi(payload.new) : w));
          } else {
             // Ziyaretçiler için: Onaylandıysa listeye ekle/güncelle, onayı alındıysa listeden gizle
             if (payload.new.approved) {
               setWishes((prev) => prev.some(w => w.id === payload.new.id) 
                 ? prev.map(w => w.id === payload.new.id ? dbWishToUi(payload.new) : w)
                 : [dbWishToUi(payload.new), ...prev]);
             } else {
               setWishes((prev) => prev.filter(w => w.id !== payload.new.id));
             }
          }
        } else if (payload.eventType === "DELETE") {
          setWishes((prev) => prev.filter(w => w.id !== payload.old.id));
        }
      }).subscribe();

    const guestsChannel = supabase.channel("public:guests")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "guests" }, (payload) => {
        if (payload.new) setGuests((prev) => prev.some(g => g.id === payload.new.id) ? prev : [dbGuestToUi(payload.new), ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "guests" }, (payload) => {
        if (payload.new) setGuests((prev) => prev.map(g => g.id === payload.new.id ? dbGuestToUi(payload.new) : g));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "guests" }, (payload) => {
        setGuests((prev) => prev.filter(g => g.id !== payload.old.id)); // EKLENDİ: Silinme dinleyicisi
      }).subscribe();

    return () => {
      supabase.removeChannel(wishesChannel);
      supabase.removeChannel(guestsChannel);
    };
  }, [setWishes, setGuests]);

  useEffect(() => {
    const syncOfflineData = async () => {
      if (!navigator.onLine || !isSupabaseReady()) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const offlineGuests = JSON.parse(localStorage.getItem('offline_guests') || '[]');
      if (offlineGuests.length > 0) {
        for (const guest of offlineGuests) {
          await supabase.functions.invoke('submit-form', {
            body: { type: 'guest', data: guest, turnstileToken: "OFFLINE_TOKEN" },
            headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
          });
        }
        localStorage.removeItem('offline_guests');
      }

      const offlineWishes = JSON.parse(localStorage.getItem('offline_wishes') || '[]');
      if (offlineWishes.length > 0) {
        for (const wish of offlineWishes) {
          await supabase.functions.invoke('submit-form', {
            body: { type: 'wish', data: wish, turnstileToken: "OFFLINE_TOKEN" },
            headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
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
      offlineGuests.push(uiGuestToDb(formData));
      localStorage.setItem('offline_guests', JSON.stringify(offlineGuests));
      await showAppAlert?.(isEn ? "Saved offline. Will sync automatically." : "İnternet yok. Bağlantı geldiğinde form otomatik gönderilecek.", { title: "Çevrimdışı 📶" });
      return;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('submit-form', {
        body: { type: 'guest', data: uiGuestToDb(formData), turnstileToken: formData.turnstileToken }
      });
      
      if (error || !data.success) throw new Error(error?.message || data?.error || "Sunucu hatası.");
      
      setGuests((prev) => prev.map(g => g.id === tempId ? dbGuestToUi(data.data) : g));
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
      offlineWishes.push({ name: formData.name, message: formData.message, approved: shouldPublishNow });
      localStorage.setItem('offline_wishes', JSON.stringify(offlineWishes));
      return;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('submit-form', {
        body: { 
          type: 'wish', 
          data: { name: formData.name, message: formData.message, approved: shouldPublishNow }, 
          turnstileToken: formData.turnstileToken 
        }
      });
      
      if (error || !data.success) throw new Error(error?.message || data?.error || "Sunucu hatası.");
      
      if (shouldPublishNow) {
        setWishes((prev) => prev.map(w => w.id === tempId ? dbWishToUi(data.data) : w));
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

  const clearGuests = useCallback(async () => {
    const confirmed = await showAppConfirm?.(
      isEn ? "Delete all RSVP records? This cannot be undone." : "Tüm katılım kayıtları silinsin mi? Bu işlem geri alınamaz.",
      { title: isEn ? "Clear Guests" : "Tümünü Sil", tone: "danger" }
    );
    if (!confirmed) return;

    const previousGuests = [...guests];
    setGuests([]); 

    if (navigator.onLine && isSupabaseReady()) {
      const { error } = await supabase.from('guests').delete().not('id', 'is', null);
      if (error) {
        setGuests(previousGuests);
        setAdminSaveMessage?.(isEn ? "Error clearing guests." : "Kayıtlar silinemedi.");
      } else {
        setAdminSaveMessage?.(isEn ? "All guests cleared." : "Tüm katılım kayıtları başarıyla silindi.");
      }
    }
  }, [guests, setGuests, showAppConfirm, setAdminSaveMessage, isEn]);

  const clearWishes = useCallback(async () => {
    const confirmed = await showAppConfirm?.(
      isEn ? "Delete all guestbook messages? This cannot be undone." : "Tüm anı defteri mesajları silinsin mi? Bu işlem geri alınamaz.",
      { title: isEn ? "Clear Guestbook" : "Tümünü Sil", tone: "danger" }
    );
    if (!confirmed) return;

    const previousWishes = [...wishes];
    setWishes([]); 

    if (navigator.onLine && isSupabaseReady()) {
      const { error } = await supabase.from('wishes').delete().not('id', 'is', null);
      if (error) {
        setWishes(previousWishes);
        setAdminSaveMessage?.(isEn ? "Error clearing wishes." : "Mesajlar silinemedi.");
      } else {
        setAdminSaveMessage?.(isEn ? "All wishes cleared." : "Tüm mesajlar başarıyla silindi.");
      }
    }
  }, [wishes, setWishes, showAppConfirm, setAdminSaveMessage, isEn]);

  const deleteGuest = useCallback(async (guestId) => {
    const confirmed = await showAppConfirm?.(
      isEn ? "Delete this RSVP record?" : "Bu katılım kaydı silinsin mi?",
      { title: isEn ? "Delete Record" : "Kaydı Sil", tone: "danger" }
    );
    if (!confirmed) return;

    const previousGuests = [...guests];
    setGuests(prev => prev.filter(g => g.id !== guestId));

    if (navigator.onLine && isSupabaseReady()) {
      const { error } = await supabase.from('guests').delete().eq('id', guestId);
      if (error) {
        setGuests(previousGuests);
        setAdminSaveMessage?.(isEn ? "Error deleting record." : "Kayıt silinemedi.");
      } else {
        setAdminSaveMessage?.(isEn ? "Record deleted." : "Kayıt silindi.");
      }
    }
  }, [guests, setGuests, showAppConfirm, setAdminSaveMessage, isEn]);

  const deleteWish = useCallback(async (wishId) => {
    const confirmed = await showAppConfirm?.(
      isEn ? "Delete this message?" : "Bu mesaj silinsin mi?",
      { title: isEn ? "Delete Message" : "Mesajı Sil", tone: "danger" }
    );
    if (!confirmed) return;

    const previousWishes = [...wishes];
    setWishes(prev => prev.filter(w => w.id !== wishId));

    if (navigator.onLine && isSupabaseReady()) {
      const { error } = await supabase.from('wishes').delete().eq('id', wishId);
      if (error) {
        setWishes(previousWishes);
        setAdminSaveMessage?.(isEn ? "Error deleting message." : "Mesaj silinemedi.");
      } else {
        setAdminSaveMessage?.(isEn ? "Message deleted." : "Mesaj silindi.");
      }
    }
  }, [wishes, setWishes, showAppConfirm, setAdminSaveMessage, isEn]);

  const toggleWishApproval = useCallback(async (wishId) => {
    const wish = wishes.find(w => w.id === wishId);
    if (!wish) return;

    const newStatus = !wish.approved;
    setWishes(prev => prev.map(w => w.id === wishId ? { ...w, approved: newStatus } : w));

    if (navigator.onLine && isSupabaseReady()) {
      const { error } = await supabase.from('wishes').update({ approved: newStatus }).eq('id', wishId);
      if (error) {
        setWishes(prev => prev.map(w => w.id === wishId ? { ...w, approved: !newStatus } : w));
        setAdminSaveMessage?.(isEn ? "Could not change status." : "Durum değiştirilemedi.");
      } else {
        setAdminSaveMessage?.(isEn ? "Status updated." : "Mesaj durumu güncellendi.");
      }
    }
  }, [wishes, setWishes, setAdminSaveMessage, isEn]);

  const editWish = useCallback(async (wishId) => {
    const wish = wishes.find(w => w.id === wishId);
    if (!wish) return;

    const newMessage = await showAppPrompt?.(
      isEn ? "Edit the message text:" : "Bu mesajı düzenle:",
      wish.message,
      { title: isEn ? "Edit Message" : "Mesaj Düzenle", multiline: true }
    );

    if (newMessage !== null && newMessage.trim() !== wish.message) {
      const updatedMessage = newMessage.trim();
      setWishes(prev => prev.map(w => w.id === wishId ? { ...w, message: updatedMessage } : w));

      if (navigator.onLine && isSupabaseReady()) {
        const { error } = await supabase.from('wishes').update({ message: updatedMessage }).eq('id', wishId);
        if (error) {
          setWishes(prev => prev.map(w => w.id === wishId ? { ...w, message: wish.message } : w));
          setAdminSaveMessage?.(isEn ? "Error updating message." : "Mesaj güncellenemedi.");
        } else {
           setAdminSaveMessage?.(isEn ? "Message updated." : "Mesaj başarıyla güncellendi.");
        }
      }
    }
  }, [wishes, setWishes, showAppPrompt, setAdminSaveMessage, isEn]);

  const editGuest = useCallback(async (guestId) => {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;

    const newNote = await showAppPrompt?.(
      isEn ? "Add/Edit admin note for this guest:" : "Bu misafirin notunu/kendi admin notunuzu düzenleyin:",
      guest.note || "",
      { title: isEn ? "Edit Note" : "Notu Düzenle", multiline: true }
    );

    if (newNote !== null && newNote.trim() !== (guest.note || "")) {
      const updatedNote = newNote.trim();
      setGuests(prev => prev.map(g => g.id === guestId ? { ...g, note: updatedNote } : g));

      if (navigator.onLine && isSupabaseReady()) {
        const { error } = await supabase.from('guests').update({ note: updatedNote }).eq('id', guestId);
        if (error) {
          setGuests(prev => prev.map(g => g.id === guestId ? { ...g, note: guest.note } : g));
          setAdminSaveMessage?.(isEn ? "Error updating note." : "Not güncellenemedi.");
        } else {
           setAdminSaveMessage?.(isEn ? "Note updated." : "Misafir notu güncellendi.");
        }
      }
    }
  }, [guests, setGuests, showAppPrompt, setAdminSaveMessage, isEn]);

  return { submitGuest, submitWish, clearGuests, clearWishes, deleteGuest, editGuest, deleteWish, editWish, toggleWishApproval, toggleCheckIn, assignTable };
}