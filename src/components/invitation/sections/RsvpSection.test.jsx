import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RsvpSection } from './RsvpSection';

vi.mock('framer-motion', () => ({
  m: { section: ({ children }) => <section>{children}</section> }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('RsvpSection Koşullu Render (Conditional UI) Testleri', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('Katılacağım seçeneği aktif olduğunda form alanları görünür olmalı', () => {
    render(<RsvpSection submitRsvp={vi.fn()} />);
    
    const attendBtn = screen.getByRole('button', { name: /Katılacağım/i });
    fireEvent.click(attendBtn);

    expect(screen.getByPlaceholderText(/form.namePlaceholder/i)).toBeInTheDocument();
  });

  it('Katılamayacağım seçildiğinde durum başarıyla güncellenmeli', () => {
    render(<RsvpSection submitRsvp={vi.fn()} />);
    
    const declineBtn = screen.getByRole('button', { name: /Katılamayacağım/i });
    fireEvent.click(declineBtn);

    expect(declineBtn).toHaveClass('active');
  });
});