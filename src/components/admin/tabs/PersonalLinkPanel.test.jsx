import React from 'react';
import { render, screen, fireEvent } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PersonalLinkPanel } from './PersonalLinkPanel';

// react-i18next mock
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('PersonalLinkPanel Bileşen Testleri', () => {
  let mockCopyAdminLink;
  let mockSetPersonalLinkName;

  beforeEach(() => {
    mockCopyAdminLink = vi.fn();
    mockSetPersonalLinkName = vi.fn();
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  it('Davetli adı yazıldığında link üreticiye yansımalı ve kopyalanabilmeli', () => {
    render(
      <PersonalLinkPanel 
        currentShareLink="https://test.com" 
        copyAdminLink={mockCopyAdminLink} 
        personalLinkName="Haluk Can" 
        setPersonalLinkName={mockSetPersonalLinkName} 
      />
    );

    // Üretilen linki kontrol et (boşluklar URL encode olmalı)
    const resultInput = screen.getByDisplayValue('https://test.com/?guest=Haluk%20Can');
    expect(resultInput).toBeInTheDocument();

    // Linki kopyala butonuna bas
    const copyBtn = screen.getByRole('button', { name: /Linki Kopyala/i });
    fireEvent.click(copyBtn);

    expect(mockCopyAdminLink).toHaveBeenCalledWith(
      'https://test.com/?guest=Haluk%20Can', 
      'Akıllı davetiye linki kopyalandı!'
    );
  });

  it('Davetli adı yoksa WhatsApp paylaşım butonu uyarısı çalışmalı', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(
      <PersonalLinkPanel 
        currentShareLink="https://test.com" 
        copyAdminLink={mockCopyAdminLink} 
        personalLinkName="" 
        setPersonalLinkName={mockSetPersonalLinkName} 
      />
    );

    const whatsappBtn = screen.getByRole('button', { name: /WhatsApp ile Gönder/i });
    fireEvent.click(whatsappBtn);

    // İsim olmadığı için alert vermeli
    expect(window.alert).toHaveBeenCalledWith('Lütfen önce bir davetli adı yazın!');
  });
});