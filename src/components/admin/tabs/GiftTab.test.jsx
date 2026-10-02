import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GiftTab } from './GiftTab';
import { useStore } from '../../../store/useStore';

vi.mock('../../../store/useStore');

describe('GiftTab Admin Bileşen Testleri', () => {
  let mockUpdateDraftObject;

  beforeEach(() => {
    mockUpdateDraftObject = vi.fn();

    useStore.mockImplementation((selector) => selector({
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
      },
      updateDraftObject: mockUpdateDraftObject,
      saveSiteContent: vi.fn()
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Verilen taslak bilgilerini doğru şekilde inputlarda göstermeli', () => {
    render(<GiftTab isEn={false} />);
    
    expect(screen.getByDisplayValue('Ahmet Yılmaz')).toBeInTheDocument();
    expect(screen.getByDisplayValue('TR123456')).toBeInTheDocument();
  });

  it('IBAN bilgisi güncellendiğinde updateDraftObject tetiklenmeli', () => {
    render(<GiftTab isEn={false} />);
    
    const ibanInput = screen.getByDisplayValue('TR123456');
    fireEvent.change(ibanInput, { target: { value: 'TR999999' } });
    
    expect(mockUpdateDraftObject).toHaveBeenCalledWith('giftRegistry', 'iban', 'TR999999');
  });

  it('Kredi Kartı butonu görünürlüğü değiştirildiğinde ayarları güncellemeli', () => {
    render(<GiftTab isEn={false} />);
    
    const creditCardCheckbox = screen.getByLabelText(/Kredi Kartı ile Gönder Butonunu Göster/i);
    expect(creditCardCheckbox).not.toBeChecked(); // Varsayılan false verdik

    fireEvent.click(creditCardCheckbox);
    
    expect(mockUpdateDraftObject).toHaveBeenCalledWith('settings', 'visibility', expect.objectContaining({
      creditCard: true
    }));
  });
});