/* eslint-disable no-restricted-imports */
import React from 'react';

import { useRouter } from 'next/navigation';
import { GroupData } from '@/app/stores/tradeStore';
import { useTradeStore } from '@/app/stores';
import { TokenSymbol } from '../token-item';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { TokenCombobox } from '../TokenCombobox';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { tokenPriceFormatter, usdFormatterDyn } from '@/lib/formatters';
import { PoolShare } from './PoolShare';
import {
  aprToApy,
  numeralFormatter,
  percentFormatter,
  usdFormatter,
} from '@/lib';
import { Desktop, Mobile } from '@/lib/mediaQueryUtils';
import { Button } from '../ui/button';
import { cn, shortenAddress } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ActionBoxDialog } from '../common/ActionBox/ActionBoxDialog';
import { ActionType } from '@/lib/mrgnlend';
import { Link } from '@/navigation';
import { PositionCard } from './PositionCard';

export const PoolTradeHeader = ({
  activeGroup,
}: {
  activeGroup: GroupData;
}) => {
  const router = useRouter();

  const [portfolio] = useTradeStore((state) => [state.portfolio]);

  const lpPosition = React.useMemo(() => {
    if (!portfolio) return null;
    const tokenLpPosition = portfolio.lpPositions.find((lp) =>
      activeGroup?.pool.token.info.id
        ? lp.pool.token.info.id === activeGroup?.pool.token.info.id
        : null,
    );
    const quoteTokenLpPosition = portfolio.lpPositions.find((lp) =>
      activeGroup?.pool.quoteTokens[0].info.id
        ? lp.pool.quoteTokens[0].info.id ===
          activeGroup?.pool.quoteTokens[0].info.id
        : null,
    );
    return {
      token: tokenLpPosition,
      quoteToken: quoteTokenLpPosition,
    };
  }, [portfolio, activeGroup]);

  const hasTradePosition = React.useMemo(() => {
    const long = portfolio?.long.find(
      (lp) => lp.pool.token.info.id === activeGroup?.pool.token.info.id,
    );
    const short = portfolio?.short.find(
      (lp) => lp.pool.token.info.id === activeGroup?.pool.token.info.id,
    );
    return long || short;
  }, [portfolio, activeGroup]);
  return (
    <div className="px-4 pb-10 lg:rounded-xl lg:border lg:bg-background lg:px-8 lg:py-10">
      <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
        <div className="flex w-full flex-col items-center px-8 lg:w-1/4 xl:w-1/2">
          <TokenSymbol
            asset={activeGroup.pool.token.token}
            coinIconClassName="w-8 h-8"
            chainIconClassName="w-4 h-4"
            className="mb-2 rounded-full border bg-background lg:mb-0"
          />

          <TokenCombobox
            selected={activeGroup}
            setSelected={(group) => {
              router.push(`/trade/${group.groupId}`);
            }}
          >
            <h1 className="mt-2 flex translate-x-1.5 cursor-pointer items-center gap-1 rounded-md px-2 py-1 pl-3 text-lg font-medium transition-colors hover:bg-accent">
              {activeGroup.pool.token.token.symbol}
              <ChevronDown size={18} />
            </h1>
          </TokenCombobox>
          <p className="mt-2 text-sm text-muted-foreground lg:mt-0">
            {activeGroup.pool.token.token.symbol}
          </p>
          <p className="text-sm text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Link
                    href={`https://mixin.space/asset/${activeGroup.pool.token.token.assetId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-primary"
                  >
                    {shortenAddress(activeGroup.pool.token.bankId)}
                    <ExternalLink size={12} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{activeGroup.pool.token.bankId}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </p>
          <PoolShare activeGroup={activeGroup} />
        </div>
        <div className="w-full space-y-10">
          {activeGroup.pool.token.tokenData && (
            <div className="mx-auto grid w-full max-w-md gap-1 lg:max-w-none lg:grid-cols-3 lg:gap-16">
              <div className="grid grid-cols-2 lg:block">
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-right text-sm lg:text-left lg:text-2xl">
                  {tokenPriceFormatter(activeGroup.pool.token.token.price)}
                  <span
                    className={cn(
                      'ml-1 text-sm',
                      activeGroup.pool.token.tokenData.priceChange24hr > 0
                        ? 'text-mrgn-success'
                        : 'text-mrgn-error',
                    )}
                  >
                    {activeGroup.pool.token.tokenData.priceChange24hr > 0 &&
                      '+'}
                    {usdFormatter.format(
                      activeGroup.pool.token.tokenData.priceChange24hr,
                    )}
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-2 lg:block">
                <p className="text-sm text-muted-foreground">24hr Volume</p>
                <p className="text-right text-sm lg:text-left lg:text-2xl">
                  $
                  {numeralFormatter(
                    activeGroup.pool.token.tokenData?.volume24hr,
                  )}
                  {/* <span
                    className={cn(
                      'ml-1 text-sm',
                      activeGroup.pool.token.tokenData.volumeChange24hr > 0
                        ? 'text-mrgn-success'
                        : 'text-mrgn-error',
                    )}
                  >
                    {activeGroup.pool.token.tokenData.volumeChange24hr > 0 &&
                      '+'}
                    {percentFormatter.format(
                      activeGroup.pool.token.tokenData.volumeChange24hr / 100,
                    )}
                  </span> */}
                </p>
              </div>
              <div className="grid grid-cols-2 lg:block">
                <p className="text-sm text-muted-foreground">Market cap</p>
                <p className="text-right text-sm lg:text-left lg:text-2xl">
                  $
                  {numeralFormatter(activeGroup.pool.token.tokenData.marketCap)}
                </p>
              </div>
              {activeGroup.pool.poolData && (
                <div className="grid grid-cols-2 lg:hidden">
                  <p className="text-sm text-muted-foreground">
                    Lending pool liquidity
                  </p>
                  <p className="text-right text-sm lg:text-left lg:text-2xl">
                    $
                    {numeralFormatter(activeGroup.pool.poolData.totalLiquidity)}
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="mx-auto grid w-full max-w-md gap-4 lg:max-w-none lg:grid-cols-3 lg:gap-16">
            <div className="border-y border-border py-6 lg:border-b-0 lg:border-t-0 lg:py-0">
              <div className="flex flex-row justify-between space-y-2 lg:block">
                <div className="flex translate-y-0.5 items-start gap-2">
                  <TokenSymbol
                    asset={activeGroup.pool.token.token}
                    coinIconClassName="w-8 h-8"
                    chainIconClassName="w-4 h-4"
                    className="rounded-full border bg-background"
                  />
                  <div className="text-sm leading-tight">
                    <p>
                      Total Deposits
                      <br />({activeGroup.pool.token.token.symbol})
                    </p>
                    <p className="text-mrgn-success">
                      {percentFormatter.format(
                        aprToApy(activeGroup.pool.token.info.state.lendingRate),
                      )}{' '}
                      APY
                    </p>
                    {!hasTradePosition &&
                      lpPosition?.token &&
                      lpPosition.token.pool.token.isActive &&
                      activeGroup.selectedAccount && (
                        <p className="mt-2 lg:hidden">Supplied</p>
                      )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 lg:items-start lg:justify-start">
                  <p className="text-right lg:text-left lg:text-2xl">
                    {usdFormatterDyn.format(
                      activeGroup.pool.token.info.state.totalDeposits *
                        activeGroup.pool.token.token.price,
                    )}
                  </p>
                  {!hasTradePosition &&
                    lpPosition?.token &&
                    lpPosition.token.pool.token.isActive &&
                    activeGroup.selectedAccount && (
                      <p className="mt-5 text-right lg:hidden lg:text-left">
                        {usdFormatter.format(
                          lpPosition.token.pool.token.balanceWithLendingPosition
                            .amount * lpPosition.token.pool.token.token.price,
                        )}
                      </p>
                    )}
                  <Desktop>
                    {!hasTradePosition &&
                    lpPosition?.token &&
                    lpPosition.token.pool.token.isActive &&
                    activeGroup.selectedAccount ? (
                      <div>
                        <div className="flex gap-4">
                          <ActionBoxDialog
                            requestedBank={activeGroup.pool.token}
                            requestedAction={ActionType.Deposit}
                            requestedAccount={activeGroup.selectedAccount}
                            activeGroupArg={activeGroup}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-auto w-full px-2 py-1.5 lg:px-4 lg:py-2"
                            >
                              Supply more
                            </Button>
                          </ActionBoxDialog>
                          <ActionBoxDialog
                            requestedBank={activeGroup.pool.token}
                            requestedAction={ActionType.Withdraw}
                            requestedAccount={activeGroup.selectedAccount}
                            activeGroupArg={activeGroup}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-auto w-full px-2 py-1.5 lg:px-4 lg:py-2"
                            >
                              Withdraw
                            </Button>
                          </ActionBoxDialog>
                        </div>
                      </div>
                    ) : (
                      !hasTradePosition && (
                        <ActionBoxDialog
                          requestedBank={activeGroup.pool.token}
                          requestedAction={ActionType.Deposit}
                          requestedAccount={
                            activeGroup.selectedAccount || undefined
                          }
                          activeGroupArg={activeGroup}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-4 h-auto w-full px-2 py-1.5 lg:px-4 lg:py-2"
                          >
                            Supply
                          </Button>
                        </ActionBoxDialog>
                      )
                    )}
                  </Desktop>
                  {/* <Desktop>
                    {!hasTradePosition &&
                    lpPosition?.token &&
                    lpPosition.token.pool.token.isActive &&
                    activeGroup.selectedAccount ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          asChild
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-auto px-2 py-1.5 lg:px-4 lg:py-2"
                          >
                            Supplied{' '}
                            {numeralFormatter(
                              lpPosition.token.pool.token
                                .balanceWithLendingPosition.amount,
                            )}
                            <div className="ml-1 border-l pl-2">
                              <ChevronDown size={14} />
                            </div>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          style={{
                            width: 'var(--radix-dropdown-menu-trigger-width)',
                          }}
                        >
                          <DropdownMenuItem
                            className="text-xs"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <ActionBoxDialog
                              requestedBank={activeGroup.pool.token}
                              requestedAction={ActionType.Deposit}
                              requestedAccount={activeGroup.selectedAccount}
                              activeGroupArg={activeGroup}
                            >
                              <p>Supply more</p>
                            </ActionBoxDialog>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-xs"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <ActionBoxDialog
                              requestedBank={activeGroup.pool.token}
                              requestedAction={ActionType.Withdraw}
                              requestedAccount={activeGroup.selectedAccount}
                              activeGroupArg={activeGroup}
                            >
                              <p>Withdraw</p>
                            </ActionBoxDialog>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      !hasTradePosition && (
                        <ActionBoxDialog
                          requestedBank={activeGroup.pool.token}
                          requestedAction={ActionType.Deposit}
                          requestedAccount={
                            activeGroup.selectedAccount || undefined
                          }
                          activeGroupArg={activeGroup}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-auto px-2 py-1.5 lg:px-4 lg:py-2"
                          >
                            Supply
                          </Button>
                        </ActionBoxDialog>
                      )
                    )}
                  </Desktop> */}
                </div>
              </div>
              <Mobile>
                {!hasTradePosition &&
                lpPosition?.token &&
                lpPosition.token.pool.token.isActive &&
                activeGroup.selectedAccount ? (
                  <div className="mt-4">
                    <div className="flex gap-4">
                      <ActionBoxDialog
                        requestedBank={activeGroup.pool.token}
                        requestedAction={ActionType.Deposit}
                        requestedAccount={activeGroup.selectedAccount}
                        activeGroupArg={activeGroup}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-auto w-full px-2 py-1.5 lg:px-4 lg:py-2"
                        >
                          Supply more
                        </Button>
                      </ActionBoxDialog>
                      <ActionBoxDialog
                        requestedBank={activeGroup.pool.token}
                        requestedAction={ActionType.Withdraw}
                        requestedAccount={activeGroup.selectedAccount}
                        activeGroupArg={activeGroup}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-auto w-full px-2 py-1.5 lg:px-4 lg:py-2"
                        >
                          Withdraw
                        </Button>
                      </ActionBoxDialog>
                    </div>
                  </div>
                ) : (
                  !hasTradePosition && (
                    <ActionBoxDialog
                      requestedBank={activeGroup.pool.token}
                      requestedAction={ActionType.Deposit}
                      requestedAccount={
                        activeGroup.selectedAccount || undefined
                      }
                      activeGroupArg={activeGroup}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-4 h-auto w-full px-2 py-1.5 lg:px-4 lg:py-2"
                      >
                        Supply
                      </Button>
                    </ActionBoxDialog>
                  )
                )}
              </Mobile>
            </div>
            <div className="flex flex-row justify-between space-y-2 lg:block">
              <div className="flex items-start gap-2">
                <TokenSymbol
                  asset={activeGroup.pool.quoteTokens[0].token}
                  coinIconClassName="w-8 h-8"
                  chainIconClassName="w-4 h-4"
                  className="rounded-full border bg-background"
                />
                <div className="text-sm leading-tight">
                  <p>
                    Total Deposits
                    <br />({activeGroup.pool.quoteTokens[0].token.symbol})
                  </p>
                  <p className="text-mrgn-success">
                    {percentFormatter.format(
                      aprToApy(
                        activeGroup.pool.quoteTokens[0].info.state.lendingRate,
                      ),
                    )}
                  </p>
                  {!hasTradePosition &&
                    lpPosition?.quoteToken &&
                    lpPosition.quoteToken.pool.quoteTokens[0].isActive &&
                    activeGroup.selectedAccount && (
                      <p className="mt-2 lg:hidden">Supplied</p>
                    )}
                </div>
              </div>
              <div className="flex flex-col gap-2 lg:items-start lg:justify-start">
                <p className="text-right lg:text-left lg:text-2xl">
                  {usdFormatterDyn.format(
                    activeGroup.pool.quoteTokens[0].info.state.totalDeposits *
                      activeGroup.pool.quoteTokens[0].token.price,
                  )}
                </p>
                {!hasTradePosition &&
                  lpPosition?.quoteToken &&
                  lpPosition.quoteToken.pool.quoteTokens[0].isActive &&
                  activeGroup.selectedAccount && (
                    <p className="mt-5 text-right lg:hidden lg:text-left">
                      {usdFormatter.format(
                        lpPosition.quoteToken.pool.quoteTokens[0]
                          .balanceWithLendingPosition &&
                          lpPosition.quoteToken.pool.quoteTokens[0]
                            .balanceWithLendingPosition.amount *
                            lpPosition.quoteToken.pool.quoteTokens[0].token
                              .price,
                      )}
                    </p>
                  )}
                <Desktop>
                  {!hasTradePosition &&
                  lpPosition?.quoteToken &&
                  lpPosition.quoteToken.pool.quoteTokens[0].isActive &&
                  activeGroup.selectedAccount ? (
                    <div>
                      <div className="flex gap-4">
                        <ActionBoxDialog
                          requestedBank={activeGroup.pool.quoteTokens[0]}
                          requestedAction={ActionType.Deposit}
                          requestedAccount={activeGroup.selectedAccount}
                          activeGroupArg={activeGroup}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-auto w-full px-2 py-1.5 lg:px-4 lg:py-2"
                          >
                            Supply more
                          </Button>
                        </ActionBoxDialog>
                        <ActionBoxDialog
                          requestedBank={activeGroup.pool.quoteTokens[0]}
                          requestedAction={ActionType.Withdraw}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-auto w-full px-2 py-1.5 lg:px-4 lg:py-2"
                          >
                            Withdraw
                          </Button>
                        </ActionBoxDialog>
                      </div>
                    </div>
                  ) : (
                    !hasTradePosition && (
                      <ActionBoxDialog
                        requestedBank={activeGroup.pool.quoteTokens[0]}
                        requestedAction={ActionType.Deposit}
                        requestedAccount={
                          activeGroup.selectedAccount || undefined
                        }
                        activeGroupArg={activeGroup}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-auto w-full px-2 py-1.5 lg:px-4 lg:py-2"
                        >
                          Supply
                        </Button>
                      </ActionBoxDialog>
                    )
                  )}
                </Desktop>
                {/* <Desktop>
                  {!hasTradePosition &&
                  lpPosition?.quoteToken &&
                  lpPosition.quoteToken.pool.quoteTokens[0].isActive &&
                  activeGroup.selectedAccount ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-auto px-2 py-1.5 lg:px-4 lg:py-2"
                        >
                          Supplied{' '}
                          {numeralFormatter(
                            lpPosition.quoteToken.pool.quoteTokens[0]
                              .balanceWithLendingPosition.amount,
                          )}
                          <div className="ml-1 border-l pl-2">
                            <ChevronDown size={14} />
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        style={{
                          width: 'var(--radix-dropdown-menu-trigger-width)',
                        }}
                      >
                        <DropdownMenuItem
                          className="text-xs"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <ActionBoxDialog
                            requestedBank={activeGroup.pool.quoteTokens[0]}
                            requestedAction={ActionType.Deposit}
                            requestedAccount={activeGroup.selectedAccount}
                            activeGroupArg={activeGroup}
                          >
                            <p>Supply more</p>
                          </ActionBoxDialog>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-xs"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <ActionBoxDialog
                            requestedBank={activeGroup.pool.quoteTokens[0]}
                            requestedAction={ActionType.Withdraw}
                          >
                            <p>Withdraw</p>
                          </ActionBoxDialog>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    !hasTradePosition && (
                      <ActionBoxDialog
                        requestedBank={activeGroup.pool.quoteTokens[0]}
                        requestedAction={ActionType.Deposit}
                        requestedAccount={
                          activeGroup.selectedAccount || undefined
                        }
                        activeGroupArg={activeGroup}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-auto px-2 py-1.5 lg:px-4 lg:py-2"
                        >
                          Supply
                        </Button>
                      </ActionBoxDialog>
                    )
                  )}
                </Desktop> */}
              </div>
            </div>
            <Mobile>
              {!hasTradePosition &&
              lpPosition?.quoteToken &&
              lpPosition.quoteToken.pool.quoteTokens[0].isActive &&
              activeGroup.selectedAccount ? (
                <div>
                  <div className="flex gap-4">
                    <ActionBoxDialog
                      requestedBank={activeGroup.pool.quoteTokens[0]}
                      requestedAction={ActionType.Deposit}
                      requestedAccount={activeGroup.selectedAccount}
                      activeGroupArg={activeGroup}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-auto w-full px-2 py-1.5 lg:px-4 lg:py-2"
                      >
                        Supply more
                      </Button>
                    </ActionBoxDialog>
                    <ActionBoxDialog
                      requestedBank={activeGroup.pool.quoteTokens[0]}
                      requestedAction={ActionType.Withdraw}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-auto w-full px-2 py-1.5 lg:px-4 lg:py-2"
                      >
                        Withdraw
                      </Button>
                    </ActionBoxDialog>
                  </div>
                </div>
              ) : (
                !hasTradePosition && (
                  <ActionBoxDialog
                    requestedBank={activeGroup.pool.quoteTokens[0]}
                    requestedAction={ActionType.Deposit}
                    requestedAccount={activeGroup.selectedAccount || undefined}
                    activeGroupArg={activeGroup}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-auto w-full px-2 py-1.5 lg:px-4 lg:py-2"
                    >
                      Supply
                    </Button>
                  </ActionBoxDialog>
                )
              )}
            </Mobile>
          </div>
        </div>
      </div>
      {hasTradePosition && (
        <Mobile>
          <div className="mt-8 space-y-2">
            <p className="flex items-center text-sm">
              <span
                className={cn(
                  'mr-2 flex h-2.5 w-2.5 rounded-full',
                  activeGroup.pool.token.isActive &&
                    activeGroup.pool.token.balanceWithLendingPosition?.position
                      ?.isLending
                    ? 'bg-mrgn-green'
                    : 'bg-mrgn-error',
                )}
              ></span>
              Open{' '}
              {activeGroup.pool.token.isActive &&
              activeGroup.pool.token.balanceWithLendingPosition?.position
                ?.isLending
                ? 'long '
                : 'short '}
              position
            </p>
            {/* TODO PositionCard */}
            <PositionCard groupData={activeGroup} size="sm" />
          </div>
        </Mobile>
      )}
    </div>
  );
};
