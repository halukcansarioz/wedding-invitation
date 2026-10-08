import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GiftSection } from './GiftSection';
import { useStore } from '../../../store/useStore';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'tr' } })
}));

vi.mock('../../../supabaseClient', () => ({
  supabase: {
    functions: { invoke: vi.fn().mockResolvedValue({ data: { paymentUrl: 'https://stripe.test' } }) }
  }
}));

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
    (useStore as any).mockReturnValue({ visibility: { creditCard: true } });
    
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });
  });

  afterEach(() => {
    cleanup();
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
    
    const creditCardBtn = screen.getByRole('button', { name: /Kredi Kartı ile Gönder/i });
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