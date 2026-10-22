import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAdminQr } from './useAdminQr';

describe('useAdminQr Hook Testleri', () => {
  let mockWindowOpen: ReturnType<typeof vi.spyOn>;
  let mockDocumentWrite: ReturnType<typeof vi.fn>;
  let mockDocumentClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockDocumentWrite = vi.fn();
    mockDocumentClose = vi.fn();
    
    mockWindowOpen = vi.spyOn(window, 'open').mockReturnValue({
      document: {
        write: mockDocumentWrite,
        close: mockDocumentClose
      }
    } as unknown as Window);
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
    
    act(() => {
      result.current.setTableCount(2);
    });

    act(() => {
      result.current.printTableCards();
    });

    expect(mockWindowOpen).toHaveBeenCalledWith('', '_blank');
    expect(mockDocumentWrite).toHaveBeenCalled();
    expect(mockDocumentClose).toHaveBeenCalled();
    
    const writtenHtml = mockDocumentWrite.mock.calls[0][0];
    expect(writtenHtml).toContain('Masa 1');
    expect(writtenHtml).toContain('Masa 2');
    expect(writtenHtml).not.toContain('Masa 3');
  });
});