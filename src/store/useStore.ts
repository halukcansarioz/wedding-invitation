import { create } from 'zustand';
import { MainStoreState } from './storeTypes';
import { createUISlice } from './slices/uiSlice';
import { createDataSlice } from './slices/dataSlice';
import { createAdminDraftSlice } from './slices/adminDraftSlice';

// Diğer bileşenlerdeki tüm import'ların kırılmaması için 
// slice mimarisi burada birleştiriliyor.
export const useStore = create<MainStoreState>((...a) => ({
  ...createUISlice(...a),
  ...createDataSlice(...a),
  ...createAdminDraftSlice(...a)
}));