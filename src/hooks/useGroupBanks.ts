import React from 'react';
import { GroupData } from '@/app/stores/tradeStore';

export function useGroupBanks({ group }: { group: GroupData }) {
  const banks = React.useMemo(() => {
    const borrowBank =
      group.pool.token.isActive &&
      group.pool.token.balanceWithLendingPosition?.position?.isLending
        ? group.pool.quoteTokens[0]
        : group.pool.token;
    const depositBank =
      group.pool.token.bankId === borrowBank.bankId
        ? group.pool.quoteTokens[0]
        : group.pool.token;
    const isBorrowing =
      borrowBank.isActive &&
      !borrowBank.balanceWithLendingPosition?.position?.isLending;
    const isDepositing =
      depositBank.isActive &&
      depositBank.balanceWithLendingPosition?.position?.isLending;
    return {
      borrowBank: isBorrowing ? borrowBank : null,
      depositBank: isDepositing ? depositBank : null,
    };
  }, [group]);

  return {
    depositBank: banks.depositBank,
    borrowBank: banks.borrowBank,
  };
}
