import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { RsvpSection } from './RsvpSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'tr' } })
}));

vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({ onSuccess }: any) => {
    return <button data-testid="turnstile-btn" onClick={() => onSuccess('fake-token')}>Token Al</button>;
  }
}));

describe('RsvpSection Koşullu Render (Conditional UI) Testleri', () => {
  afterEach(() => {
    cleanup();
  });

  it('Katılacağım seçeneği aktif olduğunda form alanları görünür olmalı', async () => {
    render(<RsvpSection submitRsvp={vi.fn()} />);

    const attendBtn = screen.getAllByRole('radio', { name: /Katılacağım/i })[0];
    fireEvent.click(attendBtn);

    await waitFor(() => {
      const noteInput = screen.getAllByPlaceholderText('form.notePlaceholder')[0];
      expect(noteInput).toBeInTheDocument();
    });
  }, 10000); // CI ortamı için timeout eklendi

  it('Katılamayacağım seçildiğinde durum başarıyla güncellenmeli', async () => {
    render(<RsvpSection submitRsvp={vi.fn()} />);

    const declineBtn = screen.getAllByRole('radio', { name: /Katılamayacağım/i })[0];
    fireEvent.click(declineBtn);

    await waitFor(() => {
      expect(declineBtn).toHaveAttribute('aria-checked', 'true');
    });
  }, 10000);
});