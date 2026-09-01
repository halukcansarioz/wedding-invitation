import React from "react";
import { AdminSection, AdminField, AdminTextarea, AdminCheckbox, AdminActionButtons } from "../../AdminUI";

export function ScheduleTab({ adminDraft, updateDraftObject, saveSiteContent, updateDraftArrayItem, removeDraftArrayItem, addDraftArrayItem, moveDraftArrayItem, isEn }) {
  return (
    <AdminSection title={isEn ? "Wedding Schedule" : "Düğün Programı (Akış)"} onSave={saveSiteContent}>
      <div className="admin-theme-check-row" style={{ marginBottom: "16px" }}>
        <AdminCheckbox checked={adminDraft.settings.visibility?.schedule ?? true} label={isEn ? "Show Schedule Section" : "Düğün Takvimi bölümünü göster"} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, schedule: v })} />
      </div>
      <div className="admin-repeat-list">
        {(adminDraft.scheduleItems || []).map((item, index) => (
          <div key={item._id || index} className="admin-repeat-item">
            <div className="admin-repeat-title">
              <strong>{isEn ? `Program ${index + 1}` : `Program ${index + 1}`}</strong>
              <AdminActionButtons 
                onMoveUp={index > 0 ? () => moveDraftArrayItem("scheduleItems", index, -1) : null}
                onMoveDown={index < (adminDraft.scheduleItems?.length || 0) - 1 ? () => moveDraftArrayItem("scheduleItems", index, 1) : null}
                onSave={saveSiteContent} onDelete={() => removeDraftArrayItem("scheduleItems", index)} isEn={isEn} 
              />
            </div>
            <div className="admin-edit-grid">
              <AdminField label={isEn ? "Time" : "Saat"} value={item.time} onChange={(v) => updateDraftArrayItem("scheduleItems", index, "time", v)} placeholder="Örn: 18:30" />
              <AdminField label={isEn ? "Title" : "Başlık"} value={item.title} onChange={(v) => updateDraftArrayItem("scheduleItems", index, "title", v)} placeholder="Örn: Misafir Karşılama" />
              <AdminTextarea label={isEn ? "Description" : "Açıklama"} value={item.description} onChange={(v) => updateDraftArrayItem("scheduleItems", index, "description", v)} />
            </div>
          </div>
        ))}
        <button type="button" className="admin-add-button" onClick={() => addDraftArrayItem("scheduleItems", { time: "22:00", title: "Yeni Program", description: "" })}>{isEn ? "Add New Program" : "Yeni Program Ekle"}</button>
      </div>
    </AdminSection>
  );
}