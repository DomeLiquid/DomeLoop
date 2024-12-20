import { GroupData } from '@/app/stores/tradeStore';
import {
  clampedNumeralFormatter,
  IconMixin,
  tokenPriceFormatter,
  usdFormatter,
} from '@/lib';
import { AccountSummary, ActionMethod, ExtendedBankInfo } from '@/lib/mrgnlend';
import { computeMaxLeverage } from '@/lib/tradeUtils';
import { LoopingObject } from '@/types/type';
import { ArrowRight } from 'lucide-react';

export type TradeSide = 'long' | 'short';

interface StatResult {
  tokenPositionAmount: number;
  usdtPositionAmount: number;
  healthFactor: number;
  liquidationPrice: number | null;
}

export function getCurrentStats(
  accountSummary: AccountSummary,
  tokenBank: ExtendedBankInfo,
  usdtBank: ExtendedBankInfo,
): StatResult {
  const tokenPositionAmount = tokenBank?.isActive
    ? tokenBank.balanceWithLendingPosition.position?.amount ?? 0
    : 0;
  const usdtPositionAmount = usdtBank?.isActive
    ? usdtBank.balanceWithLendingPosition.position?.amount ?? 0
    : 0;
  const healthFactor =
    !accountSummary.balance || !accountSummary.healthFactor
      ? 1
      : accountSummary.healthFactor;

  // always token asset liq price
  const liquidationPrice =
    tokenBank.isActive &&
    tokenBank.balanceWithLendingPosition.position?.liquidationPrice &&
    tokenBank.balanceWithLendingPosition.position?.liquidationPrice > 0.00000001
      ? tokenBank.balanceWithLendingPosition.position?.liquidationPrice
      : null;

  return {
    tokenPositionAmount,
    usdtPositionAmount,
    healthFactor,
    liquidationPrice,
  };
}

export function generateStats(
  accountSummary: AccountSummary,
  tokenBank: ExtendedBankInfo,
  usdtBank: ExtendedBankInfo,
  //   simulationResult: SimulationResult | null,
  looping: LoopingObject | null,
  isAccountInitialized: boolean,
) {
  let simStats: StatResult | null = null;

  //   if (simulationResult) {
  //     simStats = getSimulationStats(simulationResult, tokenBank, usdcBank);
  //   }

  const currentStats = getCurrentStats(accountSummary, tokenBank, usdtBank);

  const currentLiqPrice = currentStats.liquidationPrice
    ? usdFormatter.format(currentStats.liquidationPrice)
    : null;
  //   const simulatedLiqPrice = simStats?.liquidationPrice
  //     ? usdFormatter.format(simStats?.liquidationPrice)
  //     : null;
  const showLiqComparison = currentLiqPrice;

  let oracle = 'Mixin';

  return (
    <>
      <dl className="grid w-full grid-cols-2 gap-1.5 text-xs text-muted-foreground">
        <dt>Entry Price</dt>
        <dd className="text-right text-primary">
          {tokenPriceFormatter(tokenBank.token.price)}
        </dd>
        {currentLiqPrice && (
          <>
            <dt>Liquidation Price</dt>

            <dd className="flex flex-row justify-end gap-2 text-right text-primary">
              {currentLiqPrice && <span>{currentLiqPrice}</span>}
              {showLiqComparison && <ArrowRight width={12} height={12} />}
            </dd>
          </>
        )}
        <dt>Oracle</dt>
        <dd className="ml-auto flex items-center gap-1 text-primary">
          {oracle}
          {oracle === 'Mixin' ? <IconMixin size={14} /> : null}
        </dd>
        {tokenBank.info.state.totalDeposits > 0 && (
          <>
            <dt>Total deposits</dt>
            <dd className="text-right text-primary">
              {clampedNumeralFormatter(
                tokenBank.info.state.totalDeposits * tokenBank.token.price,
              )}
            </dd>
          </>
        )}
        {tokenBank.info.state.totalBorrows > 0 && (
          <>
            <dt>Total borrows</dt>
            <dd className="text-right text-primary">
              {clampedNumeralFormatter(
                tokenBank.info.state.totalBorrows * tokenBank.token.price,
              )}
            </dd>
          </>
        )}
      </dl>

      {/* {looping && !isAccountInitialized ? (
        <label className="text-xs italic text-muted-foreground text-center">
          Health & liquidation simulation will display after the initial transaction.
        </label>
      ) : (
        <></>
      )} */}
    </>
  );

  // health comparison
}

