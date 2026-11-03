import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { AdminSection, AdminActionButtons } from './AdminLayout';
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'tr' } })
}));

describe('AdminLayout Bileşenleri Testleri', () => {

  afterEach(() => {
    cleanup(); // Testler arası DOM temizliği[cite: 1]
  });

  it('AdminSection başlığı ve çocuk elemanları doğru render etmeli', () => {
    const mockOnSave = vi.fn();
    const { container } = render(
      <AdminSection title="Test Başlığı" onSave={mockOnSave}>
        <div data-testid="child-element">İçerik</div>
      </AdminSection>
    );

    expect(screen.getByText('Test Başlığı')).toBeInTheDocument();
    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    const saveBtn = container.querySelector('.admin-editor-section button');
    expect(saveBtn).toBeInTheDocument();

    fireEvent.click(saveBtn);
    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });

  it('AdminActionButtons sağlanan proplara göre butonları oluşturmalı ve tetiklemeli', () => {
    const mockMoveUp = vi.fn();
    const mockMoveDown = vi.fn();
    const mockDelete = vi.fn();

    const { container } = render(
      <AdminActionButtons
        onMoveUp={mockMoveUp}
        onMoveDown={mockMoveDown}
        onDelete={mockDelete}
        isEn={false}
      />
    );
    const saveButtonQuery = Array.from(container.querySelectorAll('button')).find(btn => btn.textContent.includes('Kaydet'));
    expect(saveButtonQuery).toBeUndefined();

    const btnUp = screen.getByTitle('Yukarı Taşı');
    const btnDown = screen.getByTitle('Aşağı Taşı');
    const btnDelete = screen.getByRole('button', { name: /Sil 🗑️/i });

    fireEvent.click(btnUp);
    fireEvent.click(btnDown);
    fireEvent.click(btnDelete);

    expect(mockMoveUp).toHaveBeenCalledTimes(1);
    expect(mockMoveDown).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });
});
