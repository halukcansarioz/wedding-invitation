import React from "react";
import { AdminSection, AdminField, AdminTextarea, AdminCheckbox } from "../../AdminUI";

export function GiftTab({ adminDraft, updateDraftObject, saveSiteContent, isEn }) {
  return (
    <AdminSection title={isEn ? "Gift & IBAN Details" : "Hediye & IBAN Bilgileri"} onSave={saveSiteContent}>
      <div className="admin-visibility-card" style={{ marginBottom: "24px" }}>
        <AdminCheckbox checked={adminDraft.settings.visibility?.iban ?? true} label={isEn ? "Show Gift Section" : "Bu bölümü davetiyede göster"} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, iban: v })} />
        <AdminCheckbox checked={adminDraft.settings.visibility?.popupIban ?? true} label={isEn ? "Gift Button for Non-Attending" : "Katılmayanlar İçin Hediye Butonu (Modal)"} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, popupIban: v })} />
      </div>
      <div className="admin-edit-grid">
        <AdminField label={isEn ? "Title" : "Başlık"} onChange={(v) => updateDraftObject("giftRegistry", "title", v)} value={adminDraft.giftRegistry?.title} />
        <AdminField label={isEn ? "Receiver Full Name" : "Alıcı Adı Soyadı"} onChange={(v) => updateDraftObject("giftRegistry", "receiver", v)} value={adminDraft.giftRegistry?.receiver} />
        <AdminField label={isEn ? "Bank Name" : "Banka Adı"} onChange={(v) => updateDraftObject("giftRegistry", "bankName", v)} value={adminDraft.giftRegistry?.bankName} />
        <AdminField label={isEn ? "IBAN Number" : "IBAN Numarası"} onChange={(v) => updateDraftObject("giftRegistry", "iban", v)} value={adminDraft.giftRegistry?.iban} />
        <AdminTextarea label={isEn ? "Description Text" : "Açıklama Metni"} onChange={(v) => updateDraftObject("giftRegistry", "description", v)} value={adminDraft.giftRegistry?.description} />
      </div>
    </AdminSection>
  );
}