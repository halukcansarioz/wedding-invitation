import React from "react";
import { useTranslation } from "react-i18next";
import {
  AdminField,
  AdminTextarea,
  AdminCheckbox,
  AdminImageField,
  AdminMusicField,
  AdminSection,
} from "../AdminUI";
import { ThemeDropdown } from "../common/UIComponents";
import { THEMES } from "../../config/constants";
import { getCurrentShareLink, buildPersonalLink } from "../../utils/helpers";

export function GuestsAdminPanel({ guests, adminGuestSearch, setAdminGuestSearch, exportGuestsExcel, exportGuestsCsv, filteredGuests, editGuest, deleteGuest, clearGuests }) {
  const { i18n } = useTranslation();
  const isEn = i18n.language.startsWith("en");

  return (
    <AdminSection title={isEn ? "RSVP Responses" : "Kayıtlı Form Yanıtları"}>
      <div className="admin-stats admin-stats-inside" style={{ gridTemplateColumns: "repeat(3, 1fr)", maxWidth: "500px" }}>
        <div><strong>{guests.length}</strong><span>{isEn ? "Total Responses" : "Toplam Yanıt"}</span></div>
        <div><strong>{guests.filter(g => g.attendance === "Katılacağım").length}</strong><span>{isEn ? "Attending" : "Katılacak"}</span></div>
        <div><strong>{guests.filter(g => g.attendance === "Katılamayacağım").length}</strong><span>{isEn ? "Not Attending" : "Katılmayacak"}</span></div>
      </div>
      <div className="admin-toolbar" style={{ gridTemplateColumns: "1fr 140px 140px" }}>
        <input value={adminGuestSearch} onChange={(e) => setAdminGuestSearch(e.target.value)} placeholder={isEn ? "Search..." : "Kayıtlarda ara"} />
        <button type="button" className="secondary-button" onClick={exportGuestsExcel}>{isEn ? "Export Excel" : "Excel İndir"}</button>
        <button type="button" className="secondary-button" onClick={exportGuestsCsv}>{isEn ? "Export CSV" : "CSV İndir"}</button>
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
                  <button type="button" className="secondary-button small-admin-button" onClick={() => editGuest(guest.id)}>{isEn ? "Edit" : "Düzenle"}</button>
                  <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => deleteGuest(guest.id)}>{isEn ? "Delete" : "Sil"}</button>
                </div>
              </div>
            );
          })
        )}
        <button type="button" className="secondary-button danger-button" onClick={clearGuests}>{isEn ? "Clear All Responses" : "Kayıtları Temizle"}</button>
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

