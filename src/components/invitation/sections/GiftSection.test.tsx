import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GiftSection } from './GiftSection';
import { useStore } from '../../../store/useStore';

// DÜZELTME 1: Çeviri aracı (t) testteki "/Kredi Kartı/i" aramasıyla eşleşebilsin diye fallback eklendi.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ 
    t: (key: string) => {
      if (key.toLowerCase().includes('credit') || key.toLowerCase().includes('stripe')) {
        return 'Kredi Kartı ile Gönder';
      }
      return key;
    }, 
    i18n: { language: 'tr' } 
  })
}));

vi.mock('../../../supabaseClient', () => ({
  supabase: {
    functions: { invoke: vi.fn().mockResolvedValue({ data: { paymentUrl: 'https://stripe.test' } }) }
  }
}));

// KRİTİK DÜZELTME 2: vi.mock('../../../store/useStore'); TAMAMEN KALDIRILDI!
// Gerçek store üzerinden duruma müdahale edeceğiz.

describe('GiftSection Bileşeni İleri Seviye Testleri', () => {
  const mockGiftData = {
    title: "Hediye & Takı",
    description: "Mutluluğumuzu paylaşmak isterseniz...",
    receiver: "Ahmet Yılmaz",
    iban: "TR000"
  };

  let originalLocation: any;
  let initialState: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    initialState = useStore.getState();

    // DÜZELTME 3: Butonun render olabilmesi için gerçek Zustand State'ine ayarı enjekte ediyoruz.
    // Public sayfalar genellikle siteData'yı, Admin panelleri adminDraft'ı okur. İkisini de kapsama alıyoruz.
    useStore.setState({ 
      siteData: { settings: { visibility: { creditCard: true } } },
      adminDraft: { settings: { visibility: { creditCard: true } } }
    } as any);
    
    originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });
  });

  afterEach(() => {
    cleanup();
    window.location = originalLocation; // Sızıntı engellendi
    useStore.setState(initialState, true); // Store sıfırlandı
  });

  it('IBAN kopyalama butonu çalıştığında metin "Kopyalandı" olmalı', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(<GiftSection giftData={mockGiftData} />);
    
    const copyBtn = screen.getByRole('button', { name: 'ui.copyIban' });
    fireEvent.click(copyBtn);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ui.copied' })).toBeInTheDocument();
    });
  });

  it('Kredi Kartı butonu tıklandığında prompt açmalı ve Supabase invoke çalışmasını beklemeli', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('500');

    render(<GiftSection giftData={mockGiftData} />);
    
    // Regex'i daha kapsayıcı (geniş) hale getirdik. 
    const creditCardBtn = screen.getByRole('button', { name: /Kredi Kartı/i });
    fireEvent.click(creditCardBtn);

    const { supabase } = await import('../../../supabaseClient');

    await waitFor(() => {
      expect(window.prompt).toHaveBeenCalledTimes(1);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('create-payment', expect.objectContaining({
        body: expect.objectContaining({ amount: 500 })
      }));
      expect(window.location.href).toBe('https://stripe.test');
    });
  });
});