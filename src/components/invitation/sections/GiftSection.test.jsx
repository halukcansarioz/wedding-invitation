import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GiftSection } from './GiftSection';
import { useStore } from '../../../store/useStore';

// Framer Motion Mock
vi.mock('framer-motion', () => ({
  m: { section: ({ children, className }) => <section className={className}>{children}</section> }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: 'tr' } })
}));

// Supabase Fonksiyon Mock
vi.mock('../../../supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { paymentUrl: 'https://stripe.test' } })
    }
  }
}));

// Zustand Store Mock
vi.mock('../../../store/useStore');

describe('GiftSection Bileşeni İleri Seviye Testleri', () => {
  const mockGiftData = {
    title: "Hediye & Takı",
    description: "Mutluluğumuzu paylaşmak isterseniz...",
    receiver: "Ahmet Yılmaz",
    iban: "TR000"
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Varsayılan olarak Kredi Kartı butonu aktif
    useStore.mockReturnValue({ visibility: { creditCard: true } });
    
    // window.location modifikasyonu (yönlendirme testi için)
    delete window.location;
    window.location = { href: '' };
  });

  it('IBAN kopyalama butonu çalıştığında metin "Kopyalandı" olmalı', () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue() },
    });

    render(<GiftSection giftData={mockGiftData} />);
    
    const copyBtn = screen.getByRole('button', { name: 'ui.copyIban' });
    fireEvent.click(copyBtn);
    
    expect(screen.getByRole('button', { name: 'ui.copied' })).toBeInTheDocument();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('TR000');
  });

  it('Kredi Kartı butonu tıklandığında prompt açmalı ve Supabase invoke çalıştırmalı', async () => {
    // Kullanıcı prompt'a "500" girdiğini simüle ediyoruz
    vi.spyOn(window, 'prompt').mockReturnValue('500');

    render(<GiftSection giftData={mockGiftData} />);
    
    const creditCardBtn = screen.getByRole('button', { name: /Kredi Kartı ile Gönder/i });
    expect(creditCardBtn).toBeInTheDocument();

    fireEvent.click(creditCardBtn);

    // Prompt çalışmalı
    expect(window.prompt).toHaveBeenCalledTimes(1);

    const { supabase } = await import('../../../supabaseClient');

    // Supabase fonksiyonu doğru payload ile çağrılmalı
    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith('create-payment', expect.objectContaining({
        body: expect.objectContaining({ amount: 500 })
      }));
    });

    // Başarılı dönerse window.location yönlendirmesi yapılmalı
    expect(window.location.href).toBe('https://stripe.test');
  });
});