import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GuestsAdminPanel } from './GuestsAdminPanel';
import { useStore } from '../../../store/useStore';

vi.mock('react-virtuoso', () => ({
  Virtuoso: ({ data, itemContent }) => <div>{data.map((item, index) => <React.Fragment key={item.id}>{itemContent(index, item)}</React.Fragment>)}</div>,
}));
vi.mock('../../common/UIComponents', () => ({
  Dropdown: ({ value, onChange, options }) => (
    <select data-testid="status-filter" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  )
}));

describe('GuestsAdminPanel Bileşen Testleri', () => {
  const mockGuests = [
    { id: '1', name: 'Ahmet Yılmaz', attendance: 'Katılacağım', personCount: '2' },
    { id: '2', name: 'Zeynep Demir', attendance: 'Katılamayacağım', personCount: '1' },
    { id: '3', name: 'Mehmet Kaya', attendance: 'Katılacağım', personCount: '3' }
  ];

  let initialState;

  beforeEach(() => {
    initialState = useStore.getState();
    
    // Verileri (data) setState ile, Fonksiyonları (actions) spyOn ile yönetmeliyiz
    useStore.setState({
      adminDraft: {
        settings: { visibility: { guests: true } },
        invitation: { bride: "Gelin", groom: "Damat", mapLink: "" },
      }
    });

    vi.spyOn(useStore.getState(), 'updateDraftObject').mockImplementation(() => {});
    vi.spyOn(useStore.getState(), 'showAppConfirm').mockResolvedValue(true);
    vi.spyOn(useStore.getState(), 'showAppAlert').mockResolvedValue(true);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    useStore.setState(initialState, true); // Orijinal saf haline döndür
  });

  it('Misafir istatistiklerini doğru hesaplamalı', () => {
    render(<GuestsAdminPanel guests={mockGuests} filteredGuests={mockGuests} isEn={false} />);
    expect(screen.getByText('3', { selector: 'strong' })).toBeInTheDocument(); 
  });

  it('Davetiye taslağında davetli bilgisi yoksa paneli açabilmeli', () => {
    render(<GuestsAdminPanel guests={mockGuests} filteredGuests={mockGuests} />);
    expect(screen.getByText('Katılım Yanıtları & Kapı Kontrolü')).toBeInTheDocument();
  });

  it('Arama kutusuna yazıldığında setAdminGuestSearch fonksiyonunu tetiklemeli', () => {
    const mockSetSearch = vi.fn();
    render(<GuestsAdminPanel guests={mockGuests} filteredGuests={mockGuests} adminGuestSearch="" setAdminGuestSearch={mockSetSearch} isEn={false} />);
    
    const searchInput = screen.getByPlaceholderText(/İsim veya tel ara/i);
    fireEvent.change(searchInput, { target: { value: 'Zeynep' } });
    expect(mockSetSearch).toHaveBeenCalledWith('Zeynep');
  });

  it('Filtre değiştirildiğinde setAdminGuestStatusFilter tetiklenmeli', () => {
    const mockSetFilter = vi.fn();
    render(<GuestsAdminPanel guests={mockGuests} filteredGuests={mockGuests} adminGuestAttendanceFilter="all" setAdminGuestAttendanceFilter={mockSetFilter} isEn={false} />);
    
    const filterSelect = screen.getByTestId('status-filter');
    fireEvent.change(filterSelect, { target: { value: 'Katılacağım' } });
    expect(mockSetFilter).toHaveBeenCalledWith('Katılacağım');
  });

  it('Misafir sil butonuna basıldığında deleteGuest fonksiyonu tetiklenmeli', () => {
    const mockDelete = vi.fn();
    render(<GuestsAdminPanel guests={mockGuests} filteredGuests={[mockGuests[0]]} deleteGuest={mockDelete} isEn={false} />);
    
    const deleteBtn = screen.getByRole('button', { name: /Sil 🗑️/i });
    fireEvent.click(deleteBtn);
    expect(mockDelete).toHaveBeenCalledWith('1');
  });
});