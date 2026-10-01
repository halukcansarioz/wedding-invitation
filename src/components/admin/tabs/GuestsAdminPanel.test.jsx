import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GuestsAdminPanel } from './GuestsAdminPanel';
import { useStore } from '../../../store/useStore';

vi.mock('../../../store/useStore');
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

  beforeEach(() => {
    useStore.mockImplementation((selector) => selector({
      adminDraft: { settings: { visibility: { guests: true } } },
      updateDraftObject: vi.fn(),
      showAppConfirm: vi.fn().mockResolvedValue(true)
    }));
  });

  it('Misafir istatistiklerini doğru hesaplamalı', () => {
    render(<GuestsAdminPanel guests={mockGuests} filteredGuests={mockGuests} isEn={false} />);
    expect(screen.getByText('3', { selector: 'strong' })).toBeInTheDocument(); 
  });

  it('Arama kutusuna yazıldığında setAdminGuestSearch fonksiyonunu tetiklemeli', () => {
    const mockSetSearch = vi.fn();
    render(<GuestsAdminPanel guests={mockGuests} filteredGuests={mockGuests} adminGuestSearch="" setAdminGuestSearch={mockSetSearch} isEn={false} />);
    
    // Doğru placeholder metni
    const searchInput = screen.getByPlaceholderText(/Misafir ara/i);
    fireEvent.change(searchInput, { target: { value: 'Zeynep' } });
    expect(mockSetSearch).toHaveBeenCalledWith('Zeynep');
  });

  it('Filtre değiştirildiğinde setAdminGuestStatusFilter tetiklenmeli', () => {
    const mockSetFilter = vi.fn();
    render(<GuestsAdminPanel guests={mockGuests} filteredGuests={mockGuests} adminGuestStatusFilter="all" setAdminGuestStatusFilter={mockSetFilter} isEn={false} />);
    
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