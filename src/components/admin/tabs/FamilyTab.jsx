import React from "react";
import { AdminSection, AdminField, AdminTextarea, AdminCheckbox } from "../../AdminUI";

export function FamilyTab({ adminDraft, updateDraftObject, saveSiteContent, isEn }) {
  return (
    <AdminSection title={isEn ? "Family Information" : "Aile Bilgileri"} onSave={saveSiteContent}>
      <div className="admin-theme-check-row" style={{ marginBottom: "24px" }}>
        <AdminCheckbox checked={adminDraft.settings.visibility?.family ?? true} label={isEn ? "Show Family Section" : "Aile Bilgilerini göster"} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, family: v })} />
      </div>
      <div className="admin-edit-grid">
        <AdminField label={isEn ? "Bride Family Title" : "Gelin Ailesi Başlık"} onChange={(v) => updateDraftObject("familyInfo", "brideFamilyTitle", v)} value={adminDraft.familyInfo?.brideFamilyTitle} />
        <AdminField label={isEn ? "Bride Family Name" : "Gelin Ailesi Adı"} onChange={(v) => updateDraftObject("familyInfo", "brideFamilyName", v)} value={adminDraft.familyInfo?.brideFamilyName} />
        <AdminField label={isEn ? "Groom Family Title" : "Damat Ailesi Başlık"} onChange={(v) => updateDraftObject("familyInfo", "groomFamilyTitle", v)} value={adminDraft.familyInfo?.groomFamilyTitle} />
        <AdminField label={isEn ? "Groom Family Name" : "Damat Ailesi Adı"} onChange={(v) => updateDraftObject("familyInfo", "groomFamilyName", v)} value={adminDraft.familyInfo?.groomFamilyName} />
        <AdminTextarea label={isEn ? "Family Message" : "Aile Mesajı"} onChange={(v) => updateDraftObject("familyInfo", "text", v)} value={adminDraft.familyInfo?.text} />
      </div>
    </AdminSection>
  );
}