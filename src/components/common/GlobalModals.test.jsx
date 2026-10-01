import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GlobalModals } from './GlobalModals';

describe('GlobalModals Bileşen Testleri', () => {
  const mockT = (key) => key; // i18n t() fonksiyonu simülasyonu

  it('customAlert tetiklendiğinde Alert modalını göstermeli ve Onaylanabilmeli', () => {
    const mockResolve = vi.fn();
    const mockSetCustomAlert = vi.fn();
    
    const alertData = {
      title: 'Hata',
      message: 'Bir şeyler ters gitti!',
      resolve: mockResolve
    };

    render(<GlobalModals customAlert={alertData} setCustomAlert={mockSetCustomAlert} t={mockT} />);

    expect(screen.getByText('Hata')).toBeInTheDocument();
    expect(screen.getByText('Bir şeyler ters gitti!')).toBeInTheDocument();

    const okButton = screen.getByRole('button', { name: 'ui.ok' });
    fireEvent.click(okButton);

    expect(mockResolve).toHaveBeenCalledWith(true);
    expect(mockSetCustomAlert).toHaveBeenCalledWith(null);
  });

  it('customConfirm tetiklendiğinde Evet/Hayır seçeneklerini doğru çözümlemeli', () => {
    const mockResolve = vi.fn();
    const mockSetCustomConfirm = vi.fn();
    
    const confirmData = {
      title: 'Silme Onayı',
      message: 'Emin misiniz?',
      resolve: mockResolve
    };

    render(<GlobalModals customConfirm={confirmData} setCustomConfirm={mockSetCustomConfirm} t={mockT} />);

    const yesButton = screen.getByRole('button', { name: 'ui.yes' });
    const cancelButton = screen.getByRole('button', { name: 'ui.cancel' });

    // İptal'e basıldığında false dönmeli
    fireEvent.click(cancelButton);
    expect(mockResolve).toHaveBeenCalledWith(false);

    // Evet'e basıldığında true dönmeli
    fireEvent.click(yesButton);
    expect(mockResolve).toHaveBeenCalledWith(true);
  });
});