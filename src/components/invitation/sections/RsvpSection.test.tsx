import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { RsvpSection } from './RsvpSection';

vi.mock('framer-motion', () => ({
  m: { section: ({ children, className }: any) => <section className={className}>{children}</section> }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'tr' } })
}));

vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({ onSuccess }: any) => {
    return <button data-testid="turnstile-btn" onClick={() => onSuccess('fake-token')}>Token Al</button>;
  }
}));

describe('RsvpSection Koşullu Render (Conditional UI) Testleri', () => {
  // GÜNCELLENDİ: Testler arası DOM'u temizliyoruz ki butonlar üst üste binmesin.
  afterEach(() => {
    cleanup();
  });

  it('Katılacağım seçeneği aktif olduğunda form alanları görünür olmalı', async () => {
    render(<RsvpSection submitRsvp={vi.fn()} />);

    // GÜNCELLENDİ: Olası DOM çakışmalarına karşı getAllByRole kullanıp her zaman ilkini ([0]) hedefliyoruz.
    const attendBtn = screen.getAllByRole('radio', { name: /Katılacağım/i })[0];
    fireEvent.click(attendBtn);

    await waitFor(() => {
      // getByPlaceholderText genelde tektir ama çakışma varsa getAllBy... yapılabilir.
      const noteInput = screen.getAllByPlaceholderText('form.notePlaceholder')[0];
      expect(noteInput).toBeInTheDocument();
    });
  });

  it('Katılamayacağım seçildiğinde durum başarıyla güncellenmeli', async () => {
    render(<RsvpSection submitRsvp={vi.fn()} />);

    const declineBtn = screen.getAllByRole('radio', { name: /Katılamayacağım/i })[0];
    fireEvent.click(declineBtn);

    await waitFor(() => {
      expect(declineBtn).toHaveAttribute('aria-checked', 'true');
    });
  });
});