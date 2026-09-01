import React from "react";
import { AdminSection, AdminField, AdminTextarea, AdminCheckbox, AdminActionButtons } from "../../AdminUI";

export function CeremonyTab({ adminDraft, updateDraftObject, saveSiteContent, updateDraftArrayItem, removeDraftArrayItem, addDraftArrayItem, moveDraftArrayItem, isEn }) {
  return (
    <AdminSection title={isEn ? "Ceremony / Wedding Details" : "Nikah / Düğün Bilgileri"} onSave={saveSiteContent}>
      <div className="admin-theme-check-row" style={{ marginBottom: "16px" }}>
        <AdminCheckbox checked={adminDraft.settings.visibility?.ceremony ?? true} label={isEn ? "Show Ceremony Section" : "Nikah bölümünü göster"} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, ceremony: v })} />
      </div>
      <div className="admin-repeat-list">
        {(adminDraft.eventDetails || []).map((event, index) => (
          <div key={event._id || index} className="admin-repeat-item">
            <div className="admin-repeat-title">
              <strong>{isEn ? `Event ${index + 1}` : `Etkinlik ${index + 1}`}</strong>
              <AdminActionButtons 
                onMoveUp={index > 0 ? () => moveDraftArrayItem("eventDetails", index, -1) : null}
                onMoveDown={index < (adminDraft.eventDetails?.length || 0) - 1 ? () => moveDraftArrayItem("eventDetails", index, 1) : null}
                onSave={saveSiteContent} onDelete={() => removeDraftArrayItem("eventDetails", index)} isEn={isEn} 
              />
            </div>
            <div className="admin-edit-grid">
              <AdminField label={isEn ? "Title" : "Başlık"} value={event.label} onChange={(v) => updateDraftArrayItem("eventDetails", index, "label", v)} placeholder="Örn: Nikah Töreni" />
              <AdminField label={isEn ? "Time" : "Saat"} value={event.time} onChange={(v) => updateDraftArrayItem("eventDetails", index, "time", v)} placeholder="Örn: 19:00" />
              <AdminField label={isEn ? "Location" : "Mekan"} value={event.location} onChange={(v) => updateDraftArrayItem("eventDetails", index, "location", v)} placeholder="Örn: Kır Bahçesi" />
              <AdminTextarea label={isEn ? "Description" : "Açıklama"} value={event.description} onChange={(v) => updateDraftArrayItem("eventDetails", index, "description", v)} />
            </div>
          </div>
        ))}
        <button type="button" className="admin-add-button" onClick={() => addDraftArrayItem("eventDetails", { label: "Yeni Etkinlik", time: "20:00", location: "", description: "" })}>{isEn ? "Add New Event" : "Yeni Etkinlik Ekle"}</button>
      </div>
    </AdminSection>
  );
}