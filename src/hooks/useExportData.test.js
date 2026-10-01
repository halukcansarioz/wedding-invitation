import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useExportData } from './useExportData';
import * as helpers from '../utils/helpers';

// Helper fonksiyonlarını mockluyoruz
vi.mock('../utils/helpers', () => ({
  createExcelTable: vi.fn().mockReturnValue('<table>mock</table>'),
  createCsv: vi.fn().mockReturnValue('isim,durum\nAli,Katılacak'),
  downloadTextFile: vi.fn()
}));

describe('useExportData Hook Testleri', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exportJson çağrıldığında doğru formattaki veriyi downloadTextFile fonksiyonuna iletmeli', () => {
    const { result } = renderHook(() => useExportData(false));
    const mockData = [{ id: 1, name: "Test" }];
    
    result.current.exportJson(mockData, "test.json");

    expect(helpers.downloadTextFile).toHaveBeenCalledTimes(1);
    expect(helpers.downloadTextFile).toHaveBeenCalledWith(
      "test.json",
      JSON.stringify(mockData),
      "application/json"
    );
  });

  it('exportCsv çağrıldığında createCsv ve downloadTextFile tetiklenmeli', () => {
    const { result } = renderHook(() => useExportData(true));
    
    result.current.exportCsv([], "wishes", "wishes.csv");

    expect(helpers.createCsv).toHaveBeenCalled();
    expect(helpers.downloadTextFile).toHaveBeenCalledWith(
      "wishes.csv",
      'isim,durum\nAli,Katılacak',
      "text/csv;charset=utf-8;"
    );
  });
});