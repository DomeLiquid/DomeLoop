import { clampedNumeralFormatter } from '@/lib';
import { ActionType, ExtendedBankInfo } from '@/lib/mrgnlend';
import { Wallet } from 'lucide-react';
import React from 'react';

interface InputHeaderActionProps {
  actionMode: ActionType;
  bank: ExtendedBankInfo | null;
  maxAmount: number;
  walletAmount: number | undefined;
  onSetAmountRaw: (amount: string) => void;
}

export const InputHeaderActionRight = ({
  actionMode,
  bank,
  maxAmount,
  walletAmount,
  onSetAmountRaw,
}: InputHeaderActionProps) => {
  const numberFormater = React.useMemo(
    () => new Intl.NumberFormat('en-US', { maximumFractionDigits: 10 }),
    [],
  );

  const maxLabel = React.useMemo((): {
    amount: string;
    showWalletIcon?: boolean;
    label?: string;
  } => {
    if (!bank) {
      return {
        amount: '-',
        showWalletIcon: false,
      };
    }

    const formatAmount = (amount?: number, symbol?: string) =>
      amount !== undefined
        ? `${clampedNumeralFormatter(amount)} ${symbol}`
        : '-';

    switch (actionMode) {
      case ActionType.Deposit:
      case ActionType.Borrow:
        return {
          showWalletIcon: true,
          amount: formatAmount(walletAmount, bank?.token.symbol),
        };

      case ActionType.Withdraw:
        return {
          amount: formatAmount(
            bank?.isActive
              ? bank.balanceWithLendingPosition?.position?.amount
              : undefined,
            bank?.token.symbol,
          ),
          label: 'Supplied: ',
        };

      default:
        return { amount: '-' };
    }
  }, [bank, actionMode, walletAmount]);

  return (
    <>
      {bank && actionMode !== ActionType.Repay && (
        <div className="inline-flex items-center gap-1.5">
          {maxLabel.showWalletIcon && <Wallet size={16} />}
          {maxLabel.label && (
            <span className="text-xs font-normal text-muted-foreground">
              {maxLabel.label}
            </span>
          )}
          <span className="text-sm font-normal">{maxLabel.amount}</span>
          <button
            className={`ml-1 rounded-full border border-background-gray-light bg-transparent px-3 py-1.5 text-xs text-muted-foreground ${
              maxAmount === 0
                ? ''
                : 'cursor-pointer hover:bg-background-gray-light'
            } transition-colors`}
            onClick={() => onSetAmountRaw(numberFormater.format(maxAmount))}
            disabled={maxAmount === 0}
          >
            {'MAX'}
          </button>
        </div>
      )}
    </>
  );
};
