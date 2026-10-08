import React from 'react';
import { render, screen, fireEvent } from '../../../../tests/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { SecurityTab } from './SecurityTab';
import { useAdminStore } from '../../../store/useAdminStore';
import { useStore } from '../../../store/useStore';

vi.mock('../../../store/useAdminStore');
vi.mock('../../../store/useStore');

describe('SecurityTab Admin Bileşen Testleri', () => {
  it('Form inputlarını ve hata mesajlarını doğru şekilde render etmeli', () => {
    useAdminStore.mockReturnValue({
      adminCurrentPassword: 'eski', setAdminCurrentPassword: vi.fn(),
      adminNewPassword: 'yeni', setAdminNewPassword: vi.fn(),
      adminNewPasswordAgain: 'yeni', setAdminNewPasswordAgain: vi.fn(),
      adminPasswordMessage: 'Şifreler uyuşmuyor!'
    });
    
    useStore.mockImplementation((selector) => selector({
      saveSiteContent: vi.fn()
    }));

    const mockChangePassword = vi.fn();
    
    render(<SecurityTab changeAdminPassword={mockChangePassword} isEn={false} />);
    
    expect(screen.getByDisplayValue('eski')).toBeInTheDocument();
    expect(screen.getAllByDisplayValue('yeni')).toHaveLength(2);
    
    expect(screen.getByText('Şifreler uyuşmuyor!')).toBeInTheDocument();

    const btn = screen.getByRole('button', { name: /Şifreyi Değiştir/i });
    fireEvent.click(btn);
    expect(mockChangePassword).toHaveBeenCalledTimes(1);
  });
});