import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdminField, AdminCheckbox, AdminTextarea } from './AdminInputs';

describe('AdminInputs Bileşen Testleri', () => {
  
  it('AdminField bileşeni değeri göstermeli ve değişiklikleri (onChange) iletmeli', () => {
    const handleChange = vi.fn();
    render(<AdminField label="Gelin Adı" value="Hande" onChange={handleChange} placeholder="İsim" />);

    // Label ve değerin ekranda olduğunu onayla
    expect(screen.getByText('Gelin Adı')).toBeInTheDocument();
    const input = screen.getByDisplayValue('Hande');
    expect(input).toBeInTheDocument();

    // Kullanıcı yazıyormuş gibi simüle et
    fireEvent.change(input, { target: { value: 'Handenur' } });
    
    // onChange fonksiyonuna doğru değer gitti mi?
    expect(handleChange).toHaveBeenCalledWith('Handenur');
  });

  it('AdminTextarea bileşeni çok satırlı metinleri doğru iletmeli', () => {
    const handleChange = vi.fn();
    render(<AdminTextarea label="Açıklama" value="Eski not" onChange={handleChange} />);

    const textarea = screen.getByDisplayValue('Eski not');
    fireEvent.change(textarea, { target: { value: 'Yeni çok satırlı not' } });
    
    expect(handleChange).toHaveBeenCalledWith('Yeni çok satırlı not');
  });

  it('AdminCheckbox bileşeni checked (işaretli) durumunu tersine çevirebilmeli', () => {
    const handleChange = vi.fn();
    render(<AdminCheckbox label="Geri Sayımı Göster" checked={true} onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();

    // Tıkla ve işareti kaldır
    fireEvent.click(checkbox);
    
    // true olan değer false olarak iletilmeli
    expect(handleChange).toHaveBeenCalledWith(false);
  });
});