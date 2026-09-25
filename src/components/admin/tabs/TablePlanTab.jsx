import React, { useState, useMemo } from "react";
import { AdminSection } from "../../AdminUI";
import { useStore } from "../../../store/useStore";

export function TablePlanTab({ guests, assignTable, isEn }) {
  const [search, setSearch] = useState("");
  const showAppAlert = useStore(state => state.showAppAlert);

  const attendingGuests = useMemo(() =>
    guests.filter(g => g.attendance === "Katılacağım" && g.name.toLowerCase().includes(search.toLowerCase())),
  [guests, search]);

  const tables = useMemo(() => {
    const groups = {};
    attendingGuests.forEach(g => {
      const t = g.tableNumber ? String(g.tableNumber).trim() : "";
      if (t) {
        if (!groups[t]) groups[t] = [];
        groups[t].push(g);
      }
    });
    return groups;
  }, [attendingGuests]);

  const unassigned = attendingGuests.filter(g => !g.tableNumber || String(g.tableNumber).trim() === "");

  // YZ Asistanı: Misafirleri mantıksal gruplara göre otomatik yerleştirir
  const autoAssignTables = () => {
    if (!window.confirm(isEn ? "Auto-assign remaining guests?" : "Boşta olan misafirler taraf ve çocuk durumlarına göre gruplanarak masalara yerleştirilecek. Onaylıyor musunuz?")) return;

    let currentTableNum = Object.keys(tables).length > 0 
      ? Math.max(...Object.keys(tables).map(k => isNaN(Number(k)) ? 0 : Number(k))) + 1 
      : 1;

    let currentTableCapacity = 0;
    const MAX_CAPACITY = 8; // Masalar varsayılan olarak 8 kişilik hesaplanır

    // Taraf (Gelin/Damat) ve Çocuk Durumuna göre sıralama/gruplama
    const sortedUnassigned = [...unassigned].sort((a, b) => {
      if (a.side !== b.side) return a.side.localeCompare(b.side);
      return (a.hasChild || "").localeCompare(b.hasChild || "");
    });

    sortedUnassigned.forEach(g => {
      const pCount = Number(g.personCount || 1);
      if (currentTableCapacity + pCount > MAX_CAPACITY && currentTableCapacity > 0) {
        currentTableNum++;
        currentTableCapacity = 0;
      }
      assignTable(g.id, String(currentTableNum));
      currentTableCapacity += pCount;
    });

    showAppAlert(isEn ? "Auto-assignment complete." : "Otomatik yerleştirme tamamlandı.");
  };

  // Matbaa için optimize edilmiş PDF Çıktısı
  const exportTablePlanPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(isEn ? "Wedding Seating Chart" : "Dugun Oturma Plani", 20, 20);

    let yOffset = 35;
    doc.setFontSize(12);

    Object.keys(tables).sort((a,b) => a.localeCompare(b, undefined, {numeric: true})).forEach(tableNum => {
      if (yOffset > 270) { doc.addPage(); yOffset = 20; }
      
      doc.setFont("helvetica", "bold");
      doc.text(`${isEn ? "Table" : "Masa"} ${tableNum}`, 20, yOffset);
      yOffset += 8;
      
      doc.setFont("helvetica", "normal");
      tables[tableNum].forEach(g => {
        if (yOffset > 280) { doc.addPage(); yOffset = 20; }
        // Türkçe karakterleri PDF uyumlu hale getirme
        const safeName = (g.name || "").replace(/ğ/g, 'g').replace(/Ğ/g, 'G').replace(/ü/g, 'u').replace(/Ü/g, 'U').replace(/ş/g, 's').replace(/Ş/g, 'S').replace(/ı/g, 'i').replace(/İ/g, 'I').replace(/ö/g, 'o').replace(/Ö/g, 'O').replace(/ç/g, 'c').replace(/Ç/g, 'C');
        doc.text(`- ${safeName} (${g.personCount} ${isEn ? "Person" : "Kisi"})`, 25, yOffset);
        yOffset += 7;
      });
      yOffset += 7;
    });

    doc.save("oturma-plani.pdf");
  };

  return (
    <AdminSection title={isEn ? "Seating Chart" : "Oturma Planı"}>
      <p className="admin-help-text" style={{ marginBottom: "20px" }}>
        {isEn 
          ? "Assign tables manually or use the AI Assistant." 
          : "Katılacak misafirlerinizi manuel atayın veya YZ Asistanı ile otomatik doldurun."}
      </p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="admin-toolbar-search"
          style={{ flex: 1, minWidth: '200px', margin: 0 }}
          placeholder={isEn ? "Search guest..." : "Misafir ara..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="main-button" style={{ margin: 0 }} onClick={autoAssignTables}>
          {isEn ? "🤖 AI Auto-Assign" : "🤖 YZ Otomatik Yerleştir"}
        </button>
        <button type="button" className="secondary-button" style={{ margin: 0 }} onClick={exportTablePlanPDF}>
          {isEn ? "🖨️ Export PDF" : "🖨️ PDF Çıktısı Al"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
         {/* SOL: Atanmamış Misafirler */}
         <div className="admin-card" style={{ padding: "16px", background: "var(--paper-soft)", borderRadius: "16px" }}>
            <h4 style={{ color: "var(--rose-deep)", marginTop: 0 }}>
              {isEn ? "Unassigned Guests" : "Atanmamış Misafirler"} ({unassigned.length})
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "550px", overflowY: "auto" }}>
              {unassigned.length === 0 && (
                <p className="admin-help-text" style={{ textAlign: "center", marginTop: "20px" }}>
                  {isEn ? "All found guests assigned." : "Listelenen tüm misafirler masalara atanmış."}
                </p>
              )}
              {unassigned.map(g => (
                <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--paper)", borderRadius: "12px", border: "1px solid var(--admin-border-color)" }}>
                  <div>
                    <strong style={{ display: "block", color: "var(--admin-text-main)" }}>{g.name}</strong>
                    <div style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>{g.personCount} {isEn ? "Person" : "Kişi"} - {g.side}</div>
                  </div>
                  <input
                    type="text"
                    placeholder="Masa"
                    style={{ width: "70px", padding: "8px", borderRadius: "8px", border: "1px solid var(--admin-border-color)", textAlign: "center", background: "var(--admin-input-bg)" }}
                    onBlur={(e) => {
                      if (e.target.value.trim()) assignTable(g.id, e.target.value.trim());
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        assignTable(g.id, e.target.value.trim());
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
              ))}
            </div>
         </div>

         {/* SAĞ: Masalar */}
         <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "600px", overflowY: "auto", paddingRight: "8px" }}>
           {Object.keys(tables).sort((a,b) => a.localeCompare(b, undefined, {numeric: true})).map(tableNum => {
             const tableGuests = tables[tableNum];
             const tableTotal = tableGuests.reduce((acc, g) => acc + Number(g.personCount || 1), 0);

             return (
               <div key={tableNum} style={{ padding: "16px", background: "var(--paper-soft)", borderRadius: "16px", border: "2px solid color-mix(in srgb, var(--amp-color) 30%, transparent)" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                   <h4 style={{ margin: 0, color: "var(--rose-deep)", fontSize: "18px" }}>{isEn ? "Table" : "Masa"} {tableNum}</h4>
                   <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--admin-text-muted)" }}>Toplam: {tableTotal} {isEn ? "Person" : "Kişi"}</span>
                 </div>
                 <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                   {tableGuests.map(g => (
                     <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--paper)", borderRadius: "8px", fontSize: "14px", border: "1px solid var(--admin-border-color)" }}>
                       <span style={{ color: "var(--admin-text-main)", fontWeight: "600" }}>{g.name} <small style={{ opacity: 0.7 }}>({g.personCount})</small></span>
                       <button
                         type="button"
                         className="secondary-button"
                         style={{ padding: "4px 8px", fontSize: "12px", minWidth: "auto", minHeight: "auto", margin: 0, border: "none", color: "#d35400" }}
                         onClick={() => assignTable(g.id, "")}
                       >
                         {isEn ? "Remove" : "Kaldır"}
                       </button>
                     </div>
                   ))}
                 </div>
               </div>
             )
           })}
           {Object.keys(tables).length === 0 && (
             <p className="admin-help-text" style={{ textAlign: "center", marginTop: "40px" }}>
               {isEn ? "No tables assigned yet." : "Henüz oluşturulmuş bir masa yok."}
             </p>
           )}
         </div>
      </div>
    </AdminSection>
  );
}