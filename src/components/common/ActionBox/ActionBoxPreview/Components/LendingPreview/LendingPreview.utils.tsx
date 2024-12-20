import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  clampedNumeralFormatter,
  IconMixin,
  IconPando,
  numeralFormatter,
  percentFormatter,
  usdFormatter,
} from '@/lib';
import { actionPreview } from '@/lib/actions';
import { AccountSummary, ActionType, ExtendedBankInfo } from '@/lib/mrgnlend';
import { cn } from '@/lib/utils';
import { Account } from '@/types/account';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import React from 'react';

export interface SimulateActionProps {
  actionMode: ActionType;
  account: Account;
  bank: ExtendedBankInfo;
  amount: number;
  // repayWithCollatOptions?: RepayWithCollatOptions;
  //   borrowWithdrawOptions?: {
  //     actionTx: VersionedTransaction | null;
  //     feedCrankTxs: VersionedTransaction[];
  //   };
}

export interface ActionPreview {
  simulationPreview: ActionPreviewSimulation;
  currentPositionAmount: number;
  healthFactor: number;
  liquidationPrice?: number;
  poolSize: number;
  bankCap: number;
  //   priceImpactPct?: number;
  //   slippageBps?: number;
  //   platformFeeBps?: number;
}

export interface ActionPreviewSimulation {
  health: number;
  liquidationPrice: number | null;
  depositRate: number;
  borrowRate: number;
  positionAmount: number;
  availableCollateral: {
    ratio: number;
    amount: number;
  };
}

export interface CalculatePreviewProps {
  actionMode: ActionType;
  //   simulationResult?: SimulationResult;
  bank: ExtendedBankInfo;
  amount: number;
  account: Account;
  // repayWithCollatOptions?: RepayWithCollatOptions;
  accountSummary: AccountSummary;
  isLoading: boolean;
}

export async function calculatePreview({
  account,
  bank,
  actionMode,
  amount,
}: CalculatePreviewProps): Promise<ActionPreview | null> {
  try {
    // 直接调用actionPreview并等待结果
    const preview = await actionPreview(
      account.id,
      bank.bankId,
      amount.toString(),
      actionMode,
    );
    if (preview) {
      return preview ?? null;
    }
    return null;
  } catch (error) {
    console.error('Error calculating preview:', error);
    return null;
  }
}

export interface PreviewStat {
  label: string;
  color?: 'SUCCESS' | 'ALERT' | 'DESTRUCTIVE';
  value: () => React.JSX.Element;
}

export function generateStats(
  preview: ActionPreview,
  bank: ExtendedBankInfo,
  isLending: boolean,
  isLoading: boolean,
  // isRepayWithCollat: boolean,
) {
  const stats = [];

  stats.push(
    getAmountStat(
      preview.currentPositionAmount,
      bank,
      preview.simulationPreview?.positionAmount,
    ),
  );
  //   if (preview.priceImpactPct)
  //     stats.push(getPriceImpactStat(preview.priceImpactPct));
  //   if (preview.slippageBps) stats.push(getSlippageStat(preview.slippageBps));
  //   if (preview.platformFeeBps) stats.push(getJupFeeStat(preview.platformFeeBps));

  stats.push(
    getHealthStat(
      preview.healthFactor,
      isLoading,
      preview.simulationPreview?.health,
    ),
  );

  if (preview.simulationPreview?.liquidationPrice)
    stats.push(
      getLiquidationStat(
        bank,
        isLoading,
        preview.simulationPreview?.liquidationPrice,
      ),
    );

  stats.push(getPoolSizeStat(preview.bankCap, bank, isLending));
  stats.push(getBankTypeStat(bank));
  stats.push(getOracleStat(bank));

  return stats;
}

function getJupFeeStat(platformFeeBps: number): PreviewStat {
  return {
    label: 'Platform fee',
    value: () => <>{percentFormatter.format(platformFeeBps / 10000)}</>,
  };
}

function getAmountStat(
  currentAmount: number,
  bank: ExtendedBankInfo,
  simulatedAmount?: number,
): PreviewStat {
  return {
    label: 'Your amount',
    value: () => (
      <>
        {clampedNumeralFormatter(currentAmount)} {bank.token.symbol}
        {simulatedAmount !== undefined ? (
          <ArrowRight width={12} height={12} />
        ) : (
          <></>
        )}
        {simulatedAmount !== undefined ? (
          clampedNumeralFormatter(simulatedAmount) + ' ' + bank.token.symbol
        ) : (
          <></>
        )}
      </>
    ),
  };
}

function getPriceImpactStat(priceImpactPct: number): PreviewStat {
  return {
    label: 'Price impact',
    color: priceImpactPct > 0.05 ? 'DESTRUCTIVE' : 'ALERT',
    value: () => <>{percentFormatter.format(priceImpactPct)}</>,
  };
}

function getSlippageStat(slippageBps: number): PreviewStat {
  return {
    label: 'Slippage',
    color: slippageBps > 500 ? 'ALERT' : undefined,
    value: () => <> {percentFormatter.format(slippageBps / 10000)}</>,
  };
}

