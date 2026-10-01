import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AdminLogin } from './AdminLogin';
import { useAdminStore } from '../../../store/useAdminStore';

// Zustand Store'u Mockluyoruz
vi.mock('../../../store/useAdminStore');

describe('AdminLogin Bileşen Testleri', () => {
  let mockStore;

  beforeEach(() => {
    mockStore = {
      isPasswordRecovery: false,
      showForgotPassword: false,
      adminEmail: '',
      adminPassword: '',
      adminAuthLoading: false,
      setAdminEmail: vi.fn(),
      setAdminPassword: vi.fn(),
      setShowForgotPassword: vi.fn(),
      setForgotPasswordEmail: vi.fn(),
      setAdminError: vi.fn(),
      setAdminLoginNotice: vi.fn(),
    };
    useAdminStore.mockReturnValue(mockStore);
  });

  afterEach(() => {
    cleanup(); // Testler arası DOM temizliği
    vi.clearAllMocks();
  });

  it('Varsayılan durumda standart giriş (Login) formunu göstermeli', () => {
    render(<AdminLogin isEn={false} submitAdminPassword={vi.fn()} />);
    
    expect(screen.getByPlaceholderText('Admin e-posta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Admin şifresi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Giriş Yap/i })).toBeInTheDocument();
  });

  it('Şifremi unuttum linkine tıklandığında store durumunu güncellemeli', () => {
    render(<AdminLogin isEn={false} submitAdminPassword={vi.fn()} />);
    
    const forgotBtn = screen.getByRole('button', { name: /Şifremi unuttum/i });
    fireEvent.click(forgotBtn);

    expect(mockStore.setShowForgotPassword).toHaveBeenCalledWith(true);
    expect(mockStore.setAdminError).toHaveBeenCalledWith('');
  });

  it('showForgotPassword true olduğunda Kurtarma E-postası formunu göstermeli', () => {
    useAdminStore.mockReturnValue({ ...mockStore, showForgotPassword: true });
    
    render(<AdminLogin isEn={false} sendPasswordResetEmail={vi.fn()} />);
    
    expect(screen.queryByPlaceholderText('Admin şifresi')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sıfırlama Linki Gönder/i })).toBeInTheDocument();
  });
});