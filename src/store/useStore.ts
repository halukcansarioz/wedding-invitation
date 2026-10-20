import { create } from 'zustand';
import { MainStoreState } from './storeTypes';
import { createUISlice } from './slices/uiSlice';
import { createDataSlice } from './slices/dataSlice';
import { createAdminDraftSlice } from './slices/adminDraftSlice';

export const useStore = create<MainStoreState>((...a) => ({
  ...createUISlice(...a),
  ...createDataSlice(...a),
  ...createAdminDraftSlice(...a)
}));