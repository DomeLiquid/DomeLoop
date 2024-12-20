import { ActionType } from '@/lib/mrgnlend';
import { LendingModes } from '@/types/type';
import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

export enum WalletState {
  DEFAULT = 'default',
  TOKEN = 'token',
  SEND = 'send',
  SELECT = 'select',
  SWAP = 'swap',
  BRIDGE = 'bridge',
  BUY = 'buy',
}

interface UiState {
  // State
  lendingMode: LendingModes;
  isActionComplete: boolean;
  isActionBoxInputFocussed: boolean;
  walletState: WalletState;
  isOnrampActive: boolean;

  // Actions
  setLendingMode: (lendingMode: LendingModes) => void;
  setIsActionComplete: (isActionSuccess: boolean) => void;
  setWalletState: (walletState: WalletState) => void;
  setIsActionBoxInputFocussed: (isFocussed: boolean) => void;
  setIsOnrampActive: (isOnrampActive: boolean) => void;
}

function createUiStore() {
  return create<UiState>()(
    persist(stateCreator, {
      name: 'uiStore',
      onRehydrateStorage: () => (state) => {},
    }),
  );
}

const stateCreator: StateCreator<UiState, [], []> = (set, get) => ({
  // State
  lendingMode: LendingModes.LEND,
  isActionComplete: false,
  isActionBoxInputFocussed: false,
  walletState: WalletState.DEFAULT,
  isOnrampActive: false,

  // Actions
  setLendingMode: (lendingMode: LendingModes) =>
    set({
      lendingMode: lendingMode,
    }),
  setIsActionComplete: (isActionComplete: boolean) =>
    set({ isActionComplete: isActionComplete }),
  setWalletState: (walletState: WalletState) =>
    set({ walletState: walletState }),
  setIsActionBoxInputFocussed: (isFocussed: boolean) =>
    set({ isActionBoxInputFocussed: isFocussed }),
  setIsOnrampActive: (isOnrampActive: boolean) =>
    set({ isOnrampActive: isOnrampActive }),
});

export { createUiStore };
export type { UiState };
