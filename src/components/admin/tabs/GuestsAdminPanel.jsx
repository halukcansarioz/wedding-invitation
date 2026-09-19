import React, { Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { Virtuoso } from "react-virtuoso";
import { AdminSection, AdminCheckbox } from "../../AdminUI";
import { Dropdown } from "../../common/UIComponents";
import { useStore } from "../../../store/useStore";

// Grafikler Bundle boyutunu şişirmemesi için asenkron yüklenecek
const AdminCharts = lazy(() => import('./AdminCharts'));

export function GuestsAdminPanel({ 
  guests, adminGuestSearch, setAdminGuestSearch, exportGuestsExcel, exportGuestsCsv, 
  filteredGuests, editGuest, deleteGuest, clearGuests,
  adminGuestAttendanceFilter, setAdminGuestAttendanceFilter,
  toggleCheckIn
}) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en") || false;

  const adminDraft = useStore((state) => state.adminDraft);
  const updateDraftObject = useStore((state) => state.updateDraftObject);

  if (!adminDraft?.settings) return null;

  const attendingGuests = guests.filter(g => g.attendance === "Katılacağım");
  const arrivedCount = guests.filter(g => g.has_arrived).reduce((tot, g) => tot + Number(g.personCount || 1), 0);
  const totalAttendingPersonCount = attendingGuests.reduce((tot, g) => tot + Number(g.personCount || 1), 0);

  const sideData = [
    { name: isEn ? 'Bride Side' : 'Gelin Tarafı', value: guests.filter(g => g.side === 'Gelin Tarafı' && g.attendance === 'Katılacağım').reduce((a,b)=>a+Number(b.personCount||1),0) },
    { name: isEn ? 'Groom Side' : 'Damat Tarafı', value: guests.filter(g => g.side === 'Damat Tarafı' && g.attendance === 'Katılacağım').reduce((a,b)=>a+Number(b.personCount||1),0) },
    { name: isEn ? 'Mutual' : 'Ortak', value: guests.filter(g => g.side === 'Ortak' && g.attendance === 'Katılacağım').reduce((a,b)=>a+Number(b.personCount||1),0) }
  ].filter(d => d.value > 0);

  const checkInData = [
    { name: isEn ? 'Expected' : 'Beklenen', value: totalAttendingPersonCount },
    { name: isEn ? 'Arrived' : 'Gelen', value: arrivedCount }
  ];

  return (
    <AdminSection title={isEn ? "RSVP Responses & Check-in" : "Katılım Yanıtları & Kapı Kontrolü"}>
      <div className="admin-visibility-card" style={{ marginBottom: "24px" }}>
        <AdminCheckbox checked={adminDraft.settings.visibility?.rsvp ?? true} label={t('visibility.rsvp')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, rsvp: v })} />
        <AdminCheckbox checked={adminDraft.settings.visibility?.guests ?? true} label={t('visibility.guests')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, guests: v })} />
      </div>
      
      <div className="admin-stats admin-stats-inside" style={{ gridTemplateColumns: "repeat(4, 1fr)", maxWidth: "100%", marginBottom: "14px" }}>
        <div><strong>{guests.length}</strong><span>{isEn ? "Total Forms" : "Doldurulan Form"}</span></div>
        <div><strong>{totalAttendingPersonCount}</strong><span>{isEn ? "Expected Guests" : "Beklenen Kişi"}</span></div>
        <div><strong>{guests.filter(g => g.attendance === "Katılamayacağım").length}</strong><span>{isEn ? "Not Attending" : "Katılmayacak"}</span></div>
        <div className="admin-guest-badge arrived">
          <strong style={{ color: "#27ae60" }}>{arrivedCount}</strong>
          <span style={{ color: "#27ae60" }}>{isEn ? "Arrived" : "Mekana Girdi"}</span>
        </div>
      </div>

      <Suspense fallback={<div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Grafikler Yükleniyor...</div>}>
        <AdminCharts sideData={sideData} checkInData={checkInData} isEn={isEn} />
      </Suspense>

      <div className="admin-toolbar-flex">
        <input className="admin-toolbar-search" value={adminGuestSearch} onChange={(e) => setAdminGuestSearch(e.target.value)} placeholder={isEn ? "Search name or phone..." : "İsim veya tel ara..."} />
        <div className="admin-toolbar-filter">
          <Dropdown value={adminGuestAttendanceFilter} onChange={setAdminGuestAttendanceFilter} options={[{ value: "all", label: isEn ? "All Attendance" : "Tüm Durumlar" }, { value: "Katılacağım", label: isEn ? "Attending" : "Katılacak" }, { value: "Katılamayacağım", label: isEn ? "Not Attending" : "Katılmayacak" }]} />
        </div>
        <button type="button" className="secondary-button admin-toolbar-btn" onClick={exportGuestsExcel}>{isEn ? "Excel 📊" : "Excel İndir 📊"}</button>
        <button type="button" className="secondary-button admin-toolbar-btn" onClick={exportGuestsCsv}>{isEn ? "CSV 📄" : "CSV İndir 📄"}</button>
        <button type="button" className="secondary-button danger-button admin-toolbar-btn" onClick={clearGuests}>{isEn ? "Clear All 🚨" : "Tümünü Sil 🚨"}</button>
      </div>

      <div className="admin-list admin-list-full admin-guest-list-container" style={{ height: "500px" }}>
        {filteredGuests.length === 0 ? (
          <p className="empty-text">{isEn ? "No matching responses found." : "Kayıt bulunamadı."}</p>
        ) : (
          <Virtuoso
            style={{ height: '100%', width: '100%' }}
            data={filteredGuests}
            itemContent={(index, guest) => {
              const isAttending = guest.attendance === "Katılacağım";
              return (
                <div className="admin-row admin-guest-row" style={{ borderLeftColor: guest.has_arrived ? "#27ae60" : undefined, marginBottom: '14px' }}>
                  <div className="admin-guest-header">
                    <strong>{guest.name}</strong>
                  </div>
                  <span>{isEn ? (isAttending ? "Attending" : "Not Attending") : guest.attendance}</span>
                  {guest.phone && <span>📞 {guest.phone}</span>}
                  {guest.songRequest && <span className="admin-guest-song">🎵 İstek: {guest.songRequest}</span>}
                  {guest.note && <em>Not: {guest.note}</em>}
                  
                  <div className="admin-row-actions admin-guest-actions">
                    <button 
                      type="button" 
                      className={`secondary-button small-admin-button ${guest.has_arrived ? 'danger-button' : ''}`}
                      onClick={() => toggleCheckIn(guest.id, guest.has_arrived)}
                    >
                      {guest.has_arrived ? (isEn ? "Cancel Check-in ↩️" : "Girişi İptal Et ↩️") : (isEn ? "Check-in ✅" : "Mekana Girdi ✅")}
                    </button>
                    <button type="button" className="secondary-button small-admin-button" onClick={() => editGuest(guest.id)}>
                      {isEn ? "Edit ✏️" : "Düzenle ✏️"}
                    </button>
                    <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => deleteGuest(guest.id)}>
                      {isEn ? "Delete 🗑️" : "Sil 🗑️"}
                    </button>
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