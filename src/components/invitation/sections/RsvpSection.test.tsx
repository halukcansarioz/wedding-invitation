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
    vi.restoreAllMocks();
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
    await waitFor(() => expect(submitButton.disabled).toBe(false));
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitGuest).toHaveBeenCalled();
      expect(screen.getByText('TR00 0000 0000 0000')).toBeTruthy();
    });

    expect(screen.queryByPlaceholderText(/Song Request|Düğünde Çalmasını/)).toBeNull();
    expect(screen.queryByText(/Gelin Tarafı|Damat Tarafı|Mutual/i)).toBeNull();
  }, 10000);

  it('popup içindeki IBAN kopyalama butonu doğru IBANı panoya göndermeli', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { onLine: true, webdriver: false, clipboard: { writeText } });
    const { container } = render(
      <RsvpSection
        {...({
          submitGuest: vi.fn().mockResolvedValue({ id: 'guest-2' }),
          giftData: {
            receiver: 'Test Alıcı',
            bankName: 'Test Bankası',
            iban: 'TR11 2222 3333',
          },
        } as any)}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('form.namePlaceholder'), {
      target: { value: 'Test Davetli' },
    });
    fireEvent.click(screen.getByRole('radio', { name: /Katılamayacağım/i }));
    await waitFor(() =>
      (expect(screen.getByRole('radio', { name: /Katılamayacağım/i })) as any).toHaveAttribute(
        'aria-checked',
        'true'
      )
    );
    fireEvent.click(screen.getByTestId('turnstile-btn'));
    const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    await waitFor(() => expect(submitButton.disabled).toBe(false));
    fireEvent.click(submitButton);

    const copyButton = await screen.findByRole('button', { name: 'ui.copyIban' });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('TR11 2222 3333');
      expect(screen.getByRole('button', { name: 'ui.copied' })).toBeTruthy();
    });
  }, 10000);

  it('popup backdropine veya kapat butonuna tıklanınca IBAN popupını kapatmalı', async () => {
    const { container } = render(
      <RsvpSection
        {...({
          submitGuest: vi.fn().mockResolvedValue({ id: 'guest-3' }),
          giftData: { receiver: 'Alıcı', bankName: 'Banka', iban: 'TR22 3333' },
        } as any)}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('form.namePlaceholder'), {
      target: { value: 'Kapatma Testi' },
    });
    fireEvent.click(screen.getByRole('radio', { name: /Katılamayacağım/i }));
    await waitFor(() =>
      (expect(screen.getByRole('radio', { name: /Katılamayacağım/i })) as any).toHaveAttribute(
        'aria-checked',
        'true'
      )
    );
    fireEvent.click(screen.getByTestId('turnstile-btn'));
    const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    await waitFor(() => expect(submitButton.disabled).toBe(false));
    fireEvent.click(submitButton);

    const closeButton = await screen.findByRole('button', { name: 'ui.closeBtn' });
    fireEvent.click(closeButton);
    await waitFor(() => expect(screen.queryByText('TR22 3333')).toBeNull());
  }, 10000);
});
