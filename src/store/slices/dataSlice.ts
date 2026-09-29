import { StateCreator } from 'zustand';
import { MainStoreState, DataSlice } from '../storeTypes';
import { loadStoredSiteData } from '../../utils/helpers';
import { SiteData } from '../../types';

export const createDataSlice: StateCreator<MainStoreState, [], [], DataSlice> = (set) => ({
  siteData: loadStoredSiteData() as SiteData,
  setSiteData: (data) => set({ siteData: data }),
  guests: [],
  setGuests: (guests) => set({ guests }),
  wishes: [],
  setWishes: (wishes) => set({ wishes }),
});