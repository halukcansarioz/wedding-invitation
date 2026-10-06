import React, { useState, ChangeEvent } from "react";
import { AdminSection, AdminField, AdminTextarea, AdminCheckbox, AdminImageField, AdminActionButtons } from "../../AdminUI";
import { useStore } from "../../../store/useStore";
import { uploadMediaFile, deleteMediaFile } from "../../../services/database";
import { StoryTimelineItem } from "../../../types";

interface StoryTabProps {
  isEn: boolean;
}

export function StoryTab({ isEn }: StoryTabProps) {
  const adminDraft = useStore((state) => state.adminDraft);
  const updateDraftObject = useStore((state) => state.updateDraftObject);
  const saveSiteContent = useStore((state) => state.saveSiteContent);
  const updateDraftArrayItem = useStore((state) => state.updateDraftArrayItem);
  const removeDraftArrayItem = useStore((state) => state.removeDraftArrayItem);
  const addDraftArrayItem = useStore((state) => state.addDraftArrayItem);
  const moveDraftArrayItem = useStore((state) => state.moveDraftArrayItem);

  const [uploadingStates, setUploadingStates] = useState<Record<string, boolean>>({});

  if (!adminDraft?.settings) return null;

  const handleStoryImageUpload = async (index: number, file?: File | null) => {
    if (!file) return;
    const uploadKey = `story_${index}`;
    setUploadingStates((prev) => ({ ...prev, [uploadKey]: true }));

    try {
      const url = await uploadMediaFile(file, "images");
      if (url) {
        const oldUrl = adminDraft.storyTimeline[index]?.image;
        if (oldUrl) {
          deleteMediaFile(oldUrl).catch(console.error);
        }
        updateDraftArrayItem("storyTimeline", index, "image", url);
      }
    } finally {
      setUploadingStates((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleRemoveStoryImage = async (index: number) => {
    const oldUrl = adminDraft.storyTimeline[index]?.image;
    if (oldUrl) {
      deleteMediaFile(oldUrl).catch(console.error);
    }
    updateDraftArrayItem("storyTimeline", index, "image", "");
  };

  const handleDeleteStoryItem = async (index: number) => {
    const oldUrl = adminDraft.storyTimeline[index]?.image;
    if (oldUrl) {
      deleteMediaFile(oldUrl).catch(console.error);
    }
    removeDraftArrayItem("storyTimeline", index);
  };

  return (
    <AdminSection title={isEn ? "Our Story" : "Bizim Hikayemiz"} onSave={() => saveSiteContent(isEn)}>
      <div className="admin-theme-check-row" style={{ marginBottom: "16px" }}>
        <AdminCheckbox
          checked={adminDraft.settings.visibility?.story ?? true}
          label={isEn ? "Show Story Section" : "Hikayemiz bölümünü davetiyede göster"}
          onChange={(v: boolean) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, story: v })}
        />
      </div>
      <div className="admin-repeat-list">
        {(adminDraft.storyTimeline || []).map((item: StoryTimelineItem, index: number) => (
          <div key={index} className="admin-repeat-item">
            <div className="admin-repeat-title">
              <strong>{isEn ? `Memory ${index + 1}` : `Anı ${index + 1}`}</strong>
              <AdminActionButtons
                onMoveUp={index > 0 ? () => moveDraftArrayItem("storyTimeline", index, -1) : null}
                onMoveDown={index < (adminDraft.storyTimeline?.length || 0) - 1 ? () => moveDraftArrayItem("storyTimeline", index, 1) : null}
                onSave={() => saveSiteContent(isEn)}
                onDelete={() => handleDeleteStoryItem(index)}
                isEn={isEn}
              />
            </div>
            <div className="admin-edit-grid">
              <AdminField
                label={isEn ? "Date/Year" : "Tarih / Yıl"}
                value={item.date}
                onChange={(v: string) => updateDraftArrayItem("storyTimeline", index, "date", v)}
                placeholder="Örn: 22 Ağustos 2026"
              />
              <AdminField
                label={isEn ? "Title" : "Başlık"}
                value={item.title}
                onChange={(v: string) => updateDraftArrayItem("storyTimeline", index, "title", v)}
                placeholder="Örn: Büyük Teklif"
              />
              <AdminTextarea
                label={isEn ? "Description" : "Açıklama"}
                value={item.description}
                onChange={(v: string) => updateDraftArrayItem("storyTimeline", index, "description", v)}
              />
              <div className="admin-field-wide">
                <AdminImageField
                  label={isEn ? "Memory Photo" : "Anı Fotoğrafı"}
                  value={item.image || ""}
                  isUploading={Boolean(uploadingStates[`story_${index}`])}
                  onFileSelect={(e: ChangeEvent<HTMLInputElement>) => handleStoryImageUpload(index, e.target.files?.[0])}
                  onClear={() => handleRemoveStoryImage(index)}
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="admin-add-button"
          onClick={() => addDraftArrayItem("storyTimeline", { date: "Yeni Tarih", title: "Yeni Anı", description: "", image: "" })}
        >
          {isEn ? "Add New Memory" : "Yeni Anı Ekle"}
        </button>
      </div>
    </AdminSection>
  );
}