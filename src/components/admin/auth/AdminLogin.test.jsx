import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AdminLogin } from './AdminLogin';
import { useAdminStore } from '../../../store/useAdminStore';

describe('AdminLogin Bileşen Testleri', () => {
  let initialAdminState;
  let mockSetShowForgotPassword;
  let mockSetAdminError;

  beforeEach(() => {
    initialAdminState = useAdminStore.getState();
    
    // Verileri sıfırla ama store fonksiyonlarını YAKMA
    useAdminStore.setState({
      isPasswordRecovery: false,
      showForgotPassword: false,
      adminEmail: '',
      adminPassword: '',
      adminAuthLoading: false,
      adminError: ''
    });

    // İzlenmesi gerekenleri spyOn ile bağla
    mockSetShowForgotPassword = vi.spyOn(useAdminStore.getState(), 'setShowForgotPassword');
    mockSetAdminError = vi.spyOn(useAdminStore.getState(), 'setAdminError');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    useAdminStore.setState(initialAdminState, true); // Orijinal duruma getir
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

    expect(mockSetShowForgotPassword).toHaveBeenCalledWith(true);
    expect(mockSetAdminError).toHaveBeenCalledWith('');
  });

  it('showForgotPassword true olduğunda Kurtarma E-postası formunu göstermeli', () => {
    useAdminStore.setState({ showForgotPassword: true });
    
    render(<AdminLogin isEn={false} sendPasswordResetEmail={vi.fn()} />);
    
    expect(screen.queryByPlaceholderText('Admin şifresi')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sıfırlama Linki Gönder/i })).toBeInTheDocument();
  });
});