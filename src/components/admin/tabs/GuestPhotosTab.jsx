// src/components/admin/tabs/GuestPhotosTab.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AdminSection } from "../../AdminUI";
import { supabase } from "../../../supabaseClient";
import { useStore } from "../../../store/useStore";
import { deleteMediaFile } from "../../../services/database";

export function GuestPhotosTab({ isEn }) {
  const { t } = useTranslation();
  const showAppAlert = useStore(state => state.showAppAlert);
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Veritabanından fotoğrafları çek
  const fetchPhotos = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('guest_photos')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setPhotos(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Fotoğrafı Onayla (Galeride görünür yap)
  const approvePhoto = async (id) => {
    const { error } = await supabase.from('guest_photos').update({ approved: true }).eq('id', id);
    if (!error) {
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, approved: true } : p));
      showAppAlert(isEn ? "Photo approved!" : "Fotoğraf onaylandı ve galeriye eklendi!");
    }
  };

  // Fotoğrafı Sil (Hem veritabanından hem Storage'dan)
  const rejectPhoto = async (id, imageUrl) => {
    if (!window.confirm(isEn ? "Delete this photo permanently?" : "Bu fotoğrafı kalıcı olarak silmek istiyor musunuz?")) return;
    
    // 1. Storage'dan fiziksel olarak sil
    await deleteMediaFile(imageUrl).catch(console.error);
    
    // 2. Veritabanından sil
    const { error } = await supabase.from('guest_photos').delete().eq('id', id);
    if (!error) {
      setPhotos(prev => prev.filter(p => p.id !== id));
      showAppAlert(isEn ? "Photo deleted." : "Fotoğraf silindi.");
    }
  };

  const pendingPhotos = photos.filter(p => !p.approved);
  const approvedPhotos = photos.filter(p => p.approved);

  return (
    <AdminSection title={isEn ? "Guest Uploads (POV)" : "Misafir Fotoğrafları (POV)"}>
      <p className="admin-help-text">
        {isEn 
          ? "Photos uploaded by guests appear here. Approved photos are shown in the main gallery." 
          : "Misafirlerin yüklediği fotoğraflar burada onayınıza düşer. Onayladığınız kareler ana galeride ziyaretçilere gösterilir."}
      </p>

      {isLoading ? (
        <div style={{ padding: "20px", textAlign: "center" }}>{isEn ? "Loading..." : "Yükleniyor..."}</div>
      ) : (
        <>
          {/* ONAY BEKLEYENLER */}
          <h4 style={{ color: "var(--rose-deep)", marginTop: "10px", marginBottom: "16px" }}>
            {isEn ? `Pending Approval (${pendingPhotos.length})` : `Onay Bekleyenler (${pendingPhotos.length})`}
          </h4>
          
          <div className="gallery-grid" style={{ marginBottom: "40px" }}>
            {pendingPhotos.length === 0 && <p className="empty-text">{isEn ? "No pending photos." : "Onay bekleyen fotoğraf yok."}</p>}
            {pendingPhotos.map(photo => (
              <div key={photo.id} style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "2px solid #f1c40f" }}>
                <img src={photo.image_url} alt="Guest Upload" style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", background: "rgba(0,0,0,0.7)", padding: "10px", display: "flex", justifyContent: "space-between" }}>
                  <button type="button" className="secondary-button danger-button" style={{ margin: 0, padding: "4px 8px", fontSize: "12px" }} onClick={() => rejectPhoto(photo.id, photo.image_url)}>
                    {isEn ? "Delete 🗑️" : "Sil 🗑️"}
                  </button>
                  <button type="button" className="main-button" style={{ margin: 0, padding: "4px 12px", fontSize: "12px", background: "#27ae60", borderColor: "#27ae60" }} onClick={() => approvePhoto(photo.id)}>
                    {isEn ? "Approve ✅" : "Onayla ✅"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ONAYLANMIŞ OLANLAR */}
          <h4 style={{ color: "var(--text-muted)", marginBottom: "16px", borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: "20px" }}>
            {isEn ? `Approved & Published (${approvedPhotos.length})` : `Yayında Olanlar (${approvedPhotos.length})`}
          </h4>
          <div className="gallery-grid">
            {approvedPhotos.map(photo => (
              <div key={photo.id} style={{ position: "relative", borderRadius: "12px", overflow: "hidden" }}>
                <img src={photo.image_url} alt="Guest Upload" style={{ width: "100%", height: "150px", objectFit: "cover", display: "block", filter: "brightness(0.8)" }} />
                <button 
                  type="button" 
                  className="secondary-button danger-button" 
                  style={{ position: "absolute", top: "8px", right: "8px", margin: 0, padding: "4px 8px", fontSize: "12px" }} 
                  onClick={() => rejectPhoto(photo.id, photo.image_url)}
                >
                  {isEn ? "Remove" : "Kaldır"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminSection>
  );
}