import React from 'react';

import Image from 'next/image';

import { LendingModes } from '@/types/type';
import { Bank } from '@/types/account';
import { cn } from '@/lib/utils';
import { TokenSymbol } from '@/components/token-item';
import { ExtendedBankInfo } from '@/lib/mrgnlend';
type SelectedBankItemProps = {
  bank: ExtendedBankInfo;
  lendingMode?: LendingModes;
  rate?: string;
};

export const SelectedBankItem = ({
  rate,
  bank,
  lendingMode,
}: SelectedBankItemProps) => {
  return (
    <>
      <TokenSymbol asset={bank.token} />
      <div className="mr-auto flex min-w-14 flex-col gap-1 xs:mr-0">
        <p className="text-sm leading-none">{bank.token.symbol}</p>
        {lendingMode && rate && (
          <p
            className={cn(
              'text-xs font-normal leading-none',
              lendingMode === LendingModes.LEND && 'text-success',
              lendingMode === LendingModes.BORROW && 'text-warning',
            )}
          >
            {`${rate} APY`}
          </p>
        )}
      </div>
    </>
  );
};
