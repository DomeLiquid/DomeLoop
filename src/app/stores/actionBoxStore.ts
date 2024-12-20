import { debounceFn } from '@/components/action-box/actions/lend-box/utils/mrgnUtils';
import { ActionType, ExtendedBankInfo, RepayType } from '@/lib/mrgnlend';
import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

interface ActionBoxState {
  // State
  amountRaw: string;
  repayAmountRaw: string;
  maxAmountCollat: number;

  actionMode: ActionType;
  repayMode: RepayType;

  selectedBank: ExtendedBankInfo | null;
  selectedRepayBank: ExtendedBankInfo | null;

  // errorMessage: ActionMethod | null;
  isLoading: boolean;

  // Actions
  refreshState: () => void;
  refreshSelectedBanks: (banks: ExtendedBankInfo[]) => void;
  fetchActionBoxState: (args: {
    requestedAction?: ActionType;
    requestedBank?: ExtendedBankInfo;
  }) => void;
  setActionMode: (actionMode: ActionType) => void;
  setRepayMode: (repayMode: RepayType) => void;
  setAmountRaw: (amountRaw: string, maxAmount?: number) => void;
  setRepayAmountRaw: (repayAmountRaw: string) => void;
  setSelectedBank: (bank: ExtendedBankInfo | null) => void;
  setRepayBank: (bank: ExtendedBankInfo | null) => void;
  setRepayCollateral: (
    selectedBank: ExtendedBankInfo,
    selectedRepayBank: ExtendedBankInfo,
    amount: number,
  ) => void;
  setIsLoading: (isLoading: boolean) => void;
}

function createActionBoxStore() {
  return create<ActionBoxState>()(
    persist(stateCreator, {
      name: 'actionbox-peristent-store',
    }),
  );
}

const initialState = {
  slippageBps: 100,
  amountRaw: '',
  repayAmountRaw: '',
  maxAmountCollat: 0,
  errorMessage: null,

  actionMode: ActionType.Deposit,
  repayMode: RepayType.RepayRaw,

  selectedBank: null,
  selectedRepayBank: null,

  repayCollatQuote: null,
  repayCollatTxns: {
    repayCollatTxn: null,
    feedCrankTxs: [],
  },

  isLoading: false,
};

