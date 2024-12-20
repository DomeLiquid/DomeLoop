import React from 'react';

import Image from 'next/image';

// import {
//   usdFormatter,
//   tokenPriceFormatter,
//   percentFormatter,
//   numeralFormatter,
//   shortenAddress,
// } from '@mrgnlabs/mrgn-common';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { GroupData } from '@/app/stores/tradeStore';
import { Tooltip, TooltipTrigger } from '../ui/tooltip';
import { TooltipContent } from '../ui/tooltip';
import { TooltipProvider } from '../ui/tooltip';
import { Link } from '@/navigation';
import { TokenSymbol } from '../token-item';
import {
  IconDomeLoop,
  IconMixin,
  numeralFormatter,
  percentFormatter,
  tokenPriceFormatter,
  usdFormatter,
} from '@/lib';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

type PoolCardProps = {
  groupData: GroupData;
};

export const PoolCard = ({ groupData }: PoolCardProps) => {
  return (
    <div>
      <Card>
        <CardHeader className="md:pb-0">
          <CardTitle>
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/trade/${groupData.groupId}`}
                className="flex cursor-pointer items-center justify-between gap-2"
              >
                <TokenSymbol asset={groupData.pool.token.token} />{' '}
                <div className="flex flex-col space-y-0.5">
                  <h2>{groupData.pool.token.token.symbol}</h2>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm text-muted-foreground">
                          {/* {shortenAddress(groupData.pool.token.info.state.mint)} */}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {/* <p>{groupData.pool.token.info.state.mint.toBase58()}</p> */}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </Link>
              <div className="ml-auto flex flex-col items-center gap-1 self-start text-xs font-medium">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="https://mixin.one/codes/f2a7c34c-f2da-4147-a5e3-9281b7d3c873"
                        target="_blank"
                      >
                        {/* <IconMixin size={20} /> */}
                        <IconDomeLoop size={20} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Pool created by domefi</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-6 pt-4">
          {groupData.pool.token.tokenData && (
            <div className="mt-2 grid w-full grid-cols-1 gap-1.5 text-sm text-muted-foreground">
              <div className="flex flex-col">
                <div className="flex justify-between">
                  <dt>Price</dt>
                  <dd className="text-right tracking-wide text-primary">
                    {tokenPriceFormatter(groupData.pool.token.tokenData.price)}
                    {groupData.pool.token.tokenData.priceChange24hr && (
                      <span
                        className={cn(
                          'ml-2 text-xs',
                          groupData.pool.token.tokenData.priceChange24hr > 0
                            ? 'text-mrgn-success'
                            : 'text-mrgn-error',
                        )}
                      >
                        {groupData.pool.token.tokenData.priceChange24hr > 0 &&
                          '+'}
                        {usdFormatter.format(
                          groupData.pool.token.tokenData.priceChange24hr,
                        )}
                      </span>
                    )}
                  </dd>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between">
                  <dt>24hr vol</dt>
                  <dd className="text-right tracking-wide text-primary">
                    $
                    {numeralFormatter(
                      groupData.pool.token.tokenData.volume24hr,
                    )}
                    {groupData.pool.token.tokenData?.volumeChange24hr && (
                      <span
                        className={cn(
                          'ml-2 text-xs',
                          groupData.pool.token.tokenData.volumeChange24hr > 0
                            ? 'text-mrgn-success'
                            : 'text-mrgn-error',
                        )}
                      >
                        {groupData.pool.token.tokenData.volumeChange24hr > 0 &&
                          '+'}
                        {percentFormatter.format(
                          groupData.pool.token.tokenData.volumeChange24hr / 100,
                        )}
                      </span>
                    )}
                  </dd>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between">
                  <dt>Market cap</dt>
                  <dd className="text-right tracking-wide text-primary">
                    $
                    {numeralFormatter(groupData.pool.token.tokenData.marketCap)}
                  </dd>
                </div>
              </div>
              {groupData.pool.poolData && (
                <div className="flex flex-col">
                  <div className="flex justify-between">
                    <dt>Lending pool liquidity</dt>
                    <dd className="text-right tracking-wide text-primary">
                      $
                      {numeralFormatter(groupData.pool.poolData.totalLiquidity)}
                    </dd>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center gap-3">
            <Link
              href={`/trade/${groupData.groupId}?side=long`}
              className="w-full"
            >
              <Button variant="long" className="w-full">
                Long
              </Button>
            </Link>
            <Link
              href={`/trade/${groupData.groupId}?side=short`}
              className="w-full"
            >
              <Button variant="short" className="w-full">
                Short
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
