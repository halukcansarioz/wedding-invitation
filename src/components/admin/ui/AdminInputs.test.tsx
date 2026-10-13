import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { AdminField, AdminCheckbox } from './AdminInputs';

describe('AdminInputs Bileşen Testleri', () => {
  it('AdminField değere göre inputu doldurmalı ve değişimde onChange tetiklemeli', () => {
    const mockOnChange = vi.fn();
    render(<AdminField label="Test Label" value="Test Değer" onChange={mockOnChange} />);
    
    const input = screen.getByDisplayValue('Test Değer');
    // TS-2339 hatasını önlemek için toBeInTheDocument yerine toBeDefined kullanıldı
    expect(input).toBeDefined();

    fireEvent.change(input, { target: { value: 'Yeni Değer' } });
    expect(mockOnChange).toHaveBeenCalledWith('Yeni Değer');
  });

  it('AdminCheckbox işaretlendiğinde doğru değeri iletmeli', () => {
    const mockOnChange = vi.fn();
    render(<AdminCheckbox label="Onay Kutusu" checked={false} onChange={mockOnChange} />);
    
    // Elementi HTMLInputElement olarak cast edip native checked özelliğini kontrol ediyoruz
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });
});