import React from "react";
import { useTranslation } from "react-i18next";
import { Virtuoso } from "react-virtuoso";
import { AdminSection, AdminCheckbox } from "../../AdminUI";
import { Dropdown } from "../../common/UIComponents";

export function GuestsAdminPanel({ 
  guests, adminGuestSearch, setAdminGuestSearch, exportGuestsExcel, exportGuestsCsv, 
  filteredGuests, editGuest, deleteGuest, clearGuests, adminDraft, updateDraftObject,
  adminGuestAttendanceFilter, setAdminGuestAttendanceFilter,
  adminGuestSideFilter, setAdminGuestSideFilter,
  adminGuestChildFilter, setAdminGuestChildFilter
}) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en") || false;

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
        <input style={{ flex: "1", minWidth: "160px", margin: 0 }} value={adminGuestSearch} onChange={(e) => setAdminGuestSearch(e.target.value)} placeholder={isEn ? "Search..." : "İsim veya tel ara"} />
        
        <div style={{ minWidth: "140px", margin: 0 }}>
          <Dropdown value={adminGuestAttendanceFilter} onChange={setAdminGuestAttendanceFilter} options={[{ value: "all", label: isEn ? "All Attendance" : "Tüm Durumlar" }, { value: "Katılacağım", label: isEn ? "Attending" : "Katılacak" }, { value: "Katılamayacağım", label: isEn ? "Not Attending" : "Katılmayacak" }]} />
        </div>
        <div style={{ minWidth: "140px", margin: 0 }}>
          <Dropdown value={adminGuestSideFilter} onChange={setAdminGuestSideFilter} options={[{ value: "all", label: isEn ? "All Sides" : "Tüm Taraflar" }, { value: "Gelin Tarafı", label: isEn ? "Bride Side" : "Gelin Tarafı" }, { value: "Damat Tarafı", label: isEn ? "Groom Side" : "Damat Tarafı" }, { value: "Ortak", label: isEn ? "Both" : "Ortak" }]} />
        </div>
        <div style={{ minWidth: "140px", margin: 0 }}>
          <Dropdown value={adminGuestChildFilter} onChange={setAdminGuestChildFilter} options={[{ value: "all", label: isEn ? "All Guests" : "Çocuk Durumu" }, { value: "Evet", label: isEn ? "With Children" : "Çocuklu" }, { value: "Hayır", label: isEn ? "No Children" : "Çocuksuz" }]} />
        </div>
        
        <button type="button" className="secondary-button" style={{ margin: 0 }} onClick={exportGuestsExcel}>{isEn ? "Excel 📊" : "Excel İndir 📊"}</button>
        <button type="button" className="secondary-button" style={{ margin: 0 }} onClick={exportGuestsCsv}>{isEn ? "CSV 📄" : "CSV İndir 📄"}</button>
        <button type="button" className="secondary-button danger-button" style={{ margin: 0 }} onClick={clearGuests}>{isEn ? "Clear All 🚨" : "Tümünü Sil 🚨"}</button>
      </div>
      <div className="admin-list admin-list-full" style={{ height: "600px", margin: 0, padding: 0 }}>
        {filteredGuests.length === 0 ? (
          <p className="empty-text">{isEn ? "No matching responses found." : "Kayıt bulunamadı."}</p>
        ) : (
          <Virtuoso
            style={{ height: '100%', width: '100%' }}
            data={filteredGuests}
            itemContent={(index, guest) => {
              let translatedAttendance = guest.attendance || "Katılacağım";
              if (isEn && translatedAttendance === "Katılacağım") translatedAttendance = "Attending";
              if (isEn && translatedAttendance === "Katılamayacağım") translatedAttendance = "Not Attending";
              
              return (
                <div className="admin-row" style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "0 8px 14px 8px" }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{guest.name}</strong>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.05)' }}>
                      {guest.side || "Gelin Tarafı"} | {guest.personCount || 1} Kişi
                    </span>
                  </div>
                  <span>{translatedAttendance}</span>
                  {guest.songRequest && <span style={{ color: 'var(--rose-dark)' }}>🎵 DJ İsteği: {guest.songRequest}</span>}
                  {guest.note && <em>{isEn ? "Note:" : "Not:"} {guest.note}</em>}
                  <div className="admin-row-actions" style={{ display: "flex", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed var(--border)" }}>
                    <button type="button" className="secondary-button small-admin-button" onClick={() => editGuest(guest.id)}>{isEn ? "Edit ✏️" : "Düzenle ✏️"}</button>
                    <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => deleteGuest(guest.id)}>{isEn ? "Delete 🗑️" : "Sil 🗑️"}</button>
                  </div>
                </div>
              );
            }}
          />
        )}
      </div>
    </AdminSection>
  );
}