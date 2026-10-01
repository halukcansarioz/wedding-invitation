import { useState, useMemo } from "react";
import { Guest } from "../types";

export function useAdminTablePlan(guests: Guest[], isEn: boolean) {
  const [search, setSearch] = useState<string>("");

  const attendingGuests = useMemo(() =>
    guests.filter(g => g.attendance === "Katılacağım" && g.name.toLowerCase().includes(search.toLowerCase())),
  [guests, search]);

  const unassigned = attendingGuests.filter(g => !g.tableNumber || String(g.tableNumber).trim() === "");
  const tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; 

  const exportTablePlanPDF = async () => {
    // Dynamic import to keep bundle size small
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
        // Türkçe karakter temizleme
        const safeName = (g.name || "").replace(/ğ/g, 'g').replace(/Ğ/g, 'G').replace(/ü/g, 'u').replace(/Ü/g, 'U').replace(/ş/g, 's').replace(/Ş/g, 'S').replace(/ı/g, 'i').replace(/İ/g, 'I').replace(/ö/g, 'o').replace(/Ö/g, 'O').replace(/ç/g, 'c').replace(/Ç/g, 'C');
        doc.text(`- ${safeName} (${g.personCount} ${isEn ? "Person" : "Kisi"})`, 25, yOffset);
        yOffset += 7;
      });
      yOffset += 7;
    });
    doc.save("oturma-plani.pdf");
  };

  return {
    search,
    setSearch,
    attendingGuests,
    unassigned,
    tables,
    exportTablePlanPDF
  };
}