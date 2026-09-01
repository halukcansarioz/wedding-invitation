import React from "react";
import { useTranslation } from "react-i18next";
import { AdminSection, AdminCheckbox } from "../../AdminUI";

export function VisibilityTab({ adminDraft, updateDraftObject, saveSiteContent, isEn }) {
  const { t } = useTranslation();
  return (
    <AdminSection title={isEn ? "Section Visibility" : "Bölüm Görünürlüğü"} onSave={saveSiteContent}>
      <p className="admin-help-text">
        {isEn ? "You can toggle the visibility of sections here." : "Davetiyenizde görünmesini istemediğiniz bölümleri buradan kapatabilirsiniz."}
      </p>
      <div className="admin-visibility-card">
        <AdminCheckbox checked={adminDraft.settings.visibility?.countdown ?? true} label={t('visibility.countdown')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, countdown: v })} />
        <AdminCheckbox checked={adminDraft.settings.visibility?.family ?? true} label={t('visibility.family')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, family: v })} />
        <AdminCheckbox checked={adminDraft.settings.visibility?.ceremony ?? true} label={t('visibility.ceremony')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, ceremony: v })} />
        <AdminCheckbox checked={adminDraft.settings.visibility?.schedule ?? true} label={t('visibility.schedule')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, schedule: v })} />
        <AdminCheckbox checked={adminDraft.settings.visibility?.location ?? true} label={t('visibility.location')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, location: v })} />
        <AdminCheckbox checked={adminDraft.settings.visibility?.gallery ?? true} label={t('visibility.gallery')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, gallery: v })} />
        <AdminCheckbox checked={adminDraft.settings.visibility?.rsvp ?? true} label={t('visibility.rsvp')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, rsvp: v })} />
        <AdminCheckbox checked={adminDraft.settings.visibility?.wishes ?? true} label={t('visibility.wishes')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, wishes: v })} />
        <AdminCheckbox checked={adminDraft.settings.visibility?.guests ?? true} label={t('visibility.guests')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, guests: v })} />
        <AdminCheckbox checked={adminDraft.settings.visibility?.iban ?? true} label={t('visibility.iban')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, iban: v })} />
        <AdminCheckbox checked={adminDraft.settings.visibility?.popupIban ?? true} label={t('visibility.popupIban')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, popupIban: v })} />
      </div>
    </AdminSection>
  );
}