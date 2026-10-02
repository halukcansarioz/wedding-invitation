import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThemeTab } from './ThemeTab';
import { useStore } from '../../../store/useStore';

vi.mock('../../../store/useStore');
// Gerçek Dropdown yerine kolay tetiklenebilir bir mock
vi.mock('../../common/UIComponents', () => ({
  Dropdown: ({ value, onChange }) => (
    <select data-testid="mock-dropdown" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="lavanta">Lavanta</option>
      <option value="dark">Koyu Tema</option>
    </select>
  )
}));

describe('ThemeTab İleri Seviye Admin Bileşen Testleri', () => {
  let mockUpdateDraftObject;

  beforeEach(() => {
    mockUpdateDraftObject = vi.fn();
    useStore.mockImplementation((selector) => selector({
      adminDraft: { settings: { theme: 'lavanta', defaultTheme: 'lavanta', isPostWedding: false } },
      updateDraftObject: mockUpdateDraftObject,
      saveSiteContent: vi.fn()
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Tema kartına tıklandığında document HTML etiketine "data-theme" eklenmeli', () => {
    render(<ThemeTab isEn={false} />);
    
    // Mocklanmış temanın butonunu bul (Dark)
    const darkThemeButton = screen.getByText('Koyu Tema').closest('button');
    fireEvent.click(darkThemeButton);
    
    // Store güncellenmeli
    expect(mockUpdateDraftObject).toHaveBeenCalledWith('settings', 'theme', 'dark');
    
    // HTML'in kendisine data-theme attribute'u eklenmeli (Canlı önizleme için)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('Düğün Bitti (isPostWedding) checkboxı tıklanabilir olmalı ve state güncellenmeli', () => {
    render(<ThemeTab isEn={false} />);
    
    const postWeddingCheckbox = screen.getByLabelText(/Düğün Bitti Modu/i);
    expect(postWeddingCheckbox).not.toBeChecked();

    fireEvent.click(postWeddingCheckbox);
    expect(mockUpdateDraftObject).toHaveBeenCalledWith('settings', 'isPostWedding', true);
  });
});