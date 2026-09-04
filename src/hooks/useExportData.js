import { useCallback } from "react";
import { createExcelTable, createCsv, downloadTextFile } from "../utils/helpers";

export function useExportData(isEn) {
  const exportExcel = useCallback((data, type, filename) => {
    const html = createExcelTable(data, type, isEn);
    downloadTextFile(filename, html, "application/vnd.ms-excel");
  }, [isEn]);

  const exportCsv = useCallback((data, type, filename) => {
    const csv = createCsv(data, type, isEn);
    downloadTextFile(filename, csv, "text/csv;charset=utf-8;");
  }, [isEn]);

  const exportJson = useCallback((data, filename) => {
    downloadTextFile(filename, JSON.stringify(data), "application/json");
  }, []);

  return { exportExcel, exportCsv, exportJson };
}