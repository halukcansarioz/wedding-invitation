import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CeremonyTab } from './CeremonyTab';
import { useStore } from '../../../store/useStore';

vi.mock('../../../store/useStore');

describe('CeremonyTab Admin Bileşen Testleri', () => {
  let mockUpdateDraftArrayItem;
  let mockAddDraftArrayItem;
  let mockRemoveDraftArrayItem;

  beforeEach(() => {
    mockUpdateDraftArrayItem = vi.fn();
    mockAddDraftArrayItem = vi.fn();
    mockRemoveDraftArrayItem = vi.fn();

    useStore.mockImplementation((selector) => selector({
      adminDraft: {
        settings: { visibility: { ceremony: true } },
        eventDetails: [
          { label: "Kına Gecesi", time: "18:00", location: "Bahçe", description: "Bekleriz" }
        ]
      },
      updateDraftArrayItem: mockUpdateDraftArrayItem,
      addDraftArrayItem: mockAddDraftArrayItem,
      removeDraftArrayItem: mockRemoveDraftArrayItem,
      moveDraftArrayItem: vi.fn(),
      saveSiteContent: vi.fn(),
      updateDraftObject: vi.fn()
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Store verisine göre kayıtlı etkinlikleri ekranda göstermeli', () => {
    render(<CeremonyTab isEn={false} />);
    
    expect(screen.getByDisplayValue('Kına Gecesi')).toBeInTheDocument();
    expect(screen.getByDisplayValue('18:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bahçe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bekleriz')).toBeInTheDocument();
  });

  it('Girdiler değiştiğinde array öğesini güncelleme fonksiyonunu tetiklemeli', () => {
    render(<CeremonyTab isEn={false} />);
    
    const timeInput = screen.getByDisplayValue('18:00');
    fireEvent.change(timeInput, { target: { value: '19:30' } });

    expect(mockUpdateDraftArrayItem).toHaveBeenCalledWith('eventDetails', 0, 'time', '19:30');
  });

  it('Yeni etkinlik ekle butonuna tıklandığında varsayılan değerlerle listeye eleman eklemeli', () => {
    render(<CeremonyTab isEn={false} />);
    
    const addBtn = screen.getByRole('button', { name: /Yeni Etkinlik Ekle/i });
    fireEvent.click(addBtn);

    expect(mockAddDraftArrayItem).toHaveBeenCalledWith('eventDetails', {
      label: "Yeni Etkinlik",
      time: "20:00",
      location: "",
      description: ""
    });
  });

  it('Etkinlik sil butonuna basıldığında listeyi güncellemeli', () => {
    render(<CeremonyTab isEn={false} />);
    
    const deleteBtn = screen.getByRole('button', { name: /Sil 🗑️/i });
    fireEvent.click(deleteBtn);

    expect(mockRemoveDraftArrayItem).toHaveBeenCalledWith('eventDetails', 0);
  });
});