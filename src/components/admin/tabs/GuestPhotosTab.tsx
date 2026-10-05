import React, { useCallback } from "react";
import { AdminSection } from "../../AdminUI";
import { useAdminGuestPhotos } from "../../../hooks/useAdminGuestPhotos";
import { Spinner } from "../../common/UIComponents";

interface GuestPhotosTabProps {
  isEn: boolean;
}

export function GuestPhotosTab({ isEn }: GuestPhotosTabProps) {
  const { isLoading, approvePhoto, rejectPhoto, pendingPhotos, approvedPhotos } = useAdminGuestPhotos(isEn);

  const handleApprove = useCallback((id: string) => () => approvePhoto(id), [approvePhoto]);
  const handleReject = useCallback((id: string, url: string) => () => rejectPhoto(id, url), [rejectPhoto]);

  return (
    <AdminSection title={isEn ? "Guest Uploads (POV)" : "Misafir Fotoğrafları (POV)"}>
      <p className="admin-help-text">
        {isEn 
          ? "Photos uploaded by guests appear here. Approved photos are shown in the main gallery." 
          : "Misafirlerin yüklediği fotoğraflar burada onayınıza düşer. Onayladığınız kareler ana galeride ziyaretçilere gösterilir."}
      </p>

      {isLoading ? (
        <div style={{ padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", color: "var(--rose-deep)" }}>
          <Spinner size={40} />
          <span style={{ fontWeight: 500, fontSize: "16px" }}>{isEn ? "Loading photos..." : "Fotoğraflar yükleniyor..."}</span>
        </div>
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
                  <button type="button" className="secondary-button danger-button" style={{ margin: 0, padding: "4px 8px", fontSize: "12px" }} onClick={handleReject(photo.id, photo.image_url)}>
                    {isEn ? "Delete 🗑" : "Sil 🗑️"}
                  </button>
                  <button type="button" className="main-button" style={{ margin: 0, padding: "4px 12px", fontSize: "12px", background: "#27ae60", borderColor: "#27ae60" }} onClick={handleApprove(photo.id)}>
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
                  onClick={handleReject(photo.id, photo.image_url)}
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