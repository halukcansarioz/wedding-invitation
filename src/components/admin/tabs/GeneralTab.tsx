import React from "react";
import { useTranslation } from "react-i18next";
import { AdminSection, AdminField, AdminTextarea, AdminCheckbox } from "../../AdminUI";
import { getCurrentShareLink } from "../../../utils/helpers";
import { useStore } from "../../../store/useStore";

interface GeneralTabProps {
  isEn: boolean;
}

export function GeneralTab({ isEn }: GeneralTabProps) {
  const { t } = useTranslation();
  
  const invitation = useStore((state) => state.adminDraft.invitation);
  const visibility = useStore((state) => state.adminDraft.settings.visibility);
  const updateDraftObject = useStore((state) => state.updateDraftObject);
  const saveSiteContent = useStore((state) => state.saveSiteContent);

  return (
    <AdminSection title={t('admin.general.title', isEn ? "General Invitation Information" : "Genel Davetiye Bilgileri")} onSave={() => saveSiteContent(isEn)}>
      <div className="admin-visibility-card" style={{ marginBottom: "24px" }}>
        <AdminCheckbox 
          checked={visibility?.countdown ?? true} 
          label={t('admin.general.showCountdown', isEn ? "Show Countdown Section" : "Geri Sayım bölümünü göster")} 
          onChange={(v: boolean) => updateDraftObject("settings", "visibility", { ...visibility, countdown: v })} 
        />
        <AdminCheckbox 
          checked={visibility?.location ?? true} 
          label={t('admin.general.showLocation', isEn ? "Show Map & Location" : "Konum bölümünü göster")} 
          onChange={(v: boolean) => updateDraftObject("settings", "visibility", { ...visibility, location: v })} 
        />
      </div>
      <div className="admin-edit-grid">
        <AdminField label={t('admin.general.brideName', isEn ? "Bride Name" : "Gelin adı")} onChange={(v: string) => updateDraftObject("invitation", "bride", v)} value={invitation.bride} />
        <AdminField label={t('admin.general.groomName', isEn ? "Groom Name" : "Damat adı")} onChange={(v: string) => updateDraftObject("invitation", "groom", v)} value={invitation.groom} />
        <AdminField label={t('admin.general.dateText', isEn ? "Display Date" : "Görünen tarih")} onChange={(v: string) => updateDraftObject("invitation", "dateText", v)} value={invitation.dateText} />
        <AdminField label={t('admin.general.timeText', isEn ? "Time" : "Saat")} onChange={(v: string) => updateDraftObject("invitation", "timeText", v)} value={invitation.timeText} />
        <AdminField type="datetime-local" label={t('admin.general.weddingDate', isEn ? "Countdown Target Date" : "Geri sayım tarihi")} onChange={(v: string) => updateDraftObject("invitation", "weddingDate", v)} value={invitation.weddingDate} />
        <AdminField type="date" label={t('admin.general.rsvpDeadline', isEn ? "RSVP Deadline" : "LCV Son Bildirim Tarihi")} onChange={(v: string) => updateDraftObject("invitation", "rsvpDeadline", v)} value={invitation.rsvpDeadline} />
        <AdminField label={t('admin.general.whatsapp', isEn ? "WhatsApp Number" : "WhatsApp numarası")} onChange={(v: string) => updateDraftObject("invitation", "whatsappNumber", v)} value={invitation.whatsappNumber} />
        <AdminField label={t('admin.general.venue', isEn ? "Venue Name" : "Mekan adı")} onChange={(v: string) => updateDraftObject("invitation", "venue", v)} value={invitation.venue} />
        <AdminField label={t('admin.general.address', isEn ? "Address" : "Adres")} onChange={(v: string) => updateDraftObject("invitation", "address", v)} value={invitation.address} />
        <AdminField label={t('admin.general.mapLink', isEn ? "Map Link" : "Harita linki")} onChange={(v: string) => updateDraftObject("invitation", "mapLink", v)} value={invitation.mapLink} />
        <AdminField label={t('admin.general.shareLink', isEn ? "Share Link" : "Paylaşım linki")} onChange={(v: string) => updateDraftObject("invitation", "shareLink", v)} value={invitation.shareLink} placeholder={getCurrentShareLink()} />
        <AdminTextarea label={t('admin.general.message', isEn ? "Main Invitation Text" : "Ana davet metni")} onChange={(v: string) => updateDraftObject("invitation", "message", v)} value={invitation.message} />
      </div>
    </AdminSection>
  );
}