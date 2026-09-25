import React, { useState, useMemo } from "react";
import { AdminSection } from "../../AdminUI";
import { useStore } from "../../../store/useStore";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

// Sürüklenebilir Misafir Bileşeni
function DraggableGuest({ guest, isEn }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: guest.id });
  const style = transform 
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 999, position: 'relative' } 
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="draggable-guest-item" style={{ padding: "12px", background: "var(--paper)", border: "1px solid var(--admin-border-color)", borderRadius: "8px", cursor: "grab", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <strong style={{ color: "var(--admin-text-main)", display: "block" }}>{guest.name}</strong> 
        <small style={{ color: "var(--admin-text-muted)" }}>{guest.personCount} {isEn ? "Person" : "Kişi"} - {guest.side}</small>
      </div>
      <span style={{ fontSize: "18px", opacity: 0.5 }}>⋮⋮</span>
    </div>
  );
}

// Bırakılabilir Masa Bileşeni
function DroppableTable({ tableNum, guests, isEn, assignTable }) {
  const { isOver, setNodeRef } = useDroppable({ id: `table-${tableNum}` });
  const tableTotal = guests.reduce((acc, g) => acc + Number(g.personCount || 1), 0);
  
  const style = {
    background: isOver ? "color-mix(in srgb, var(--amp-color) 15%, transparent)" : "var(--paper-soft)",
    border: isOver ? "2px dashed var(--amp-color)" : "2px solid color-mix(in srgb, var(--amp-color) 30%, transparent)",
    minHeight: "200px", padding: "16px", borderRadius: "16px", 
    display: "flex", flexDirection: "column",
    transition: "all 0.2s ease"
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
        <h4 style={{ margin: 0, color: "var(--rose-deep)", fontSize: "18px" }}>{isEn ? "Table" : "Masa"} {tableNum}</h4>
        <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--admin-text-muted)" }}>{tableTotal} {isEn ? "Person" : "Kişi"}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        {guests.map(g => (
          <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--paper)", borderRadius: "8px", fontSize: "14px", border: "1px solid var(--admin-border-color)" }}>
            <span style={{ color: "var(--admin-text-main)", fontWeight: "600" }}>{g.name} <small style={{ opacity: 0.7 }}>({g.personCount})</small></span>
            <button type="button" className="secondary-button" style={{ padding: "4px 8px", fontSize: "12px", minWidth: "auto", minHeight: "auto", margin: 0, border: "none", color: "#d35400" }} onClick={() => assignTable(g.id, "")}>
              {isEn ? "Remove" : "Kaldır"}
            </button>
          </div>
        ))}
        {guests.length === 0 && <div style={{ margin: "auto", color: "var(--admin-text-muted)", fontSize: "13px", opacity: 0.6 }}>{isEn ? "Drop guests here" : "Misafirleri buraya sürükleyin"}</div>}
      </div>
    </div>
  );
}

export function TablePlanTab({ guests, assignTable, isEn }) {
  const [search, setSearch] = useState("");
  const showAppAlert = useStore(state => state.showAppAlert);

  const attendingGuests = useMemo(() =>
    guests.filter(g => g.attendance === "Katılacağım" && g.name.toLowerCase().includes(search.toLowerCase())),
  [guests, search]);

  const unassigned = attendingGuests.filter(g => !g.tableNumber || String(g.tableNumber).trim() === "");
  const tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // İsteğe göre masa sayısını artırabilirsiniz

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && over.id.toString().startsWith("table-")) {
      const tableNumber = over.id.replace("table-", "");
      assignTable(active.id, tableNumber);
    }
  };

  const exportTablePlanPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(isEn ? "Wedding Seating Chart" : "Dugun Oturma Plani", 20, 20);
    let yOffset = 35;
    doc.setFontSize(12);

    tables.forEach(tableNum => {
      const tGuests = attendingGuests.filter(g => String(g.tableNumber) === String(tableNum));
      if(tGuests.length === 0) return;

      if (yOffset > 270) { doc.addPage(); yOffset = 20; }
      doc.setFont("helvetica", "bold");
      doc.text(`${isEn ? "Table" : "Masa"} ${tableNum}`, 20, yOffset);
      yOffset += 8;
      
      doc.setFont("helvetica", "normal");
      tGuests.forEach(g => {
        if (yOffset > 280) { doc.addPage(); yOffset = 20; }
        const safeName = (g.name || "").replace(/ğ/g, 'g').replace(/Ğ/g, 'G').replace(/ü/g, 'u').replace(/Ü/g, 'U').replace(/ş/g, 's').replace(/Ş/g, 'S').replace(/ı/g, 'i').replace(/İ/g, 'I').replace(/ö/g, 'o').replace(/Ö/g, 'O').replace(/ç/g, 'c').replace(/Ç/g, 'C');
        doc.text(`- ${safeName} (${g.personCount} ${isEn ? "Person" : "Kisi"})`, 25, yOffset);
        yOffset += 7;
      });
      yOffset += 7;
    });
    doc.save("oturma-plani.pdf");
  };

  return (
    <AdminSection title={isEn ? "Visual Seating Chart" : "Görsel Oturma Planı"}>
      <p className="admin-help-text" style={{ marginBottom: "20px" }}>
        {isEn ? "Drag unassigned guests and drop them onto tables." : "Atanmamış misafirleri tutup masaların üzerine sürükleyerek bırakın."}
      </p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input type="text" className="admin-toolbar-search" style={{ flex: 1, minWidth: '200px', margin: 0 }} placeholder={isEn ? "Search guest..." : "Misafir ara..."} value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="button" className="secondary-button" style={{ margin: 0 }} onClick={exportTablePlanPDF}>
          {isEn ? "🖨️ Export PDF" : "🖨️ PDF Çıktısı Al"}
        </button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px", alignItems: "start" }}>
          <div style={{ background: "var(--paper-soft)", padding: "16px", borderRadius: "16px", maxHeight: "700px", overflowY: "auto", border: "1px solid var(--admin-border-color)" }}>
            <h4 style={{ color: "var(--rose-deep)", marginTop: 0, marginBottom: "16px" }}>{isEn ? "Unassigned Guests" : "Bekleyenler"} ({unassigned.length})</h4>
            {unassigned.length === 0 && <p className="admin-help-text" style={{ textAlign: "center" }}>{isEn ? "All found guests assigned." : "Bekleyen misafir yok."}</p>}
            {unassigned.map(g => <DraggableGuest key={g.id} guest={g} isEn={isEn} />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", maxHeight: "700px", overflowY: "auto", paddingRight: "8px" }}>
            {tables.map(num => (
              <DroppableTable key={num} tableNum={num} guests={attendingGuests.filter(g => String(g.tableNumber) === String(num))} isEn={isEn} assignTable={assignTable} />
            ))}
          </div>
        </div>
      </DndContext>
    </AdminSection>
  );
}