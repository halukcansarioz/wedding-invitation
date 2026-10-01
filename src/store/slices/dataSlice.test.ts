import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../useStore';

describe('Zustand dataSlice Testleri', () => {
  
  beforeEach(() => {
    // State'i sıfırla
    useStore.setState({ guests: [], wishes: [], siteData: {} as any });
  });

  it('setGuests ile misafir listesi güncellenebilmeli', () => {
    const { setGuests } = useStore.getState();
    const newGuests = [
      { id: "1", name: "Kemal", attendance: "Katılacağım", personCount: "2", side: "Gelin Tarafı", hasChild: "Hayır", has_arrived: false }
    ];
    
    setGuests(newGuests);
    
    const currentState = useStore.getState();
    expect(currentState.guests).toHaveLength(1);
    expect(currentState.guests[0].name).toBe("Kemal");
  });

  it('setWishes ile anı defteri mesajları güncellenebilmeli', () => {
    const { setWishes } = useStore.getState();
    const newWishes = [
      { id: "1", name: "Zeynep", message: "Mutluluklar!", approved: true }
    ];
    
    setWishes(newWishes);
    
    const currentState = useStore.getState();
    expect(currentState.wishes).toHaveLength(1);
    expect(currentState.wishes[0].message).toBe("Mutluluklar!");
  });
});