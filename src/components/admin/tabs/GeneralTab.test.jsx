import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeneralTab } from './GeneralTab';
import { useStore } from '../../../store/useStore';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('GeneralTab Admin Bileşen Testleri', () => {
  let initialState;
  let saveSpy;

  beforeEach(() => {
    initialState = useStore.getState();
    useStore.setState({
      adminDraft: {
        settings: { visibility: { countdown: true, location: true } },
        invitation: { bride: 'Zeynep', groom: 'Kerem', venue: 'Otel', address: 'İstanbul' }
      }
    });
    saveSpy = vi.spyOn(useStore.getState(), 'saveSiteContent').mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    cleanup();
    useStore.setState(initialState, true);
    vi.clearAllMocks();
  });

  it('Gelin veya Damat ismi değiştirildiğinde store güncellenmeli', () => {
    render(<GeneralTab isEn={false} />);
    
    const brideInput = screen.getByDisplayValue('Zeynep');
    fireEvent.change(brideInput, { target: { value: 'Zeynep Yılmaz' } });
    
    expect(useStore.getState().adminDraft.invitation.bride).toBe('Zeynep Yılmaz');
  });

  it('Adres alanı değiştirildiğinde store güncellenmeli', () => {
    render(<GeneralTab isEn={false} />);
    
    const addressInput = screen.getByDisplayValue('İstanbul');
    fireEvent.change(addressInput, { target: { value: 'Ankara' } });
    
    expect(useStore.getState().adminDraft.invitation.address).toBe('Ankara');
  });

  it('Görünürlük (Visibility) checkboxlarına tıklandığında ayarları güncellemeli', () => {
    render(<GeneralTab isEn={false} />);
    
    const countdownCheckbox = screen.getByLabelText('admin.general.showCountdown');
    expect(countdownCheckbox).toBeChecked();
    
    fireEvent.click(countdownCheckbox);
    
    expect(useStore.getState().adminDraft.settings.visibility.countdown).toBe(false);
    expect(useStore.getState().adminDraft.settings.visibility.location).toBe(true);
  });

  it('Kaydet butonuna basıldığında saveSiteContent çağrılmalı', () => {
    render(<GeneralTab isEn={false} />);
    
    const saveButton = screen.getByRole('button', { name: /Kaydet/i });
    fireEvent.click(saveButton);
    
    expect(saveSpy).toHaveBeenCalledWith(false);
  });
});