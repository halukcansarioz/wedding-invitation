import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAdminQr } from './useAdminQr';

describe('useAdminQr Hook Testleri', () => {
  let mockWindowOpen: any;
  let mockDocumentWrite: any;
  let mockDocumentClose: any;

  beforeEach(() => {
    mockDocumentWrite = vi.fn();
    mockDocumentClose = vi.fn();
    
    // window.open fonksiyonunu mockluyoruz ki tarayıcı sekmesi açılmasın
    mockWindowOpen = vi.spyOn(window, 'open').mockReturnValue({
      document: {
        write: mockDocumentWrite,
        close: mockDocumentClose
      }
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Varsayılan masa sayısını 15 olarak başlatmalı', () => {
    const { result } = renderHook(() => useAdminQr('https://test.com', false));
    expect(result.current.tableCount).toBe(15);
  });

  it('Masa sayısı setTableCount ile güncellenebilmeli', () => {
    const { result } = renderHook(() => useAdminQr('https://test.com', false));
    act(() => {
      result.current.setTableCount(5);
    });
    expect(result.current.tableCount).toBe(5);
  });

  it('printTableCards çağrıldığında yeni sekme açmalı ve HTML yazdırmalı', () => {
    const { result } = renderHook(() => useAdminQr('https://test.com', false));
    
    // 1. Önce masa sayısını güncelliyoruz ve Hook'un yeniden render edilmesini sağlıyoruz
    act(() => {
      result.current.setTableCount(2);
    });

    // 2. Güncel state üzerinden yazdırma fonksiyonunu çağırıyoruz
    act(() => {
      result.current.printTableCards();
    });

    expect(mockWindowOpen).toHaveBeenCalledWith('', '_blank');
    expect(mockDocumentWrite).toHaveBeenCalled();
    expect(mockDocumentClose).toHaveBeenCalled();
    
    // Oluşturulan HTML içinde Masa 1 ve Masa 2'nin geçtiğini doğrula
    const writtenHtml = mockDocumentWrite.mock.calls[0][0];
    expect(writtenHtml).toContain('Masa 1');
    expect(writtenHtml).toContain('Masa 2');
    
    // Artık Masa 3 HTML içinde yer almayacak
    expect(writtenHtml).not.toContain('Masa 3');
  });
});