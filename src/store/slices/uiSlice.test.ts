import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../useStore';

describe('Zustand uiSlice - Özel Modal Yönetimi', () => {
  
  beforeEach(() => {
    // Test öncesi mağazayı temizle
    useStore.setState({ customConfirm: null, customAlert: null, customPrompt: null });
  });

  it('showAppConfirm çağrıldığında customConfirm durumunu güncellemeli ve resolve fonksiyonunu tutmalı', async () => {
    const { showAppConfirm } = useStore.getState();
    
    // Modal'ı çağırıp dönen Promise'i değişkene alıyoruz (henüz await yapmıyoruz)
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