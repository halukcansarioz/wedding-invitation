import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useStore } from "../store/useStore";
import { deleteMediaFile } from "../services/database";

export interface GuestPhoto {
  id: string;
  image_url: string;
  approved: boolean;
  created_at: string;
  tenant_id?: string;
}

export function useAdminGuestPhotos(isEn: boolean) {
  const showAppAlert = useStore(state => state.showAppAlert);
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPhotos = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('guest_photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPhotos(data as GuestPhoto[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const approvePhoto = async (id: string) => {
    const { error } = await supabase.from('guest_photos').update({ approved: true }).eq('id', id);
    if (!error) {
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, approved: true } : p));
      showAppAlert(isEn ? "Photo approved!" : "Fotoğraf onaylandı ve galeriye eklendi!");
    } else {
      showAppAlert(isEn ? "Error approving photo." : "Fotoğraf onaylanırken hata oluştu.", { tone: "error" });
    }
  };

  const rejectPhoto = async (id: string, imageUrl: string) => {
    if (!window.confirm(isEn ? "Delete this photo permanently?" : "Bu fotoğrafı kalıcı olarak silmek istiyor musunuz?")) return;

    // 1. Storage'dan fiziksel olarak sil
    await deleteMediaFile(imageUrl).catch(console.error);

    // 2. Veritabanından sil
    const { error } = await supabase.from('guest_photos').delete().eq('id', id);
    if (!error) {
      setPhotos(prev => prev.filter(p => p.id !== id));
      showAppAlert(isEn ? "Photo deleted." : "Fotoğraf silindi.");
    } else {
      showAppAlert(isEn ? "Error deleting photo." : "Fotoğraf silinirken hata oluştu.", { tone: "error" });
    }
  };

  return {
    photos,
    isLoading,
    approvePhoto,
    rejectPhoto,
    pendingPhotos: photos.filter(p => !p.approved),
    approvedPhotos: photos.filter(p => p.approved)
  };
}