export function AdminPanelContent({ activeAdminTab, adminDraft, updateDraftObject, handleThemeChange, changeAdminPassword, adminCurrentPassword, setAdminCurrentPassword, adminNewPassword, setAdminNewPassword, adminNewPasswordAgain, setAdminNewPasswordAgain, adminPasswordMessage, updateDraftArrayItem, updateDraftImage, clearDraftImage, updateDraftMusic, clearDraftMusic, guests, adminGuestSearch, setAdminGuestSearch, exportGuestsExcel, exportGuestsCsv, filteredGuests, editGuest, deleteGuest, clearGuests, adminWishSearch, setAdminWishSearch, adminWishStatusFilter, setAdminWishStatusFilter, exportWishesExcel, exportWishesCsv, qrImageUrl, downloadQrCode, copyAdminLink, currentShareLink, personalLinkName, setPersonalLinkName, exportAllDataJson, dataImportText, setDataImportText, importAllDataJson }) {
  const { i18n } = useTranslation();
  const isEn = i18n.language.startsWith("en");

  switch (activeAdminTab) {
    case "general":
      return (
        <AdminSection title="Genel Davetiye Bilgileri">
          <div className="admin-visibility-card">
            <AdminCheckbox checked={adminDraft.settings.visibility?.countdown ?? false} label="Geri Sayım bölümünü davetiyede göster" onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, countdown: v })} />
            <AdminCheckbox checked={adminDraft.settings.visibility?.location ?? false} label="Tarih ve Konum (Harita) bölümünü davetiyede göster" onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, location: v })} />
          </div>
          <div className="admin-edit-grid">
            <AdminField label="Gelin adı" onChange={(v) => updateDraftObject("invitation", "bride", v)} value={adminDraft.invitation.bride} />
            <AdminField label="Damat adı" onChange={(v) => updateDraftObject("invitation", "groom", v)} value={adminDraft.invitation.groom} />
            <AdminField label="Görünen tarih" onChange={(v) => updateDraftObject("invitation", "dateText", v)} value={adminDraft.invitation.dateText} />
            <AdminField label="Saat" onChange={(v) => updateDraftObject("invitation", "timeText", v)} value={adminDraft.invitation.timeText} />
            <AdminField label="Geri sayım tarihi" onChange={(v) => updateDraftObject("invitation", "weddingDate", v)} value={adminDraft.invitation.weddingDate} placeholder="2027-07-07T19:00:00" />
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

    case "theme":
      return (
        <AdminSection title="Tema ve Yayın Ayarları">
          <p className="admin-help-text">Tema değiştiğinde butonlar, kartlar, yazı renkleri, arka planlar ve ana görsellerin üzerindeki renk katmanı aynı temaya göre değişir.</p>
          <div className="theme-picker-grid">
            {THEMES.map((theme) => (
              <button type="button" key={theme.value} className={adminDraft.settings.theme === theme.value ? "theme-option-card active" : "theme-option-card"} data-theme-preview={theme.value} onClick={() => handleThemeChange(theme.value)}>
                <span className="theme-swatch" aria-hidden="true"></span>
                <strong>{theme.label}</strong>
                <small>{adminDraft.settings.theme === theme.value ? "Seçili tema" : "Bu temayı kullan"}</small>
              </button>
            ))}
          </div>
          <div className="admin-theme-check-row">
            <AdminCheckbox checked={adminDraft.settings.requireWishApproval} label="Anı defteri mesajları admin onayından sonra yayınlansın" onChange={(value) => updateDraftObject("settings", "requireWishApproval", value)} />
          </div>
          <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
            <h4 style={{ marginBottom: "12px", color: "var(--rose-dark)" }}>Varsayılan Tema (Sıfırlama İçin)</h4>
            <ThemeDropdown value={adminDraft.settings.defaultTheme || "lavanta"} onChange={(value) => updateDraftObject("settings", "defaultTheme", value)} options={THEMES} />
          </div>
        </AdminSection>
      );

    case "security":
      return (
        <AdminSection title={isEn ? "Admin Password" : "Admin Şifresi"}>
          <div className="admin-edit-grid">
            <AdminField label={isEn ? "Current Password" : "Mevcut Şifre"} onChange={setAdminCurrentPassword} value={adminCurrentPassword} />
            <AdminField label={isEn ? "New Password" : "Yeni Şifre"} onChange={setAdminNewPassword} value={adminNewPassword} />
            <AdminField label={isEn ? "New Password Again" : "Yeni Şifre Tekrar"} onChange={setAdminNewPasswordAgain} value={adminNewPasswordAgain} />
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button type="button" className="main-button" onClick={changeAdminPassword}>{isEn ? "Change Password" : "Şifreyi Değiştir"}</button>
          </div>
          {adminPasswordMessage ? <p className="admin-help-text">{adminPasswordMessage}</p> : null}
        </AdminSection>
      );

    case "messages":
      return (
        <AdminSection title={isEn ? "WhatsApp Messages" : "WhatsApp Mesajları"}>
          <div className="admin-edit-grid">
            <AdminField label={isEn ? "Greeting Text" : "Karşılama Metni"} onChange={(v) => updateDraftObject("invitation", "guestGreeting", v)} value={adminDraft.invitation.guestGreeting} />
            <AdminField label={isEn ? "RSVP Message" : "Katılım Mesajı"} onChange={(v) => updateDraftObject("invitation", "rsvpText", v)} value={adminDraft.invitation.rsvpText} />
            <AdminField label={isEn ? "Gift Message" : "Hediye Mesajı"} onChange={(v) => updateDraftObject("invitation", "giftText", v)} value={adminDraft.invitation.giftText} />
          </div>
        </AdminSection>
      );

    case "copy":
      return (
        <AdminSection title="Başlıklar ve Metinler">
          <div className="admin-edit-grid">
            <AdminField label="Ana başlık" onChange={(v) => updateDraftObject("copy", "heroTitle", v)} value={adminDraft.copy?.heroTitle} />
            <AdminField label="Alt başlık" onChange={(v) => updateDraftObject("copy", "heroSubtitle", v)} value={adminDraft.copy?.heroSubtitle} />
            <AdminField label="Davet metni" onChange={(v) => updateDraftObject("copy", "invitationText", v)} value={adminDraft.copy?.invitationText} />
          </div>
        </AdminSection>
      );

    case "family":
      return (
        <AdminSection title="Aile Bilgileri">
          <div className="admin-edit-grid">
            <AdminField label="Gelin ailesi" onChange={(v) => updateDraftObject("family", "brideFamily", v)} value={adminDraft.family?.brideFamily} />
            <AdminField label="Damat ailesi" onChange={(v) => updateDraftObject("family", "groomFamily", v)} value={adminDraft.family?.groomFamily} />
          </div>
        </AdminSection>
      );

    case "ceremony":
      return (
        <AdminSection title="Nikah / Düğün Bilgileri">
          <div className="admin-edit-grid">
            <AdminField label="Nikah saati" onChange={(v) => updateDraftObject("ceremony", "ceremonyTime", v)} value={adminDraft.ceremony?.ceremonyTime} />
            <AdminField label="Düğün saati" onChange={(v) => updateDraftObject("ceremony", "receptionTime", v)} value={adminDraft.ceremony?.receptionTime} />
          </div>
        </AdminSection>
      );

    case "schedule":
      return (
        <AdminSection title="Düğün Programı">
          <div className="admin-edit-grid">
            <AdminField label="Program metni" onChange={(v) => updateDraftObject("schedule", "timeline", v)} value={adminDraft.schedule?.timeline} />
          </div>
        </AdminSection>
      );

    case "gallery":
      return (
        <AdminSection title="Görsel ve Müzik">
          <div className="admin-edit-grid">
            <AdminImageField label="Ana görsel" value={adminDraft.invitation?.heroImage} onChange={updateDraftImage} onClear={clearDraftImage} />
            <AdminMusicField label="Müzik dosyası" value={adminDraft.invitation?.heroMusic} onChange={updateDraftMusic} onClear={clearDraftMusic} />
          </div>
          <div className="admin-edit-grid" style={{ marginTop: "16px" }}>
            <AdminField label="Galeri görsel URL" onChange={(v) => updateDraftArrayItem("gallery", "images", v)} value={adminDraft.gallery?.images?.[0] || ""} />
          </div>
        </AdminSection>
      );

    case "guests":
      return <GuestsAdminPanel guests={guests} adminGuestSearch={adminGuestSearch} setAdminGuestSearch={setAdminGuestSearch} exportGuestsExcel={exportGuestsExcel} exportGuestsCsv={exportGuestsCsv} filteredGuests={filteredGuests} editGuest={editGuest} deleteGuest={deleteGuest} clearGuests={clearGuests} />;

    case "wishes":
      return (
        <AdminSection title="Anı Defteri Mesajları">
          <div className="admin-edit-grid">
            <AdminField label="Arama" onChange={setAdminWishSearch} value={adminWishSearch} />
            <AdminField label="Durum filtresi" onChange={setAdminWishStatusFilter} value={adminWishStatusFilter} />
          </div>
          <div className="admin-edit-grid" style={{ marginTop: "16px" }}>
            <button type="button" className="secondary-button" onClick={exportWishesExcel}>Excel</button>
            <button type="button" className="secondary-button" onClick={exportWishesCsv}>CSV</button>
          </div>
        </AdminSection>
      );

    case "qr":
      return (
        <AdminSection title="QR Kod ve Paylaşım">
          <div className="admin-edit-grid">
            <AdminField label="QR URL" value={qrImageUrl || ""} readOnly />
            <button type="button" className="main-button" onClick={downloadQrCode}>QR İndir</button>
          </div>
        </AdminSection>
      );

    case "personalLink":
      return <PersonalLinkPanel currentShareLink={currentShareLink} copyAdminLink={copyAdminLink} personalLinkName={personalLinkName} setPersonalLinkName={setPersonalLinkName} />;

    case "data":
      return (
        <AdminSection title="Veri Yedeği">
          <div className="admin-edit-grid">
            <button type="button" className="main-button" onClick={exportAllDataJson}>JSON İndir</button>
            <AdminTextarea label="İçe Aktar" value={dataImportText} onChange={setDataImportText} />
            <button type="button" className="secondary-button" onClick={importAllDataJson}>İçe Aktar</button>
          </div>
        </AdminSection>
      );

    default:
      return null;
  }
}
