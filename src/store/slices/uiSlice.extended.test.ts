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
    const promptPromise = showAppPrompt("Lütfen adınızı girin:", "Varsayılan Değer", { title: "Bilgi Girişi" });

    const state = useStore.getState();
    expect(state.customPrompt).not.toBeNull();
    expect(state.customPrompt?.label).toBe("Lütfen adınızı girin:");
    expect(state.customPrompt?.value).toBe("Varsayılan Değer");
    expect(state.customPrompt?.title).toBe("Bilgi Girişi");
    if (state.customPrompt?.resolve) {
      state.customPrompt.resolve("Yeni Girilen Değer");
    }

    const result = await promptPromise;
    expect(result).toBe("Yeni Girilen Değer");
  });

  it('showAppAlert çağrıldığında toast ve gerçek popup durumunu üretmeli', async () => {
    const { showAppAlert } = useStore.getState();

    const alertPromise = showAppAlert("İşlem başarıyla tamamlandı", { title: "Başarılı" });
    const state = useStore.getState();
    expect(state.customAlert?.title).toBe("Başarılı");
    expect(state.customAlert?.message).toBe("İşlem başarıyla tamamlandı");

    state.customAlert?.resolve(true);
    expect(await alertPromise).toBe(true);
  });
});
