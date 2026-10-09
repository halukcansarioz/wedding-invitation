import React from 'react';
import { render, screen, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { TablePlanTab } from './TablePlanTab';

// @dnd-kit kütüphanesini test ortamında çökmelerden korumak için mockluyoruz
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div data-testid="dnd-context">{children}</div>,
  useDraggable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null }),
  useDroppable: () => ({ isOver: false, setNodeRef: vi.fn() })
}));

describe('TablePlanTab Admin Bileşen Testleri', () => {
  const mockGuests = [
    { id: '1', name: 'Ahmet Yılmaz', attendance: 'Katılacağım', personCount: '2', side: 'Gelin', hasChild: 'Hayır', has_arrived: false },
    { id: '2', name: 'Ayşe Kaya', attendance: 'Katılacağım', personCount: '1', side: 'Damat', hasChild: 'Hayır', has_arrived: false, tableNumber: '1' }
  ];

  afterEach(() => {
    cleanup();
  });

  it('Atanmamış (Bekleyen) misafirleri listeleyebilmeli', () => {
    render(<TablePlanTab guests={mockGuests as any} assignTable={vi.fn()} isEn={false} />);
    
    // Masa atanmamış Ahmet Yılmaz "Bekleyenler" listesinde görünmeli
    expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    
    // Bekleyen sayısı 1 olmalı
    expect(screen.getByText('Bekleyenler (1)')).toBeInTheDocument();
  });

  it('Masaları ve atanan misafirleri render edebilmeli', () => {
    render(<TablePlanTab guests={mockGuests as any} assignTable={vi.fn()} isEn={false} />);
    
    // Masa 1 başlığı görünmeli
    expect(screen.getByText('Masa 1')).toBeInTheDocument();
    
    // Ayşe Kaya Masa 1'e atandığı için ismi DOM'da yer almalı
    expect(screen.getByText(/Ayşe Kaya/i)).toBeInTheDocument();
  });
});