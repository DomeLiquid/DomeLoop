'use client';

import { useTradeStore } from '@/app/stores';
import { Loader } from '@/components/Loader';
import { PageHeading } from '@/components/PageHeading';
import { LpPositionList } from '@/components/Pool/LpPositionList';
import { PositionCard } from '@/components/Pool/PositionCard';
import { TokenSymbol } from '@/components/token-item';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { groupedNumberFormatterDyn, usdFormatter } from '@/lib';
import { cn } from '@/lib/utils';
import { Link } from '@/navigation';
import Image from 'next/image';
import React from 'react';

export default function Page() {
  const [initialized, portfolio] = useTradeStore((state) => [
    state.initialized,
    state.portfolio,
  ]);

  const totalLong = React.useMemo(() => {
    return (
      portfolio?.long.reduce(
        (acc, group) =>
          group.pool.token.isActive
            ? acc +
              (Number(
                group.pool.token.balanceWithLendingPosition?.position?.usdValue,
              ) ?? 0)
            : 0,
        0,
      ) || 0
    );
  }, [portfolio]);

  const totalShort = React.useMemo(() => {
    return (
      portfolio?.short.reduce(
        (acc, group) =>
          group.pool.token.isActive
            ? acc +
              (Number(
                group.pool.token.balanceWithLendingPosition?.position?.usdValue,
              ) ?? 0)
            : 0,
        0,
      ) || 0
    );
  }, [portfolio]);

  const portfolioCombined = React.useMemo(() => {
    if (!portfolio) return null;

    return [
      ...portfolio.long,
      ...portfolio.short,
      ...portfolio.lpPositions,
    ].sort((a, b) =>
      a.pool.token.isActive && b.pool.token.isActive
        ? (a.pool.token.balanceWithLendingPosition?.position?.usdValue ?? 0) -
          (b.pool.token.balanceWithLendingPosition?.position?.usdValue ?? 0)
        : 0,
    );
  }, [portfolio]);

  return (
    <div className="mx-auto min-h-[calc(100vh-100px)] w-full max-w-8xl px-4 pb-28 pt-12 md:px-8">
      {!initialized && <Loader label="Loading portfolio..." className="mt-8" />}
      {initialized && (
        <div className="space-y-4">
          <div className="mx-auto w-full max-w-4xl px-4 md:px-0">
            <PageHeading
              heading="Portfolio"
              body={<p>Manage your positions.</p>}
              links={[]}
            />
          </div>
          {!portfolio ||
          (!portfolio.long.length &&
            !portfolio.short.length &&
            !portfolio.lpPositions.length) ? (
            <p className="mt-4 text-center">
              You do not have any open positions.
              <br className="md:hidden" />{' '}
              <Link
                href="/"
                className="border-b border-primary transition-colors hover:border-transparent"
              >
                Explore the pools
              </Link>{' '}
              and start trading!
            </p>
          ) : (
            <div className="mx-auto max-w-6xl space-y-12">
              <div
                className={cn(
                  'grid w-full grid-cols-2 gap-8',
                  portfolioCombined ? 'md:grid-cols-3' : 'md:grid-col-2',
                )}
              >
                <StatBlock
                  label="Total long (USD)"
                  value={usdFormatter.format(totalLong)}
                />
                <StatBlock
                  label="Total short (USD)"
                  value={usdFormatter.format(totalShort)}
                />
                {portfolioCombined && portfolioCombined.length > 0 && (
                  <div className="col-span-2 md:col-span-1">
                    <StatBlock
                      label="Active pools"
                      value={
                        <div className="flex items-center gap-4">
                          {groupedNumberFormatterDyn.format(
                            portfolioCombined.length,
                          )}
                          <ul className="flex items-center -space-x-2">
                            {portfolioCombined
                              .slice(0, 5)
                              .map((group, index) => (
                                <li
                                  key={index}
                                  className="rounded-full bg-white"
                                >
                                  <TokenSymbol
                                    asset={group.pool.token.token}
                                    className="rounded-full border bg-background"
                                  />
                                </li>
                              ))}
                          </ul>
                          {portfolioCombined?.length - 5 > 0 && (
                            <p className="text-sm text-muted-foreground">
                              +{portfolioCombined?.length - 5} more
                            </p>
                          )}
                        </div>
                      }
                    />
                  </div>
                )}
              </div>
              <div className="grid w-full grid-cols-1 gap-12 md:grid-cols-2">
                {portfolio.long.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-medium">Long positions</h2>
                    <div className="space-y-8">
                      {portfolio.long.map((group, index) => (
                        <PositionCard key={index} groupData={group} />
                      ))}
                    </div>
                  </div>
                )}
                {portfolio.short.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-medium">Short positions</h2>
                    <div className="space-y-8">
                      {portfolio.short.map((group, index) => (
                        <PositionCard key={index} groupData={group} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <LpPositionList />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type StatProps = {
  label: JSX.Element | string;
  value: JSX.Element | string;
  subValue?: JSX.Element | string;
};

const StatBlock = ({ label, value, subValue }: StatProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-normal text-muted-foreground">
        {label}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl">
        {value}{' '}
        {subValue && (
          <span className="text-lg text-muted-foreground">{subValue}</span>
        )}
      </div>
    </CardContent>
  </Card>
);
