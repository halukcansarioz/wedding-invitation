import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RsvpSection } from './RsvpSection';

vi.mock('framer-motion', () => ({ m: { section: ({ children, className }) => <section className={className}>{children}</section> } }));
// HTML varsayılan <button> (type="submit") davranışını engellemek için mock'a type="button" eklendi
vi.mock('@marsidev/react-turnstile', () => ({ Turnstile: ({ onSuccess }) => <button type="button" onClick={() => onSuccess('fake-token')}>Ben Robot Değilim</button> }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } }) }));

describe('RsvpSection Bileşen Testleri', () => {
  const mockSubmitRsvp = vi.fn();
  
  beforeEach(() => { 
    vi.clearAllMocks(); 
  });

  afterEach(() => {
    cleanup();
  });

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
    
    const turnstileBtn = screen.getByRole('button', { name: 'Ben Robot Değilim' });
    fireEvent.click(turnstileBtn);

    const submitBtn = screen.getByRole('button', { name: 'form.submitRsvp' });
    
    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('form.missingNameMessage')).toBeInTheDocument();
    });
  });

  it('Form başarıyla doldurulup gönderildiğinde submit fonksiyonu çağrılmalı', async () => {
    render(<RsvpSection submitRsvp={mockSubmitRsvp} />);
    
    fireEvent.change(screen.getByPlaceholderText('form.namePlaceholder'), { target: { value: 'Ali Veli' } });

    const turnstileBtn = screen.getByRole('button', { name: 'Ben Robot Değilim' });
    fireEvent.click(turnstileBtn);

    const submitBtn = screen.getByRole('button', { name: 'form.submitRsvp' });
    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmitRsvp).toHaveBeenCalled();
    });
  });
});