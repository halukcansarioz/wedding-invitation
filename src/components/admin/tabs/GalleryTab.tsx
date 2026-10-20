import React, { useState, ChangeEvent } from "react";
import { AdminSection, AdminCheckbox, AdminImageField, AdminVideoField, AdminMusicField, AdminActionButtons } from "../../AdminUI";
import { useStore } from "../../../store/useStore";
import { uploadMediaFile, deleteMediaFile } from "../../../services/database";

export function GalleryTab({ isEn }: { isEn: boolean }) {
  const adminDraft = useStore((state) => state.adminDraft);
  const updateDraftObject = useStore((state) => state.updateDraftObject);
  const saveSiteContent = useStore((state) => state.saveSiteContent);

  const [uploadingStates, setUploadingStates] = useState<Record<string, boolean>>({});

  if (!adminDraft?.settings) return null;

  const handleMediaUpload = async (group: "invitation", key: string, file?: File | null, folder = "media") => {
    if (!file) return;
    setUploadingStates(prev => ({ ...prev, [key]: true }));
    try {
      const url = await uploadMediaFile(file, folder);
      if (url) {
        const oldUrl = (adminDraft[group] as Record<string, any>)?.[key];
        if (oldUrl) await deleteMediaFile(oldUrl).catch(() => {});
        updateDraftObject(group, key, url);
      }
    } finally {
      setUploadingStates(prev => ({ ...prev, [key]: false }));
    }
  };
  
  const handleMusicUpload = async (file?: File | null) => {
    if (!file) return;
    setUploadingStates(prev => ({ ...prev, musicFile: true }));
    try {
      const url = await uploadMediaFile(file, "music");
      if (url) {
        const oldUrl = adminDraft.invitation?.musicFile;
        if (oldUrl) await deleteMediaFile(oldUrl).catch(() => {});

        updateDraftObject("invitation", "musicFile", url);
        updateDraftObject("invitation", "musicName", file.name);
      }
    } finally {
      setUploadingStates(prev => ({ ...prev, musicFile: false }));
    }
  };

  const handleGalleryUpload = async (index: number, file?: File | null) => {
    if (!file) return;
    const uploadKey = `gallery_${index}`;
    setUploadingStates(prev => ({ ...prev, [uploadKey]: true }));
    try {
      const url = await uploadMediaFile(file, "images");
      if (url) {
        const oldUrl = adminDraft.invitation?.gallery?.[index];
        if (oldUrl) await deleteMediaFile(oldUrl).catch(() => {});

        const newGallery = [...(adminDraft.invitation?.gallery || [])];
        newGallery[index] = url;
        updateDraftObject("invitation", "gallery", newGallery);
      }
    } finally {
      setUploadingStates(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const removeGalleryItem = async (index: number) => {
    const newGallery = [...(adminDraft.invitation?.gallery || [])];
    const oldUrl = newGallery[index];
    
    if (oldUrl) await deleteMediaFile(oldUrl).catch(() => {});
    
    newGallery.splice(index, 1);
    updateDraftObject("invitation", "gallery", newGallery);
  };

  const clearSingleMedia = async (group: "invitation", key: string) => {
    const oldUrl = (adminDraft[group] as Record<string, any>)?.[key];
    if (oldUrl) await deleteMediaFile(oldUrl).catch(() => {});
    updateDraftObject(group, key, "");
    if (key === "musicFile") updateDraftObject(group, "musicName", "");
  };

  const moveGalleryItem = (index: number, direction: number) => {
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
        <AdminImageField 
          label={isEn ? "Hero Main Image" : "Ana Karşılama Görseli"} 
          value={adminDraft.invitation?.heroImage} 
          isUploading={uploadingStates["heroImage"]}
          onFileSelect={(e: ChangeEvent<HTMLInputElement>) => handleMediaUpload("invitation", "heroImage", e.target.files?.[0], "images")} 
          onClear={() => clearSingleMedia("invitation", "heroImage")} 
        />
        <AdminVideoField 
          label={isEn ? "Hero Background Video" : "Karşılama Arka Plan Videosu"} 
          value={adminDraft.invitation?.heroVideo} 
          isUploading={uploadingStates["heroVideo"]}
          onFileSelect={(e: ChangeEvent<HTMLInputElement>) => handleMediaUpload("invitation", "heroVideo", e.target.files?.[0], "video")} 
          onClear={() => clearSingleMedia("invitation", "heroVideo")} 
        />
        <AdminMusicField 
          label={isEn ? "Music File" : "Müzik dosyası"} 
          value={adminDraft.invitation?.musicFile} 
          fileName={adminDraft.invitation?.musicName} 
          isUploading={uploadingStates["musicFile"]}
          onFileSelect={(e: ChangeEvent<HTMLInputElement>) => handleMusicUpload(e.target.files?.[0])} 
          onClear={() => clearSingleMedia("invitation", "musicFile")} 
        />
      </div>
      <div style={{ marginTop: "32px" }}>
        <h4 style={{ marginBottom: "16px", color: "var(--rose-deep)" }}>{isEn ? "Gallery Photos" : "Galeri Fotoğrafları"}</h4>
        <div className="admin-gallery-list">
          {(adminDraft.invitation?.gallery || []).map((imgUrl: string, index: number) => (
            <div key={index} className="admin-gallery-upload-row">
              <AdminImageField 
                label={`${isEn ? "Photo" : "Fotoğraf"} ${index + 1}`} 
                value={imgUrl} 
                isUploading={uploadingStates[`gallery_${index}`]}
                onFileSelect={(e: ChangeEvent<HTMLInputElement>) => handleGalleryUpload(index, e.target.files?.[0])} 
                onClear={() => removeGalleryItem(index)} 
              />
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