function getHealthStat(
  health: number,
  isLoading: boolean,
  simulationHealth?: number,
): PreviewStat {
  let computeHealth = simulationHealth
    ? isNaN(simulationHealth)
      ? health
      : simulationHealth
    : health;
  const healthColor =
    computeHealth >= 0.5
      ? 'SUCCESS'
      : computeHealth >= 0.25
        ? 'ALERT'
        : 'DESTRUCTIVE';

  return {
    label: 'Health',
    color: healthColor,
    value: () => (
      <>
        {health && percentFormatter.format(health)}
        {simulationHealth ? <ArrowRight width={12} height={12} /> : ''}
        {isLoading ? (
          <Skeleton className="h-4 w-[45px] bg-[#373F45]" />
        ) : simulationHealth ? (
          percentFormatter.format(simulationHealth)
        ) : (
          ''
        )}
      </>
    ),
  };
}

function getLiquidationStat(
  bank: ExtendedBankInfo,
  isLoading: boolean,
  simulationLiq: number | null,
): PreviewStat {
  const price = bank ? bank.token.price : 0;

  const computeLiquidation = simulationLiq
    ? isNaN(simulationLiq)
      ? bank.isActive &&
        bank.balanceWithLendingPosition.position?.liquidationPrice
      : simulationLiq
    : bank.isActive &&
      bank.balanceWithLendingPosition.position?.liquidationPrice;
  // const healthColor = computeHealth >= 0.5 ? "SUCCESS" : computeHealth >= 0.25 ? "ALERT" : "DESTRUCTIVE";

  const healthColor = computeLiquidation
    ? computeLiquidation / price >= 0.5
      ? 'SUCCESS'
      : computeLiquidation / price >= 0.25
        ? 'ALERT'
        : 'DESTRUCTIVE'
    : undefined;

  return {
    label: 'Liquidation price',
    color: healthColor,
    value: () => (
      <>
        {bank.isActive &&
          bank.balanceWithLendingPosition.position?.liquidationPrice &&
          bank.balanceWithLendingPosition.position.liquidationPrice > 0.00001 &&
          usdFormatter.format(
            bank.balanceWithLendingPosition.position.liquidationPrice,
          )}
        {bank.isActive &&
          bank.balanceWithLendingPosition.position?.liquidationPrice &&
          simulationLiq && <ArrowRight width={12} height={12} />}
        {isLoading ? (
          <Skeleton className="h-4 w-[45px] bg-[#373F45]" />
        ) : simulationLiq ? (
          usdFormatter.format(simulationLiq)
        ) : (
          ''
        )}
      </>
    ),
  };
}

function getPoolSizeStat(
  bankCap: number,
  bank: ExtendedBankInfo,
  isLending: boolean,
): PreviewStat {
  const isBankHigh =
    (isLending
      ? bank.info.state.totalDeposits
      : bank.info.state.totalBorrows) >=
    bankCap * 0.9;

  const isBankFilled =
    (isLending
      ? bank.info.state.totalDeposits
      : bank.info.state.totalBorrows) >=
    bankCap * 0.99999;

  return {
    label: 'Pool size',
    value: () => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                'flex items-center justify-end gap-1.5',
                isBankFilled && 'text-destructive-foreground',
              )}
            >
              {numeralFormatter(
                isLending
                  ? bank.info.state.totalDeposits
                  : Math.max(
                      0,
                      Math.min(
                        bank.info.state.totalDeposits,
                        bank.info.bankConfig.liabilityLimit,
                      ) - bank.info.state.totalBorrows,
                    ),
              )}

              {(isBankHigh || isBankFilled) && <AlertTriangle size={14} />}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-col items-start gap-1">
              <h4 className="flex items-center gap-1.5 text-base">
                {isBankHigh &&
                  (isBankFilled ? (
                    <>
                      <AlertTriangle size={16} /> Limit Reached
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={16} /> Approaching Limit
                    </>
                  ))}
              </h4>

              <p>
                {`${bank.token.symbol} ${isLending ? 'deposits' : 'borrows'} are at ${percentFormatter.format(
                  (isLending
                    ? bank.info.state.totalDeposits
                    : bank.info.state.totalBorrows) / bankCap,
                )} capacity.`}
              </p>
              {/* <a href="https://docs.domefi.com">
                <u>Learn more.</u>
              </a> */}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  };
}

function getBankTypeStat(bank: ExtendedBankInfo): PreviewStat {
  return {
    label: 'Type',
    value: () => <>Isolated pool</>,
  };
}

function getOracleStat(bank: ExtendedBankInfo): PreviewStat {
  let oracle = '';
  switch (bank?.info.bankConfig.oracleSetup) {
    case 0:
      oracle = 'Mixin';
      break;
      // case 'PythLegacy':
      //   oracle = 'Pyth';
      //   break;
      // case 'PythPushOracle':
      //   oracle = 'Pyth';
      //   break;
      // case 'SwitchboardV2':
      //   oracle = 'Switchboard';
      break;
  }

  return {
    label: 'Oracle',
    value: () => (
      <>
        {oracle}

        {oracle === 'Mixin' ? (
          <IconMixin size={14} />
        ) : (
          <IconMixin size={14} />
          //   <IconSwitchboard size={14} />
        )}
      </>
    ),
  };
}
