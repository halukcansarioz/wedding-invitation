import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useStore } from './useStore';
import { DEFAULT_SITE_DATA } from '../config/constants';

describe('useStore Zustand Birleştirilmiş Mimari Dayanıklılık Testleri', () => {
  let initialState;

  beforeEach(() => {
    initialState = useStore.getState();
    useStore.setState({
      adminDraft: JSON.parse(JSON.stringify(DEFAULT_SITE_DATA))
    });
  });

  afterEach(() => {
    useStore.setState(initialState, true);
  });

  it('updateDraftObject var olmayan bir gruba müdahale etmeye çalıştığında çökmemeli', () => {
    const { updateDraftObject } = useStore.getState();
    
    expect(() => {
      updateDraftObject("nonExistentGroup", "anyKey", "value");
    }).not.toThrow();
  });

  it('moveDraftArrayItem dizinin sınırları dışına taşıma yapmaya çalıştığında işlemi reddetmeli', () => {
    const { moveDraftArrayItem, adminDraft } = useStore.getState();
    const initialScheduleLength = adminDraft.scheduleItems.length;

    moveDraftArrayItem("scheduleItems", 0, -1);
    
    const afterState = useStore.getState().adminDraft;
    expect(afterState.scheduleItems.length).toBe(initialScheduleLength);
  });

  it('removeDraftArrayItem ile son eleman silindiğinde dizi yapısı bozulmamalı (null olmamalı)', () => {
    useStore.setState({
      adminDraft: {
        ...useStore.getState().adminDraft,
        scheduleItems: [{ time: "10:00" }, { time: "11:00" }]
      }
    });

    const { removeDraftArrayItem } = useStore.getState();
    
    removeDraftArrayItem("scheduleItems", 0);
    removeDraftArrayItem("scheduleItems", 0);
    
    const { adminDraft } = useStore.getState();
    
    expect(Array.isArray(adminDraft.scheduleItems)).toBe(true);
    expect(adminDraft.scheduleItems).toHaveLength(0);
  });
});