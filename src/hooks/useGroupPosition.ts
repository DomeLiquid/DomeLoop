import React from 'react';

import { GroupData } from '@/app/stores/tradeStore';
import { useGroupBanks } from '@/hooks/useGroupBanks';
import { getGroupPositionInfo } from '@/lib/tradeUtils';
import { numeralFormatter } from '@/lib';

export function useGroupPosition({ group }: { group: GroupData }) {
  const { borrowBank, depositBank } = useGroupBanks({ group });
  const positionInfo = React.useMemo(
    () => getGroupPositionInfo({ group }),
    [group],
  );

  const positions = React.useMemo(() => {
    const depositValue = depositBank
      ? depositBank.balanceWithLendingPosition?.position?.usdValue
      : 0;
    const borrowValue = borrowBank
      ? borrowBank.balanceWithLendingPosition?.position?.usdValue
      : 0;
    const depositSize = depositBank
      ? depositBank.balanceWithLendingPosition?.amount
      : 0;
    const borrowSize = borrowBank
      ? borrowBank.balanceWithLendingPosition?.amount
      : 0;

    if (positionInfo === null) {
      return { value: 0, size: 0, tokenSize: 0, leverage: 0 };
    } else if (positionInfo === 'LP') {
      return {
        value: depositValue,
        size: depositValue,
        tokenSize: depositSize,
        leverage: 1,
      };
    } else if (positionInfo === 'LONG' || positionInfo === 'SHORT') {
      const leverage = numeralFormatter(
        Math.round(
          ((borrowValue ?? 0) / (depositValue ?? 0) + Number.EPSILON) * 100,
        ) /
          100 +
          1,
      );
      return {
        value: (depositValue ?? 0) - (borrowValue ?? 0),
        size: depositValue,
        tokenSize: depositSize,
        leverage,
      };
    }

    return { value: 0, size: 0, tokenSize: 0, leverage: 0 };
  }, [group, positionInfo]);

  return {
    positionSizeUsd: positions.size,
    positionSizeToken: positions.tokenSize,
    totalUsdValue: positions.value,
    leverage: positions.leverage,
  };
}
