import React from "react";
import { AdminSection, AdminTextarea } from "../../AdminUI";
import { useStore } from "../../../store/useStore";

export function MessagesTab({ isEn }) {
  const adminDraft = useStore((state) => state.adminDraft);
  const updateDraftObject = useStore((state) => state.updateDraftObject);
  const saveSiteContent = useStore((state) => state.saveSiteContent);

  if (!adminDraft?.messages) return null;

  return (
    <AdminSection title={isEn ? "WhatsApp Messages" : "WhatsApp Mesajları"} onSave={() => saveSiteContent(isEn)}>
      <p className="admin-help-text">
        {isEn ? "Edit default messages sent via invitation link. {couple} represents couple names, {link} is the link." : "Hazır mesajları düzenleyin. {couple} gelin-damat adını, {link} davetiye linkini temsil eder."}
      </p>
      <div className="admin-edit-grid" style={{ gridTemplateColumns: "1fr" }}>
        <AdminTextarea label={isEn ? "Personalized Guest Greeting" : "Kişiye Özel Davet Karşılama Metni"} onChange={(v) => updateDraftObject("messages", "guestGreeting", v)} value={adminDraft.messages?.guestGreeting} />
        <AdminTextarea label={isEn ? "WhatsApp General Share Message" : "WhatsApp Genel Paylaşım Mesajı"} onChange={(v) => updateDraftObject("messages", "whatsappShareMessage", v)} value={adminDraft.messages?.whatsappShareMessage} />
        <AdminTextarea label={isEn ? "RSVP Form WhatsApp Notification Message" : "LCV Formu WhatsApp Bildirim Mesajı"} onChange={(v) => updateDraftObject("messages", "rsvpWhatsappMessage", v)} value={adminDraft.messages?.rsvpWhatsappMessage} />
      </div>
    </AdminSection>
  );
}