interface CheckActionAvailableProps {
  amount: string;
  connected: boolean;
  activeGroup: GroupData | null;
  loopingObject: LoopingObject | null;
  tradeSide: TradeSide;
}

export function checkLoopingActionAvailable({
  amount,
  connected,
  activeGroup,
  loopingObject,
  tradeSide,
}: CheckActionAvailableProps): ActionMethod[] {
  let checks: ActionMethod[] = [];

  const requiredCheck = getRequiredCheck(connected, activeGroup, loopingObject);
  if (requiredCheck) return [requiredCheck];

  const generalChecks = getGeneralChecks(amount);
  if (generalChecks) checks.push(...generalChecks);

  // allert checks
  if (activeGroup && loopingObject) {
    const lentChecks = canBeLooped(activeGroup, loopingObject, tradeSide);
    if (lentChecks.length) checks.push(...lentChecks);
  }

  if (checks.length === 0)
    checks.push({
      isEnabled: true,
    });

  return checks;
}

function getRequiredCheck(
  connected: boolean,
  activeGroup: GroupData | null,
  loopingObject: LoopingObject | null,
): ActionMethod | null {
  if (!connected) {
    return { isEnabled: false };
  }
  if (!activeGroup) {
    return { isEnabled: false };
  }
  if (!loopingObject) {
    return { isEnabled: false };
  }

  return null;
}

function getGeneralChecks(amount: string): ActionMethod[] {
  let checks: ActionMethod[] = [];

  try {
    if (Number(amount) === 0) {
      checks.push({ isEnabled: false });
    }
    return checks;
  } catch {
    checks.push({ isEnabled: false });
    return checks;
  }
}
function canBeLooped(
  activeGroup: GroupData,
  loopingObject: LoopingObject,
  tradeSide: TradeSide,
): ActionMethod[] {
  let checks: ActionMethod[] = [];
  const isUsdcBankPaused =
    activeGroup.pool.quoteTokens[0].info.bankConfig.operationalState === 0;
  const isTokenBankPaused =
    activeGroup.pool.token.info.bankConfig.operationalState === 0;

  let tokenPosition,
    usdtPosition: 'inactive' | 'lending' | 'borrowing' = 'inactive';

  if (activeGroup.pool.quoteTokens[0].isActive) {
    usdtPosition = activeGroup.pool.quoteTokens[0].balanceWithLendingPosition
      ?.position?.isLending
      ? 'lending'
      : 'borrowing';
  }

  if (activeGroup.pool.token.isActive) {
    tokenPosition = activeGroup.pool.token.balanceWithLendingPosition?.position
      ?.isLending
      ? 'lending'
      : 'borrowing';
  }

  const wrongPositionActive =
    tradeSide === 'long'
      ? usdtPosition === 'lending' || tokenPosition === 'borrowing'
      : usdtPosition === 'borrowing' || tokenPosition === 'lending';

  if (isUsdcBankPaused) {
    checks.push({
      description: `The ${activeGroup.pool.quoteTokens[0].token.symbol} bank is paused at this time.`,
      isEnabled: false,
    });
  }

  if (isTokenBankPaused) {
    checks.push({
      description: `The ${activeGroup.pool.token.token.symbol} bank is paused at this time.`,
      isEnabled: false,
    });
  }

  //   if (wrongPositionActive && loopingObject.loopingTxn) {
  //     const wrongSupplied =
  //       tradeSide === 'long'
  //         ? usdcPosition === 'lending'
  //         : tokenPosition === 'lending';
  //     const wrongBorrowed =
  //       tradeSide === 'long'
  //         ? tokenPosition === 'borrowing'
  //         : usdcPosition === 'borrowing';

  //     if (wrongSupplied && wrongBorrowed) {
  //       checks.push(
  //         DYNAMIC_SIMULATION_ERRORS.LOOP_CHECK(
  //           tradeSide,
  //           activeGroup.pool.quoteTokens[0],
  //           activeGroup.pool.token,
  //         ),
  //       );
  //     } else if (wrongSupplied) {
  //       checks.push(
  //         DYNAMIC_SIMULATION_ERRORS.WITHDRAW_CHECK(
  //           tradeSide,
  //           activeGroup.pool.quoteTokens[0],
  //           activeGroup.pool.token,
  //         ),
  //       );
  //     } else if (wrongBorrowed) {
  //       checks.push(
  //         DYNAMIC_SIMULATION_ERRORS.REPAY_CHECK(
  //           tradeSide,
  //           activeGroup.pool.quoteTokens[0],
  //           activeGroup.pool.token,
  //         ),
  //       );
  //     }
  //   }

  //   const priceImpactPct = loopingObject.quote.priceImpactPct;

  //   if (priceImpactPct && Number(priceImpactPct) > 0.01) {
  //     //invert
  //     if (priceImpactPct && Number(priceImpactPct) > 0.05) {
  //       checks.push(
  //         DYNAMIC_SIMULATION_ERRORS.PRICE_IMPACT_ERROR_CHECK(
  //           Number(priceImpactPct),
  //         ),
  //       );
  //     } else {
  //       checks.push(
  //         DYNAMIC_SIMULATION_ERRORS.PRICE_IMPACT_WARNING_CHECK(
  //           Number(priceImpactPct),
  //         ),
  //       );
  //     }
  //   }

  // Banks will always be stale for now
  // if (
  //   (activeGroup.pool.token && isBankOracleStale(activeGroup.pool.token)) ||
  //   (activeGroup.pool.quoteTokens[0] && isBankOracleStale(activeGroup.pool.quoteTokens[0]))
  // ) {
  //   checks.push(STATIC_SIMULATION_ERRORS.STALE_TRADING);
  // }

  return checks;
}
/*
 * Calculates the parameters for a looper flashloan
 */