const stateCreator: StateCreator<ActionBoxState, [], []> = (set, get) => ({
  // State
  ...initialState,

  refreshState() {
    set({ ...initialState });
  },

  fetchActionBoxState(args) {
    let requestedAction: ActionType;
    let requestedBank: ExtendedBankInfo | null = null;
    const actionMode = get().actionMode;

    if (args.requestedAction) {
      requestedAction = args.requestedAction;
    } else {
      requestedAction = actionMode;
    }

    if (args.requestedBank) {
      requestedBank = args.requestedBank;
    } else {
      requestedBank = null;
    }

    const selectedBank = get().selectedBank;

    const needRefresh =
      !selectedBank ||
      !requestedAction ||
      actionMode !== requestedAction ||
      (requestedBank && requestedBank.bankId !== selectedBank.bankId);

    if (needRefresh)
      set({
        ...initialState,
        actionMode: requestedAction,
        selectedBank: requestedBank,
      });
  },

  setAmountRaw(amountRaw, maxAmount) {
    if (!maxAmount) {
      set({ amountRaw });
    } else {
      const strippedAmount = amountRaw.replace(/,/g, '');
      const amount = isNaN(Number.parseFloat(strippedAmount))
        ? 0
        : Number.parseFloat(strippedAmount);
      const numberFormater = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 10,
      });

      // if (amount && amount > maxAmount) {
      //   set({ amountRaw: numberFormater.format(maxAmount) });
      // } else {
      set({ amountRaw: numberFormater.format(amount) });
      // }
    }
  },

  setRepayAmountRaw(amountRaw) {
    const strippedAmount = amountRaw.replace(/,/g, '');
    const amount = isNaN(Number.parseFloat(strippedAmount))
      ? 0
      : Number.parseFloat(strippedAmount);

    const selectedBank = get().selectedBank;
    const selectedRepayBank = get().selectedRepayBank;

    set({ repayAmountRaw: amountRaw });

    if (selectedBank && selectedRepayBank) {
      const setCollat = debounceFn(get().setRepayCollateral, 500);
      setCollat(selectedBank, selectedRepayBank, amount);
    }
  },
  async setRepayCollateral(
    selectedBank: ExtendedBankInfo,
    selectedRepayBank: ExtendedBankInfo,
    amount: number,
  ) {
    set({ isLoading: true });
    // TODO: Implement this
    // const repayCollat = await calculateRepayCollateralParams(
    //   selectedBank,
    //   selectedRepayBank,
    //   amount,
    // );

    // if (repayCollat && 'repayTxn' in repayCollat) {
    //   set({
    //     repayCollatTxns: {
    //       repayCollatTxn: repayCollat.repayTxn,
    //       feedCrankTxs: repayCollat.feedCrankTxs,
    //     },
    //     repayCollatQuote: repayCollat.quote,
    //     amountRaw: repayCollat.amount.toString(),
    //   });
    // } else {
    //   if (repayCollat?.description) {
    //     set({
    //       errorMessage: repayCollat,
    //     });
    //   } else {
    //     set({
    //       errorMessage: DYNAMIC_SIMULATION_ERRORS.REPAY_COLLAT_FAILED_CHECK(
    //         selectedRepayBank.meta.tokenSymbol,
    //       ),
    //     });
    //   }
    // }
    set({ isLoading: false });
  },

  refreshSelectedBanks(banks: ExtendedBankInfo[]) {
    const selectedBank = get().selectedBank;
    const selectedRepayBank = get().selectedRepayBank;

    if (selectedBank) {
      const updatedBank = banks.find((v) => v.bankId === selectedBank.bankId);
      if (updatedBank) {
        set({ selectedBank: updatedBank });
      }
    }

    if (selectedRepayBank) {
      const updatedRepayBank = banks.find(
        (v) => v.bankId === selectedRepayBank.bankId,
      );
      if (updatedRepayBank) {
        set({ selectedRepayBank: updatedRepayBank });
      }
    }
  },

  async setSelectedBank(tokenBank) {
    const selectedBank = get().selectedBank;
    const hasBankChanged =
      !tokenBank || !selectedBank || tokenBank.bankId !== selectedBank.bankId;

    if (hasBankChanged) {
      set({
        selectedBank: tokenBank,
        amountRaw: '',
        repayAmountRaw: '',
        // errorMessage: null,
      });

      const repayMode = get().repayMode;
      const repayBank = get().selectedRepayBank;

      // if (repayMode === RepayType.RepayCollat && tokenBank && repayBank) {
      //   const maxAmount = await calculateMaxCollat(tokenBank, repayBank, slippageBps);
      //   set({ maxAmountCollat: maxAmount, repayAmountRaw: "" });
      // }
    }
  },

  async setRepayBank(repayTokenBank) {
    const selectedRepayBank = get().selectedRepayBank;
    const hasBankChanged =
      !repayTokenBank ||
      !selectedRepayBank ||
      repayTokenBank.bankId !== selectedRepayBank.bankId;

    if (hasBankChanged) {
      set({
        selectedRepayBank: repayTokenBank,
        amountRaw: '',
        repayAmountRaw: '',
        // errorMessage: null,
      });

      const repayMode = get().repayMode;
      const prevTokenBank = get().selectedBank;

      // if (
      //   repayMode === RepayType.RepayCollat &&
      //   repayTokenBank &&
      //   prevTokenBank
      // ) {
      //   set({ isLoading: true });
      //   const maxAmount = await calculateMaxRepayableCollateral(
      //     prevTokenBank,
      //     repayTokenBank,
      //     slippageBps,
      //   );
      //   if (maxAmount) {
      //     set({ maxAmountCollat: maxAmount, repayAmountRaw: '' });
      //   } else {
      //     set({
      //       errorMessage: DYNAMIC_SIMULATION_ERRORS.REPAY_COLLAT_FAILED_CHECK(
      //         repayTokenBank.meta.tokenSymbol,
      //       ),
      //     });
      //   }
      //   set({ isLoading: false });
      // }
    } else {
      set({ selectedRepayBank: repayTokenBank });
    }
  },

  async setRepayMode(newRepayMode) {
    const repayMode = get().repayMode;
    const repayModeChanged = repayMode !== newRepayMode;

    if (repayModeChanged) {
      set({
        repayAmountRaw: '',
        repayMode: newRepayMode,
      });
    }

    // if (newRepayMode === RepayType.RepayCollat) {
    //   const bank = get().selectedBank;
    //   const repayBank = get().selectedRepayBank;
    //   const slippageBps = get().slippageBps;

    //   if (bank && repayBank) {
    //     set({ isLoading: true });
    //     const maxAmount = await calculateMaxRepayableCollateral(
    //       bank,
    //       repayBank,
    //       slippageBps,
    //     );
    //     if (maxAmount) {
    //       set({ maxAmountCollat: maxAmount, repayAmountRaw: '' });
    //     } else {
    //       set({
    //         errorMessage: DYNAMIC_SIMULATION_ERRORS.REPAY_COLLAT_FAILED_CHECK(
    //           repayBank.meta.tokenSymbol,
    //         ),
    //       });
    //     }
    //     set({ isLoading: false });
    //   }
    // }
  },

  setActionMode(actionMode) {
    const selectedActionMode = get().actionMode;
    const hasActionModeChanged =
      !selectedActionMode || actionMode !== selectedActionMode;

    if (hasActionModeChanged) set({ amountRaw: '', repayAmountRaw: '' });

    if (actionMode !== ActionType.Repay) {
      set({ repayMode: RepayType.RepayRaw });
    }

    set({ actionMode });
  },

  setIsLoading(isLoading) {
    set({ isLoading });
  },
});

export { createActionBoxStore };
export type { ActionBoxState };
