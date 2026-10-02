import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useExportData } from './useExportData';
import * as helpers from '../utils/helpers';

vi.mock('../utils/helpers', () => ({
  createExcelTable: vi.fn().mockReturnValue('<table>mock-excel</table>'),
  createCsv: vi.fn().mockReturnValue('mock,csv,data'),
  downloadTextFile: vi.fn()
}));

describe('useExportData Hook Kapsamlı Testleri', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exportExcel çağrıldığında HTML tablosu üretip doğru MIME tipiyle indirmeli', () => {
    const { result } = renderHook(() => useExportData(false));
    const mockData = [{ name: "Ahmet" }];
    
    result.current.exportExcel(mockData, 'guests', 'misafirler.xls');

    // Excel HTML oluşturucu çağrılmalı
    expect(helpers.createExcelTable).toHaveBeenCalledWith(mockData, 'guests', false);
    
    // İndirme tetikleyici çağrılmalı (MIME: application/vnd.ms-excel)
    expect(helpers.downloadTextFile).toHaveBeenCalledWith(
      'misafirler.xls',
      '<table>mock-excel</table>',
      'application/vnd.ms-excel'
    );
  });

  it('exportCsv çağrıldığında virgülle ayrılmış veriyi utf-8 kodlamasıyla indirmeli', () => {
    const { result } = renderHook(() => useExportData(true)); // isEn = true
    const mockData = [{ name: "John" }];
    
    result.current.exportCsv(mockData, 'wishes', 'wishes.csv');

    expect(helpers.createCsv).toHaveBeenCalledWith(mockData, 'wishes', true);
    
    expect(helpers.downloadTextFile).toHaveBeenCalledWith(
      'wishes.csv',
      'mock,csv,data',
      'text/csv;charset=utf-8;'
    );
  });
});