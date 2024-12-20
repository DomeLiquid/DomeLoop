import React, { useRef } from 'react';

import { useAmountDebounce } from '@/hooks/useAmountDebounce';

import {
  AccountSummary,
  ActionMethod,
  ActionType,
  ExtendedBankInfo,
} from '@/lib/mrgnlend';
import { Account } from '@/types/account';
import { usePrevious } from '@/hooks';
import { PreviewStat } from '@/lib/stats-preview.utils';
import { SimulatedActionPreview } from '@/components/action-box/actions/lend-box/utils/lend-simulation.utils';
import {
  ActionPreview,
  ActionPreviewSimulation,
  calculatePreview,
  CalculatePreviewProps,
  generateStats,
  SimulateActionProps,
} from './LendingPreview.utils';

interface UseLendingPreviewProps {
  accountSummary: AccountSummary;
  actionMode: ActionType;
  account: Account | null;
  bank: ExtendedBankInfo | null;
  amount: number | null;
  // repayWithCollatOptions?: RepayWithCollatOptions;
}

export function useLendingPreview({
  accountSummary,
  actionMode,
  account,
  bank,
  amount,
  // repayWithCollatOptions,
}: UseLendingPreviewProps) {
  // const [simulationResult, setSimulationResult] =
  //   React.useState<SimulationResult>();
  const [preview, setPreview] = React.useState<ActionPreview | null>(null);
  const [previewStats, setPreviewStats] = React.useState<PreviewStat[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [actionMethod, setActionMethod] = React.useState<ActionMethod>();
  const abortControllerRef = useRef<AbortController | null>(null);

  const bankPrev = usePrevious(bank);
  const debouncedAmount = useAmountDebounce<number | null>(amount, 500);
  const prevDebouncedAmount = usePrevious(debouncedAmount);

  React.useEffect(() => {
    if (amount && amount !== prevDebouncedAmount) {
      setIsLoading(true);
    }
  }, [amount, prevDebouncedAmount]);

  // const getSimulationResultCb = React.useCallback(
  //   async (amountArg: number, controller: AbortController) => {
  //     const isBankChanged = bank ? bankPrev?.bankId !== bank.bankId : false;

  //     if (
  //       account &&
  //       bank &&
  //       debouncedAmount &&
  //       !isBankChanged &&
  //       amount !== 0
  //     ) {
  //       // let borrowWithdrawOptions: BorrowLendObject | undefined;
  //       // if (
  //       //   actionMode === ActionType.Borrow ||
  //       //   actionMode === ActionType.Withdraw
  //       // ) {
  //       //   try {
  //       //     borrowWithdrawOptions = await calculateBorrowLend(
  //       //       account,
  //       //       actionMode,
  //       //       bank,
  //       //       amountArg,
  //       //     );
  //       //     if (controller.signal.aborted) {
  //       //       return;
  //       //     }
  //       //   } catch (error) {
  //       //     // TODO: eccountered error,  handle setErrorMessage
  //       //     console.error('Error fetching borrowWithdrawOptions');
  //       //   }
  //       // }

  //       getSimulationResult({
  //         actionMode,
  //         account,
  //         bank,
  //         amount: debouncedAmount,
  //         // repayWithCollatOptions,
  //         // borrowWithdrawOptions,
  //       });
  //     } else {
  //       // setSimulationResult(undefined);
  //       setActionMethod(undefined);
  //       setIsLoading(false);
  //     }
  //   },
  //   [
  //     account,
  //     actionMode,
  //     amount,
  //     bank,
  //     bankPrev?.bankId,
  //     debouncedAmount,
  //     // repayWithCollatOptions,
  //   ],
  // );

  // React.useEffect(() => {
  //   if (prevDebouncedAmount !== debouncedAmount) {
  //     const controller = new AbortController();
  //     abortControllerRef.current = controller;

  //     getSimulationResultCb(debouncedAmount ?? 0, controller);

  //     return () => {
  //       controller.abort();
  //       setIsLoading(false);
  //     };
  //   }
  // }, [prevDebouncedAmount, debouncedAmount, getSimulationResultCb]);

  React.useEffect(() => {
    if (bank && account) {
      getPreviewStats({
        account,
        bank,
        // repayWithCollatOptions,
        actionMode,
        accountSummary,
        isLoading,
        amount: debouncedAmount ?? 0,
      });
    }
  }, [
    // simulationResult,
    bank,
    // repayWithCollatOptions,
    accountSummary,
    actionMode,
    isLoading,
    debouncedAmount,
  ]);

  const getPreviewStats = async (props: CalculatePreviewProps) => {
    const isLending =
      props.actionMode === ActionType.Deposit ||
      props.actionMode === ActionType.Withdraw;
    const preview = await calculatePreview(props);

    setPreview(preview);
    setPreviewStats(
      generateStats(
        preview ?? {
          simulationPreview: {} as ActionPreviewSimulation,
          currentPositionAmount: 0,
          healthFactor: 0,
          poolSize: 0,
          bankCap: 0,
        },
        props.bank,
        isLending,
        props.isLoading,
        // isRepayWithCollat,
      ),
    );
    setIsLoading(false);
  };

  // const getSimulationResult = async (props: SimulateActionProps) => {
  //   try {
  //     const result = await simulateAction(props);
  //     setSimulationResult(result);
  //     setActionMethod(undefined);
  //   } catch (error: any) {
  //     let actionString;
  //     switch (props.actionMode) {
  //       case ActionType.Deposit:
  //         actionString = 'Depositing';
  //         break;
  //       case ActionType.Withdraw:
  //         actionString = 'Withdrawing';
  //         break;
  //       case ActionType.Loop:
  //         actionString = 'Looping';
  //         break;
  //       case ActionType.Repay:
  //         actionString = 'Repaying';
  //         break;
  //       case ActionType.Borrow:
  //         actionString = 'Borrowing';
  //         break;
  //       default:
  //         actionString = 'The action';
  //     }
  //     const actionMethod = handleSimulationError(
  //       error,
  //       props.bank,
  //       false,
  //       actionString,
  //     );

  //     if (actionMethod) setActionMethod(actionMethod);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return { preview, previewStats, isLoading, actionMethod };
}
