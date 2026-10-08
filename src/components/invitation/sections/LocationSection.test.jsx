import React from 'react';
import { render, screen, fireEvent } from '../../../../tests/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { LocationSection } from './LocationSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('LocationSection Bileşen Testleri', () => {
  const mockInvitation = { venue: "Otel", address: "İstanbul" };

  it('Konuma Git butonuna tıklandığında Navigasyon Modalı açılmalı ve kapatılabilmeli', () => {
    render(<LocationSection invitation={mockInvitation} />);
    
    const mapButtons = screen.getAllByRole('button', { name: 'ui.goToMap' });
    fireEvent.click(mapButtons[0]);

    expect(screen.getByText(/Yandex Navi/i)).toBeInTheDocument();
    
    const closeButton = screen.getByRole('button', { name: 'ui.closeBtn' });
    fireEvent.click(closeButton);
    expect(screen.queryByText(/Yandex Navi/i)).not.toBeInTheDocument();
  });
});