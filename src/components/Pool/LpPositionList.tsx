import React from 'react';

import Image from 'next/image';
import { useTradeStore } from '@/app/stores';
import { Desktop, Mobile } from '@/lib/mediaQueryUtils';
import {
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Link } from '@/navigation';
import { TokenSymbol } from '../token-item';
import { numeralFormatter, usdFormatter } from '@/lib';
import { LpActionButtons } from './LpActionButtons';

export const LpPositionList = () => {
  const [portfolio] = useTradeStore((state) => [state.portfolio]);

  if (!portfolio || !portfolio.lpPositions.length) {
    return null;
  }

  return (
    <>
      <h2 className="mb-4 mt-10 text-2xl font-medium">LP Positions</h2>
      <Desktop>
        <div className="rounded-xl">
          <Table className="min-w-[600px] overflow-auto">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[20%]">Pool</TableHead>
                <TableHead className="w-[20%]">Token Size</TableHead>
                <TableHead className="w-[20%]">USDC Size</TableHead>
                <TableHead className="w-[20%]">Total (USD)</TableHead>
                <TableHead className="w-[20%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolio.lpPositions.map((group, i) => {
                return (
                  <TableRow key={i} className="">
                    <TableCell>
                      <Link
                        href={`/trade/${group.groupId}`}
                        className="flex shrink-0 items-center gap-3 transition-colors"
                      >
                        <div className="flex shrink-0">
                          <TokenSymbol asset={group.pool.token.token} />
                          <TokenSymbol
                            asset={group.pool.quoteTokens[0].token}
                          />
                        </div>{' '}
                        {`${group.pool.token.token.symbol}/${group.pool.quoteTokens[0].token.symbol} `}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {group.pool.token.isActive
                        ? group.pool.token.balanceWithLendingPosition?.position
                            ?.amount &&
                          group.pool.token.balanceWithLendingPosition?.position
                            ?.amount < 0.00000001
                          ? '0'
                          : numeralFormatter(
                              group.pool.token.balanceWithLendingPosition
                                ?.position?.amount ?? 0,
                            )
                        : 0}
                    </TableCell>
                    <TableCell>
                      {group.pool.quoteTokens[0].isActive
                        ? group.pool.quoteTokens[0].balanceWithLendingPosition
                            ?.position?.amount &&
                          group.pool.quoteTokens[0].balanceWithLendingPosition
                            ?.position?.amount < 0.00000001
                          ? '0'
                          : numeralFormatter(
                              group.pool.quoteTokens[0]
                                .balanceWithLendingPosition?.position?.amount ??
                                0,
                            )
                        : 0}
                    </TableCell>
                    <TableCell>
                      {(group.pool.token.isActive ||
                        group.pool.quoteTokens[0].isActive) &&
                        usdFormatter.format(
                          (group.pool.token.isActive
                            ? Number(
                                group.pool.token.balanceWithLendingPosition
                                  ?.position?.usdValue,
                              ) ?? 0
                            : 0) +
                            (group.pool.quoteTokens[0].isActive
                              ? Number(
                                  group.pool.quoteTokens[0]
                                    .balanceWithLendingPosition?.position
                                    ?.usdValue,
                                ) ?? 0
                              : 0),
                        )}
                    </TableCell>

                    <TableCell className="text-right">
                      {group.selectedAccount && (
                        <LpActionButtons
                          Account={group.selectedAccount}
                          activeGroup={group}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Desktop>
      <Mobile>
        <div className="space-y-8">
          {portfolio.lpPositions.map((group, i) => {
            return (
              <div
                key={i}
                className="space-y-4 rounded-lg border border-border bg-background p-4"
              >
                <Link
                  href={`/trade/${group.groupId}`}
                  className="flex shrink-0 items-center gap-3 transition-colors"
                >
                  <div className="flex shrink-0">
                    <TokenSymbol asset={group.pool.token.token} />
                    <TokenSymbol asset={group.pool.quoteTokens[0].token} />
                  </div>{' '}
                  {`${group.pool.token.token.symbol}/${group.pool.quoteTokens[0].token.symbol} `}
                </Link>
                <div>
                  <div className="rounded-lg bg-accent p-2">
                    <p className="flex justify-between gap-2 text-muted-foreground">
                      {group.pool.token.token.symbol} supplied
                      <span className="text-primary">
                        {usdFormatter.format(
                          group.pool.token.isActive
                            ? (group.pool.token.balanceWithLendingPosition
                                ?.position?.amount ?? 0) < 0.00000001
                              ? 0
                              : (group.pool.token.balanceWithLendingPosition
                                  ?.position?.amount ?? 0) *
                                (group.pool.token.tokenData?.price ?? 0)
                            : 0,
                        )}
                      </span>
                    </p>
                    <p className="flex justify-between gap-2 text-muted-foreground">
                      {group.pool.quoteTokens[0].token.symbol} supplied
                      <span className="text-primary">
                        {usdFormatter.format(
                          group.pool.quoteTokens[0].isActive
                            ? (group.pool.quoteTokens[0]
                                .balanceWithLendingPosition?.position?.amount ??
                                0) < 0.00000001
                              ? 0
                              : (group.pool.quoteTokens[0]
                                  .balanceWithLendingPosition?.position
                                  ?.amount ?? 0) *
                                (group.pool.quoteTokens[0].tokenData?.price ??
                                  0)
                            : 0,
                        )}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <LpActionButtons
                    size="lg"
                    Account={group.selectedAccount || undefined}
                    activeGroup={group}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Mobile>
    </>
  );
};
