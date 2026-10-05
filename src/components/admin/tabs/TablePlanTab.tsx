import React, { useMemo } from "react";
import { AdminSection } from "../../AdminUI";
import { DndContext, useDraggable, useDroppable, DragEndEvent } from "@dnd-kit/core";
import { Guest } from "../../../types";
import { useAdminTablePlan } from "../../../hooks/useAdminTablePlan";

interface DraggableGuestProps {
  guest: Guest;
  isEn: boolean;
}

function DraggableGuest({ guest, isEn }: DraggableGuestProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: guest.id });
  const style = transform 
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 999, position: 'relative' as const } 
    : undefined;

  return (
    <div ref={setNodeRef} style={{...style, padding: "12px", background: "var(--paper)", border: "1px solid var(--admin-border-color)", borderRadius: "8px", cursor: "grab", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }} {...listeners} {...attributes} className="draggable-guest-item">
      <div>
        <strong style={{ color: "var(--admin-text-main)", display: "block" }}>{guest.name}</strong> 
        <small style={{ color: "var(--admin-text-muted)" }}>{guest.personCount} {isEn ? "Person" : "Kişi"} - {guest.side}</small>
      </div>
      <span style={{ fontSize: "18px", opacity: 0.5 }}>⋮⋮</span>
    </div>
  );
}

interface DroppableTableProps {
  tableNum: number;
  guests: Guest[];
  isEn: boolean;
  assignTable: (id: string, tableNumber: string) => void;
}

function DroppableTable({ tableNum, guests, isEn, assignTable }: DroppableTableProps) {
  const { isOver, setNodeRef } = useDroppable({ id: `table-${tableNum}` });
  
  // React Performans Optimizasyonu: Her renderda masadaki kişi sayısını tekrardan saymayı engelliyoruz
  const tableTotal = useMemo(() => {
    return guests.reduce((acc, g) => acc + Number(g.personCount || 1), 0);
  }, [guests]);
  
  const style = {
    background: isOver ? "color-mix(in srgb, var(--amp-color) 15%, transparent)" : "var(--paper-soft)",
    border: isOver ? "2px dashed var(--amp-color)" : "2px solid color-mix(in srgb, var(--amp-color) 30%, transparent)",
    minHeight: "200px", padding: "16px", borderRadius: "16px", 
    display: "flex", flexDirection: "column" as const,
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

interface TablePlanTabProps {
  guests: Guest[];
  assignTable: (id: string, tableNumber: string) => void;
  isEn: boolean;
}

// guests prop'u artık varsayılan olarak boş dizi ataması ile güvende tutuluyor.
export function TablePlanTab({ guests = [], assignTable, isEn }: TablePlanTabProps) {
  const { search, setSearch, attendingGuests, unassigned, tables, exportTablePlanPDF } = useAdminTablePlan(guests, isEn);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && over.id.toString().startsWith("table-")) {
      const tableNumber = over.id.toString().replace("table-", "");
      assignTable(active.id.toString(), tableNumber);
    }
  };

  const getTableGuests = useMemo(() => (num: number) => {
    return attendingGuests.filter(g => String(g.tableNumber) === String(num));
  }, [attendingGuests]);

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
              <DroppableTable key={num} tableNum={num} guests={getTableGuests(num)} isEn={isEn} assignTable={assignTable} />
            ))}
          </div>
        </div>
      </DndContext>
    </AdminSection>
  );
}