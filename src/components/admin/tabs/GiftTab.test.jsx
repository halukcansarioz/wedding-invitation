import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GiftTab } from './GiftTab';
import { useStore } from '../../../store/useStore';

describe('GiftTab Admin Bileşen Testleri', () => {
  let initialState;

  beforeEach(() => {
    initialState = useStore.getState();
    useStore.setState({
      adminDraft: {
        settings: { 
          visibility: { iban: true, popupIban: true, creditCard: false } 
        },
        giftRegistry: {
          title: "Hediyeler",
          receiver: "Ahmet Yılmaz",
          bankName: "Garanti",
          iban: "TR123456",
          description: "Teşekkürler"
        }
      }
    });
  });

  afterEach(() => {
    cleanup();
    useStore.setState(initialState, true);
    vi.clearAllMocks();
  });

  it('Verilen taslak bilgilerini doğru şekilde inputlarda göstermeli', () => {
    render(<GiftTab isEn={false} />);
    
    expect(screen.getByDisplayValue('Ahmet Yılmaz')).toBeInTheDocument();
    expect(screen.getByDisplayValue('TR123456')).toBeInTheDocument();
  });

  it('IBAN bilgisi güncellendiğinde store güncellenmeli', () => {
    render(<GiftTab isEn={false} />);
    
    const ibanInput = screen.getByDisplayValue('TR123456');
    fireEvent.change(ibanInput, { target: { value: 'TR999999' } });
    
    expect(useStore.getState().adminDraft.giftRegistry.iban).toBe('TR999999');
  });

  it('Kredi Kartı butonu görünürlüğü değiştirildiğinde ayarları güncellemeli', () => {
    render(<GiftTab isEn={false} />);
    
    const creditCardCheckbox = screen.getByLabelText(/Kredi Kartı ile Gönder Butonunu Göster/i);
    expect(creditCardCheckbox).not.toBeChecked();

    fireEvent.click(creditCardCheckbox);
    
    expect(useStore.getState().adminDraft.settings.visibility.creditCard).toBe(true);
  });
});