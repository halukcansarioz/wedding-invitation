import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GlobalModals } from './GlobalModals';

describe('GlobalModals Bileşen Testleri', () => {
  const mockT = (key) => key;

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

    fireEvent.click(cancelButton);
    expect(mockResolve).toHaveBeenCalledWith(false);

    fireEvent.click(yesButton);
    expect(mockResolve).toHaveBeenCalledWith(true);
  });

  it('customAlert backdrop tıklamasında popupı kapatıp true çözümlemeli', () => {
    const resolve = vi.fn();
    const setCustomAlert = vi.fn();
    render(
      <GlobalModals
        customAlert={{ title: 'Bilgi', message: 'İşlem tamamlandı', resolve }}
        setCustomAlert={setCustomAlert}
        t={mockT}
      />
    );

    fireEvent.click(screen.getByRole('dialog'));
    expect(resolve).toHaveBeenCalledWith(true);
    expect(setCustomAlert).toHaveBeenCalledWith(null);
  });

  it('customConfirm backdrop tıklamasında false çözümlemeli', () => {
    const resolve = vi.fn();
    const setCustomConfirm = vi.fn();
    render(
      <GlobalModals
        customConfirm={{ title: 'Onay', message: 'Devam?', resolve }}
        setCustomConfirm={setCustomConfirm}
        t={mockT}
      />
    );

    fireEvent.click(screen.getByRole('dialog'));
    expect(resolve).toHaveBeenCalledWith(false);
    expect(setCustomConfirm).toHaveBeenCalledWith(null);
  });

  it('customPrompt tek satırlı ve çok satırlı girişleri kaydedebilmeli', () => {
    const resolve = vi.fn();
    const setCustomPrompt = vi.fn();
    const { rerender } = render(
      <GlobalModals
        customPrompt={{ title: 'İsim', label: 'Adınız', value: 'Ada', resolve }}
        setCustomPrompt={setCustomPrompt}
        t={mockT}
      />
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Ayşe' } });
    expect(setCustomPrompt).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'ui.save' }));
    expect(resolve).toHaveBeenCalledWith('Ada');

    const multilineResolve = vi.fn();
    rerender(
      <GlobalModals
        customPrompt={{ title: 'Not', label: 'Mesaj', value: 'İlk satır', resolve: multilineResolve, multiline: true }}
        setCustomPrompt={setCustomPrompt}
        t={mockT}
      />
    );
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
    fireEvent.click(screen.getByRole('button', { name: 'ui.cancel' }));
    expect(multilineResolve).toHaveBeenCalledWith(null);
  });

  it('alert, confirm ve prompt aynı anda varsa üçünü de render etmeli', () => {
    render(
      <GlobalModals
        customAlert={{ title: 'Alert', message: 'A', resolve: vi.fn() }}
        setCustomAlert={vi.fn()}
        customConfirm={{ title: 'Confirm', message: 'C', resolve: vi.fn() }}
        setCustomConfirm={vi.fn()}
        customPrompt={{ title: 'Prompt', label: 'P', value: '', resolve: vi.fn() }}
        setCustomPrompt={vi.fn()}
        t={mockT}
      />
    );

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('P')).toBeInTheDocument();
    expect(screen.getAllByRole('dialog')).toHaveLength(3);
  });
});
