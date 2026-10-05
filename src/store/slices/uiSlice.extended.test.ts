import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useStore } from '../useStore';

describe('Zustand uiSlice Gelişmiş Kapsamlı Testleri', () => {
  let initialState: any;

  beforeEach(() => {
    initialState = useStore.getState();
    useStore.setState({ customAlert: null, customPrompt: null, customConfirm: null });
  });

  afterEach(() => {
    useStore.setState(initialState, true);
  });

  it('showAppPrompt çağrıldığında customPrompt durumunu doğru set etmeli ve değer döndürmeli', async () => {
    const { showAppPrompt } = useStore.getState();

    // Prompt modalını tetikle
    const promptPromise = showAppPrompt("Lütfen adınızı girin:", "Varsayılan Değer", { title: "Bilgi Girişi" });

    const state = useStore.getState();
    expect(state.customPrompt).not.toBeNull();
    expect(state.customPrompt?.label).toBe("Lütfen adınızı girin:");
    expect(state.customPrompt?.value).toBe("Varsayılan Değer");
    expect(state.customPrompt?.title).toBe("Bilgi Girişi");

    // Kullanıcı giriş yapıp kaydettiğinde (resolve)
    if (state.customPrompt?.resolve) {
      state.customPrompt.resolve("Yeni Girilen Değer");
    }

    const result = await promptPromise;
    expect(result).toBe("Yeni Girilen Değer");
  });

  it('showAppAlert çağrıldığında toast bildirimini tetiklemeli ve başarılı dönmeli', async () => {
    const { showAppAlert } = useStore.getState();

    const alertPromise = showAppAlert("İşlem başarıyla tamamlandı", { title: "Başarılı" });
    const result = await alertPromise;

    expect(result).toBe(true);
  });
});