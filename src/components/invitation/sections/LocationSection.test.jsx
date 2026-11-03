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

  it('modal açıldığında kapatma düğmesine odaklanır ve Escape ile kapanır', () => {
    render(<LocationSection invitation={mockInvitation} />);

    fireEvent.click(screen.getByRole('button', { name: 'ui.goToMap' }));

    const dialog = screen.getByRole('dialog');
    const closeButton = screen.getByRole('button', { name: 'ui.closeBtn' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
