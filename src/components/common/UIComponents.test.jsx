import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { OptionGroup, Dropdown } from './UIComponents';

describe('UIComponents Bileşen Testleri', () => {
  afterEach(() => {
    cleanup(); // Testler arası DOM temizliği
    vi.clearAllMocks();
  });

  describe('OptionGroup Bileşeni', () => {
    const options = [
      { label: 'Evet', value: 'yes' },
      { label: 'Hayır', value: 'no' }
    ];

    it('seçenekleri doğru render etmeli ve tıklamayı algılamalı', () => {
      const mockOnChange = vi.fn();
      render(<OptionGroup value="no" options={options} onChange={mockOnChange} />);
      
      const yesButton = screen.getByText('Evet');
      const noButton = screen.getByText('Hayır');

      expect(yesButton).toBeInTheDocument();
      expect(noButton).toBeInTheDocument();
      
      expect(noButton).toHaveClass('active');
      expect(yesButton).not.toHaveClass('active');

      fireEvent.click(yesButton);
      expect(mockOnChange).toHaveBeenCalledWith('yes');
    });

    it('disabled (devre dışı) durumundayken tıklamaları engellemeli', () => {
      const mockOnChange = vi.fn();
      render(<OptionGroup value="no" options={options} onChange={mockOnChange} disabled={true} />);
      
      const yesButton = screen.getByText('Evet');
      fireEvent.click(yesButton);
      
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Dropdown Bileşeni', () => {
    const options = [
      { label: 'Seçenek 1', value: '1' },
      { label: 'Seçenek 2', value: '2' }
    ];

    it('tıklandığında menüyü açmalı ve seçim yapabilmeli', () => {
      const mockOnChange = vi.fn();
      render(<Dropdown value="1" options={options} onChange={mockOnChange} placeholder="Seçiniz" />);
      
      const dropdownButton = screen.getByText('Seçenek 1');
      fireEvent.click(dropdownButton);
      
      const option2 = screen.getByText('Seçenek 2');
      expect(option2).toBeVisible();
      fireEvent.click(option2);
      
      expect(mockOnChange).toHaveBeenCalledWith('2');
    });
  });
});