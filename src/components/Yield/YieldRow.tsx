import React from 'react';

import { useTradeStore } from '@/app/stores';
import { DomeBank, GroupData } from '@/app/stores/tradeStore';
import { getGroupPositionInfo } from '@/lib/tradeUtils';
import { TokenSymbol } from '../token-item';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  aprToApy,
  IconDomeLoop,
  numeralFormatter,
  percentFormatter,
  usdFormatter,
} from '@/lib';
import { ActionType } from '@/lib/mrgnlend';
import {
  TooltipContent,
  Tooltip,
  TooltipTrigger,
  TooltipProvider,
} from '../ui/tooltip';
import { Button } from '../ui/button';
import { ActionBoxDialog } from '../common/ActionBox/ActionBoxDialog';
import { Link } from '@/navigation';

interface props {
  group: GroupData;
}

export const YieldRow = ({ group }: props) => {
  const { connected, portfolio } = useTradeStore();
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
        (group) => group.groupId === group.groupId,
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
          <TokenSymbol asset={group.pool.token.token} />
          <TokenSymbol asset={collateralBank.token} />
        </div>
        <span>
          {group.pool.token.token.symbol}/{collateralBank.token.symbol}
        </span>
        <div className="flex items-center gap-1 text-mrgn-green">
          <span>Trade</span>
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </div>
      </Link>

      <YieldItem
        className="border-b pb-4 pt-2"
        group={group}
        bank={group.pool.token}
        connected={connected}
        isLeveraged={isLeveraged}
        isLPPosition={isLPPosition(group.pool.token)}
      />

      <YieldItem
        className="pb-2 pt-4"
        group={group}
        bank={collateralBank}
        connected={connected}
        isLeveraged={isLeveraged}
        isLPPosition={isLPPosition(collateralBank)}
      />
    </div>
  );
};

const YieldItem = ({
  group,
  bank,
  connected,
  className,
  isLeveraged,
  isLPPosition,
}: {
  group: GroupData;
  bank: DomeBank;
  connected: boolean;
  className?: string;
  isLeveraged?: boolean;
  isLPPosition?: boolean;
}) => {
  return (
    <div
      className={cn(
        'grid items-center gap-4',
        className,
        connected ? 'grid-cols-7' : 'grid-cols-6',
      )}
    >
      {/* Token Symbol and Name */}
      <div className="flex items-center gap-2">
        <TokenSymbol asset={bank.token} />
        {bank.token.symbol}
      </div>

      {/* Total Deposits */}
      <div className="flex flex-col xl:flex-row xl:items-baseline xl:gap-2">
        <span className="text-xl">
          {numeralFormatter(bank.info.state.totalDeposits)}
        </span>
        <span className="text-sm text-muted-foreground">
          {usdFormatter.format(
            bank.info.state.totalDeposits * (bank.tokenData?.price ?? 0),
          )}
        </span>
      </div>

      {/* Lending APY */}
      <div className="text-right xl:text-center">
        <span className="text-mrgn-success">
          {percentFormatter.format(aprToApy(bank.info.state.lendingRate))}
        </span>
      </div>

      {/* Borrowing APY */}
      <div className="text-right xl:text-center">
        <span className="text-mrgn-warning">
          {percentFormatter.format(aprToApy(bank.info.state.borrowingRate))}
        </span>
      </div>

      {/* Created by */}
      <div className="flex justify-center">
        <Link
          href="https://mixin.one/codes/f2a7c34c-f2da-4147-a5e3-9281b7d3c873"
          target="_blank"
        >
          <IconDomeLoop size={20} />
        </Link>
      </div>

      {/* Supplied Amount */}
      {connected && (
        <div className="flex flex-col xl:flex-row xl:items-baseline xl:gap-1">
          {bank.isActive &&
            bank.balanceWithLendingPosition?.position?.isLending &&
            isLPPosition && (
              <>
                {numeralFormatter(bank.balanceWithLendingPosition.amount)}
                <span className="text-sm text-muted-foreground">
                  {bank.token.symbol}
                </span>
              </>
            )}
        </div>
      )}

      <TooltipProvider>
        <div className="flex justify-end gap-2">
          {bank.isActive &&
            !isLeveraged &&
            bank.balanceWithLendingPosition?.position?.isLending &&
            group.selectedAccount && (
              <ActionBoxDialog
                activeGroupArg={group}
                requestedBank={bank}
                requestedAction={ActionType.Withdraw}
                requestedAccount={group.selectedAccount}
              >
                <Button
                  className="border bg-background text-foreground hover:bg-accent"
                  onClick={() => {
                    // capture("yield_withdraw_btn_click", {
                    //   group: group.client.group.address.toBase58(),
                    //   bank: bank.meta.tokenSymbol,
                    // });
                  }}
                >
                  Withdraw
                </Button>
              </ActionBoxDialog>
            )}
          {isLeveraged ? (
            <Tooltip>
              <TooltipTrigger className="cursor-default" asChild>
                <Button
                  disabled
                  className="border bg-background text-foreground hover:bg-accent"
                >
                  Supply
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div>
                  You cannot provide liquidity with an open trade. <br />
                  {/* <Link
                    className="underline"
                    href={
                      'https://docs.domefi.com/the-arena#supply-liquidity-and-earn-yield'
                    }
                    target="_blank"
                  >
                    learn more
                  </Link> */}
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <ActionBoxDialog
              activeGroupArg={group}
              requestedBank={bank}
              requestedAction={ActionType.Deposit}
              requestedAccount={group.selectedAccount ?? undefined}
            >
              <Button
                className="border bg-background text-foreground hover:bg-accent"
                onClick={() => {
                  // capture("yield_supply_btn_click", {
                  //   group: group.client.group.address.toBase58(),
                  //   bank: bank.meta.tokenSymbol,
                  // });
                }}
              >
                Supply
              </Button>
            </ActionBoxDialog>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
};
