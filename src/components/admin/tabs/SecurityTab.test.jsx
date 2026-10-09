import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SecurityTab } from './SecurityTab';
import { useAdminStore } from '../../../store/useAdminStore';
import { useStore } from '../../../store/useStore';

describe('SecurityTab Admin Bileşen Testleri', () => {
  let initialAdminState;
  let initialStoreState;

  beforeEach(() => {
    initialAdminState = useAdminStore.getState();
    initialStoreState = useStore.getState();

    // Sadece verileri manipüle et, store fonksiyonlarını ezme
    useAdminStore.setState({
      adminCurrentPassword: 'eski',
      adminNewPassword: 'yeni',
      adminNewPasswordAgain: 'yeni',
      adminPasswordMessage: 'Şifreler uyuşmuyor!'
    });
    
    vi.spyOn(useStore.getState(), 'saveSiteContent').mockResolvedValue(true);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    useAdminStore.setState(initialAdminState, true);
    useStore.setState(initialStoreState, true);
  });

  it('Form inputlarını ve hata mesajlarını doğru şekilde render etmeli', () => {
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