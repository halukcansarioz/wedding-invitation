import React from "react";
import { useTranslation } from "react-i18next";
import { AdminSection, AdminCheckbox } from "../../AdminUI";
import { useStore } from "../../../store/useStore";

export function VisibilityTab({ isEn }) {
  const { t } = useTranslation();
  
  // OPTİMİZASYON: Sadece visibility ayarlarını dinliyoruz
  const visibility = useStore((state) => state.adminDraft.settings.visibility);
  const updateDraftObject = useStore((state) => state.updateDraftObject);
  const saveSiteContent = useStore((state) => state.saveSiteContent);

  if (!visibility) return null;

  return (
    <AdminSection title={isEn ? "Section Visibility" : "Bölüm Görünürlüğü"} onSave={() => saveSiteContent(isEn)}>
      <p className="admin-help-text">
        {isEn ? "You can toggle the visibility of sections here." : "Davetiyenizde görünmesini istemediğiniz bölümleri buradan kapatabilirsiniz."}
      </p>
      <div className="admin-visibility-card">
        <AdminCheckbox checked={visibility.countdown ?? true} label={t('visibility.countdown')} onChange={(v) => updateDraftObject("settings", "visibility", { ...visibility, countdown: v })} />
        <AdminCheckbox checked={visibility.family ?? true} label={t('visibility.family')} onChange={(v) => updateDraftObject("settings", "visibility", { ...visibility, family: v })} />
        <AdminCheckbox checked={visibility.ceremony ?? true} label={t('visibility.ceremony')} onChange={(v) => updateDraftObject("settings", "visibility", { ...visibility, ceremony: v })} />
        <AdminCheckbox checked={visibility.schedule ?? true} label={t('visibility.schedule')} onChange={(v) => updateDraftObject("settings", "visibility", { ...visibility, schedule: v })} />
        <AdminCheckbox checked={visibility.location ?? true} label={t('visibility.location')} onChange={(v) => updateDraftObject("settings", "visibility", { ...visibility, location: v })} />
        <AdminCheckbox checked={visibility.gallery ?? true} label={t('visibility.gallery')} onChange={(v) => updateDraftObject("settings", "visibility", { ...visibility, gallery: v })} />
        <AdminCheckbox checked={visibility.rsvp ?? true} label={t('visibility.rsvp')} onChange={(v) => updateDraftObject("settings", "visibility", { ...visibility, rsvp: v })} />
        <AdminCheckbox checked={visibility.wishes ?? true} label={t('visibility.wishes')} onChange={(v) => updateDraftObject("settings", "visibility", { ...visibility, wishes: v })} />
        <AdminCheckbox checked={visibility.guests ?? true} label={t('visibility.guests')} onChange={(v) => updateDraftObject("settings", "visibility", { ...visibility, guests: v })} />
        <AdminCheckbox checked={visibility.iban ?? true} label={t('visibility.iban')} onChange={(v) => updateDraftObject("settings", "visibility", { ...visibility, iban: v })} />
        <AdminCheckbox checked={visibility.popupIban ?? true} label={t('visibility.popupIban')} onChange={(v) => updateDraftObject("settings", "visibility", { ...visibility, popupIban: v })} />
        <AdminCheckbox checked={visibility.creditCard ?? false} label={isEn ? "Credit Card Button" : "Kredi Kartı Butonu"} onChange={(v) => updateDraftObject("settings", "visibility", { ...visibility, creditCard: v })} />
      </div>
    </AdminSection>
  );
}