import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ScheduleTab } from './ScheduleTab';
import { useStore } from '../../../store/useStore';

vi.mock('../../../store/useStore');

describe('ScheduleTab Admin Bileşen Testleri', () => {
  let mockUpdateDraftArrayItem, mockAddDraftArrayItem, mockRemoveDraftArrayItem, mockUpdateDraftObject;

  beforeEach(() => {
    mockUpdateDraftArrayItem = vi.fn();
    mockAddDraftArrayItem = vi.fn();
    mockRemoveDraftArrayItem = vi.fn();
    mockUpdateDraftObject = vi.fn();

    useStore.mockImplementation((selector) => selector({
      adminDraft: {
        settings: { visibility: { schedule: true } },
        scheduleItems: [
          { time: "18:00", title: "Karşılama", description: "Misafirlerin gelişi" }
        ]
      },
      updateDraftObject: mockUpdateDraftObject,
      saveSiteContent: vi.fn(),
      updateDraftArrayItem: mockUpdateDraftArrayItem,
      addDraftArrayItem: mockAddDraftArrayItem,
      removeDraftArrayItem: mockRemoveDraftArrayItem,
      moveDraftArrayItem: vi.fn()
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Mevcut programı doğru bir şekilde listelemeli', () => {
    render(<ScheduleTab isEn={false} />);
    
    expect(screen.getByDisplayValue('18:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Karşılama')).toBeInTheDocument();
  });

  it('Program başlığı değiştirildiğinde updateDraftArrayItem tetiklenmeli', () => {
    render(<ScheduleTab isEn={false} />);
    
    const titleInput = screen.getByDisplayValue('Karşılama');
    fireEvent.change(titleInput, { target: { value: 'Kokteyl' } });

    expect(mockUpdateDraftArrayItem).toHaveBeenCalledWith('scheduleItems', 0, 'title', 'Kokteyl');
  });

  it('Yeni Program Ekle butonuna tıklandığında listeye boş eleman eklenmeli', () => {
    render(<ScheduleTab isEn={false} />);
    
    const addBtn = screen.getByRole('button', { name: /Yeni Program Ekle/i });
    fireEvent.click(addBtn);

    expect(mockAddDraftArrayItem).toHaveBeenCalledWith('scheduleItems', { 
      time: "22:00", title: "Yeni Program", description: "" 
    });
  });

  it('Düğün Takvimi görünürlük checkboxı çalıştığında state güncellenmeli', () => {
    render(<ScheduleTab isEn={false} />);
    
    const visibilityCheckbox = screen.getByLabelText(/Düğün Takvimi bölümünü göster/i);
    fireEvent.click(visibilityCheckbox);

    expect(mockUpdateDraftObject).toHaveBeenCalledWith('settings', 'visibility', expect.objectContaining({
      schedule: false
    }));
  });
});