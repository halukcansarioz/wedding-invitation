import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RsvpSection } from './RsvpSection';

vi.mock('framer-motion', () => ({ m: { section: ({ children, className }) => <section className={className}>{children}</section> } }));
vi.mock('@marsidev/react-turnstile', () => ({ Turnstile: ({ onSuccess }) => <button onClick={() => onSuccess('fake-token')}>Ben Robot Değilim</button> }));
// i18n mock eklendi
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } }) }));

describe('RsvpSection Bileşen Testleri', () => {
  const mockSubmitRsvp = vi.fn();
  beforeEach(() => { vi.clearAllMocks(); });

  it('Varsayılan olarak Katılacağım seçili gelmeli', () => {
    render(<RsvpSection submitRsvp={mockSubmitRsvp} />);
    const attendButton = screen.getByRole('button', { name: 'Katılacağım' });
    expect(attendButton).toHaveClass('active');
  });

  it('Katılamayacağım seçildiğinde detay alanları DOM\'dan gizlenmeli', () => {
    render(<RsvpSection submitRsvp={mockSubmitRsvp} />);
    const notAttendButton = screen.getByRole('button', { name: 'Katılamayacağım' });
    fireEvent.click(notAttendButton);
    expect(screen.queryByText('1 Kişi')).not.toBeInTheDocument();
  });

  it('Zorunlu alanlar doldurulmadan gönderilirse Zod hatası çıkmalı', async () => {
    render(<RsvpSection submitRsvp={mockSubmitRsvp} />);
    const submitBtn = screen.getByRole('button', { name: 'form.submitRsvp' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('form.missingNameMessage')).toBeInTheDocument();
    });
  });
});