export async function calculateLoopingParams({
  depositBank,
  borrowBank,
  targetLeverage,
  amount,
}: {
  depositBank: ExtendedBankInfo; // deposit
  borrowBank: ExtendedBankInfo; // borrow
  targetLeverage: number;
  amount: number;
}): Promise<LoopingObject> {
  const { borrowAmount, depositAmount } = getLoopingParamsForAccount(
    depositBank,
    borrowBank,
    targetLeverage,
    amount,
  );

  return { borrowAmount, actualDepositAmount: depositAmount };
}

export function getLoopingParamsForAccount(
  depositBank: ExtendedBankInfo,
  borrowBank: ExtendedBankInfo,
  targetLeverage: number,
  amount: number,
) {
  const principalBufferAmountUi = amount * targetLeverage * 0.01;
  const adjustedPrincipalAmountUi = amount - principalBufferAmountUi;

  const { borrowAmount, totalDepositAmount: depositAmount } =
    computeLoopingParams(
      adjustedPrincipalAmountUi,
      targetLeverage,
      depositBank,
      borrowBank,
    );

  return { borrowAmount, depositAmount };
}

function computeLoopingParams(
  adjustedPrincipalAmountUi: number,
  targetLeverage: number,
  depositBank: ExtendedBankInfo,
  borrowBank: ExtendedBankInfo,
): { borrowAmount: number; totalDepositAmount: number } {
  const initialCollateral = adjustedPrincipalAmountUi;

  const { maxLeverage } = computeMaxLeverage(depositBank, borrowBank);

  if (targetLeverage < 1) {
    throw Error(`Target leverage ${targetLeverage} needs to be greater than 1`);
  }

  if (targetLeverage > maxLeverage) {
    throw Error(
      `Target leverage ${targetLeverage} exceeds max leverage for banks ${maxLeverage}`,
    );
  }

  const totalDepositAmount = initialCollateral * targetLeverage;
  const additionalDepositAmount = totalDepositAmount - initialCollateral;
  const borrowAmount =
    additionalDepositAmount *
    (depositBank.token.priceLowest / borrowBank.token.priceHighest);

  return { borrowAmount, totalDepositAmount };
}
