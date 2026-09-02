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
  adminGuestChildFilter, setAdminGuestChildFilter,
  toggleCheckIn // Yeni eklediğimiz props
}) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en") || false;

  // İstatistik hesaplamaları
  const attendingGuests = guests.filter(g => g.attendance === "Katılacağım");
  const arrivedCount = guests.filter(g => g.has_arrived).reduce((tot, g) => tot + Number(g.personCount || 1), 0);
  const totalAttendingPersonCount = attendingGuests.reduce((tot, g) => tot + Number(g.personCount || 1), 0);

  return (
    <AdminSection title={isEn ? "RSVP Responses & Check-in" : "Katılım Yanıtları & Kapı Kontrolü"}>
      <div className="admin-visibility-card" style={{ marginBottom: "24px" }}>
        <AdminCheckbox checked={adminDraft.settings.visibility?.rsvp ?? true} label={t('visibility.rsvp')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, rsvp: v })} />
        <AdminCheckbox checked={adminDraft.settings.visibility?.guests ?? true} label={t('visibility.guests')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, guests: v })} />
      </div>
      
      <div className="admin-stats admin-stats-inside" style={{ gridTemplateColumns: "repeat(4, 1fr)", maxWidth: "100%" }}>
        <div><strong>{guests.length}</strong><span>{isEn ? "Total Forms" : "Doldurulan Form"}</span></div>
        <div><strong>{totalAttendingPersonCount}</strong><span>{isEn ? "Expected Guests" : "Beklenen Kişi"}</span></div>
        <div><strong>{guests.filter(g => g.attendance === "Katılamayacağım").length}</strong><span>{isEn ? "Not Attending" : "Katılmayacak"}</span></div>
        <div style={{ background: "rgba(46, 204, 113, 0.1)", borderColor: "rgba(46, 204, 113, 0.3)" }}>
          <strong style={{ color: "#27ae60" }}>{arrivedCount}</strong>
          <span style={{ color: "#27ae60" }}>{isEn ? "Arrived" : "Mekana Girdi"}</span>
        </div>
      </div>

      <div className="admin-toolbar" style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "20px" }}>
        <input style={{ flex: "1", minWidth: "160px", margin: 0 }} value={adminGuestSearch} onChange={(e) => setAdminGuestSearch(e.target.value)} placeholder={isEn ? "Search name or phone..." : "İsim veya tel ara..."} />
        
        <div style={{ minWidth: "140px", margin: 0 }}>
          <Dropdown value={adminGuestAttendanceFilter} onChange={setAdminGuestAttendanceFilter} options={[{ value: "all", label: isEn ? "All Attendance" : "Tüm Durumlar" }, { value: "Katılacağım", label: isEn ? "Attending" : "Katılacak" }, { value: "Katılamayacağım", label: isEn ? "Not Attending" : "Katılmayacak" }]} />
        </div>
        
        <button type="button" className="secondary-button" style={{ margin: 0 }} onClick={exportGuestsExcel}>{isEn ? "Excel 📊" : "Excel İndir 📊"}</button>
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
              const isAttending = guest.attendance === "Katılacağım";
              
              return (
                <div className="admin-row" style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "0 8px 14px 8px", borderLeftColor: guest.has_arrived ? "#27ae60" : undefined }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{guest.name}</strong>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px', background: guest.has_arrived ? 'rgba(46, 204, 113, 0.15)' : 'rgba(0,0,0,0.05)', color: guest.has_arrived ? '#27ae60' : 'inherit' }}>
                      {guest.has_arrived ? "✅ Girdi" : `${guest.side || "Gelin Tarafı"} | ${guest.personCount || 1} Kişi`}
                    </span>
                  </div>
                  
                  <span>{isEn ? (isAttending ? "Attending" : "Not Attending") : guest.attendance}</span>
                  {guest.phone && <span style={{ fontSize: "14px" }}>📞 {guest.phone}</span>}
                  {guest.songRequest && <span style={{ color: 'var(--rose-dark)' }}>🎵 İstek: {guest.songRequest}</span>}
                  {guest.note && <em>Not: {guest.note}</em>}
                  
                  <div className="admin-row-actions" style={{ display: "flex", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed var(--border)" }}>
                    {isAttending && toggleCheckIn && (
                       <button 
                         type="button" 
                         className="main-button small-admin-button" 
                         style={{ background: guest.has_arrived ? "#e74c3c" : "#2ecc71", borderColor: guest.has_arrived ? "#e74c3c" : "#2ecc71", color: "#fff", flex: 1 }}
                         onClick={() => toggleCheckIn(guest.id, guest.has_arrived)}
                       >
                         {guest.has_arrived ? (isEn ? "Undo Check-in ⏪" : "Girişi İptal Et ⏪") : (isEn ? "Mark as Arrived ✅" : "Kapıdan Girdi İşaretle ✅")}
                       </button>
                    )}
                    <button type="button" className="secondary-button small-admin-button" onClick={() => editGuest(guest.id)}>✏️</button>
                    <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => deleteGuest(guest.id)}>🗑️</button>
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