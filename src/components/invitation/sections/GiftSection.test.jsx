import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GiftSection } from './GiftSection';

// Framer Motion Mock (React uyarılarını önlemek için animasyon proplarını filtreler)
vi.mock('framer-motion', () => ({
  m: {
    section: ({ children, initial, whileInView, viewport, variants, transition, ...props }) => (
      <section {...props}>{children}</section>
    ),
    div: ({ children, initial, whileInView, viewport, variants, transition, ...props }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

// i18next Mock
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'tr' }
  }),
}));

describe('GiftSection Bileşeni', () => {
  const mockGiftData = {
    title: "Hediye & Takı",
    description: "Mutluluğumuzu paylaşmak isterseniz...",
    receiver: "Ahmet Yılmaz",
    bankName: "Garanti BBVA",
    iban: "TR00 0000 0000 0000 0000 0000 00"
  };

  it('giftData yoksa hiçbir şey render etmemeli', () => {
    const { container } = render(<GiftSection giftData={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('banka ve IBAN bilgilerini doğru şekilde ekranda göstermeli', () => {
    render(<GiftSection giftData={mockGiftData} />);
    
    expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    expect(screen.getByText('Garanti BBVA')).toBeInTheDocument();
    expect(screen.getByText('TR00 0000 0000 0000 0000 0000 00')).toBeInTheDocument();
  });

  it('Kopyala butonuna basıldığında metin değişmeli', () => {
    // navigator.clipboard.writeText mock'laması
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    render(<GiftSection giftData={mockGiftData} />);
    
    const copyBtn = screen.getByText('ui.copyIban');
    fireEvent.click(copyBtn);
    
    // Kopyalandıktan sonra buton metni değişmeli
    expect(screen.getByText('ui.copied')).toBeInTheDocument();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockGiftData.iban);
  });
});