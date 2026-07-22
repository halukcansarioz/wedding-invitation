import React, { useState } from "react";
import {
  AdminField,
  AdminTextarea,
  AdminCheckbox,
  AdminImageField,
  AdminMusicField,
  AdminSection,
  AdminSelect,
} from "../AdminUI";
import { ThemeDropdown, CustomDropdown } from "../common/UIComponents";
import { THEMES, SIDE_OPTIONS, PERSON_COUNT_OPTIONS } from "../../config/constants";
import { getCurrentShareLink, buildPersonalLink } from "../../utils/helpers";

function PersonalLinkPanel({ currentShareLink, copyAdminLink, personalLinkName, setPersonalLinkName }) {
  // Varsayılan olarak "Seçilmedi" (boş) gelsin
  const [selectedSide, setSelectedSide] = useState("");
  const [selectedCount, setSelectedCount] = useState("");

  const generatedLink = buildPersonalLink(currentShareLink, personalLinkName, selectedSide, selectedCount);

  const openWhatsAppShare = () => {
    if (!personalLinkName.trim()) return;
    const text = `Sevgili ${personalLinkName}, düğün davetiyemiz sana özel olarak hazırlandı! 💍\n\nKatılım durumunu aşağıdaki linkten tek tıkla bize bildirebilirsin:\n${generatedLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  // Menülere "Boş Bırak" seçeneği eklendi
  const extendedSideOptions = [{ label: "Seçilmedi (Boş Bırak)", value: "" }, ...SIDE_OPTIONS];
  const extendedCountOptions = [{ label: "Seçilmedi (Boş Bırak)", value: "" }, ...PERSON_COUNT_OPTIONS];

  return (
    <AdminSection title="Kişiye Özel Akıllı Link Üretici">
      <div className="admin-personal-link-box personal-link-standalone" style={{ display: "grid", gap: "18px" }}>
        <p className="admin-help-text" style={{ margin: 0 }}>
          Sadece isim yazarak davetiye linki üretebilirsiniz. Eğer taraf ve kişi sayısını da seçerseniz LCV formu tam otomatik doldurulur.
        </p>

        <div className="admin-edit-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
          <AdminField label="Davetli Adı Soyadı" onChange={setPersonalLinkName} placeholder="Örn: Ahmet Yılmaz" value={personalLinkName} />
          <AdminSelect label="Yakınlık / Taraf (Opsiyonel)" value={selectedSide} options={extendedSideOptions} onChange={setSelectedSide} />
          <AdminSelect label="Kişi Sayısı (Opsiyonel)" value={selectedCount} options={extendedCountOptions} onChange={setSelectedCount} />
        </div>

        <div style={{ marginTop: "4px" }}>
          <span style={{ display: "block", marginBottom: "6px", fontWeight: "700", color: "var(--rose-dark)" }}>Üretilen Akıllı Link:</span>
          <input value={generatedLink} readOnly style={{ width: "100%", padding: "14px 16px", borderRadius: "14px", border: "1.5px dashed var(--rose-dark)", background: "var(--paper-soft)", fontWeight: "700", color: "var(--text)" }} />
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "6px" }}>
          <button type="button" className="main-button" onClick={() => copyAdminLink(generatedLink, "Akıllı davetiye linki kopyalandı!")} style={{ flex: "1", minWidth: "180px", margin: 0 }}>
            🔗 Linki Kopyala
          </button>
          <button type="button" className="secondary-button" onClick={openWhatsAppShare} disabled={!personalLinkName.trim()} style={{ flex: "1", minWidth: "180px", margin: 0, backgroundColor: "#25D366", color: "#fff", borderColor: "#25D366" }}>
            💬 WhatsApp ile Gönder
          </button>
        </div>
      </div>
    </AdminSection>
  );
}

export function renderAdminActivePanel({
  activeAdminTab,
  adminDraft,
  updateDraftObject,
  handleThemeChange,
  changeAdminPassword,
  adminCurrentPassword,
  setAdminCurrentPassword,
  adminNewPassword,
  setAdminNewPassword,
  adminNewPasswordAgain,
  setAdminNewPasswordAgain,
  adminPasswordMessage,
  removeDraftArrayItem,
  updateDraftArrayItem,
  addDraftArrayItem,
  updateDraftImage,
  clearDraftImage,
  updateDraftMusic,
  clearDraftMusic,
  updateGalleryImageFile,
  removeGalleryItem,
  addGalleryItem,
  guests,
  totalPersonCount,
  notAttendingCount,
  childGuestCount,
  brideSideCount,
  groomSideCount,
  adminGuestSearch,
  setAdminGuestSearch,
  adminGuestAttendanceFilter,
  setAdminGuestAttendanceFilter,
  adminGuestSideFilter,
  setAdminGuestSideFilter,
  adminGuestChildFilter,
  setAdminGuestChildFilter,
  exportGuestsExcel,
  exportGuestsCsv,
  filteredGuests,
  editGuest,
  deleteGuest,
  clearGuests,
  wishes,
  adminWishSearch,
  setAdminWishSearch,
  adminWishStatusFilter,
  setAdminWishStatusFilter,
  exportWishesExcel,
  exportWishesCsv,
  filteredWishes,
  toggleWishApproval,
  editWish,
  deleteWish,
  clearWishes,
  qrImageUrl,
  downloadQrCode,
  copyAdminLink,
  currentShareLink,
  personalLinkName,
  setPersonalLinkName,
  personalGuestLink,
  exportAllDataJson,
  dataImportText,
  setDataImportText,
  importAllDataJson
}) {
  switch (activeAdminTab) {
    case "general":
      return (
        <AdminSection title="Genel Davetiye Bilgileri">
          <div className="admin-visibility-card">
            <AdminCheckbox
              checked={adminDraft.settings.visibility?.countdown ?? false}
              label="Geri Sayım bölümünü davetiyede göster"
              onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, countdown: v })}
            />
            <AdminCheckbox
              checked={adminDraft.settings.visibility?.location ?? false}
              label="Tarih ve Konum (Harita) bölümünü davetiyede göster"
              onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, location: v })}
            />
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
          <p className="admin-help-text">
            Tema değiştiğinde butonlar, kartlar, yazı renkleri, arka planlar ve ana görsellerin üzerindeki renk katmanı aynı temaya göre değişir.
          </p>
          <div className="theme-picker-grid">
            {THEMES.map((theme) => (
              <button
                type="button"
                key={theme.value}
                className={adminDraft.settings.theme === theme.value ? "theme-option-card active" : "theme-option-card"}
                data-theme-preview={theme.value}
                onClick={() => handleThemeChange(theme.value)}
              >
                <span className="theme-swatch" aria-hidden="true"></span>
                <strong>{theme.label}</strong>
                <small>{adminDraft.settings.theme === theme.value ? "Seçili tema" : "Bu temayı kullan"}</small>
              </button>
            ))}
          </div>
          <div className="admin-theme-check-row">
            <AdminCheckbox
              checked={adminDraft.settings.requireWishApproval}
              label="Anı defteri mesajları admin onayından sonra yayınlansın"
              onChange={(value) => updateDraftObject("settings", "requireWishApproval", value)}
            />
          </div>
          <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
            <h4 style={{ marginBottom: "12px", color: "var(--rose-dark)" }}>Varsayılan Tema (Sıfırlama İçin)</h4>
            <ThemeDropdown
              value={adminDraft.settings.defaultTheme || "lavanta"}
              onChange={(val) => updateDraftObject("settings", "defaultTheme", val)}
              options={THEMES}
            />
          </div>
          <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
            <h4 style={{ marginBottom: "12px", color: "var(--rose-dark)" }}>Bölüm Görünürlüğü (Aç/Kapat)</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
              <AdminCheckbox checked={adminDraft.settings.visibility?.countdown ?? false} label="Geri Sayım" onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, countdown: v })} />
              <AdminCheckbox checked={adminDraft.settings.visibility?.family ?? false} label="Aile Bilgileri" onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, family: v })} />
              <AdminCheckbox checked={adminDraft.settings.visibility?.ceremony ?? false} label="Nikah / Düğün Detayları" onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, ceremony: v })} />
              <AdminCheckbox checked={adminDraft.settings.visibility?.schedule ?? false} label="Düğün Takvimi" onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, schedule: v })} />
              <AdminCheckbox checked={adminDraft.settings.visibility?.location ?? false} label="Tarih ve Harita" onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, location: v })} />
              <AdminCheckbox checked={adminDraft.settings.visibility?.gallery ?? false} label="Fotoğraf Galerisi" onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, gallery: v })} />
              <AdminCheckbox checked={adminDraft.settings.visibility?.rsvp ?? false} label="Katılım (LCV) Formu" onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, rsvp: v })} />
              <AdminCheckbox checked={adminDraft.settings.visibility?.guests ?? false} label="Misafir Listesi" onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, guests: v })} />
              <AdminCheckbox checked={adminDraft.settings.visibility?.wishes ?? false} label="Anı Defteri Formu" onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, wishes: v })} />
            </div>
          </div>
        </AdminSection>
      );

    case "security":
      return (
        <AdminSection title="Admin Panel Şifresi">
          <form className="admin-password-form" onSubmit={changeAdminPassword}>
            <div className="admin-edit-grid">
              <AdminField label="Mevcut şifre" onChange={setAdminCurrentPassword} placeholder="Mevcut admin şifresi" type="password" value={adminCurrentPassword} />
              <AdminField label="Yeni şifre" onChange={setAdminNewPassword} placeholder="Yeni şifre" type="password" value={adminNewPassword} />
              <AdminField label="Yeni şifre tekrar" onChange={setAdminNewPasswordAgain} placeholder="Yeni şifreyi tekrar yaz" type="password" value={adminNewPasswordAgain} />
            </div>
            <div className="admin-password-actions">
              <button type="submit" className="main-button">Şifreyi Güncelle</button>
              {adminPasswordMessage && <span className="admin-password-message">{adminPasswordMessage}</span>}
            </div>
          </form>
        </AdminSection>
      );

    case "messages":
      return (
        <AdminSection title="WhatsApp ve Özel Davetli Mesajları">
          <div className="admin-edit-grid">
            <AdminTextarea label="WhatsApp paylaşım mesajı" onChange={(v) => updateDraftObject("messages", "whatsappShareMessage", v)} value={adminDraft.messages.whatsappShareMessage} />
            <AdminTextarea label="WhatsApp katılım bildirimi mesajı" onChange={(v) => updateDraftObject("messages", "rsvpWhatsappMessage", v)} value={adminDraft.messages.rsvpWhatsappMessage} />
            <AdminTextarea label="Kişiye özel davetli karşılama metni" onChange={(v) => updateDraftObject("messages", "guestGreeting", v)} value={adminDraft.messages.guestGreeting} />
          </div>
        </AdminSection>
      );

    case "copy":
      return (
        <AdminSection title="Sayfadaki Başlık ve Açıklamalar">
          <div className="admin-edit-grid">
            {Object.entries(adminDraft.copy).map(([key, value]) =>
              key.toLowerCase().includes("text") || key.toLowerCase().includes("description") ? (
                <AdminTextarea key={key} label={key} onChange={(nextVal) => updateDraftObject("copy", key, nextVal)} value={value} />
              ) : (
                <AdminField key={key} label={key} onChange={(nextVal) => updateDraftObject("copy", key, nextVal)} value={value} />
              )
            )}
          </div>
        </AdminSection>
      );

    case "family":
      return (
        <AdminSection title="Aile Bilgileri">
          <div className="admin-edit-grid">
            <AdminField label="Gelin ailesi başlığı" onChange={(v) => updateDraftObject("familyInfo", "brideFamilyTitle", v)} value={adminDraft.familyInfo.brideFamilyTitle} />
            <AdminField label="Gelin ailesi adı" onChange={(v) => updateDraftObject("familyInfo", "brideFamilyName", v)} value={adminDraft.familyInfo.brideFamilyName} />
            <AdminField label="Damat ailesi başlığı" onChange={(v) => updateDraftObject("familyInfo", "groomFamilyTitle", v)} value={adminDraft.familyInfo.groomFamilyTitle} />
            <AdminField label="Damat ailesi adı" onChange={(v) => updateDraftObject("familyInfo", "groomFamilyName", v)} value={adminDraft.familyInfo.groomFamilyName} />
            <AdminTextarea label="Aile açıklaması" onChange={(v) => updateDraftObject("familyInfo", "text", v)} value={adminDraft.familyInfo.text} />
          </div>
        </AdminSection>
      );

    case "ceremony":
      return (
        <AdminSection title="Nikah / Düğün Ayrımı">
          <div className="admin-repeat-list">
            {adminDraft.eventDetails.map((event, index) => (
              <div className="admin-repeat-item" key={`event-${index}`}>
                <div className="admin-repeat-title">
                  <strong>Etkinlik {index + 1}</strong>
                  <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => removeDraftArrayItem("eventDetails", index)}>Sil</button>
                </div>
                <div className="admin-edit-grid">
                  <AdminField label="Başlık" onChange={(v) => updateDraftArrayItem("eventDetails", index, "label", v)} value={event.label} />
                  <AdminField label="Saat" onChange={(v) => updateDraftArrayItem("eventDetails", index, "time", v)} value={event.time} />
                  <AdminField label="Yer" onChange={(v) => updateDraftArrayItem("eventDetails", index, "location", v)} value={event.location} />
                  <AdminTextarea label="Açıklama" onChange={(v) => updateDraftArrayItem("eventDetails", index, "description", v)} value={event.description} />
                </div>
              </div>
            ))}
            <button type="button" className="secondary-button admin-add-button" onClick={() => addDraftArrayItem("eventDetails", { label: "Yeni Etkinlik", time: "", location: "", description: "" })}>Yeni Etkinlik Ekle</button>
          </div>
        </AdminSection>
      );

    case "schedule":
      return (
        <AdminSection title="Düğün Takvimi / Akış">
          <div className="admin-repeat-list">
            {adminDraft.scheduleItems.map((item, index) => (
              <div className="admin-repeat-item" key={`schedule-${index}`}>
                <div className="admin-repeat-title">
                  <strong>Akış {index + 1}</strong>
                  <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => removeDraftArrayItem("scheduleItems", index)}>Sil</button>
                </div>
                <div className="admin-edit-grid">
                  <AdminField label="Saat" onChange={(v) => updateDraftArrayItem("scheduleItems", index, "time", v)} value={item.time} />
                  <AdminField label="Başlık" onChange={(v) => updateDraftArrayItem("scheduleItems", index, "title", v)} value={item.title} />
                  <AdminTextarea label="Açıklama" onChange={(v) => updateDraftArrayItem("scheduleItems", index, "description", v)} value={item.description} />
                </div>
              </div>
            ))}
            <button type="button" className="secondary-button admin-add-button" onClick={() => addDraftArrayItem("scheduleItems", { time: "", title: "Yeni Akış", description: "" })}>Yeni Akış Ekle</button>
          </div>
        </AdminSection>
      );

    case "gallery":
      return (
        <AdminSection title="Görsel Yönetimi">
          <div className="admin-edit-grid">
            <AdminImageField label="Açılış ekranı resmi" onFileSelect={(e) => updateDraftImage("invitation", "introImage", e.target.files?.[0])} value={adminDraft.invitation.introImage} onClear={() => clearDraftImage("invitation", "introImage")} />
            <AdminImageField label="Ana ekran büyük resmi" onFileSelect={(e) => updateDraftImage("invitation", "heroImage", e.target.files?.[0])} value={adminDraft.invitation.heroImage} onClear={() => clearDraftImage("invitation", "heroImage")} />
            <AdminMusicField fileName={adminDraft.invitation.musicName} onFileSelect={(e) => updateDraftMusic(e.target.files?.[0])} value={adminDraft.invitation.musicFile} onClear={clearDraftMusic} />
          </div>
          <div className="admin-repeat-list admin-gallery-list">
            {adminDraft.invitation.gallery.map((image, index) => (
              <div className="admin-gallery-upload-row" key={`gallery-${index}`}>
                <AdminImageField label={`Galeri ${index + 1}`} onFileSelect={(e) => updateGalleryImageFile(index, e.target.files?.[0])} value={image} />
                <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => removeGalleryItem(index)}>Galeriden Sil</button>
              </div>
            ))}
            <button type="button" className="secondary-button admin-add-button" onClick={addGalleryItem}>Yeni Görsel Alanı Ekle</button>
          </div>
        </AdminSection>
      );

    case "guests":
      return (
        <AdminSection title="Katılım Formu Kayıtları">
          <div className="admin-stats admin-stats-inside">
            <div><strong>{guests.length}</strong><span>Toplam Yanıt</span></div>
            <div><strong>{totalPersonCount}</strong><span>Katılacak Kişi</span></div>
            <div><strong>{notAttendingCount}</strong><span>Katılamayacak</span></div>
            <div><strong>{childGuestCount}</strong><span>Çocuklu Yanıt</span></div>
            <div><strong>{brideSideCount}</strong><span>Gelin Tarafı</span></div>
            <div><strong>{groomSideCount}</strong><span>Damat Tarafı</span></div>
          </div>
          <div className="admin-toolbar">
            <input value={adminGuestSearch} onChange={(e) => setAdminGuestSearch(e.target.value)} placeholder="Kayıtlarda ara" />
            <CustomDropdown value={adminGuestAttendanceFilter} onChange={setAdminGuestAttendanceFilter} options={[{ value: "all", label: "Tüm Katılımlar" }, { value: "Katılacağım", label: "Katılacağım" }, { value: "Katılamayacağım", label: "Katılamayacağım" }]} />
            <CustomDropdown value={adminGuestSideFilter} onChange={setAdminGuestSideFilter} options={[{ value: "all", label: "Tüm Taraflar" }, { value: "Damat Tarafı", label: "Damat Tarafı" }, { value: "Gelin Tarafı", label: "Gelin Tarafı" }, { value: "Ortak", label: "Ortak" }]} />
            <CustomDropdown value={adminGuestChildFilter} onChange={setAdminGuestChildFilter} options={[{ value: "all", label: "Çocuk: Tümü" }, { value: "Evet", label: "Çocuk: Evet" }, { value: "Hayır", label: "Çocuk: Hayır" }]} />
            <button type="button" className="secondary-button" onClick={exportGuestsExcel}>Excel İndir</button>
            <button type="button" className="secondary-button" onClick={exportGuestsCsv}>CSV İndir</button>
          </div>
          <div className="admin-list admin-list-full">
            {filteredGuests.length === 0 ? <p className="empty-text">Bu filtreye uygun kayıt yok.</p> : filteredGuests.map((guest) => {
              // WhatsApp hatırlatma mesajı ve linki hazırlığı
              const cleanPhone = guest.phone ? guest.phone.replace(/\D/g, "") : "";
              const personalUrl = `${window.location.origin}/?guest=${encodeURIComponent(guest.name)}`;
              const reminderText = `Merhaba ${guest.name}, düğünümüze çok az kaldı! 💍 Katılım durumunu kontrol etmek veya güncellemek için sana özel hazırladığımız davetiye linkini inceleyebilirsin:\n${personalUrl}`;
              const whatsappHref = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(reminderText)}` : "";

              return (
                <div className="admin-row" key={guest.id}>
                  <strong>{guest.name}</strong>
                  <span>{guest.attendance} · {guest.personCount} kişi · {guest.side}</span>
                  <span>Telefon: {guest.phone || "-"}</span>
                  <span>Çocuk: {guest.hasChild || "Hayır"}</span>
                  {guest.note && <em>Not: {guest.note}</em>}
                  <div className="admin-row-actions">
                    {cleanPhone && (
                      <a 
                        href={whatsappHref} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="secondary-button small-admin-button"
                        style={{ backgroundColor: "#25D366", color: "#fff", borderColor: "#25D366", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      >
                        💬 WhatsApp Hatırlat
                      </a>
                    )}
                    <button type="button" className="secondary-button small-admin-button" onClick={() => editGuest(guest.id)}>Düzenle</button>
                    <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => deleteGuest(guest.id)}>Sil</button>
                  </div>
                </div>
              );
            })}
            <button type="button" className="secondary-button danger-button" onClick={clearGuests}>Katılım Kayıtlarını Temizle</button>
          </div>
        </AdminSection>
      ); 
    case "wishes":
      return (
        <AdminSection title="Anı Defteri Formu Mesajları">
          <div className="admin-toolbar">
            <input value={adminWishSearch} onChange={(e) => setAdminWishSearch(e.target.value)} placeholder="Mesajlarda ara" />
            <CustomDropdown value={adminWishStatusFilter} onChange={setAdminWishStatusFilter} options={[{ value: "all", label: "Tüm mesajlar" }, { value: "approved", label: "Yayında" }, { value: "pending", label: "Onay bekliyor" }]} />
            <button type="button" className="secondary-button" onClick={exportWishesExcel}>Excel İndir</button>
            <button type="button" className="secondary-button" onClick={exportWishesCsv}>CSV İndir</button>
          </div>
          <div className="admin-list admin-list-full">
            {filteredWishes.length === 0 ? <p className="empty-text">Bu filtreye uygun mesaj yok.</p> : filteredWishes.map((wish) => (
              <div className="admin-row" key={wish.id}>
                <strong>{wish.name}</strong>
                <span>Durum: {wish.approved === false ? "Onay bekliyor" : "Yayında"}</span>
                <em>{wish.message}</em>
                <div className="admin-row-actions">
                  <button type="button" className="secondary-button small-admin-button" onClick={() => toggleWishApproval(wish.id)}>{wish.approved === false ? "Onayla" : "Yayından Kaldır"}</button>
                  <button type="button" className="secondary-button small-admin-button" onClick={() => editWish(wish.id)}>Düzenle</button>
                  <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => deleteWish(wish.id)}>Sil</button>
                </div>
              </div>
            ))}
            <button type="button" className="secondary-button danger-button" onClick={clearWishes}>Mesajları Temizle</button>
          </div>
        </AdminSection>
      );

    case "qr":
      return (
        <AdminSection title="QR Kod">
          <div className="admin-qr-panel qr-only-panel">
            <div>
              <span>Genel Davetiye QR Kodu</span>
              <img src={qrImageUrl} alt="Davetiye QR kodu" />
              <div className="admin-qr-actions">
                <button type="button" className="secondary-button" onClick={downloadQrCode}>QR Kodu İndir</button>
                <button type="button" className="secondary-button" onClick={() => copyAdminLink(currentShareLink, "Davetiye linki kopyalandı.")}>Linki Kopyala</button>
              </div>
            </div>
            <div className="admin-link-preview-box">
              <span>QR kodun açacağı link</span>
              <input value={currentShareLink} readOnly />
              <small>Bu link genel davetiye linkidir; davetli adı içermez.</small>
            </div>
          </div>
        </AdminSection>
      );

    case "personalLink":
      return (
        <PersonalLinkPanel 
          currentShareLink={currentShareLink} 
          copyAdminLink={copyAdminLink} 
          personalLinkName={personalLinkName} 
          setPersonalLinkName={setPersonalLinkName} 
        />
      );

    case "data":
      return (
        <AdminSection title="Veri İndirme ve Yedekleme">
          <div className="admin-export-grid">
            <div className="admin-export-card">
              <strong>Katılım Formu</strong>
              <span>Ad, telefon, katılım, kişi sayısı, taraf, çocuk ve not bilgileri.</span>
              <div className="admin-export-actions">
                <button type="button" className="secondary-button" onClick={exportGuestsExcel}>Excel İndir</button>
                <button type="button" className="secondary-button" onClick={exportGuestsCsv}>CSV İndir</button>
              </div>
            </div>
            <div className="admin-export-card">
              <strong>Anı Defteri</strong>
              <span>İsim, mesaj ve yayın/onay durumları.</span>
              <div className="admin-export-actions">
                <button type="button" className="secondary-button" onClick={exportWishesExcel}>Excel İndir</button>
                <button type="button" className="secondary-button" onClick={exportWishesCsv}>CSV İndir</button>
              </div>
            </div>
            <div className="admin-export-card">
              <strong>Tüm Davetiye Yedeği</strong>
              <span>Davetiye içerikleri, tema, görseller, müzik, kayıtlar ve mesajlar.</span>
              <button type="button" className="main-button" onClick={exportAllDataJson}>Tüm Veriyi JSON İndir</button>
            </div>
          </div>
          <div className="admin-import-box">
            <AdminTextarea label="JSON yedeğini buraya yapıştır" onChange={setDataImportText} placeholder="Yedek JSON içeriği" value={dataImportText} />
            <button type="button" className="secondary-button" onClick={importAllDataJson}>JSON Yedeğini Geri Yükle</button>
          </div>
        </AdminSection>
      );

    default:
      return null;
  }
}