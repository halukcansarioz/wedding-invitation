import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SecurityTab } from './SecurityTab';
import { useAdminStore } from '../../../store/useAdminStore';
import { useStore } from '../../../store/useStore';

vi.mock('../../../store/useAdminStore');
vi.mock('../../../store/useStore');

describe('SecurityTab Admin Bileşen Testleri', () => {
  it('Form inputlarını ve hata mesajlarını doğru şekilde render etmeli', () => {
    // Store durumunu mockluyoruz
    useAdminStore.mockReturnValue({
      adminCurrentPassword: 'eski', setAdminCurrentPassword: vi.fn(),
      adminNewPassword: 'yeni', setAdminNewPassword: vi.fn(),
      adminNewPasswordAgain: 'yeni', setAdminNewPasswordAgain: vi.fn(),
      adminPasswordMessage: 'Şifreler uyuşmuyor!'
    });
    useStore.mockReturnValue(vi.fn()); // saveSiteContent mock

    const mockChangePassword = vi.fn();
    
    render(<SecurityTab changeAdminPassword={mockChangePassword} isEn={false} />);
    
    // Inputların değerlerinin doğru yansıdığını kontrol et
    expect(screen.getByDisplayValue('eski')).toBeInTheDocument();
    expect(screen.getAllByDisplayValue('yeni')).toHaveLength(2); // 2 adet yeni şifre inputu
    
    // Hata mesajı ekranda olmalı
    expect(screen.getByText('Şifreler uyuşmuyor!')).toBeInTheDocument();

    // Butona tıklandığında fonksiyon tetiklenmeli
    const btn = screen.getByRole('button', { name: /Şifreyi Değiştir/i });
    fireEvent.click(btn);
    expect(mockChangePassword).toHaveBeenCalledTimes(1);
  });
});