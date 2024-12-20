import { ActionType, ExtendedBankInfo } from '@/lib/mrgnlend';
import React from 'react';
import { useAmountDebounce } from './useAmountDebounce';

export function useActionAmounts({
  amountRaw,
  selectedBank,
  actionMode,
  maxAmountCollateral,
}: {
  amountRaw: string;
  actionMode: ActionType;
  selectedBank: ExtendedBankInfo | null;
  maxAmountCollateral?: number;
}) {
  const amount = React.useMemo(() => {
    const strippedAmount = amountRaw.replace(/,/g, '');
    return isNaN(Number.parseFloat(strippedAmount))
      ? 0
      : Number.parseFloat(strippedAmount);
  }, [amountRaw]);

  const debouncedAmount = useAmountDebounce<number | null>(amount, 500);

  const walletAmount = React.useMemo(() => 0, []);

  const maxAmount = React.useMemo(() => {
    if (!selectedBank) {
      return 0;
    }

    switch (actionMode) {
      case ActionType.Deposit:
        return parseFloat(selectedBank?.info.bankConfig.depositLimit.toString()) ?? 0;
      case ActionType.Withdraw:
        return parseFloat(selectedBank?.info.bankConfig.depositLimit.toString()) ?? 0;
      case ActionType.Borrow:
        return parseFloat(selectedBank?.info.bankConfig.liabilityLimit.toString()) ?? 0;
      case ActionType.Repay:
        return parseFloat(selectedBank?.info.bankConfig.liabilityLimit.toString()) ?? 0;
      // case ActionType.Loop:
      //   return selectedBank?.userInfo.maxDeposit ?? 0;
      // case ActionType.RepayCollat:
      //   return maxAmountCollateral ?? 0;
      default:
        return 0;
    }
  }, [selectedBank, actionMode, maxAmountCollateral]);

  return {
    amount,
    debouncedAmount,
    walletAmount,
    maxAmount,
  };
}
