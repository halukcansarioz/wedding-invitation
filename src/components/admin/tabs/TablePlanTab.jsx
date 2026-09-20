import React, { useState, useMemo } from "react";
import { AdminSection } from "../../AdminUI";

export function TablePlanTab({ guests, assignTable, isEn }) {
  const [search, setSearch] = useState("");

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

  return (
    <AdminSection title={isEn ? "Seating Chart" : "Oturma Planı"}>
      <p className="admin-help-text" style={{ marginBottom: "20px" }}>
        {isEn 
          ? "Assign tables to your attending guests. (e.g., 1, 2, A, VIP)" 
          : "Katılacak misafirlerinizi masalara yerleştirin. (Örn: 1, 2, A, VIP, Aile)"}
      </p>

      <input
        type="text"
        className="admin-toolbar-search"
        style={{ width: "100%", marginBottom: "24px" }}
        placeholder={isEn ? "Search guest..." : "Misafir ara..."}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

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