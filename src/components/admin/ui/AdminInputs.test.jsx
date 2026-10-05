import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdminField, AdminTextarea, AdminCheckbox } from './AdminInputs';

describe('AdminInputs Bileşen Testleri', () => {
  it('AdminField değere göre inputu doldurmalı ve değişimde onChange tetiklemeli', () => {
    const mockOnChange = vi.fn();
    render(<AdminField label="Test Label" value="Test Değer" onChange={mockOnChange} />);
    
    const input = screen.getByDisplayValue('Test Değer');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Yeni Değer' } });
    expect(mockOnChange).toHaveBeenCalledWith('Yeni Değer');
  });

  it('AdminCheckbox işaretlendiğinde doğru değeri iletmeli', () => {
    const mockOnChange = vi.fn();
    render(<AdminCheckbox label="Onay Kutusu" checked={false} onChange={mockOnChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });
});