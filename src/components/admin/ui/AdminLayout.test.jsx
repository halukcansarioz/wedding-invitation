import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { AdminSection, AdminActionButtons } from './AdminLayout';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('AdminLayout Bileşen Testleri', () => {
  // GÜNCELLENDİ: Testler arası DOM temizliği yapılarak elementlerin üst üste binmesi engellendi
  afterEach(() => {
    cleanup();
  });

  it('AdminSection başlığı ve kaydet butonunu doğru render etmeli', () => {
    const mockSave = vi.fn();
    render(<AdminSection title="Test Bölümü" onSave={mockSave}>İçerik</AdminSection>);
    
    expect(screen.getByText('İçerik')).toBeInTheDocument();

    // GÜNCELLENDİ: Çakışmaları önlemek için getAllByRole kullanıp ilkini ([0]) hedefliyoruz
    const saveBtns = screen.getAllByRole('button', { name: /Kaydet/i });
    fireEvent.click(saveBtns[0]);
    
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('AdminActionButtons eylemleri doğru tetiklemeli', () => {
    const mockSave = vi.fn();
    const mockDelete = vi.fn();
    const mockUp = vi.fn();
    const mockDown = vi.fn();

    render(
      <AdminActionButtons 
        onSave={mockSave} 
        onDelete={mockDelete} 
        onMoveUp={mockUp} 
        onMoveDown={mockDown} 
        isEn={false} 
      />
    );

    // GÜNCELLENDİ: Çoklu buton çakışmalarını önlemek için array'in ilk elemanı tıklanıyor
    const saveBtns = screen.getAllByRole('button', { name: /Kaydet/i });
    fireEvent.click(saveBtns[0]);
    expect(mockSave).toHaveBeenCalledTimes(1);

    const deleteBtns = screen.getAllByRole('button', { name: /Sil/i });
    fireEvent.click(deleteBtns[0]);
    expect(mockDelete).toHaveBeenCalledTimes(1);

    const upBtns = screen.getAllByRole('button', { name: '↑' });
    fireEvent.click(upBtns[0]);
    expect(mockUp).toHaveBeenCalledTimes(1);

    const downBtns = screen.getAllByRole('button', { name: '↓' });
    fireEvent.click(downBtns[0]);
    expect(mockDown).toHaveBeenCalledTimes(1);
  });
});