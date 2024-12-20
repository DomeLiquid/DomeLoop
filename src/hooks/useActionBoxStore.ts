import { StoreApi, UseBoundStore } from 'zustand';
import {
  ActionBoxState,
  useActionBoxDialogStore,
  useActionBoxGeneralStore,
} from '@/app/stores';

export const useActionBoxStore = (
  isDialog?: boolean,
): UseBoundStore<StoreApi<ActionBoxState>> => {
  if (!isDialog) {
    return useActionBoxGeneralStore;
  } else {
    return useActionBoxDialogStore;
  }
};
