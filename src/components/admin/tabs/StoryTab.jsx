import React, { useState } from "react"; // EKLENDİ: useState dahil edildi
import { AdminSection, AdminField, AdminTextarea, AdminCheckbox, AdminImageField, AdminActionButtons } from "../../AdminUI";
import { useStore } from "../../../store/useStore";
import { uploadMediaFile, deleteMediaFile } from "../../../services/database"; // EKLENDİ: deleteMediaFile dahil edildi

export function StoryTab({ isEn }) {
  const adminDraft = useStore((state) => state.adminDraft);
  const updateDraftObject = useStore((state) => state.updateDraftObject);
  const saveSiteContent = useStore((state) => state.saveSiteContent);
  const updateDraftArrayItem = useStore((state) => state.updateDraftArrayItem);
  const removeDraftArrayItem = useStore((state) => state.removeDraftArrayItem);
  const addDraftArrayItem = useStore((state) => state.addDraftArrayItem);
  const moveDraftArrayItem = useStore((state) => state.moveDraftArrayItem);

  // EKLENDİ: Yükleme state'leri için obje
  const [uploadingStates, setUploadingStates] = useState({});

  if (!adminDraft?.settings) return null;

  const handleStoryImageUpload = async (index, file) => {
    if(!file) return;
    const uploadKey = `story_${index}`;
    setUploadingStates(prev => ({ ...prev, [uploadKey]: true }));
    
    try {
      const url = await uploadMediaFile(file, "images");
      if(url) {
        // EKLENDİ: Yeni görsel yüklendiğinde eskisini fiziksel olarak sil (Storage Garbage Collection)
        const oldUrl = adminDraft.storyTimeline[index]?.image;
        if (oldUrl) await deleteMediaFile(oldUrl).catch(() => {});
        
        updateDraftArrayItem("storyTimeline", index, "image", url);
      }
    } finally {
      setUploadingStates(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleRemoveStoryImage = async (index) => {
    // EKLENDİ: Butona basarak silindiğinde dosyayı buluttan da sil
    const oldUrl = adminDraft.storyTimeline[index]?.image;
    if (oldUrl) await deleteMediaFile(oldUrl).catch(() => {});
    
    updateDraftArrayItem("storyTimeline", index, "image", "");
  };

  const handleDeleteStoryItem = async (index) => {
    // EKLENDİ: Hikaye tümden silinirse içindeki görseli de sil
    const oldUrl = adminDraft.storyTimeline[index]?.image;
    if (oldUrl) await deleteMediaFile(oldUrl).catch(() => {});
    
    removeDraftArrayItem("storyTimeline", index);
  };

  return (
    <AdminSection title={isEn ? "Our Story" : "Bizim Hikayemiz"} onSave={() => saveSiteContent(isEn)}>
      <div className="admin-theme-check-row" style={{ marginBottom: "16px" }}>
        <AdminCheckbox checked={adminDraft.settings.visibility?.story ?? true} label={isEn ? "Show Story Section" : "Hikayemiz bölümünü davetiyede göster"} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, story: v })} />
      </div>
      <div className="admin-repeat-list">
        {(adminDraft.storyTimeline || []).map((item, index) => (
          <div key={index} className="admin-repeat-item">
            <div className="admin-repeat-title">
              <strong>{isEn ? `Memory ${index + 1}` : `Anı ${index + 1}`}</strong>
              <AdminActionButtons 
                onMoveUp={index > 0 ? () => moveDraftArrayItem("storyTimeline", index, -1) : null}
                onMoveDown={index < (adminDraft.storyTimeline?.length || 0) - 1 ? () => moveDraftArrayItem("storyTimeline", index, 1) : null}
                onSave={() => saveSiteContent(isEn)} 
                onDelete={() => handleDeleteStoryItem(index)} // GÜNCELLENDİ
                isEn={isEn} 
              />
            </div>
            <div className="admin-edit-grid">
              <AdminField label={isEn ? "Date/Year" : "Tarih / Yıl"} value={item.date} onChange={(v) => updateDraftArrayItem("storyTimeline", index, "date", v)} placeholder="Örn: 22 Ağustos 2026" />
              <AdminField label={isEn ? "Title" : "Başlık"} value={item.title} onChange={(v) => updateDraftArrayItem("storyTimeline", index, "title", v)} placeholder="Örn: Büyük Teklif" />
              <AdminTextarea label={isEn ? "Description" : "Açıklama"} value={item.description} onChange={(v) => updateDraftArrayItem("storyTimeline", index, "description", v)} />
              <div className="admin-field-wide">
                <AdminImageField 
                  label={isEn ? "Memory Photo" : "Anı Fotoğrafı"} 
                  value={item.image} 
                  isUploading={uploadingStates[`story_${index}`]} // GÜNCELLENDİ
                  onFileSelect={(e) => handleStoryImageUpload(index, e.target.files[0])} 
                  onClear={() => handleRemoveStoryImage(index)} // GÜNCELLENDİ
                />
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="admin-add-button" onClick={() => addDraftArrayItem("storyTimeline", { date: "Yeni Tarih", title: "Yeni Anı", description: "", image: "" })}>{isEn ? "Add New Memory" : "Yeni Anı Ekle"}</button>
      </div>
    </AdminSection>
  );
}