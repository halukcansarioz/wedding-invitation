import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useStore } from '../useStore';

describe('Zustand adminDraftSlice Testleri', () => {
  let initialState: any;

  beforeEach(() => {
    // Mevcut (saf) durumu yedekle
    initialState = useStore.getState();

    // Her testten önce admin taslağını (draft) varsayılan verilerle sıfırla
    useStore.setState({
      adminDraft: {
        settings: { theme: 'lavanta' },
        scheduleItems: [
          { time: '18:00', title: 'Karşılama', description: 'Giriş' },
          { time: '19:00', title: 'Nikah', description: 'Evet!' }
        ]
      } as any
    });
  });

  afterEach(() => {
    // Sızıntıyı önlemek için store'u varsayılan duruma (Deep Reset) geri çevir
    useStore.setState(initialState, true);
  });

  it('updateDraftObject ile iç içe objeler doğru güncellenmeli', () => {
    const { updateDraftObject } = useStore.getState();
    
    updateDraftObject('settings', 'theme', 'dark');
    
    const { adminDraft } = useStore.getState();
    expect(adminDraft.settings.theme).toBe('dark');
  });

  it('addDraftArrayItem ile diziye yeni eleman eklenmeli', () => {
    const { addDraftArrayItem } = useStore.getState();
    
    addDraftArrayItem('scheduleItems', { time: '20:00', title: 'Yemek', description: 'Ziyafet' });
    
    const { adminDraft } = useStore.getState();
    expect(adminDraft.scheduleItems).toHaveLength(3);
    expect(adminDraft.scheduleItems[2].title).toBe('Yemek');
  });

  it('removeDraftArrayItem ile diziden doğru eleman silinmeli', () => {
    const { removeDraftArrayItem } = useStore.getState();
    
    // 0. indexteki "Karşılama"yı sil
    removeDraftArrayItem('scheduleItems', 0);
    
    const { adminDraft } = useStore.getState();
    expect(adminDraft.scheduleItems).toHaveLength(1);
    expect(adminDraft.scheduleItems[0].title).toBe('Nikah');
  });

  it('moveDraftArrayItem ile elemanların sırası (yukarı/aşağı) değiştirilebilmeli', () => {
    const { moveDraftArrayItem } = useStore.getState();
    
    // 1. indexteki "Nikah"ı 1 birim yukarı (-1) taşı (Yani 0. indexe al)
    moveDraftArrayItem('scheduleItems', 1, -1);
    
    const { adminDraft } = useStore.getState();
    expect(adminDraft.scheduleItems[0].title).toBe('Nikah');
    expect(adminDraft.scheduleItems[1].title).toBe('Karşılama');
  });
});