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
    
    const btn2 = screen.getByRole('button', { name: 'Seçenek 2' });
    fireEvent.click(btn2);

    expect(mockOnChange).toHaveBeenCalledWith('2');
  });

  it('Dropdown tıklandığında menüyü açıp seçenekleri göstermeli', () => {
    const mockOnChange = vi.fn();
    const options = [
      { label: 'Elma', value: 'apple' },
      { label: 'Armut', value: 'pear' }
    ];

    const { container } = render(<Dropdown value="apple" options={options} onChange={mockOnChange} />);
    
    // Global document araması yerine izolasyonlu container kullanılıyor
    const dropdownBtn = container.querySelector('.admin-custom-select-button');
    fireEvent.click(dropdownBtn);

    expect(screen.getByText('Armut')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Armut'));
    expect(mockOnChange).toHaveBeenCalledWith('pear');
  });
});