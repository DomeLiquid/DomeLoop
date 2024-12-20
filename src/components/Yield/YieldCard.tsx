import React from 'react';

import Image from 'next/image';

import { IconArrowRight } from '@tabler/icons-react';
import {
  DomeBank,
  GroupData,
  USDC_SOL_ASSET_ID,
} from '@/app/stores/tradeStore';
import { useTradeStore } from '@/app/stores';
import { getGroupPositionInfo } from '@/lib/tradeUtils';
import { TokenSymbol } from '../token-item';
import {
  aprToApy,
  numeralFormatter,
  percentFormatter,
  usdFormatter,
} from '@/lib';
import { USDC_MINT } from '@mrgnlabs/mrgn-common';
import { Button } from '../ui/button';
import { ActionBoxDialog } from '../common/ActionBox/ActionBoxDialog';
import { ActionType } from '@/lib/mrgnlend';
import { cn } from '@/lib/utils';
import { Link } from '@/navigation';

interface YieldCardProps {
  group: GroupData;
}

export const YieldCard = ({ group }: YieldCardProps) => {
  const [portfolio] = useTradeStore((state) => [state.portfolio]);
  const positionInfo = React.useMemo(
    () => getGroupPositionInfo({ group }),
    [group],
  );
  const isLeveraged = React.useMemo(
    () => positionInfo === 'LONG' || positionInfo === 'SHORT',
    [positionInfo],
  );

  const collateralBank = group.pool.quoteTokens[0];

  const isLPPosition = React.useCallback(
    (bank: DomeBank) => {
      if (!portfolio) return false;
      return portfolio.lpPositions.some(
        (group) => group.groupId === bank.info.groupId,
      );
    },
    [portfolio],
  );

  return (
    <div
      key={group.groupId}
      className="relative mb-12 rounded-xl border bg-background px-4 pb-2 pt-5"
    >
      <Link
        href={`/trade/${group.groupId}`}
        className="group absolute -top-5 left-3.5 flex items-center gap-2 rounded-xl border bg-background px-2 py-1.5 transition-colors hover:bg-accent"
      >
        <div className="flex items-center -space-x-2.5">
          {/* <Image
            src={group.pool.token.meta.tokenLogoUri}
            alt={group.pool.token.meta.tokenSymbol}
            width={24}
            height={24}
            className="z-10 rounded-full bg-background"
          />
          <Image
            src={collateralBank.meta.tokenLogoUri}
            alt={collateralBank.meta.tokenSymbol}
            width={24}
            height={24}
            className="rounded-full"
          /> */}
          <TokenSymbol asset={group.pool.token.token} />
          <TokenSymbol asset={collateralBank.token} />
        </div>
        <span>
          {group.pool.token.token.symbol}/{collateralBank.token.symbol}
        </span>
        <div className="flex items-center gap-1 text-mrgn-green">
          <span>Trade</span>
          <IconArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </div>
      </Link>
      <YieldItem
        group={group}
        bank={group.pool.token}
        isLeveraged={isLeveraged}
        isLPPosition={isLPPosition(group.pool.token)}
        className="items-center border-b pb-4 pt-2"
      />
      <YieldItem
        group={group}
        bank={collateralBank}
        isLeveraged={isLeveraged}
        isLPPosition={isLPPosition(collateralBank)}
        className="items-center pb-2 pt-4"
      />
    </div>
  );
};

const YieldItem = ({
  group,
  bank,
  className,
  isLeveraged,
  isLPPosition,
}: {
  group: GroupData;
  bank: DomeBank;
  className?: string;
  isLeveraged?: boolean;
  isLPPosition?: boolean;
}) => {
  return (
    <div className={cn('items-center', className)}>
      <div className="flex items-center gap-2">
        {/* <Image
          src={bank.meta.tokenLogoUri}
          alt={bank.meta.tokenSymbol}
          width={24}
          height={24}
          className="rounded-full"
        /> */}
        <TokenSymbol asset={bank.token} />

        {bank.token.symbol}
      </div>
      <div className="my-6 grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Total Deposits</span>
          <span>
            {usdFormatter.format(
              bank.info.state.totalDeposits * bank.token.price,
            )}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">
            Lending Rate (APY)
          </span>
          <span className="text-mrgn-success">
            {percentFormatter.format(aprToApy(bank.info.state.lendingRate))}
          </span>
        </div>
      </div>
      {bank.isActive &&
        bank.balanceWithLendingPosition?.position?.isLending &&
        isLPPosition && (
          <div className="mb-4 text-sm">
            <span className="text-muted-foreground">Supplied</span>{' '}
            {usdFormatter.format(
              bank.balanceWithLendingPosition.position.amount *
                bank.token.price,
            )}
            {!(bank.info.mixinSafeAssetId === USDC_SOL_ASSET_ID) && (
              <span className="ml-1 uppercase text-muted-foreground">
                (
                {numeralFormatter(
                  bank.balanceWithLendingPosition.position.amount,
                )}{' '}
                {bank.token.symbol})
              </span>
            )}
            {/* {!bank.info.state.mint.equals(USDC_MINT) && (
              <span className="ml-1 uppercase text-muted-foreground">
                ({numeralFormatter(bank.position.amount)}{' '}
                {bank.meta.tokenSymbol})
              </span>
            )} */}
          </div>
        )}
      <div className="flex flex-col gap-2 md:flex-row">
        {bank.isActive &&
          !isLeveraged &&
          bank.balanceWithLendingPosition?.position?.isLending &&
          group.selectedAccount && (
            <ActionBoxDialog
              activeGroupArg={group}
              requestedBank={bank}
              requestedAction={ActionType.Withdraw}
            >
              <Button
                className="w-full border bg-background text-foreground hover:bg-accent"
                onClick={() => {
                  // capture('yield_withdraw_btn_click', {
                  //   group: group.client.group.address.toBase58(),
                  //   bank: bank.meta.tokenSymbol,
                  // });
                }}
              >
                Withdraw {bank.token.symbol}
              </Button>
            </ActionBoxDialog>
          )}
        {isLeveraged ? (
          <div>
            <p className="mb-2 text-xs text-muted-foreground">
              You cannot provide liquidity with an open trade.{' '}
              {/* <Link
                className="underline"
                href={
                  'https://docs.domefi.com/the-arena#supply-liquidity-and-earn-yield'
                }
                target="_blank"
              >
                learn more
              </Link> */}
            </p>
            <Button
              disabled
              className="w-full border bg-background text-foreground hover:bg-accent"
            >
              Supply {bank.token.symbol}
            </Button>
          </div>
        ) : (
          <ActionBoxDialog
            activeGroupArg={group}
            requestedBank={bank}
            requestedAction={ActionType.Deposit}
          >
            <Button
              className="w-full border bg-background text-foreground hover:bg-accent"
              onClick={() => {
                // capture('yield_supply_btn_click', {
                //   group: group.client.group.address.toBase58(),
                //   bank: bank.meta.tokenSymbol,
                // });
              }}
            >
              Supply {bank.token.symbol}
            </Button>
          </ActionBoxDialog>
        )}
      </div>
    </div>
  );
};
