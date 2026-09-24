import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CountdownSection } from './CountdownSection';

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

// i18next mock (Dil çevirilerini simüle eder)
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'tr' }
  }),
}));

describe('CountdownSection Bileşeni', () => {
  const mockCopy = {
    countdownLabel: "Geri Sayım",
    countdownTitle: "Düğünümüze Kalan Süre"
  };

  it('zaman varken sayacı doğru şekilde render etmeli', () => {
    const mockTimeLeft = { days: 10, hours: 5, minutes: 30, seconds: 15 };
    
    render(<CountdownSection copy={mockCopy} timeLeft={mockTimeLeft} />);
    
    expect(screen.getByText('10')).toBeInTheDocument(); 
    expect(screen.getByText('5')).toBeInTheDocument();  
    expect(screen.getByText('Düğünümüze Kalan Süre')).toBeInTheDocument();
  });

  it('zaman dolduğunda kutlama mesajını göstermeli', () => {
    const mockFinishedTime = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    render(<CountdownSection copy={mockCopy} timeLeft={mockFinishedTime} />);
    
    expect(screen.getByText('Bugün En Mutlu Günümüz!')).toBeInTheDocument();
    expect(screen.queryByText('ui.days')).not.toBeInTheDocument();
  });
});