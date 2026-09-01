import React from "react";
import { AdminSection, AdminField, AdminTextarea } from "../../AdminUI";

export function CopyTab({ adminDraft, updateDraftObject, saveSiteContent, isEn }) {
  return (
    <AdminSection title={isEn ? "Headings and Page Texts" : "Başlıklar ve Sayfa Metinleri"} onSave={saveSiteContent}>
      <p className="admin-help-text">
        {isEn ? "You can change all section titles here." : "Tüm bölüm başlıklarını buradan değiştirebilirsiniz."}
      </p>
      <div className="admin-edit-grid" style={{ marginBottom: "24px" }}>
        <AdminField label={isEn ? "Hero Top Heading" : "Ana Karşılama Üst Başlığı"} onChange={(v) => updateDraftObject("copy", "heroLabel", v)} value={adminDraft.copy?.heroLabel} />
        <AdminField label={isEn ? "Intro Page Small Tag" : "Giriş Sayfası Küçük Etiket"} onChange={(v) => updateDraftObject("copy", "introLabel", v)} value={adminDraft.copy?.introLabel} />
        <AdminTextarea label={isEn ? "Envelope Open Greeting Text" : "Zarf Açılış Karşılama Metni"} onChange={(v) => updateDraftObject("copy", "introText", v)} value={adminDraft.copy?.introText} />
        <AdminField label={isEn ? "Countdown Title" : "Geri Sayım Başlığı"} onChange={(v) => updateDraftObject("copy", "countdownTitle", v)} value={adminDraft.copy?.countdownTitle} />
        <AdminField label={isEn ? "Invitation Title" : "Davet Başlığı"} onChange={(v) => updateDraftObject("copy", "invitationTitle", v)} value={adminDraft.copy?.invitationTitle} />
        <AdminField label={isEn ? "Family Section Title" : "Aileler Bölümü Başlığı"} onChange={(v) => updateDraftObject("copy", "familyTitle", v)} value={adminDraft.copy?.familyTitle} />
        <AdminField label={isEn ? "Date & Location Title" : "Tarih & Konum Başlığı"} onChange={(v) => updateDraftObject("copy", "locationTitle", v)} value={adminDraft.copy?.locationTitle} />
        <AdminField label={isEn ? "Gallery Title" : "Galeri Başlığı"} onChange={(v) => updateDraftObject("copy", "galleryTitle", v)} value={adminDraft.copy?.galleryTitle} />
        <AdminField label={isEn ? "RSVP Title" : "LCV (Katılım) Başlığı"} onChange={(v) => updateDraftObject("copy", "rsvpTitle", v)} value={adminDraft.copy?.rsvpTitle} />
        <AdminField label={isEn ? "Guestbook Title" : "Anı Defteri Başlığı"} onChange={(v) => updateDraftObject("copy", "wishesTitle", v)} value={adminDraft.copy?.wishesTitle} />
        <AdminField label={isEn ? "Story Section Tag" : "Hikayemiz Küçük Etiket"} onChange={(v) => updateDraftObject("copy", "storyLabel", v)} value={adminDraft.copy?.storyLabel} />
        <AdminField label={isEn ? "Story Title" : "Hikayemiz Ana Başlığı"} onChange={(v) => updateDraftObject("copy", "storyTitle", v)} value={adminDraft.copy?.storyTitle} />
      </div>
      <h4 style={{ color: 'var(--rose-dark)', marginBottom: '12px' }}>{isEn ? "Closing and Warnings" : "Kapanış ve Uyarılar"}</h4>
      <div className="admin-edit-grid">
        <AdminTextarea label={isEn ? "Footer Thanks Text" : "Kapanış Yazısı (Footer)"} onChange={(v) => updateDraftObject("copy", "thanksText", v)} value={adminDraft.copy?.thanksText} />
        <AdminTextarea label={isEn ? "RSVP Deadline Passed Message" : "LCV Süresi Doldu Mesajı"} onChange={(v) => updateDraftObject("copy", "deadlineText", v)} value={adminDraft.copy?.deadlineText} />
        <AdminTextarea label={isEn ? "Decline Modal Message" : "Katılamayacaklara Mesaj (Modal)"} onChange={(v) => updateDraftObject("copy", "declineMessage", v)} value={adminDraft.copy?.declineMessage} />
      </div>
    </AdminSection>
  );
}