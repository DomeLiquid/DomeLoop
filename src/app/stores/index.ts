import { StoreApi } from 'zustand';
import { UseBoundStore } from 'zustand';
import { TradeStoreState } from './tradeStore';
import { createTradeStore } from './tradeStore';
import { ActionBoxState } from './actionBoxStore';
import { createActionBoxStore } from './actionBoxStore';
import { UiState } from './uiStore';
import { createUiStore } from './uiStore';

const useActionBoxGeneralStore: UseBoundStore<StoreApi<ActionBoxState>> =
  createActionBoxStore();
const useActionBoxDialogStore: UseBoundStore<StoreApi<ActionBoxState>> =
  createActionBoxStore();
const useTradeStore: UseBoundStore<StoreApi<TradeStoreState>> =
  createTradeStore();
const useUiStore: UseBoundStore<StoreApi<UiState>> = createUiStore();
// const useMrgnlendStore: UseBoundStore<StoreApi<MrgnlendState>> =
//   createPersistentMrgnlendStore();

export {
  useTradeStore,
  useActionBoxGeneralStore,
  useActionBoxDialogStore,
  useUiStore,
  // useMrgnlendStore,
};
export type { ActionBoxState };
