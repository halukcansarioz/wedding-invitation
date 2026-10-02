import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RsvpSection } from './RsvpSection';

vi.mock('framer-motion', () => ({ m: { section: ({ children }) => <section>{children}</section> } }));
vi.mock('@marsidev/react-turnstile', () => ({ Turnstile: ({ onSuccess }) => <button type="button" onClick={() => onSuccess('fake-token')}>Robot Değilim</button> }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } }) }));

describe('RsvpSection Koşullu Render (Conditional UI) Testleri', () => {
  afterEach(() => cleanup());

  it('Katılamayacağım seçildiğinde gereksiz detay alanları (Kişi Sayısı, Yakınlık, Çocuk) gizlenmeli', () => {
    render(<RsvpSection submitGuest={vi.fn()} />);
    
    // Varsayılan olarak "Katılacağım" seçili olduğu için detaylar görünür olmalı
    expect(screen.getByText('2 Kişi')).toBeInTheDocument();
    expect(screen.getByText('Gelin Tarafı')).toBeInTheDocument();

    // "Katılamayacağım" butonuna tıkla
    const declineButton = screen.getByRole('button', { name: 'Katılamayacağım' });
    fireEvent.click(declineButton);

    // Detay alanları DOM'dan tamamen kaldırılmış olmalı
    expect(screen.queryByText('2 Kişi')).not.toBeInTheDocument();
    expect(screen.queryByText('Gelin Tarafı')).not.toBeInTheDocument();
    expect(screen.queryByText('Evet (Çocuk var)')).not.toBeInTheDocument();
  });

  it('Tekrar Katılacağım seçilirse detay alanları geri gelmeli', () => {
    render(<RsvpSection submitGuest={vi.fn()} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Katılamayacağım' }));
    expect(screen.queryByText('2 Kişi')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Katılacağım' }));
    expect(screen.getByText('2 Kişi')).toBeInTheDocument();
  });
});