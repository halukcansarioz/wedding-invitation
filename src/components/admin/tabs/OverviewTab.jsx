import React, { useEffect, useState } from "react";
import { AdminSection } from "../../AdminUI";
import { useStore } from "../../../store/useStore";
import { supabase } from "../../../supabaseClient";

export function OverviewTab({ guests = [], wishes = [], isEn, setActiveAdminTab }) {
  const adminDraft = useStore((state) => state.adminDraft);
  const [pendingPhotos, setPendingPhotos] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);

  useEffect(() => {
    const fetchQuickStats = async () => {
      // Bekleyen Fotoğrafları Say
      const { count: photoCount } = await supabase
        .from('guest_photos')
        .select('*', { count: 'exact', head: true })
        .eq('approved', false);
      
      setPendingPhotos(photoCount || 0);

      // Tamamlanan Ödemeleri Hesapla
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');
        
      const sum = (payments || []).reduce((acc, curr) => acc + Number(curr.amount), 0);
      setTotalPayments(sum);
    };

    fetchQuickStats();
  }, []);

  const attendingCount = guests.filter(g => g.attendance === "Katılacağım").reduce((tot, g) => tot + Number(g.personCount || 1), 0);
  const pendingWishesCount = wishes.filter(w => !w.approved).length;

  return (
    <AdminSection title={isEn ? "Dashboard Overview" : "Sistem Özeti"}>
      <h3 style={{ color: "var(--text-main)", marginBottom: "24px", fontWeight: "normal" }}>
        {isEn ? "Welcome," : "Hoş Geldiniz,"} <strong>{adminDraft?.invitation?.bride} & {adminDraft?.invitation?.groom}</strong>
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        
        {/* Misafir İstatistiği */}
        <div className="card" style={{ padding: "20px", textAlign: "center", cursor: "pointer" }} onClick={() => setActiveAdminTab("guests")}>
          <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>👥</span>
          <strong style={{ fontSize: "28px", color: "var(--rose-dark)", display: "block" }}>{attendingCount}</strong>
          <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>{isEn ? "Expected Guests" : "Beklenen Misafir"}</span>
        </div>

        {/* Bekleyen Dilekler */}
        <div className="card" style={{ padding: "20px", textAlign: "center", cursor: "pointer", border: pendingWishesCount > 0 ? "2px solid #f39c12" : "" }} onClick={() => setActiveAdminTab("wishes")}>
          <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>💌</span>
          <strong style={{ fontSize: "28px", color: pendingWishesCount > 0 ? "#f39c12" : "var(--rose-dark)", display: "block" }}>{pendingWishesCount}</strong>
          <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>{isEn ? "Pending Wishes" : "Onay Bekleyen Mesaj"}</span>
        </div>

        {/* Bekleyen Fotoğraflar (POV) */}
        <div className="card" style={{ padding: "20px", textAlign: "center", cursor: "pointer", border: pendingPhotos > 0 ? "2px solid #f39c12" : "" }} onClick={() => setActiveAdminTab("guestPhotos")}>
          <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>📸</span>
          <strong style={{ fontSize: "28px", color: pendingPhotos > 0 ? "#f39c12" : "var(--rose-dark)", display: "block" }}>{pendingPhotos}</strong>
          <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>{isEn ? "Pending Photos" : "Onay Bekleyen Fotoğraf"}</span>
        </div>

        {/* Toplam Hediyeler */}
        <div className="card" style={{ padding: "20px", textAlign: "center", cursor: "pointer" }} onClick={() => setActiveAdminTab("payments")}>
          <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>🎁</span>
          <strong style={{ fontSize: "24px", color: "#27ae60", display: "block", marginTop: "4px" }}>
            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(totalPayments)}
          </strong>
          <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>{isEn ? "Total Gifts" : "Gelen Hediyeler"}</span>
        </div>

      </div>

      <div style={{ background: "var(--paper-soft)", padding: "24px", borderRadius: "16px", border: "1px solid var(--admin-border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h4 style={{ margin: "0 0 8px 0", color: "var(--rose-deep)", fontSize: "18px" }}>{isEn ? "Live Projector" : "Canlı Barkovizyon"}</h4>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>
            {isEn ? "Open the live stream to show approved photos and wishes on the big screen." : "Düğün gecesi onaylı fotoğrafları ve mesajları dev ekrana yansıtmak için akışı başlatın."}
          </p>
        </div>
        <button 
          type="button" 
          className="main-button" 
          onClick={() => window.open(`/${window.location.pathname.split('/')[1]}/live`, '_blank')}
          style={{ margin: 0, background: "linear-gradient(135deg, #2c3e50, #000000)", borderColor: "#000" }}
        >
          {isEn ? "Launch Live Stream 🎬" : "Barkovizyonu Başlat 🎬"}
        </button>
      </div>
    </AdminSection>
  );
}