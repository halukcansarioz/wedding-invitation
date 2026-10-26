import { useState, useMemo } from "react";
import { Guest, isAttendingGuest } from "../types";

export function useAdminTablePlan(guests: Guest[], isEn: boolean, totalTables: number = 12) {
  const [search, setSearch] = useState<string>("");

  const attendingGuests = useMemo(
    () =>
      guests.filter(
        (g) =>
          isAttendingGuest(g.attendance) &&
          (g.name || "").toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR"))
      ),
    [guests, search]
  );

  const unassigned = useMemo(
    () => attendingGuests.filter((g) => !g.tableNumber || String(g.tableNumber).trim() === ""),
    [attendingGuests]
  );

  const tables = useMemo(
    () => Array.from({ length: Math.max(1, totalTables) }, (_, idx) => idx + 1),
    [totalTables]
  );

  const exportTablePlanPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(isEn ? "Wedding Seating Chart" : "Dugun Oturma Plani", 20, 20);
    let yOffset = 35;
    doc.setFontSize(12);

    tables.forEach((tableNum) => {
      const tGuests = attendingGuests.filter((g) => String(g.tableNumber) === String(tableNum));
      if (tGuests.length === 0) return;

      if (yOffset > 270) {
        doc.addPage();
        yOffset = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${isEn ? "Table" : "Masa"} ${tableNum}`, 20, yOffset);
      yOffset += 8;

      doc.setFont("helvetica", "normal");
      tGuests.forEach((g) => {
        if (yOffset > 280) {
          doc.addPage();
          yOffset = 20;
        }
        const safeName = (g.name || "")
          .replace(/ğ/g, "g")
          .replace(/Ğ/g, "G")
          .replace(/ü/g, "u")
          .replace(/Ü/g, "U")
          .replace(/ş/g, "s")
          .replace(/Ş/g, "S")
          .replace(/ı/g, "i")
          .replace(/İ/g, "I")
          .replace(/ö/g, "o")
          .replace(/Ö/g, "O")
          .replace(/ç/g, "c")
          .replace(/Ç/g, "C");
        doc.text(
          `- ${safeName} (${g.personCount || 1} ${isEn ? "Person" : "Kisi"})`,
          25,
          yOffset
        );
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
    exportTablePlanPDF,
  };
}