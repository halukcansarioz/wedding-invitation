import React from 'react';
import { render, screen, fireEvent } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PersonalLinkPanel } from './PersonalLinkPanel';

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

    // getAllByRole kullanarak birden fazla WhatsApp butonu çakışmasını önlüyoruz
    const whatsappBtns = screen.getAllByRole('button', { name: /WhatsApp ile Gönder/i });
    fireEvent.click(whatsappBtns[0]);

    expect(window.alert).toHaveBeenCalledWith('Lütfen önce bir davetli adı yazın!');
  });
});