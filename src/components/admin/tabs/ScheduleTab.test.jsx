import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ScheduleTab } from './ScheduleTab';
import { useStore } from '../../../store/useStore';

describe('ScheduleTab Admin Bileşen Testleri', () => {
  let initialState;

  beforeEach(() => {
    initialState = useStore.getState();
    useStore.setState({
      adminDraft: {
        settings: { visibility: { schedule: true } },
        scheduleItems: [
          { time: "18:00", title: "Karşılama", description: "Misafirlerin gelişi" }
        ]
      }
    });
  });

  afterEach(() => {
    cleanup();
    useStore.setState(initialState, true);
    vi.clearAllMocks();
  });

  it('Mevcut programı doğru bir şekilde listelemeli', () => {
    render(<ScheduleTab isEn={false} />);
    
    expect(screen.getByDisplayValue('18:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Karşılama')).toBeInTheDocument();
  });

  it('Program başlığı değiştirildiğinde store tetiklenmeli', () => {
    render(<ScheduleTab isEn={false} />);
    
    const titleInput = screen.getByDisplayValue('Karşılama');
    fireEvent.change(titleInput, { target: { value: 'Kokteyl' } });

    expect(useStore.getState().adminDraft.scheduleItems[0].title).toBe('Kokteyl');
  });

  it('Yeni Program Ekle butonuna tıklandığında listeye boş eleman eklenmeli', () => {
    render(<ScheduleTab isEn={false} />);
    
    const addBtn = screen.getByRole('button', { name: /Yeni Program Ekle/i });
    fireEvent.click(addBtn);

    const items = useStore.getState().adminDraft.scheduleItems;
    expect(items.length).toBe(2);
    expect(items[1].title).toBe('Yeni Program');
  });

  it('Düğün Takvimi görünürlük checkboxı çalıştığında state güncellenmeli', () => {
    render(<ScheduleTab isEn={false} />);
    
    const visibilityCheckbox = screen.getByLabelText(/Düğün Takvimi bölümünü göster/i);
    fireEvent.click(visibilityCheckbox);

    expect(useStore.getState().adminDraft.settings.visibility.schedule).toBe(false);
  });
});