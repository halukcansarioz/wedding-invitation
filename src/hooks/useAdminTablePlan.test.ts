import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAdminTablePlan } from './useAdminTablePlan';
import { Guest } from '../types';

const mockGuests: Guest[] = [
  { id: "1", name: "Ali Yılmaz", attendance: "Katılacağım", tableNumber: "", personCount: "2", side: "Gelin Tarafı", hasChild: "Hayır", has_arrived: false },
  { id: "2", name: "Veli Demir", attendance: "Katılamayacağım", tableNumber: "", personCount: "1", side: "Damat Tarafı", hasChild: "Hayır", has_arrived: false },
  { id: "3", name: "Ayşe Kaya", attendance: "Katılacağım", tableNumber: "3", personCount: "1", side: "Ortak", hasChild: "Evet", has_arrived: false },
];

describe('useAdminTablePlan Hook Testleri', () => {
  it('sadece katılacakları filtrelemeli ve varsayılan arama kriteri boş olmalı', () => {
    const { result } = renderHook(() => useAdminTablePlan(mockGuests, false));
    
    // Toplam 3 misafir var ama sadece Ali ve Ayşe "Katılacağım" dedi
    expect(result.current.attendingGuests).toHaveLength(2);
    expect(result.current.attendingGuests.map(g => g.name)).toContain("Ali Yılmaz");
    expect(result.current.attendingGuests.map(g => g.name)).not.toContain("Veli Demir");
  });

  it('arama (search) yapıldığında misafir listesi dinamik olarak filtrelenmeli', () => {
    const { result } = renderHook(() => useAdminTablePlan(mockGuests, false));
    
    act(() => {
      result.current.setSearch('Ayşe');
    });

    expect(result.current.attendingGuests).toHaveLength(1);
    expect(result.current.attendingGuests[0].name).toBe('Ayşe Kaya');
  });

  it('henüz hiçbir masaya atanmamış (unassigned) misafirleri doğru bulmalı', () => {
    const { result } = renderHook(() => useAdminTablePlan(mockGuests, false));
    
    // Ayşe Masa 3'e atanmış, Veli katılmıyor, Ali katılacak ama atanmamış
    expect(result.current.unassigned).toHaveLength(1);
    expect(result.current.unassigned[0].name).toBe('Ali Yılmaz');
  });
});