import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useStore } from '../useStore';

describe('Zustand uiSlice - Özel Modal Yönetimi', () => {
  let initialState: any;

  beforeEach(() => {
    initialState = useStore.getState();
    useStore.setState({ customConfirm: null, customAlert: null, customPrompt: null });
  });

  afterEach(() => {
    useStore.setState(initialState, true);
  });

  it('showAppConfirm çağrıldığında customConfirm durumunu güncellemeli ve resolve fonksiyonunu tutmalı', async () => {
    const { showAppConfirm } = useStore.getState();
    const confirmPromise = showAppConfirm("Bu işlemi onaylıyor musunuz?", { title: "Onay" });
    const stateAfterCall = useStore.getState();
    expect(stateAfterCall.customConfirm).not.toBeNull();
    expect(stateAfterCall.customConfirm?.message).toBe("Bu işlemi onaylıyor musunuz?");
    expect(stateAfterCall.customConfirm?.title).toBe("Onay");
    if (stateAfterCall.customConfirm?.resolve) {
        stateAfterCall.customConfirm.resolve(true);
    }
    const result = await confirmPromise;
    expect(result).toBe(true);
  });
});
