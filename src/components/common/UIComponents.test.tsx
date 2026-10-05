import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OptionGroup, Dropdown } from './UIComponents';

describe('UIComponents Bileşen Testleri', () => {
  it('OptionGroup butonları doğru render etmeli ve tıklandığında onChange tetiklenmeli', () => {
    const mockOnChange = vi.fn();
    const options = [
      { label: 'Seçenek 1', value: '1' },
      { label: 'Seçenek 2', value: '2' }
    ];

    render(<OptionGroup value="1" options={options} onChange={mockOnChange} />);

    // GÜNCELLENDİ: A11y iyileştirmemiz ile rol 'radio' olarak değiştirildi
    const btn2 = screen.getByRole('radio', { name: 'Seçenek 2' });
    fireEvent.click(btn2);

    expect(mockOnChange).toHaveBeenCalledWith('2');
  });

  it('Dropdown tıklandığında menüyü açıp seçenekleri göstermeli', () => {
    const mockOnChange = vi.fn();
    const options = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' }
    ];

    render(<Dropdown value="a" options={options} onChange={mockOnChange} />);

    const dropdownBtn = screen.getByText('A');
    fireEvent.click(dropdownBtn);

    const optionB = screen.getByRole('option', { name: 'B' });
    expect(optionB).toBeInTheDocument();

    fireEvent.click(optionB);
    expect(mockOnChange).toHaveBeenCalledWith('b');
  });
});