import React from "react";
import { AdminSection, AdminCheckbox, AdminImageField, AdminVideoField, AdminMusicField, AdminActionButtons } from "../../AdminUI";
import { useStore } from "../../../store/useStore";
import { uploadMediaFile } from "../../../services/database";

export function GalleryTab({ isEn }) {
  const adminDraft = useStore((state) => state.adminDraft);
  const updateDraftObject = useStore((state) => state.updateDraftObject);
  const saveSiteContent = useStore((state) => state.saveSiteContent);

  if (!adminDraft?.settings) return null;

  // Medya yükleme işlemleri
  const handleMediaUpload = async (group, key, file, folder="media") => {
    if(!file) return;
    const url = await uploadMediaFile(file, folder);
    if(url) updateDraftObject(group, key, url);
  };
  
  const handleMusicUpload = async (file) => {
    if(!file) return;
    const url = await uploadMediaFile(file, "music");
    if(url) {
      updateDraftObject("invitation", "musicFile", url);
      updateDraftObject("invitation", "musicName", file.name);
    }
  };

  const handleGalleryUpload = async (index, file) => {
    if(!file) return;
    const url = await uploadMediaFile(file, "images");
    if(url) {
      const newGallery = [...(adminDraft.invitation?.gallery || [])];
      newGallery[index] = url;
      updateDraftObject("invitation", "gallery", newGallery);
    }
  };

  const removeGalleryItem = (index) => {
    const newGallery = [...(adminDraft.invitation?.gallery || [])];
    newGallery.splice(index, 1);
    updateDraftObject("invitation", "gallery", newGallery);
  };

  const moveGalleryItem = (index, direction) => {
    const newGallery = [...(adminDraft.invitation?.gallery || [])];
    if (index + direction < 0 || index + direction >= newGallery.length) return;
    const temp = newGallery[index];
    newGallery[index] = newGallery[index + direction];
    newGallery[index + direction] = temp;
    updateDraftObject("invitation", "gallery", newGallery);
  };

  return (
    <AdminSection title={isEn ? "Visuals and Music" : "Görsel ve Müzik"} onSave={() => saveSiteContent(isEn)}>
      <div className="admin-theme-check-row" style={{ marginBottom: "24px" }}>
        <AdminCheckbox checked={adminDraft.settings.visibility?.gallery ?? true} label={isEn ? "Show Gallery Section" : "Galeri bölümünü göster"} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, gallery: v })} />
      </div>
      <div className="admin-edit-grid">
        <AdminImageField label={isEn ? "Hero Main Image" : "Ana Karşılama Görseli"} value={adminDraft.invitation?.heroImage} onFileSelect={(e) => handleMediaUpload("invitation", "heroImage", e.target.files[0], "images")} onClear={() => updateDraftObject("invitation", "heroImage", "")} />
        <AdminVideoField label={isEn ? "Hero Background Video" : "Karşılama Arka Plan Videosu"} value={adminDraft.invitation?.heroVideo} onFileSelect={(e) => handleMediaUpload("invitation", "heroVideo", e.target.files[0], "video")} onClear={() => updateDraftObject("invitation", "heroVideo", "")} />
        <AdminMusicField label={isEn ? "Music File" : "Müzik dosyası"} value={adminDraft.invitation?.musicFile} fileName={adminDraft.invitation?.musicName} onFileSelect={(e) => handleMusicUpload(e.target.files[0])} onClear={() => { updateDraftObject("invitation", "musicFile", ""); updateDraftObject("invitation", "musicName", ""); }} />
      </div>
      <div style={{ marginTop: "32px" }}>
        <h4 style={{ marginBottom: "16px", color: "var(--rose-deep)" }}>{isEn ? "Gallery Photos" : "Galeri Fotoğrafları"}</h4>
        <div className="admin-gallery-list">
          {(adminDraft.invitation?.gallery || []).map((imgUrl, index) => (
            <div key={index} className="admin-gallery-upload-row">
              <AdminImageField label={`${isEn ? "Photo" : "Fotoğraf"} ${index + 1}`} value={imgUrl} onFileSelect={(e) => handleGalleryUpload(index, e.target.files[0])} onClear={() => removeGalleryItem(index)} />
              <AdminActionButtons 
                onMoveUp={index > 0 ? () => moveGalleryItem(index, -1) : null}
                onMoveDown={index < (adminDraft.invitation?.gallery?.length || 0) - 1 ? () => moveGalleryItem(index, 1) : null}
                onSave={() => saveSiteContent(isEn)} onDelete={() => removeGalleryItem(index)} isEn={isEn} 
              />
            </div>
          ))}
          <button type="button" className="admin-add-button" onClick={() => updateDraftObject("invitation", "gallery", [...(adminDraft.invitation?.gallery || []), ""])}>{isEn ? "Add New Photo" : "Yeni Fotoğraf Ekle"}</button>
        </div>
      </div>
    </AdminSection>
  );
}