import React from 'react';

import Image from 'next/image';

import { IconInfoCircle } from '@tabler/icons-react';
import { GroupData } from '@/app/stores/tradeStore';
import { percentFormatter } from '@/lib';
import { Link } from '@/navigation';
import { useGroupBanks } from '@/hooks/useGroupBanks';
import { useGroupPosition } from '@/hooks/useGroupPosition';
import { cn } from '@/lib/utils';
import {
  numeralFormatter,
  tokenPriceFormatter,
  usdFormatter,
} from '@/lib/formatters';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@radix-ui/react-tooltip';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { TokenSymbol } from '../token-item';

type PositionCardProps = {
  groupData: GroupData;
  size?: 'sm' | 'lg';
};

export const PositionCard = ({ size = 'lg', groupData }: PositionCardProps) => {
  const { borrowBank } = useGroupBanks({ group: groupData });
  const { positionSizeUsd, totalUsdValue, leverage } = useGroupPosition({
    group: groupData,
  });

  const healthColor = React.useMemo(() => {
    if (groupData.accountSummary.healthFactor) {
      let color: string;

      if (groupData.accountSummary.healthFactor >= 0.5) {
        color = '#75BA80';
      } else if (groupData.accountSummary.healthFactor >= 0.25) {
        color = '#B8B45F';
      } else {
        color = '#CF6F6F';
      }

      return color;
    } else {
      return '#fff';
    }
  }, [groupData]);

  if (!groupData.pool.token.isActive) return null;

  return (
    <div
      className={cn(
        'space-y-4',
        size === 'lg' && 'rounded-2xl border bg-background p-4',
      )}
    >
      {size === 'lg' && (
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/trade/${groupData.groupId}`}
            className="flex items-center gap-4 font-medium text-muted-foreground"
          >
            {/* <Image
              src={groupData.pool.token.meta.tokenLogoUri}
              alt={groupData.pool.token.meta.tokenSymbol}
              width={56}
              height={56}
              className="rounded-full"
            /> */}
            <TokenSymbol asset={groupData.pool.token.token} />
            <div className="space-y-0.5 leading-none">
              <h2 className="text-lg text-primary">
                {groupData.pool.token.token.name}
              </h2>
              <h3>{groupData.pool.token.token.symbol}</h3>
            </div>
          </Link>
        </div>
      )}
      <div className="rounded-xl bg-accent/50 p-4">
        <dl className="grid w-full grid-cols-2 gap-1 text-sm text-muted-foreground">
          <dt>Token</dt>
          <dd className="text-right text-primary">
            {numeralFormatter(
              groupData.pool.token.balanceWithLendingPosition?.amount ?? 0,
            )}{' '}
            {groupData.pool.token.token.symbol}
          </dd>
          <dt>Value</dt>
          <dd className="text-right text-primary">
            {usdFormatter.format(totalUsdValue ?? 0)} USD
          </dd>
          <dt>Leverage</dt>
          <dd className="text-right text-primary">{`${leverage}x`}</dd>
          <dt>Size</dt>
          <dd className="text-right text-primary">
            {positionSizeUsd && positionSizeUsd < 0.01
              ? '< 0.01'
              : usdFormatter.format(positionSizeUsd ?? 0)}{' '}
            USD
          </dd>

          <dt>Price</dt>
          <dd className="text-right text-primary">
            {tokenPriceFormatter(groupData.pool.token.tokenData?.price ?? 0)}
          </dd>
          {groupData.pool.token.balanceWithLendingPosition?.position
            ?.liquidationPrice && (
            <>
              <dt>Liquidation Price</dt>
              <dd className="text-right text-primary">
                {tokenPriceFormatter(
                  groupData.pool.token.balanceWithLendingPosition?.position
                    ?.liquidationPrice ?? 0,
                )}
              </dd>
            </>
          )}
          <dt className="flex items-center gap-0.5">
            Health Factor{' '}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconInfoCircle size={14} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Health factors indicate how well-collateralized your account
                    is. A value below 0% exposes you to liquidation.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </dt>
          <dd
            className="text-right"
            style={{
              color: healthColor,
            }}
          >
            {percentFormatter.format(groupData.accountSummary.healthFactor)}
          </dd>
        </dl>
      </div>
      {/* <div className="flex items-center justify-between gap-4">
        {groupData.client && groupData.selectedAccount && (
          <PositionActionButtons activeGroup={groupData} isBorrowing={!!borrowBank} rightAlignFinalButton={true} />
        )}
      </div> */}
    </div>
  );
};
