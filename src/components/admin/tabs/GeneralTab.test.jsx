import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeneralTab } from './GeneralTab';
import { useStore } from '../../../store/useStore';

vi.mock('../../../store/useStore');
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'tr' } })
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
        invitation: { bride: 'Zeynep', groom: 'Kerem', venue: 'Otel' }
      },
      updateDraftObject: mockUpdateDraftObject,
      saveSiteContent: mockSaveSiteContent
    }));
  });

  it('Gelin veya Damat ismi değiştirildiğinde store updateDraftObject fonksiyonunu çağırmalı', () => {
    render(<GeneralTab isEn={false} />);
    
    const brideInput = screen.getByDisplayValue('Zeynep');
    fireEvent.change(brideInput, { target: { value: 'Zeynep Yılmaz' } });
    
    expect(mockUpdateDraftObject).toHaveBeenCalledWith('invitation', 'bride', 'Zeynep Yılmaz');
  });

  it('Görünürlük (Visibility) checkboxlarına tıklandığında ayarları güncellemelis', () => {
    render(<GeneralTab isEn={false} />);
    
    // Geri sayım checkbox'ını bul
    const countdownCheckbox = screen.getByLabelText(/Geri Sayım bölümünü göster/i);
    expect(countdownCheckbox).toBeChecked(); // Store mockunda true vermiştik
    
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
    
    // isEn parametresi false olarak iletilmiş mi?
    expect(mockSaveSiteContent).toHaveBeenCalledWith(false);
  });
});