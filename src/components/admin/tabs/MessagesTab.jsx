import React from "react";
import { AdminSection, AdminTextarea } from "../../AdminUI";

export function MessagesTab({ adminDraft, updateDraftObject, saveSiteContent, isEn }) {
  return (
    <AdminSection title={isEn ? "WhatsApp Messages" : "WhatsApp Mesajları"} onSave={saveSiteContent}>
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