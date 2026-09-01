import React from "react";
import { AdminSection, AdminField, AdminTextarea, AdminCheckbox } from "../../AdminUI";
import { getCurrentShareLink } from "../../../utils/helpers";

export function GeneralTab({ adminDraft, updateDraftObject, saveSiteContent, isEn }) {
  return (
    <AdminSection title={isEn ? "General Invitation Information" : "Genel Davetiye Bilgileri"} onSave={saveSiteContent}>
      <div className="admin-visibility-card" style={{ marginBottom: "24px" }}>
        <AdminCheckbox checked={adminDraft.settings.visibility?.countdown ?? true} label={isEn ? "Show Countdown Section" : "Geri Sayım bölümünü göster"} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, countdown: v })} />
        <AdminCheckbox checked={adminDraft.settings.visibility?.location ?? true} label={isEn ? "Show Map & Location" : "Konum bölümünü göster"} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, location: v })} />
      </div>
      <div className="admin-edit-grid">
        <AdminField label={isEn ? "Bride Name" : "Gelin adı"} onChange={(v) => updateDraftObject("invitation", "bride", v)} value={adminDraft.invitation.bride} />
        <AdminField label={isEn ? "Groom Name" : "Damat adı"} onChange={(v) => updateDraftObject("invitation", "groom", v)} value={adminDraft.invitation.groom} />
        <AdminField label={isEn ? "Display Date" : "Görünen tarih"} onChange={(v) => updateDraftObject("invitation", "dateText", v)} value={adminDraft.invitation.dateText} />
        <AdminField label={isEn ? "Time" : "Saat"} onChange={(v) => updateDraftObject("invitation", "timeText", v)} value={adminDraft.invitation.timeText} />
        <AdminField type="datetime-local" label={isEn ? "Countdown Target Date" : "Geri sayım tarihi"} onChange={(v) => updateDraftObject("invitation", "weddingDate", v)} value={adminDraft.invitation.weddingDate} />
        <AdminField type="date" label={isEn ? "RSVP Deadline" : "LCV Son Bildirim Tarihi"} onChange={(v) => updateDraftObject("invitation", "rsvpDeadline", v)} value={adminDraft.invitation.rsvpDeadline} />
        <AdminField label={isEn ? "WhatsApp Number" : "WhatsApp numarası"} onChange={(v) => updateDraftObject("invitation", "whatsappNumber", v)} value={adminDraft.invitation.whatsappNumber} />
        <AdminField label={isEn ? "Venue Name" : "Mekan adı"} onChange={(v) => updateDraftObject("invitation", "venue", v)} value={adminDraft.invitation.venue} />
        <AdminField label={isEn ? "Address" : "Adres"} onChange={(v) => updateDraftObject("invitation", "address", v)} value={adminDraft.invitation.address} />
        <AdminField label={isEn ? "Map Link" : "Harita linki"} onChange={(v) => updateDraftObject("invitation", "mapLink", v)} value={adminDraft.invitation.mapLink} />
        <AdminField label={isEn ? "Share Link" : "Paylaşım linki"} onChange={(v) => updateDraftObject("invitation", "shareLink", v)} value={adminDraft.invitation.shareLink} placeholder={getCurrentShareLink()} />
        <AdminTextarea label={isEn ? "Main Invitation Text" : "Ana davet metni"} onChange={(v) => updateDraftObject("invitation", "message", v)} value={adminDraft.invitation.message} />
      </div>
    </AdminSection>
  );
}