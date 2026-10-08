import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CeremonyTab } from './CeremonyTab';
import { useStore } from '../../../store/useStore';

describe('CeremonyTab Admin Bileşen Testleri', () => {
  let initialState;

  beforeEach(() => {
    initialState = useStore.getState();
    useStore.setState({
      adminDraft: {
        settings: { visibility: { ceremony: true } },
        eventDetails: [
          { label: "Kına Gecesi", time: "18:00", location: "Bahçe", description: "Bekleriz" }
        ]
      }
    });
  });

  afterEach(() => {
    cleanup();
    useStore.setState(initialState, true);
    vi.clearAllMocks();
  });

  it('Store verisine göre kayıtlı etkinlikleri ekranda göstermeli', () => {
    render(<CeremonyTab isEn={false} />);
    
    expect(screen.getByDisplayValue('Kına Gecesi')).toBeInTheDocument();
    expect(screen.getByDisplayValue('18:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bahçe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bekleriz')).toBeInTheDocument();
  });

  it('Girdiler değiştiğinde array öğesini güncellemeli', () => {
    render(<CeremonyTab isEn={false} />);
    
    const timeInput = screen.getByDisplayValue('18:00');
    fireEvent.change(timeInput, { target: { value: '19:30' } });

    expect(useStore.getState().adminDraft.eventDetails[0].time).toBe('19:30');
  });

  it('Yeni etkinlik ekle butonuna tıklandığında varsayılan değerlerle listeye eleman eklemeli', () => {
    render(<CeremonyTab isEn={false} />);
    
    const addBtn = screen.getByRole('button', { name: /Yeni Etkinlik Ekle/i });
    fireEvent.click(addBtn);

    const details = useStore.getState().adminDraft.eventDetails;
    expect(details.length).toBe(2);
    expect(details[1].label).toBe('Yeni Etkinlik');
    expect(details[1].time).toBe('20:00');
  });

  it('Etkinlik sil butonuna basıldığında listeyi güncellemeli', () => {
    render(<CeremonyTab isEn={false} />);
    
    const deleteBtn = screen.getByRole('button', { name: /Sil 🗑️/i });
    fireEvent.click(deleteBtn);

    expect(useStore.getState().adminDraft.eventDetails.length).toBe(0);
  });
});