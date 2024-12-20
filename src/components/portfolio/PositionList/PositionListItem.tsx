import React from 'react';

import Image from 'next/image';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { tokenPriceFormatter, usdFormatter } from '@/lib';
import { useGroupBanks } from '@/hooks/useGroupBanks';
import { useGroupPosition } from '@/hooks/useGroupPosition';
import { GroupData } from '@/app/stores/tradeStore';
import { TokenSymbol } from '@/components/token-item';
import { useRouter } from '@/navigation';
import { PositionActionButtons } from '../PositionActionButtons';
import { useTradeStore } from '@/app/stores';

interface props {
  group: GroupData;
}

export const PositionListItem = ({ group }: props) => {
  const router = useRouter();
  const { borrowBank, depositBank } = useGroupBanks({ group });
  const { positionSizeUsd, positionSizeToken, totalUsdValue, leverage } =
    useGroupPosition({ group });
  const { connected } = useTradeStore();

  return (
    <TableRow
      className="cursor-pointer transition-colors hover:bg-accent/75"
      onClick={(e) => {
        if (
          e.target instanceof HTMLButtonElement ||
          e.target instanceof HTMLAnchorElement ||
          e.target instanceof SVGElement ||
          (e.target instanceof Element && e.target.hasAttribute('data-state'))
        )
          return;
        router.push(`/trade/${group.groupId}`);
      }}
    >
      <TableCell>
        {group.pool.token.isActive &&
        group.pool.token.balanceWithLendingPosition.position?.isLending ? (
          <Badge className="w-14 justify-center bg-success font-medium uppercase">
            long
          </Badge>
        ) : (
          <Badge className="w-14 justify-center bg-error font-medium uppercase">
            short
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <span className="flex items-center gap-3">
          <TokenSymbol asset={group.pool.token.token} />
          {group.pool.token.token.symbol}
        </span>
      </TableCell>
      <TableCell>{usdFormatter.format(totalUsdValue || 0)}</TableCell>
      <TableCell>{`${leverage}x`}</TableCell>
      <TableCell>
        {positionSizeUsd && positionSizeUsd < 0.01
          ? '< 0.01'
          : usdFormatter.format(positionSizeUsd || 0)}
      </TableCell>
      <TableCell>{tokenPriceFormatter(group.pool.token.token.price)}</TableCell>

      <TableCell>
        {group.pool.token.isActive &&
        group.pool.token.balanceWithLendingPosition?.position
          ?.liquidationPrice ? (
          <>
            {tokenPriceFormatter(
              group.pool.token.balanceWithLendingPosition.position
                .liquidationPrice,
            )}
          </>
        ) : (
          'n/a'
        )}
      </TableCell>
      <TableCell className="text-right">
        {connected && (
          <PositionActionButtons
            isBorrowing={!!borrowBank}
            activeGroup={group}
          />
        )}
      </TableCell>
    </TableRow>
  );
};
