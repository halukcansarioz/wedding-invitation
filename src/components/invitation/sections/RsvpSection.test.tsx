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
    render(<RsvpSection {...({ submitRsvp: vi.fn() } as any)} />);
    const attendBtn = screen.getAllByRole('radio', { name: /Katılacağım/i })[0];
    fireEvent.click(attendBtn);

    await waitFor(() => {
      const noteInput = screen.getAllByPlaceholderText('form.notePlaceholder')[0];
      expect(noteInput).toBeDefined();
    });
  }, 10000); // CI ortamı için timeout eklendi

  it('Katılamayacağım seçildiğinde durum başarıyla güncellenmeli', async () => {
    render(<RsvpSection {...({ submitRsvp: vi.fn() } as any)} />);

    const declineBtn = screen.getAllByRole('radio', { name: /Katılamayacağım/i })[0];
    fireEvent.click(declineBtn);

    await waitFor(() => {
      (expect(declineBtn) as any).toHaveAttribute('aria-checked', 'true');
    });
  }, 10000);

  it('katılmama gönderiminden sonra IBAN bilgisini doğrudan göstermeli', async () => {
    const submitGuest = vi.fn().mockResolvedValue({ id: 'guest-1' });
    const { container } = render(
      <RsvpSection
        {...({
          submitGuest,
          showIban: true,
          giftData: {
            receiver: 'Test Alıcı',
            bankName: 'Test Bankası',
            iban: 'TR00 0000 0000 0000',
          },
        } as any)}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('form.namePlaceholder'), {
      target: { value: 'Test Davetli' },
    });
    fireEvent.click(screen.getByRole('radio', { name: /Katılamayacağım/i }));
    fireEvent.click(screen.getByTestId('turnstile-btn'));
    const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitGuest).toHaveBeenCalled();
      expect(screen.getByText('TR00 0000 0000 0000')).toBeInTheDocument();
    });

    expect(screen.queryByPlaceholderText(/Song Request|Düğünde Çalmasını/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Gelin Tarafı|Damat Tarafı|Mutual/i)).not.toBeInTheDocument();
  }, 10000);
});