import { clampedNumeralFormatter } from '@/lib';
import { ActionType, ExtendedBankInfo } from '@/lib/mrgnlend';
import { decimalStrToNumber } from '@/lib/utils';
import React from 'react';

type LendingActionProps = {
  walletAmount: number | undefined;
  maxAmount: number;
  showLendingHeader?: boolean;
  lendMode: ActionType;
  selectedBank: ExtendedBankInfo | null;

  onSetAmountRaw: (amount: string) => void;
};

export const LendingAction = ({
  maxAmount,
  walletAmount,
  onSetAmountRaw,
  selectedBank,
  lendMode,
}: LendingActionProps) => {
  const numberFormater = React.useMemo(
    () => new Intl.NumberFormat('en-US', { maximumFractionDigits: 10 }),
    [],
  );

  const maxLabel = React.useMemo((): {
    amount: string;
    showWalletIcon?: boolean;
    label?: string;
  } => {
    if (!selectedBank) {
      return {
        amount: '-',
        showWalletIcon: false,
      };
    }

    const formatAmount = (amount?: number, symbol?: string) =>
      amount !== undefined
        ? `${clampedNumeralFormatter(amount)} ${symbol}`
        : '-';

    switch (lendMode) {
      case ActionType.Deposit:
        return {
          label: 'Wallet: ',
          amount: formatAmount(walletAmount, selectedBank?.token.symbol),
        };
      case ActionType.Borrow:
        return {
          label: 'Max Borrow: ',
          amount: formatAmount(
            decimalStrToNumber(
              Number(selectedBank.info.bankConfig.liabilityLimit ?? 0).toFixed(
                2,
              ),
            ),
            selectedBank?.token.symbol,
          ),
        };

      case ActionType.Withdraw:
        return {
          amount: formatAmount(
            selectedBank?.isActive
              ? decimalStrToNumber(
                  Number(
                    selectedBank.balanceWithLendingPosition.amount ?? 0,
                  ).toFixed(2),
                )
              : undefined,
            selectedBank?.token.symbol,
          ),
          label: 'Supplied: ',
        };

      case ActionType.Repay:
        return {
          amount: formatAmount(
            selectedBank?.isActive
              ? decimalStrToNumber(
                  Number(
                    selectedBank.balanceWithLendingPosition.amount ?? 0,
                  ).toFixed(2),
                )
              : undefined,
            selectedBank?.token.symbol,
          ),
          label: 'Borrowed: ',
        };

      default:
        return { amount: '-' };
    }
  }, [selectedBank, lendMode, walletAmount]);

  // const isMaxButtonVisible = React.useMemo(() => lendMode === ActionType.Repay, [lendMode]);

  // Section above the input
  return (
    <>
      {selectedBank && (
        <ul className="mt-4 flex w-full flex-col gap-0.5 text-xs text-muted-foreground">
          <li className="flex items-center justify-between gap-1.5">
            <strong className="mr-auto">{maxLabel.label}</strong>
            <div className="flex space-x-1">
              {/* {selectedBank?.isActive && <div>{clampedNumeralFormatter(selectedBank.position.amount)}</div>}
              {selectedBank?.isActive && <IconArrowRight width={12} height={12} />} */}
              {/* <div>{maxLabel.amount}</div> */}

              <div>-</div>
              <button
                className="cursor-pointer border-b border-transparent text-chartreuse transition hover:border-chartreuse"
                disabled={maxAmount === 0}
                onClick={() => onSetAmountRaw(numberFormater.format(0))}
              >
                MAX
              </button>
            </div>
          </li>
        </ul>
      )}
    </>
  );
};
