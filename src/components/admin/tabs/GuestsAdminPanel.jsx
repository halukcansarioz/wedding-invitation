import React, { Suspense, lazy, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Virtuoso } from "react-virtuoso";
import { AdminSection, AdminCheckbox } from "../../AdminUI";
import { Dropdown } from "../../common/UIComponents";
import { useStore } from "../../../store/useStore";
import { Html5QrcodeScanner } from "html5-qrcode"; 

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
  const showAppAlert = useStore((state) => state.showAppAlert); // Bildirimler için eklendi

  const [isScanning, setIsScanning] = useState(false);

  // QR Okuyucu Başlatma
  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(
        (decodedText) => {
          scanner.clear();
          setIsScanning(false);
          const urlParams = new URLSearchParams(decodedText.split('?')[1]);
          const guestId = urlParams.get('id');
          if (guestId) {
             toggleCheckIn(guestId, false); 
             alert("✅ Misafir başarıyla onaylandı!");
          } else {
             alert("❌ Geçersiz QR kod.");
          }
        },
        (error) => { /* Hataları yoksay */ }
      );
      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [isScanning, toggleCheckIn]);

  // YENİ EKLENEN BÖLÜM: Toplu WhatsApp Duyuru Sistemi (Mass Broadcast)
  const sendMassWhatsApp = async () => {
    const attendingGuests = guests.filter(g => g.attendance === 'Katılacağım' && g.phone);
    
    if (attendingGuests.length === 0) {
      alert(isEn ? "No attending guests with phone numbers found." : "Telefon numarası olan ve katılacak misafir bulunamadı.");
      return;
    }

    const defaultMsg = isEn 
      ? "Dear guest, due to weather conditions, our wedding has been moved to the indoor hall." 
      : "Değerli misafirimiz, hava muhalefeti nedeniyle nikahımız kapalı salona alınmıştır.";

    const messageTemplate = prompt(
      isEn ? "Enter your mass WhatsApp message:" : "Toplu WhatsApp duyurunuzu girin (İsimler otomatik eklenecektir):", 
      defaultMsg
    );

    if (!messageTemplate) return; // İptal edildiyse çık

    if (!window.confirm(isEn ? `Send message to ${attendingGuests.length} guests? (Pop-ups must be allowed)` : `${attendingGuests.length} kişiye sırayla WhatsApp mesajı gönderilecek. Tarayıcınızda pop-up engelleyici varsa izin vermelisiniz. Başlayalım mı?`)) return;

    for (const guest of attendingGuests) {
      const personalizedMessage = encodeURIComponent(
        isEn 
        ? `Hello ${guest.name},\n\n${messageTemplate}`
        : `Merhaba ${guest.name},\n\n${messageTemplate}`
      );
      const waUrl = `https://wa.me/${guest.phone.replace(/\D/g, "")}?text=${personalizedMessage}`;
      
      window.open(waUrl, '_blank');
      // Sekmelerin arka arkaya kilitlenmemesi için 1.5 saniye bekleme
      await new Promise(resolve => setTimeout(resolve, 1500)); 
    }
  };

  const generateAiThankYou = async (guestName) => {
    showAppAlert(isEn ? "AI generating message..." : "Yapay zeka mesajı hazırlıyor...", { title: "AI Asistan 🤖" });
    try {
      const res = await fetch('https://SİZİN_SUPABASE_PROJENİZ.supabase.co/functions/v1/ai-thank-you', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: guestName,
          coupleName: `${adminDraft.invitation.bride} & ${adminDraft.invitation.groom}`,
          wishMessage: "Sizin adınıza çok sevindim, bir ömür boyu mutluluklar dilerim." // Bu kısmı ileride Wishes listesinden çekebiliriz
        })
      });

      const data = await res.json();
      if(data.text) {
        prompt(isEn ? "Generated AI Message:" : "Üretilen AI Teşekkür Mesajı (Kopyalayabilirsiniz):", data.text);
      }
    } catch (err) {
      console.error(err);
      alert(isEn ? "Failed to generate AI message." : "AI mesajı oluşturulamadı. Edge Function ayarlarını kontrol edin.");
    }
  };

  // Bu fonksiyonu bileşeninizin içine ekleyin
  const handleSendPushNotification = async () => {
    const title = prompt("Bildirim Başlığı:", "Düğünümüze Son 1 Gün!");
    const body = prompt("Bildirim İçeriği:", "Hazırlıklar tamamlandı, yarın sizi aramızda görmek için sabırsızlanıyoruz.");
    
    if (!title || !body) return;

    alert("Bildirimler gönderiliyor, lütfen bekleyin...");

    try {
      const res = await fetch('https://SİZİN_SUPABASE_PROJENİZ.supabase.co/functions/v1/send-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SİZİN_ADMIN_TOKENİNİZ}` // Güvenlik için
        },
        body: JSON.stringify({
          title: title,
          body: body,
          url: "https://sizin-davetiye-linkiniz.com" // Bildirime tıklayınca açılacak link
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`🎉 Başarılı! Toplam ${data.count} cihaza bildirim gönderildi.`);
      } else {
        alert("Hata oluştu: " + data.error);
      }
    } catch (error) {
      alert("Bildirim sunucusuna ulaşılamadı.");
    }
  };

  // JSX kısmında butonunuz:
  <button type="button" className="main-button" onClick={handleSendPushNotification} style={{ backgroundColor: '#8e44ad', borderColor: '#8e44ad' }}>
    🔔 Tüm Misafirlere Bildirim Gönder
  </button>
  
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

  const bride = adminDraft.invitation.bride || "Gelin";
  const groom = adminDraft.invitation.groom || "Damat";
  const mapLink = adminDraft.invitation.mapLink || "";

  return (
    <AdminSection title={isEn ? "RSVP Responses & Check-in" : "Katılım Yanıtları & Kapı Kontrolü"}>
      <div className="admin-visibility-card" style={{ marginBottom: "24px" }}>
        <AdminCheckbox checked={adminDraft.settings.visibility?.rsvp ?? true} label={t('visibility.rsvp')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, rsvp: v })} />
        <AdminCheckbox checked={adminDraft.settings.visibility?.guests ?? true} label={t('visibility.guests')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, guests: v })} />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button type="button" className="main-button" onClick={() => setIsScanning(!isScanning)}>
          {isScanning ? "📷 Kamerayı Kapat" : "📷 QR ile Kapı Kontrolü"}
        </button>
        {/* YENİ EKLENEN: Toplu Duyuru Butonu */}
        <button type="button" className="secondary-button" style={{ color: '#25D366', borderColor: '#25D366' }} onClick={sendMassWhatsApp}>
          {isEn ? "📢 Mass Broadcast (WhatsApp)" : "📢 Toplu Duyuru Gönder (WhatsApp)"}
        </button>
      </div>
      {isScanning && <div id="qr-reader" style={{ width: "100%", maxWidth: "400px", margin: "0 auto 20px", borderRadius: "12px", overflow: "hidden" }}></div>}

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
              
              const whatsappMsg = encodeURIComponent(
                isEn 
                ? `Hello ${guest.name},\n\nYour RSVP for ${bride} & ${groom}'s wedding has been confirmed. ✅\n\n${guest.tableNumber ? `🍽️ Reserved Table: ${guest.tableNumber}\n\n` : ''}📍 Location:\n${mapLink}\n\nWe can't wait to celebrate with you! 🎉`
                : `Merhaba ${guest.name},\n\n${bride} & ${groom} düğün davetiyemize LCV (katılım) kaydınız başarıyla alınmıştır. ✅\n\n${guest.tableNumber ? `🍽️ Sizin İçin Ayrılan Masa: ${guest.tableNumber}\n\n` : ''}📍 Konum ve Yol Tarifi:\n${mapLink}\n\nSizi aramızda görmek için sabırsızlanıyoruz! 🎉`
              );

              return (
                <div className="admin-row admin-guest-row" style={{ borderLeftColor: guest.has_arrived ? "#27ae60" : undefined, marginBottom: '14px' }}>
                  <div className="admin-guest-header">
                    <strong>{guest.name}</strong>
                  </div>
                  <span>{isEn ? (isAttending ? "Attending" : "Not Attending") : guest.attendance}</span>
                  
                  {guest.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span>📞 {guest.phone}</span>
                      {isAttending && (
                        <>
                          <a 
                            href={`https://wa.me/${guest.phone.replace(/\D/g, "")}?text=${whatsappMsg}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="secondary-button" 
                            style={{ padding: '2px 8px', fontSize: '12px', minHeight: 'auto', margin: 0, color: '#25D366', borderColor: '#25D366', fontWeight: 'bold' }}
                          >
                            {isEn ? "Send Confirmation" : "WhatsApp Onay At"}
                          </a>
                          
                          {/* YENİ EKLENEN: AI Teşekkür Butonu */}
                          {adminDraft.settings.isPostWedding && (
                            <button 
                              type="button"
                              onClick={() => generateAiThankYou(guest.name)}
                              className="secondary-button"
                              style={{ padding: '2px 8px', fontSize: '12px', minHeight: 'auto', margin: 0, color: '#8e44ad', borderColor: '#8e44ad', fontWeight: 'bold' }}
                            >
                              {isEn ? "AI Thank You 🤖" : "AI Teşekkür Et 🤖"}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}

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