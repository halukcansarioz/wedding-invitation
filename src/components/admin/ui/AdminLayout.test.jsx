import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { AdminSection, AdminActionButtons } from './AdminLayout';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'tr' } })
}));

describe('AdminLayout Bileşen Testleri', () => {
  afterEach(() => {
    cleanup();
  });

  it('AdminSection başlığı ve kaydet butonunu doğru render etmeli', () => {
    const mockSave = vi.fn();
    
    // DOM sızıntılarını önlemek için screen yerine lokal izolasyonlu getByText ve getByRole kullanıyoruz
    const { getByText, getByRole } = render(
      <AdminSection title="Test Bölümü" onSave={mockSave}>İçerik</AdminSection>
    );
    
    expect(getByText('Test Bölümü')).toBeInTheDocument();
    expect(getByText('İçerik')).toBeInTheDocument();

    const saveBtn = getByRole('button', { name: /Kaydet/i });
    fireEvent.click(saveBtn);
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('AdminActionButtons aksiyon butonlarını tetiklemeli', () => {
    const mockDelete = vi.fn();
    
    const { getByRole } = render(<AdminActionButtons onDelete={mockDelete} isEn={false} />);
    
    const deleteBtn = getByRole('button', { name: /Sil/i });
    fireEvent.click(deleteBtn);
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });
});