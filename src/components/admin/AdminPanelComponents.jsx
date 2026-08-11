import React from "react";
import { useTranslation } from "react-i18next";
import {
  AdminField,
  AdminTextarea,
  AdminCheckbox,
  AdminImageField,
  AdminMusicField,
  AdminSection,
  AdminSelect,
  AdminActionButtons
} from "../AdminUI";
import { Dropdown } from "../common/UIComponents";
import { THEMES } from "../../config/constants";
import { getCurrentShareLink, buildPersonalLink } from "../../utils/helpers";

export function GuestsAdminPanel({ guests, adminGuestSearch, setAdminGuestSearch, exportGuestsExcel, exportGuestsCsv, filteredGuests, editGuest, deleteGuest, clearGuests, adminDraft, updateDraftObject }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith("en");

  return (
    <AdminSection title={isEn ? "RSVP Responses" : "Kayıtlı Form Yanıtları"}>
      
      <div className="admin-visibility-card" style={{ marginBottom: "24px" }}>
        <AdminCheckbox checked={adminDraft.settings.visibility?.rsvp ?? true} label={t('visibility.rsvp')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, rsvp: v })} />
        <AdminCheckbox checked={adminDraft.settings.visibility?.guests ?? true} label={t('visibility.guests')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, guests: v })} />
      </div>

      <div className="admin-stats admin-stats-inside" style={{ gridTemplateColumns: "repeat(3, 1fr)", maxWidth: "500px" }}>
        <div><strong>{guests.length}</strong><span>{isEn ? "Total Responses" : "Toplam Yanıt"}</span></div>
        <div><strong>{guests.filter(g => g.attendance === "Katılacağım").length}</strong><span>{isEn ? "Attending" : "Katılacak"}</span></div>
        <div><strong>{guests.filter(g => g.attendance === "Katılamayacağım").length}</strong><span>{isEn ? "Not Attending" : "Katılmayacak"}</span></div>
      </div>
      
      <div className="admin-toolbar" style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "20px" }}>
        <input 
          style={{ flex: "1", minWidth: "200px", margin: 0 }} 
          value={adminGuestSearch} 
          onChange={(e) => setAdminGuestSearch(e.target.value)} 
          placeholder={isEn ? "Search..." : "Kayıtlarda ara"} 
        />
        <button type="button" className="secondary-button" style={{ margin: 0 }} onClick={exportGuestsExcel}>{isEn ? "Excel" : "Excel İndir 📊"}</button>
        <button type="button" className="secondary-button" style={{ margin: 0 }} onClick={exportGuestsCsv}>{isEn ? "CSV" : "CSV CSV İndir 📄"}</button>
        <button type="button" className="secondary-button danger-button" style={{ margin: 0 }} onClick={clearGuests}>{isEn ? "Clear All" : "Tümünü Sil 🚨"}</button>
      </div>

      <div className="admin-list admin-list-full">
        {filteredGuests.length === 0 ? (
          <p className="empty-text">{isEn ? "No matching responses found." : "Kayıt bulunamadı."}</p>
        ) : (
          filteredGuests.map((guest) => {
            let translatedAttendance = guest.attendance || "Katılacağım";
            if (isEn && translatedAttendance === "Katılacağım") translatedAttendance = "Attending";
            if (isEn && translatedAttendance === "Katılamayacağım") translatedAttendance = "Not Attending";

            return (
              <div className="admin-row" key={guest.id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <strong>{guest.name}</strong>
                <span>{translatedAttendance}</span>
                {guest.note && <em>{isEn ? "Note:" : "Not:"} {guest.note}</em>}
                <div className="admin-row-actions" style={{ display: "flex", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed var(--border)", width: "100%" }}>
                  <button type="button" className="secondary-button small-admin-button" onClick={() => editGuest(guest.id)}>{isEn ? "Edit" : "Düzenle ✏️"}</button>
                  <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => deleteGuest(guest.id)}>{isEn ? "Delete" : "Sil 🗑️"}</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AdminSection>
  );
}

export function WishesAdminPanel({ wishes, filteredWishes, adminWishSearch, setAdminWishSearch, adminWishStatusFilter, setAdminWishStatusFilter, exportWishesExcel, exportWishesCsv, toggleWishApproval, editWish, deleteWish, clearWishes, isEn, adminDraft, updateDraftObject }) {
  const { t } = useTranslation();
  return (
    <AdminSection title={isEn ? "Guestbook Messages" : "Anı Defteri Mesajları"}>
      
      <div className="admin-theme-check-row" style={{ marginBottom: "24px" }}>
        <AdminCheckbox checked={adminDraft.settings.visibility?.wishes ?? true} label={t('visibility.wishes')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, wishes: v })} />
      </div>

      <div className="admin-toolbar" style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "20px" }}>
        <input 
          style={{ flex: "1", minWidth: "160px", margin: 0 }} 
          value={adminWishSearch} 
          onChange={(e) => setAdminWishSearch(e.target.value)} 
          placeholder={isEn ? "Search messages..." : "Mesajlarda ara..."} 
        />
        
        <div style={{ minWidth: "160px", margin: 0 }}>
          <Dropdown
            value={adminWishStatusFilter}
            onChange={setAdminWishStatusFilter}
            options={[
              { value: "all", label: isEn ? "All Status" : "Tümü" },
              { value: "approved", label: isEn ? "Published" : "Yayında" },
              { value: "pending", label: isEn ? "Pending" : "Onay Bekliyor" }
            ]}
          />
        </div>
        
        <button type="button" className="secondary-button" style={{ margin: 0 }} onClick={exportWishesExcel}>{isEn ? "Excel" : "Excel İndir"}</button>
        <button type="button" className="secondary-button" style={{ margin: 0 }} onClick={exportWishesCsv}>{isEn ? "CSV" : "CSV İndir"}</button>
        <button type="button" className="secondary-button danger-button" style={{ margin: 0 }} onClick={clearWishes}>{isEn ? "Clear All" : "Tümünü Sil"}</button>
      </div>

      <div className="admin-list admin-list-full">
        {filteredWishes.length === 0 ? (
          <p className="empty-text">{isEn ? "No matching messages found." : "Mesaj bulunamadı."}</p>
        ) : (
          filteredWishes.map((wish) => (
            <div className="admin-row" key={wish.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{wish.name}</strong>
                <span style={{ fontSize: "13px", padding: "4px 8px", borderRadius: "8px", background: wish.approved ? "rgba(46, 204, 113, 0.15)" : "rgba(241, 196, 15, 0.2)", color: wish.approved ? "#27ae60" : "#d35400", fontWeight: "bold" }}>
                  {wish.approved ? (isEn ? "Published" : "Yayında") : (isEn ? "Pending" : "Onay Bekliyor")}
                </span>
              </div>
              <p style={{ margin: "8px 0", fontStyle: "italic", fontSize: "16px" }}>"{wish.message}"</p>
              <div className="admin-row-actions">
                <button type="button" className="secondary-button small-admin-button" onClick={() => toggleWishApproval(wish.id)}>
                  {wish.approved ? (isEn ? "Hide" : "Yayından Kaldır 🙈") : (isEn ? "Publish" : "Yayınla 👁️")}
                </button>
                <button type="button" className="secondary-button small-admin-button" onClick={() => editWish(wish.id)}>{isEn ? "Edit" : "Düzenle"}</button>
                <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => deleteWish(wish.id)}>{isEn ? "Delete" : "Sil"}</button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminSection>
  );
}

export function PersonalLinkPanel({ currentShareLink, copyAdminLink, personalLinkName, setPersonalLinkName }) {
  const generatedLink = buildPersonalLink(currentShareLink, personalLinkName);

  const openWhatsAppShare = () => {
    if (!personalLinkName.trim()) return;
    const text = `Sevgili ${personalLinkName}, düğün davetiyemiz sana özel olarak hazırlandı! 💍\n\nDavetiyemizi aşağıdaki linkten inceleyebilirsin:\n${generatedLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <AdminSection title="Kişiye Özel Akıllı Link Üretici">
      <div className="admin-personal-link-box personal-link-standalone" style={{ display: "grid", gap: "18px" }}>
        <p className="admin-help-text" style={{ margin: 0 }}>Sadece isim yazarak davetiye linki üretebilirsiniz.</p>
        <div className="admin-edit-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px" }}>
          <AdminField label="Davetli Adı Soyadı" onChange={setPersonalLinkName} placeholder="Örn: Ahmet Yılmaz" value={personalLinkName} />
        </div>
        <div style={{ marginTop: "4px" }}>
          <span style={{ display: "block", marginBottom: "6px", fontWeight: "700", color: "var(--rose-dark)" }}>Üretilen Akıllı Link:</span>
          <input value={generatedLink} readOnly style={{ width: "100%", padding: "14px 16px", borderRadius: "14px", border: "1.5px dashed var(--rose-dark)", background: "var(--paper-soft)", fontWeight: "700", color: "var(--text)" }} />
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "6px" }}>
          <button type="button" className="main-button" onClick={() => copyAdminLink(generatedLink, "Akıllı davetiye linki kopyalandı!")} style={{ flex: "1", minWidth: "180px", margin: 0 }}>🔗 Linki Kopyala</button>
          <button type="button" className="secondary-button" onClick={() => { if (!personalLinkName.trim()) { alert("Lütfen önce bir davetli adı yazın!"); return; } openWhatsAppShare(); }} style={{ flex: "1", minWidth: "180px", margin: 0, backgroundColor: "#25D366", color: "#fff", borderColor: "#25D366", opacity: personalLinkName.trim() ? 1 : 0.6, cursor: personalLinkName.trim() ? "pointer" : "not-allowed" }}>💬 WhatsApp ile Gönder</button>
        </div>
      </div>
    </AdminSection>
  );
}

export function AdminPanelContent({ 
  activeAdminTab, adminDraft, updateDraftObject, handleThemeChange, 
  changeAdminPassword, adminCurrentPassword, setAdminCurrentPassword, 
  adminNewPassword, setAdminNewPassword, adminNewPasswordAgain, 
  setAdminNewPasswordAgain, adminPasswordMessage, updateDraftArrayItem, 
  addDraftArrayItem, removeDraftArrayItem, 
  updateDraftImage, clearDraftImage, updateDraftMusic, clearDraftMusic, 
  updateGalleryImageFile, removeGalleryItem, addGalleryItem, 
  guests, adminGuestSearch, setAdminGuestSearch, exportGuestsExcel, 
  exportGuestsCsv, filteredGuests, editGuest, deleteGuest, clearGuests, 
  wishes, adminWishSearch, setAdminWishSearch, adminWishStatusFilter, 
  setAdminWishStatusFilter, exportWishesExcel, exportWishesCsv, 
  filteredWishes, toggleWishApproval, editWish, deleteWish, clearWishes,
  qrImageUrl, downloadQrCode, copyAdminLink, currentShareLink, 
  personalLinkName, setPersonalLinkName, exportAllDataJson, 
  dataImportText, setDataImportText, importAllDataJson,
  saveSiteContent
}) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith("en");

  switch (activeAdminTab) {
    case "general":
      return (
        <AdminSection title="Genel Davetiye Bilgileri" onSave={saveSiteContent}>
          <div className="admin-visibility-card" style={{ marginBottom: "24px" }}>
            <AdminCheckbox checked={adminDraft.settings.visibility?.countdown ?? true} label="Geri Sayım bölümünü davetiyede göster" onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, countdown: v })} />
            <AdminCheckbox checked={adminDraft.settings.visibility?.location ?? true} label="Tarih ve Konum (Harita) bölümünü davetiyede göster" onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, location: v })} />
          </div>
          <div className="admin-edit-grid">
            <AdminField label="Gelin adı" onChange={(v) => updateDraftObject("invitation", "bride", v)} value={adminDraft.invitation.bride} />
            <AdminField label="Damat adı" onChange={(v) => updateDraftObject("invitation", "groom", v)} value={adminDraft.invitation.groom} />
            <AdminField label="Görünen tarih" onChange={(v) => updateDraftObject("invitation", "dateText", v)} value={adminDraft.invitation.dateText} />
            <AdminField label="Saat" onChange={(v) => updateDraftObject("invitation", "timeText", v)} value={adminDraft.invitation.timeText} />
            <AdminField label="Geri sayım tarihi (YYYY-AA-GGTSA:DK:SN)" onChange={(v) => updateDraftObject("invitation", "weddingDate", v)} value={adminDraft.invitation.weddingDate} placeholder="2027-07-07T19:00:00" />
            <AdminField label="LCV Son Bildirim Tarihi" onChange={(v) => updateDraftObject("invitation", "rsvpDeadline", v)} value={adminDraft.invitation.rsvpDeadline} placeholder="Örn: 2027-07-01" />
            <AdminField label="WhatsApp numarası" onChange={(v) => updateDraftObject("invitation", "whatsappNumber", v)} value={adminDraft.invitation.whatsappNumber} />
            <AdminField label="Mekan adı" onChange={(v) => updateDraftObject("invitation", "venue", v)} value={adminDraft.invitation.venue} />
            <AdminField label="Adres" onChange={(v) => updateDraftObject("invitation", "address", v)} value={adminDraft.invitation.address} />
            <AdminField label="Harita linki" onChange={(v) => updateDraftObject("invitation", "mapLink", v)} value={adminDraft.invitation.mapLink} />
            <AdminField label="Paylaşım linki" onChange={(v) => updateDraftObject("invitation", "shareLink", v)} value={adminDraft.invitation.shareLink} placeholder={getCurrentShareLink()} />
            <AdminTextarea label="Ana davet metni" onChange={(v) => updateDraftObject("invitation", "message", v)} value={adminDraft.invitation.message} />
          </div>
        </AdminSection>
      );

    case "visibility":
      return (
        <AdminSection title={isEn ? "Section Visibility" : "Bölüm Görünürlüğü"} onSave={saveSiteContent}>
          <p className="admin-help-text">
            {isEn ? "You can toggle the visibility of sections on your invitation here." : "Davetiyenizde görünmesini istemediğiniz bölümleri buradan kapatabilirsiniz."}
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
            <AdminCheckbox checked={adminDraft.settings.visibility?.trickyDecline ?? false} label={t('visibility.trickyDecline')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, trickyDecline: v })} />
          </div>
        </AdminSection>
      );

    case "theme":
      return (
        <AdminSection title={isEn ? "Theme & Publishing Settings" : "Tema ve Yayın Ayarları"} onSave={saveSiteContent}>
          <p className="admin-help-text">
            {isEn 
              ? "When the theme changes, buttons, cards, text colors, backgrounds, and color overlays on hero images adjust accordingly." 
              : "Tema değiştiğinde butonlar, kartlar, yazı renkleri, arka planlar ve ana görsellerin üzerindeki renk katmanı aynı temaya göre değişir."}
          </p>
          <div className="theme-picker-grid">
            {THEMES.map((theme) => (
              <button type="button" key={theme.value} className={adminDraft.settings.theme === theme.value ? "theme-option-card active" : "theme-option-card"} data-theme-preview={theme.value} onClick={() => handleThemeChange(theme.value)}>
                <span className="theme-swatch" aria-hidden="true"></span>
                <strong>{theme.label}</strong>
                <small>{adminDraft.settings.theme === theme.value ? (isEn ? "Selected theme" : "Seçili tema") : (isEn ? "Use this theme" : "Bu temayı kullan")}</small>
              </button>
            ))}
          </div>
          <div className="admin-theme-check-row">
            <AdminCheckbox checked={adminDraft.settings.requireWishApproval} label={isEn ? "Guestbook messages require admin approval before publishing" : "Anı defteri mesajları admin onayından sonra yayınlansın"} onChange={(value) => updateDraftObject("settings", "requireWishApproval", value)} />
          </div>
          <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
            <h4 style={{ marginBottom: "12px", color: "var(--rose-dark)" }}>{isEn ? "Default Theme (For Reset)" : "Varsayılan Tema (Sıfırlama İçin)"}</h4>
            <Dropdown value={adminDraft.settings.defaultTheme || "lavanta"} onChange={(value) => updateDraftObject("settings", "defaultTheme", value)} options={THEMES} />
          </div>
        </AdminSection>
      );

    case "security":
      return (
        <AdminSection title={isEn ? "Admin Password" : "Admin Şifresi"} onSave={saveSiteContent}>
          <div className="admin-edit-grid">
            <AdminField label={isEn ? "Current Password" : "Mevcut Şifre"} onChange={setAdminCurrentPassword} value={adminCurrentPassword} type="password" />
            <AdminField label={isEn ? "New Password" : "Yeni Şifre"} onChange={setAdminNewPassword} value={adminNewPassword} type="password" />
            <AdminField label={isEn ? "New Password Again" : "Yeni Şifre Tekrar"} onChange={setAdminNewPasswordAgain} value={adminNewPasswordAgain} type="password" />
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button type="button" className="main-button" onClick={changeAdminPassword}>{isEn ? "Change Password" : "Şifreyi Değiştir 🔐"}</button>
          </div>
          {adminPasswordMessage ? <p className="admin-help-text">{adminPasswordMessage}</p> : null}
        </AdminSection>
      );

    case "messages":
      return (
        <AdminSection title={isEn ? "WhatsApp Messages" : "WhatsApp Mesajları"} onSave={saveSiteContent}>
          <p className="admin-help-text">
            {isEn 
              ? "Edit default messages sent via invitation link or form. {couple} represents couple names, and {link} represents the invitation link." 
              : "Davetiye linkiyle veya form aracılığıyla gönderilecek hazır mesajları düzenleyin. {couple} gelin-damat adını, {link} ise davetiye linkini temsil eder."}
          </p>
          <div className="admin-edit-grid" style={{ gridTemplateColumns: "1fr" }}>
            <AdminTextarea label={isEn ? "Personalized Guest Greeting" : "Kişiye Özel Davet Karşılama Metni"} onChange={(v) => updateDraftObject("messages", "guestGreeting", v)} value={adminDraft.messages?.guestGreeting} />
            <AdminTextarea label={isEn ? "WhatsApp General Share Message" : "WhatsApp Genel Paylaşım Mesajı"} onChange={(v) => updateDraftObject("messages", "whatsappShareMessage", v)} value={adminDraft.messages?.whatsappShareMessage} />
            <AdminTextarea label={isEn ? "RSVP Form WhatsApp Notification Message" : "LCV Formu WhatsApp Bildirim Mesajı"} onChange={(v) => updateDraftObject("messages", "rsvpWhatsappMessage", v)} value={adminDraft.messages?.rsvpWhatsappMessage} />
          </div>
        </AdminSection>
      );

    case "copy":
      return (
        <AdminSection title={isEn ? "Headings and Page Texts" : "Başlıklar ve Sayfa Metinleri"} onSave={saveSiteContent}>
          <p className="admin-help-text">
            {isEn ? "You can change all section titles and descriptions on your invitation here." : "Davetiyedeki tüm bölüm başlıklarını ve alt metinleri buradan değiştirebilirsiniz."}
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
          </div>
          
          <h4 style={{ color: 'var(--rose-dark)', marginBottom: '12px' }}>{isEn ? "Closing and Warnings" : "Kapanış ve Uyarılar"}</h4>
          <div className="admin-edit-grid">
            <AdminTextarea label={isEn ? "Footer Thanks Text" : "Kapanış Yazısı (Footer)"} onChange={(v) => updateDraftObject("copy", "thanksText", v)} value={adminDraft.copy?.thanksText} />
            <AdminTextarea label={isEn ? "RSVP Deadline Passed Message" : "LCV Süresi Doldu Mesajı"} onChange={(v) => updateDraftObject("copy", "deadlineText", v)} value={adminDraft.copy?.deadlineText} />
            <AdminTextarea label={isEn ? "Decline Modal Message" : "Katılamayacaklara Mesaj (Modal)"} onChange={(v) => updateDraftObject("copy", "declineMessage", v)} value={adminDraft.copy?.declineMessage} />
          </div>
        </AdminSection>
      );

    case "family":
      return (
        <AdminSection title={isEn ? "Family Information" : "Aile Bilgileri"} onSave={saveSiteContent}>
          <div className="admin-theme-check-row" style={{ marginBottom: "24px" }}>
            <AdminCheckbox checked={adminDraft.settings.visibility?.family ?? true} label={isEn ? "Show Family Section on Invitation" : "Aile Bilgileri bölümünü davetiyede göster"} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, family: v })} />
          </div>
          <div className="admin-edit-grid">
            <AdminField label={isEn ? "Bride Family Title" : "Gelin Ailesi Başlık (Örn: Gelin Ailesi)"} onChange={(v) => updateDraftObject("familyInfo", "brideFamilyTitle", v)} value={adminDraft.familyInfo?.brideFamilyTitle} />
            <AdminField label={isEn ? "Bride Family Name" : "Gelin Ailesi Adı"} onChange={(v) => updateDraftObject("familyInfo", "brideFamilyName", v)} value={adminDraft.familyInfo?.brideFamilyName} />
            <AdminField label={isEn ? "Groom Family Title" : "Damat Ailesi Başlık"} onChange={(v) => updateDraftObject("familyInfo", "groomFamilyTitle", v)} value={adminDraft.familyInfo?.groomFamilyTitle} />
            <AdminField label={isEn ? "Groom Family Name" : "Damat Ailesi Adı"} onChange={(v) => updateDraftObject("familyInfo", "groomFamilyName", v)} value={adminDraft.familyInfo?.groomFamilyName} />
            <AdminTextarea label={isEn ? "Family Message" : "Aile Mesajı"} onChange={(v) => updateDraftObject("familyInfo", "text", v)} value={adminDraft.familyInfo?.text} />
          </div>
        </AdminSection>
      );

    case "ceremony":
      return (
        <AdminSection title={isEn ? "Ceremony / Wedding Details" : "Nikah / Düğün Bilgileri"} onSave={saveSiteContent}>
          <div className="admin-theme-check-row" style={{ marginBottom: "16px" }}>
            <AdminCheckbox checked={adminDraft.settings.visibility?.ceremony ?? true} label={isEn ? "Show Ceremony Section on Invitation" : "Nikah ve Düğün bölümünü davetiyede göster"} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, ceremony: v })} />
          </div>
          <p className="admin-help-text">{isEn ? "You can add or remove event venues and times here." : "Etkinlik mekanlarını ve saatlerini buradan ekleyip çıkarabilirsiniz."}</p>
          <div className="admin-repeat-list">
            {(adminDraft.eventDetails || []).map((event, index) => (
              <div key={index} className="admin-repeat-item">
                <div className="admin-repeat-title">
                  <strong>{isEn ? `Event ${index + 1}` : `Etkinlik ${index + 1}`}</strong>
                  <AdminActionButtons onSave={saveSiteContent} onDelete={() => removeDraftArrayItem("eventDetails", index)} isEn={isEn} />
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

    case "schedule":
      return (
        <AdminSection title={isEn ? "Wedding Schedule (Timeline)" : "Düğün Programı (Akış)"} onSave={saveSiteContent}>
          <div className="admin-theme-check-row" style={{ marginBottom: "16px" }}>
            <AdminCheckbox checked={adminDraft.settings.visibility?.schedule ?? true} label={isEn ? "Show Schedule Section on Invitation" : "Düğün Takvimi bölümünü davetiyede göster"} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, schedule: v })} />
          </div>
          <p className="admin-help-text">{isEn ? "You can edit the wedding day timeline schedule here." : "Düğün gününün saat saat akış planını buradan düzenleyebilirsiniz."}</p>
          <div className="admin-repeat-list">
            {(adminDraft.scheduleItems || []).map((item, index) => (
              <div key={index} className="admin-repeat-item">
                <div className="admin-repeat-title">
                  <strong>{isEn ? `Program ${index + 1}` : `Program ${index + 1}`}</strong>
                  <AdminActionButtons onSave={saveSiteContent} onDelete={() => removeDraftArrayItem("scheduleItems", index)} isEn={isEn} />
                </div>
                <div className="admin-edit-grid">
                  <AdminField label={isEn ? "Time" : "Saat"} value={item.time} onChange={(v) => updateDraftArrayItem("scheduleItems", index, "time", v)} placeholder="Örn: 18:30" />
                  <AdminField label={isEn ? "Title" : "Başlık"} value={item.title} onChange={(v) => updateDraftArrayItem("scheduleItems", index, "title", v)} placeholder="Örn: Misafir Karşılama" />
                  <AdminTextarea label={isEn ? "Description" : "Açıklama"} value={item.description} onChange={(v) => updateDraftArrayItem("scheduleItems", index, "description", v)} />
                </div>
              </div>
            ))}
            <button type="button" className="admin-add-button" onClick={() => addDraftArrayItem("scheduleItems", { time: "22:00", title: "Yeni Program", description: "" })}>{isEn ? "Add New Program" : "Yeni Program Ekle"}</button>
          </div>
        </AdminSection>
      );

    case "gallery":
      return (
        <AdminSection title={isEn ? "Visuals and Music" : "Görsel ve Müzik"} onSave={saveSiteContent}>
          <div className="admin-theme-check-row" style={{ marginBottom: "24px" }}>
            <AdminCheckbox checked={adminDraft.settings.visibility?.gallery ?? true} label={isEn ? "Show Gallery Section on Invitation" : "Fotoğraf Galerisi bölümünü davetiyede göster"} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, gallery: v })} />
          </div>
          <div className="admin-edit-grid">
            <AdminImageField label={isEn ? "Hero Main Image" : "Ana Karşılama Görseli"} value={adminDraft.invitation?.heroImage} onFileSelect={(e) => updateDraftImage("invitation", "heroImage", e.target.files[0])} onClear={() => clearDraftImage("invitation", "heroImage")} />
            <AdminMusicField label={isEn ? "Music File" : "Müzik dosyası"} value={adminDraft.invitation?.musicFile} fileName={adminDraft.invitation?.musicName} onFileSelect={(e) => updateDraftMusic(e.target.files[0])} onClear={clearDraftMusic} />
          </div>
          
          <div style={{ marginTop: "32px" }}>
            <h4 style={{ marginBottom: "16px", color: "var(--rose-deep)" }}>{isEn ? "Gallery Photos" : "Galeri Fotoğrafları"}</h4>
            <div className="admin-gallery-list">
              {(adminDraft.invitation?.gallery || []).map((imgUrl, index) => (
                <div key={index} className="admin-gallery-upload-row">
                  <AdminImageField label={`${isEn ? "Photo" : "Fotoğraf"} ${index + 1}`} value={imgUrl} onFileSelect={(e) => updateGalleryImageFile(index, e.target.files[0])} onClear={() => removeGalleryItem(index)} />
                  <AdminActionButtons onSave={saveSiteContent} onDelete={() => removeGalleryItem(index)} isEn={isEn} />
                </div>
              ))}
              <button type="button" className="admin-add-button" onClick={addGalleryItem}>{isEn ? "Add New Photo" : "Yeni Fotoğraf Ekle"}</button>
            </div>
          </div>
        </AdminSection>
      );

    case "guests":
      return <GuestsAdminPanel guests={guests} adminGuestSearch={adminGuestSearch} setAdminGuestSearch={setAdminGuestSearch} exportGuestsExcel={exportGuestsExcel} exportGuestsCsv={exportGuestsCsv} filteredGuests={filteredGuests} editGuest={editGuest} deleteGuest={deleteGuest} clearGuests={clearGuests} adminDraft={adminDraft} updateDraftObject={updateDraftObject} />;

    case "wishes":
      return <WishesAdminPanel wishes={wishes} filteredWishes={filteredWishes} adminWishSearch={adminWishSearch} setAdminWishSearch={setAdminWishSearch} adminWishStatusFilter={adminWishStatusFilter} setAdminWishStatusFilter={setAdminWishStatusFilter} exportWishesExcel={exportWishesExcel} exportWishesCsv={exportWishesCsv} toggleWishApproval={toggleWishApproval} editWish={editWish} deleteWish={deleteWish} clearWishes={clearWishes} isEn={isEn} adminDraft={adminDraft} updateDraftObject={updateDraftObject} />;

    case "qr": 
      return (
        <AdminSection title={isEn ? "QR Code and Share" : "QR Kod ve Paylaşım"} onSave={saveSiteContent}>
          <p className="admin-help-text">{isEn ? "You can download the QR code or copy the link to share your invitation easily." : "Davetiyenizi kolayca paylaşmak için QR kodu indirebilir veya linki kopyalayabilirsiniz."}</p>
          
          <div className="admin-qr-panel" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", background: "var(--paper-soft)", padding: "32px 24px", borderRadius: "22px", border: "1px solid var(--border)" }}>
              <img 
                src={qrImageUrl} 
                alt="QR Code" 
                style={{ width: "180px", height: "180px", objectFit: "contain", borderRadius: "16px", margin: "0 auto 20px", background: "#fff", padding: "12px", border: "1px solid var(--border)" }} 
              />
              <button type="button" className="main-button" onClick={downloadQrCode} style={{ minWidth: "220px", margin: 0 }}>{isEn ? "Download QR" : "QR İndir 📥"}</button>
            </div>

            <div className="admin-link-preview-box" style={{ display: "flex", flexDirection: "column", gap: "16px", background: "var(--paper-soft)", padding: "24px", borderRadius: "22px", border: "1px solid var(--border)" }}>
              <div>
                <span style={{ fontWeight: 800, color: "var(--rose-dark)", display: "block", marginBottom: "8px", fontSize: "16px" }}>{isEn ? "General Invitation Link" : "Genel Davetiye Linki"}</span>
                <input value={currentShareLink} readOnly style={{ width: "100%", padding: "14px 16px", borderRadius: "14px", border: "1.5px solid rgba(159, 79, 104, 0.46)", background: "#fff", fontWeight: "700", color: "var(--text)", outline: "none" }} />
                <small style={{ display: "block", marginTop: "12px", fontSize: "14px", color: "var(--text-soft)", lineHeight: "1.5" }}>{isEn ? "You can copy this link and share it with everyone via WhatsApp or social media." : "Bu linki kopyalayıp WhatsApp veya sosyal medyadan herkesle paylaşabilirsiniz."}</small>
              </div>
              <button type="button" className="secondary-button" onClick={() => copyAdminLink(currentShareLink, isEn ? "Invitation link copied!" : "Davetiye linki kopyalandı!")} style={{ alignSelf: "flex-start", margin: 0 }}>{isEn ? "Copy Link" : "Linki Kopyala 🔗"}</button>
            </div>

          </div>
        </AdminSection>
      );
    
    case "personalLink":
      return (
        <AdminSection title="Kişiye Özel Akıllı Link Üretici" onSave={saveSiteContent}>
          <PersonalLinkPanel currentShareLink={currentShareLink} copyAdminLink={copyAdminLink} personalLinkName={personalLinkName} setPersonalLinkName={setPersonalLinkName} />
        </AdminSection>
    );
    
    case "data":
      return (
        <AdminSection title={isEn ? "Data Backup" : "Veri Yedeği"} onSave={saveSiteContent}>
          <p className="admin-help-text">{isEn ? "You can back up all your invitation data as a JSON file or restore an old backup with one click." : "Tüm davetiye verilerinizi (ayarlar, misafirler, mesajlar) tek tıkla JSON dosyası olarak yedekleyebilir veya eski bir yedeği geri yükleyebilirsiniz."}</p>
          <div className="admin-export-grid">
            <div className="admin-export-card">
              <strong>{isEn ? "Backup (Export)" : "Yedek Al (Dışa Aktar)"}</strong>
              <span>{isEn ? "Downloads the entire system as a JSON file." : "Tüm sistemi JSON formatında bilgisayarınıza indirir."}</span>
              <button type="button" className="main-button" onClick={exportAllDataJson}>{isEn ? "Download JSON" : "JSON İndir ⬇️"}</button>
            </div>
            <div className="admin-import-box" style={{ margin: 0 }}>
              <strong style={{ display: "block", marginBottom: "8px", color: "var(--rose-deep)" }}>{isEn ? "Restore Backup (Import)" : "Yedeği Geri Yükle (İçe Aktar)"}</strong>
              <AdminTextarea label="" value={dataImportText} onChange={setDataImportText} placeholder={isEn ? "Paste downloaded JSON file content here..." : "İndirdiğiniz JSON dosyasının içeriğini buraya yapıştırın..."} />
              <button type="button" className="secondary-button danger-button" style={{ marginTop: "12px", width: "100%" }} onClick={importAllDataJson}>{isEn ? "Import Backup" : "Yedeği İçe Aktar ⬆️"}</button>
            </div>
          </div>
        </AdminSection>
      );
      
    case "gift":
      return (
        <AdminSection title={isEn ? "Gift & IBAN Details" : "Hediye & IBAN Bilgileri"} onSave={saveSiteContent}>
          <div className="admin-visibility-card" style={{ marginBottom: "24px" }}>
            <AdminCheckbox checked={adminDraft.settings.visibility?.iban ?? true} label={isEn ? "Show Gift Section on Invitation" : "Bu bölümü (IBAN & Hediye) davetiyede göster"} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, iban: v })} />
            <AdminCheckbox checked={adminDraft.settings.visibility?.popupIban ?? true} label={isEn ? "Gift Button for Non-Attending (Modal)" : "Katılmayanlar İçin Hediye Butonu (Form Modalı)"} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, popupIban: v })} />
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

    default:
      return null;
  }
}