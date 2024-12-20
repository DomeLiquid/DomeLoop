import React from 'react';

import { ExtendedBankInfo } from '@/lib/mrgnlend';
import { LendingModes } from '@/types/type';
import { TokenSymbol } from '@/components/token-item';
import { cn } from '@/lib/utils';
import { numeralFormatter, usdFormatter } from '@/lib';

type ActionBoxItemProps = {
  bank: ExtendedBankInfo;
  showBalanceOverride: boolean;
  nativeSolBalance?: number;
  rate?: string;
  lendingMode?: LendingModes;
  isRepay?: boolean;
  available?: boolean;
};

export const ActionBoxItem = ({
  bank,
  showBalanceOverride,
  rate,
  lendingMode,
  isRepay,
  available = true,
}: ActionBoxItemProps) => {
  const balance = React.useMemo(() => {
    // TODO: Implement balance
    return 0;
  }, [bank]);

  const openPosition = React.useMemo(() => {
    return isRepay
      ? bank.isActive
        ? bank.balanceWithLendingPosition?.position?.amount
        : 0
      : bank.info.state.totalDeposits;
  }, [bank, isRepay]);

  const balancePrice = React.useMemo(
    () =>
      balance * bank.token.price > 0.00001
        ? usdFormatter.format(balance * bank.token.price)
        : `$${balance * bank.token.price}`,
    [bank, balance],
  );

  const openPositionPrice = React.useMemo(
    () =>
      (openPosition ?? 0) * bank.token.price > 0.00001
        ? usdFormatter.format((openPosition ?? 0) * bank.token.price)
        : `$${(openPosition ?? 0) * bank.token.price}`,
    [bank, openPosition],
  );

  return (
    <>
      <div className="flex items-center gap-3">
        {/* <Image
          src={bank.meta.tokenLogoUri}
          alt={bank.meta.tokenName}
          width={28}
          height={28}
          className="rounded-full"
        /> */}
        <TokenSymbol asset={bank.token} />
        <div>
          <p className="flex items-center">
            {bank.token.symbol}
            {!available && (
              <span className="ml-1 text-[11px] font-light">
                (currently unavailable)
              </span>
            )}
          </p>
          {lendingMode && (
            <p
              className={cn(
                'text-xs font-normal',
                (lendingMode === LendingModes.LEND || isRepay) &&
                  'text-success',
                lendingMode === LendingModes.BORROW &&
                  !isRepay &&
                  'text-warning',
              )}
            >
              {rate}
            </p>
          )}
        </div>
      </div>

      {((!isRepay &&
        lendingMode &&
        lendingMode === LendingModes.BORROW &&
        balance > 0) ||
        showBalanceOverride) && (
        <div className="space-y-0.5 text-right text-sm font-normal">
          <p>
            {balance > 0.00001
              ? numeralFormatter(balance)
              : `$${balance.toExponential(2)}`}
          </p>
          <p className="text-xs text-muted-foreground">{balancePrice}</p>
        </div>
      )}

      {isRepay && openPosition && openPosition > 0.00000001 && (
        <div className="space-y-0.5 text-right text-sm font-normal">
          <p>
            {openPosition > 0.00000001
              ? numeralFormatter(openPosition)
              : `$${balance}`}
          </p>
          <p className="text-xs text-muted-foreground">{openPositionPrice}</p>
        </div>
      )}
    </>
  );
};
