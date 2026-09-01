import React from "react";
import { AdminSection, AdminCheckbox, AdminImageField, AdminVideoField, AdminMusicField, AdminActionButtons } from "../../AdminUI";

export function GalleryTab({ adminDraft, updateDraftObject, saveSiteContent, updateDraftImage, clearDraftImage, updateDraftVideo, clearDraftVideo, updateDraftMusic, clearDraftMusic, updateGalleryImageFile, removeGalleryItem, addGalleryItem, moveDraftArrayItem, isEn }) {
  return (
    <AdminSection title={isEn ? "Visuals and Music" : "Görsel ve Müzik"} onSave={saveSiteContent}>
      <div className="admin-theme-check-row" style={{ marginBottom: "24px" }}>
        <AdminCheckbox checked={adminDraft.settings.visibility?.gallery ?? true} label={isEn ? "Show Gallery Section" : "Galeri bölümünü göster"} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, gallery: v })} />
      </div>
      <div className="admin-edit-grid">
        <AdminImageField label={isEn ? "Hero Main Image" : "Ana Karşılama Görseli"} value={adminDraft.invitation?.heroImage} onFileSelect={(e) => updateDraftImage("invitation", "heroImage", e.target.files[0])} onClear={() => clearDraftImage("invitation", "heroImage")} />
        <AdminVideoField label={isEn ? "Hero Background Video" : "Karşılama Arka Plan Videosu"} value={adminDraft.invitation?.heroVideo} onFileSelect={(e) => updateDraftVideo("invitation", "heroVideo", e.target.files[0])} onClear={() => clearDraftVideo("invitation", "heroVideo")} />
        <AdminMusicField label={isEn ? "Music File" : "Müzik dosyası"} value={adminDraft.invitation?.musicFile} fileName={adminDraft.invitation?.musicName} onFileSelect={(e) => updateDraftMusic(e.target.files[0])} onClear={clearDraftMusic} />
      </div>
      <div style={{ marginTop: "32px" }}>
        <h4 style={{ marginBottom: "16px", color: "var(--rose-deep)" }}>{isEn ? "Gallery Photos" : "Galeri Fotoğrafları"}</h4>
        <div className="admin-gallery-list">
          {(adminDraft.invitation?.gallery || []).map((imgUrl, index) => (
            <div key={index} className="admin-gallery-upload-row">
              <AdminImageField label={`${isEn ? "Photo" : "Fotoğraf"} ${index + 1}`} value={imgUrl} onFileSelect={(e) => updateGalleryImageFile(index, e.target.files[0])} onClear={() => removeGalleryItem(index)} />
              <AdminActionButtons 
                onMoveUp={index > 0 ? () => moveDraftArrayItem("invitation", index, -1) : null}
                onMoveDown={index < adminDraft.invitation.gallery.length - 1 ? () => moveDraftArrayItem("invitation", index, 1) : null}
                onSave={saveSiteContent} onDelete={() => removeGalleryItem(index)} isEn={isEn} 
              />
            </div>
          ))}
          <button type="button" className="admin-add-button" onClick={addGalleryItem}>{isEn ? "Add New Photo" : "Yeni Fotoğraf Ekle"}</button>
        </div>
      </div>
    </AdminSection>
  );
}