import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeneralTab } from './GeneralTab';
import { useStore } from '../../../store/useStore';

vi.mock('../../../store/useStore');
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('GeneralTab Admin Bileşen Testleri', () => {
  let mockUpdateDraftObject;
  let mockSaveSiteContent;

  beforeEach(() => {
    mockUpdateDraftObject = vi.fn();
    mockSaveSiteContent = vi.fn();

    useStore.mockImplementation((selector) => selector({
      adminDraft: {
        settings: { visibility: { countdown: true, location: true } },
        invitation: { bride: 'Zeynep', groom: 'Kerem', venue: 'Otel', address: 'İstanbul' }
      },
      updateDraftObject: mockUpdateDraftObject,
      saveSiteContent: mockSaveSiteContent
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Gelin veya Damat ismi değiştirildiğinde store updateDraftObject fonksiyonunu çağırmalı', () => {
    render(<GeneralTab isEn={false} />);
    
    const brideInput = screen.getByDisplayValue('Zeynep');
    fireEvent.change(brideInput, { target: { value: 'Zeynep Yılmaz' } });
    
    expect(mockUpdateDraftObject).toHaveBeenCalledWith('invitation', 'bride', 'Zeynep Yılmaz');
  });

  it('Adres alanı değiştirildiğinde store güncellenmeli', () => {
    render(<GeneralTab isEn={false} />);
    
    const addressInput = screen.getByDisplayValue('İstanbul');
    fireEvent.change(addressInput, { target: { value: 'Ankara' } });
    
    expect(mockUpdateDraftObject).toHaveBeenCalledWith('invitation', 'address', 'Ankara');
  });

  it('Görünürlük (Visibility) checkboxlarına tıklandığında ayarları güncellemeli', () => {
    render(<GeneralTab isEn={false} />);
    
    // t() mock fonksiyonu (k) => k döndürdüğü için çeviri anahtarıyla arama yapıyoruz
    const countdownCheckbox = screen.getByLabelText('admin.general.showCountdown');
    expect(countdownCheckbox).toBeChecked();
    
    fireEvent.click(countdownCheckbox);
    
    expect(mockUpdateDraftObject).toHaveBeenCalledWith('settings', 'visibility', expect.objectContaining({
      countdown: false,
      location: true
    }));
  });

  it('Kaydet butonuna basıldığında saveSiteContent çağrılmalı', () => {
    render(<GeneralTab isEn={false} />);
    
    const saveButton = screen.getByRole('button', { name: /Kaydet/i });
    fireEvent.click(saveButton);
    
    expect(mockSaveSiteContent).toHaveBeenCalledWith(false);
  });
});