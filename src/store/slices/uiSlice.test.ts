import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useStore } from '../useStore';

describe('Zustand uiSlice - Özel Modal Yönetimi', () => {
  let initialState: any;

  beforeEach(() => {
    // Mevcut (saf) durumu yedekle
    initialState = useStore.getState();
    
    // Test öncesi modal state'lerini temizle (true parametresi OLMADAN sadece güncelleme yapıyoruz)
    useStore.setState({ customConfirm: null, customAlert: null, customPrompt: null });
  });

  afterEach(() => {
    // Sızıntıyı önlemek için store'u varsayılan duruma (Deep Reset) geri çevir
    useStore.setState(initialState, true);
  });

  it('showAppConfirm çağrıldığında customConfirm durumunu güncellemeli ve resolve fonksiyonunu tutmalı', async () => {
    const { showAppConfirm } = useStore.getState();
    
    // Modal'ı çağırıp dönen Promise'i değişkene alıyoruz
    const confirmPromise = showAppConfirm("Bu işlemi onaylıyor musunuz?", { title: "Onay" });
    
    // State güncellendi mi kontrol et
    const stateAfterCall = useStore.getState();
    expect(stateAfterCall.customConfirm).not.toBeNull();
    expect(stateAfterCall.customConfirm?.message).toBe("Bu işlemi onaylıyor musunuz?");
    expect(stateAfterCall.customConfirm?.title).toBe("Onay");
    
    // Modal üzerinden Evet'e basılmış gibi resolve fonksiyonunu manuel tetikle
    if (stateAfterCall.customConfirm?.resolve) {
        stateAfterCall.customConfirm.resolve(true);
    }
    
    // Promise'in beklenen sonucu dönüp dönmediğini test et
    const result = await confirmPromise;
    expect(result).toBe(true);
  });
});