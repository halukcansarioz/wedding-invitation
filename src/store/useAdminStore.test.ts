import { describe, it, expect, beforeEach } from 'vitest';
import { useAdminStore } from './useAdminStore';

describe('Zustand useAdminStore Testleri', () => {
  beforeEach(() => {
    // Her testten önce auth state'i tamamen sıfırla
    useAdminStore.getState().clearAdminAuth();
  });

  it('setAdminEmail ve setAdminPassword durumları doğru şekilde güncellemeli', () => {
    const { setAdminEmail, setAdminPassword } = useAdminStore.getState();
    
    setAdminEmail('test@admin.com');
    setAdminPassword('123456');

    expect(useAdminStore.getState().adminEmail).toBe('test@admin.com');
    expect(useAdminStore.getState().adminPassword).toBe('123456');
  });

  it('clearAdminAuth çağrıldığında hassas güvenlik verileri sıfırlanmalı', () => {
    const store = useAdminStore.getState();
    
    // Rastgele durumlar ata
    store.setIsAdminUnlocked(true);
    store.setAdminPassword('gizli-sifre-123');
    store.setAdminError('Hatalı giriş');
    store.setAdminNewPassword('yeni-sifre');

    // Temizle
    useAdminStore.getState().clearAdminAuth();

    const clearedStore = useAdminStore.getState();
    
    // Güvenlik riski oluşturacak verilerin silindiğinden emin ol
    expect(clearedStore.isAdminUnlocked).toBe(false);
    expect(clearedStore.adminPassword).toBe('');
    expect(clearedStore.adminError).toBe('');
    expect(clearedStore.adminNewPassword).toBe('');
  });

  it('Şifre kurtarma (Recovery) akış durumları başarıyla set edilebilmeli', () => {
    const store = useAdminStore.getState();
    
    store.setIsPasswordRecovery(true);
    store.setRecoveryPassword('yeni123');
    
    expect(useAdminStore.getState().isPasswordRecovery).toBe(true);
    expect(useAdminStore.getState().recoveryPassword).toBe('yeni123');
  });
});