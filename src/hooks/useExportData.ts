import { useCallback } from "react";
import { createExcelTable, createCsv, downloadTextFile } from "../utils/helpers";

export type ExportDatasetType = "guests" | "wishes" | string;

export function useExportData(isEn: boolean) {
  const exportExcel = useCallback((data: any[], type: ExportDatasetType, filename: string) => {
    const html = createExcelTable(data, type, isEn);
    downloadTextFile(filename, html, "application/vnd.ms-excel");
  }, [isEn]);

  const exportCsv = useCallback((data: any[], type: ExportDatasetType, filename: string) => {
    const csv = createCsv(data, type, isEn);
    downloadTextFile(filename, csv, "text/csv;charset=utf-8;");
  }, [isEn]);

  const exportJson = useCallback((data: unknown, filename: string) => {
    downloadTextFile(filename, JSON.stringify(data, null, 2), "application/json");
  }, []);

  return { exportExcel, exportCsv, exportJson };
}