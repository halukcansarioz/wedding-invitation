import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useStore } from './useStore';
import { DEFAULT_SITE_DATA } from '../config/constants';

describe('useStore Zustand Durum Yönetimi', () => {
  let initialState;

  beforeEach(() => {
    // Mağazanın orijinal saf halini tut
    initialState = useStore.getState();
    
    // Derin kopya (Deep Copy) kullanarak testler arası veri sızıntısını önle
    useStore.setState({
      opened: false,
      adminDraft: JSON.parse(JSON.stringify(DEFAULT_SITE_DATA)),
      guests: []
    });
  });

  afterEach(() => {
    // Store sızıntılarını önle
    useStore.setState(initialState, true);
  });

  it('setOpened çağrıldığında opened durumu güncellenmeli', () => {
    const { setOpened } = useStore.getState();
    expect(useStore.getState().opened).toBe(false);
    setOpened(true);
    expect(useStore.getState().opened).toBe(true);
  });

  it('updateDraftObject ile iç içe geçmiş objeler başarıyla güncellenmeli', () => {
    const { updateDraftObject } = useStore.getState();
    expect(useStore.getState().adminDraft.invitation.bride).toBe("Handenur");
    
    updateDraftObject("invitation", "bride", "Ayşe");
    
    expect(useStore.getState().adminDraft.invitation.bride).toBe("Ayşe");
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