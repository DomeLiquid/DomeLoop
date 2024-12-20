import { DomeBank, GroupData } from '@/app/stores/tradeStore';

export type GroupPositionInfo = 'LP' | 'LONG' | 'SHORT' | null;

export function getGroupPositionInfo({
  group,
}: {
  group: GroupData;
}): GroupPositionInfo {
  const tokenBank = group.pool.token;
  const quoteTokens = group.pool.quoteTokens;

  let isLpPosition = true;
  let hasAnyPosition = false;
  let isLendingInAny = false;
  let isLong = false;
  let isShort = false;

  if (tokenBank.isActive && tokenBank.balanceWithLendingPosition) {
    hasAnyPosition = true;
    if (
      tokenBank.balanceWithLendingPosition.position?.isLending &&
      tokenBank.balanceWithLendingPosition.position?.amount > 0
    ) {
      isLendingInAny = true;
    } else if (
      tokenBank.balanceWithLendingPosition.position?.usdValue &&
      tokenBank.balanceWithLendingPosition.position?.usdValue > 0
    ) {
      isShort = true;
      isLpPosition = false;
    }
  }

  // Check quote token positions
  quoteTokens.forEach((quoteToken) => {
    if (quoteToken.isActive && quoteToken.balanceWithLendingPosition) {
      hasAnyPosition = true;
      if (
        quoteToken.balanceWithLendingPosition.position?.isLending &&
        quoteToken.balanceWithLendingPosition.position?.amount > 0
      ) {
        isLendingInAny = true;
      } else if (
        quoteToken.balanceWithLendingPosition.position?.usdValue &&
        quoteToken.balanceWithLendingPosition.position?.usdValue > 0
      ) {
        if (
          tokenBank.isActive &&
          tokenBank.balanceWithLendingPosition.position?.isLending &&
          tokenBank.balanceWithLendingPosition.position?.amount > 0
        ) {
          isLong = true;
        }
        isLpPosition = false;
      }
    }
  });

  if (hasAnyPosition) {
    if (isLpPosition && isLendingInAny) {
      return 'LP';
    } else if (isLong) {
      return 'LONG';
    } else if (isShort) {
      return 'SHORT';
    }
  }

  return null;
}

export function computeMaxLeverage(
  depositBank: DomeBank,
  borrowBank: DomeBank,
): { maxLeverage: number; ltv: number } {
  const assetWeightInit = depositBank.info.bankConfig.assetWeightInit;
  const liabilityWeightInit = borrowBank.info.bankConfig.liabilityWeightInit;

  const ltv = assetWeightInit / liabilityWeightInit;
  const maxLeverage = 1 / (1 - ltv);

  return {
    maxLeverage,
    ltv,
  };
}
