import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';
import { DEFAULT_SITE_DATA } from '../config/constants';

describe('useStore Zustand Durum Yönetimi', () => {
  
  // Her testten önce state'i varsayılana sıfırla
  beforeEach(() => {
    useStore.setState({
      opened: false,
      adminDraft: { ...DEFAULT_SITE_DATA },
      guests: []
    });
  });

  it('setOpened çağrıldığında opened durumu güncellenmeli', () => {
    const { setOpened } = useStore.getState();
    
    expect(useStore.getState().opened).toBe(false);
    
    setOpened(true);
    
    expect(useStore.getState().opened).toBe(true);
  });

  it('updateDraftObject ile iç içe geçmiş objeler başarıyla güncellenmeli', () => {
    const { updateDraftObject } = useStore.getState();
    
    // Varsayılan gelini kontrol et
    expect(useStore.getState().adminDraft.invitation.bride).toBe("Handenur");
    
    // Değeri güncelle
    updateDraftObject("invitation", "bride", "Ayşe");
    
    // Güncellendiğini doğrula
    expect(useStore.getState().adminDraft.invitation.bride).toBe("Ayşe");
    // Diğer verilerin bozulmadığından emin ol
    expect(useStore.getState().adminDraft.invitation.groom).toBe("Haluk Can");
  });

  it('addDraftArrayItem ile diziye yeni bir eleman eklenebilmeli', () => {
    const { addDraftArrayItem } = useStore.getState();
    
    const initialLength = useStore.getState().adminDraft.scheduleItems.length;
    
    const newItem = { time: "23:00", title: "After Party", description: "Gece devam ediyor" };
    addDraftArrayItem("scheduleItems", newItem);
    
    const newItems = useStore.getState().adminDraft.scheduleItems;
    expect(newItems.length).toBe(initialLength + 1);
    expect(newItems[newItems.length - 1].title).toBe("After Party");
  });
});