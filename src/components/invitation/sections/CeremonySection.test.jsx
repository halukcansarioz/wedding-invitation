import React from 'react';
import { render, screen } from '../../../../tests/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { CeremonySection } from './CeremonySection';

vi.mock('framer-motion', () => ({
  m: { section: ({ children }) => <section>{children}</section> }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('CeremonySection Bileşen Testleri', () => {
  const mockEventDetails = [
    { label: "Nikah Töreni", time: "19:00", location: "Kır Bahçesi", description: "Bekleriz" },
    { label: "After Party", time: "23:00", location: "Kulüp", description: "Eğlence" }
  ];

  it('Gönderilen etkinlik detaylarını doğru formatta listelemeli', () => {
    render(<CeremonySection eventDetails={mockEventDetails} />);
    
    expect(screen.getByText('Nikah Töreni')).toBeInTheDocument();
    expect(screen.getByText('19:00')).toBeInTheDocument();
    expect(screen.getByText('Kır Bahçesi')).toBeInTheDocument();

    expect(screen.getByText('After Party')).toBeInTheDocument();
    expect(screen.getByText('23:00')).toBeInTheDocument();
  });

  it('eventDetails undefined veya null ise hatasız render olmalı', () => {
    const { container } = render(<CeremonySection eventDetails={undefined} />);
    expect(container.querySelector('.ceremony-card')).toBeInTheDocument();
  });
});