'use client';

import React from 'react';
import { useTradeStore } from '@/app/stores';
import { useIsMobile } from '@/hooks';
import { Desktop, Mobile } from '@/lib/mediaQueryUtils';
import { PageHeading } from '@/components/PageHeading';
import { GroupData, TradePoolFilterStates } from '@/app/stores/tradeStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Loader } from '@/components/Loader';
import Fuse from 'fuse.js';
import { SortAsc, SortDesc } from 'lucide-react';
import { YieldRow } from '@/components/Yield/YieldRow';
import { YieldCard } from '@/components/Yield/YieldCard';
import { IconSortAscending, IconSortDescending } from '@tabler/icons-react';
let fuse: Fuse<GroupData> | null = null;

const sortOptions: {
  value: TradePoolFilterStates;
  label: string;
  dir?: 'asc' | 'desc';
}[] = [
  { value: TradePoolFilterStates.APY_DESC, label: 'APY Desc' },
  { value: TradePoolFilterStates.APY_ASC, label: 'APY Asc', dir: 'asc' },
  { value: TradePoolFilterStates.LIQUIDITY_DESC, label: 'Liquidity Desc' },
  {
    value: TradePoolFilterStates.LIQUIDITY_ASC,
    label: 'Liquidity Asc',
    dir: 'asc',
  },
];

export default function YieldPage() {
  const [connected, initialized, groupMap, sortBy, setSortBy] = useTradeStore(
    (state) => [
      state.connected,
      state.initialized,
      state.groupMap,
      state.sortBy,
      state.setSortBy,
    ],
  );
  const groups = React.useMemo(() => {
    if (!groupMap || !(groupMap instanceof Map)) {
      return [];
    }
    return Array.from(groupMap.values());
  }, [groupMap]);

  React.useEffect(() => {
    fuse = new Fuse(groups, {
      includeScore: true,
      threshold: 0.2,
      keys: [
        {
          name: 'pool.token.meta.tokenSymbol',
          weight: 0.7,
        },
        {
          name: 'pool.quoteTokens[0].meta.tokenSymbol',
          weight: 0.7,
        },
        {
          name: 'pool.token.meta.tokenName',
          weight: 0.3,
        },
        {
          name: 'pool.quoteTokens[0].meta.tokenName',
          weight: 0.3,
        },
        {
          name: 'pool.token.info.state.mint.toBase58()',
          weight: 0.1,
        },
        {
          name: 'pool.quoteTokens[0].info.state.mint.toBase58()',
          weight: 0.1,
        },
      ],
    });
  }, [groups]);

  const isMobile = useIsMobile();
  const [search, setSearch] = React.useState('');

  const filteredGroups = React.useMemo(() => {
    if (!fuse) return groups;
    const results = fuse.search(search).map((result) => result.item);
    if (!results.length && !search) {
      return groups;
    } else if (!results) {
      return [];
    }
    return results;
  }, [groups, search]);

  const dir = React.useMemo(() => {
    const option = sortOptions.find((option) => option.value === sortBy);
    return option?.dir || 'desc';
  }, [sortBy]);

  React.useEffect(() => {
    setSortBy(TradePoolFilterStates.APY_DESC);
  }, [setSortBy]);

  return (
    <div className="container mx-auto px-4 py-8">
      {!initialized && (
        <Loader label="Loading yield farming..." className="mt-8" />
      )}

      {initialized && (
        <>
          <div className="mx-auto w-full max-w-4xl">
            <PageHeading
              heading="Yield farming"
              body={<p>Supply over-collateralized liquidity and earn yield.</p>}
              links={[]}
            />
          </div>

          <Desktop>
            {filteredGroups && filteredGroups.length > 0 && (
              <div
                className={cn(
                  'mb-8 grid items-center gap-4 text-sm text-muted-foreground xl:text-base',
                  connected ? 'grid-cols-7' : 'grid-cols-6',
                )}
              >
                <div className="pl-4">Pool</div>
                <div
                  className={cn(
                    'flex cursor-pointer items-center gap-1 pl-3 transition-colors hover:text-foreground',
                    (sortBy === TradePoolFilterStates.LIQUIDITY_ASC ||
                      sortBy === TradePoolFilterStates.LIQUIDITY_DESC) &&
                      'text-foreground',
                  )}
                  onClick={() => {
                    setSortBy(
                      sortBy === TradePoolFilterStates.LIQUIDITY_DESC
                        ? TradePoolFilterStates.LIQUIDITY_ASC
                        : TradePoolFilterStates.LIQUIDITY_DESC,
                    );
                  }}
                >
                  {sortBy === TradePoolFilterStates.LIQUIDITY_ASC && (
                    <SortAsc size={16} />
                  )}
                  {sortBy === TradePoolFilterStates.LIQUIDITY_DESC && (
                    <SortDesc size={16} />
                  )}
                  Total Deposits
                </div>
                <button
                  className={cn(
                    'flex cursor-pointer items-center justify-end gap-1 transition-colors hover:text-foreground xl:justify-center xl:pr-4',
                    (sortBy === TradePoolFilterStates.APY_ASC ||
                      sortBy === TradePoolFilterStates.APY_DESC) &&
                      'text-foreground',
                  )}
                  onClick={() => {
                    setSortBy(
                      sortBy === TradePoolFilterStates.APY_DESC
                        ? TradePoolFilterStates.APY_ASC
                        : TradePoolFilterStates.APY_DESC,
                    );
                  }}
                >
                  {sortBy === TradePoolFilterStates.APY_ASC && (
                    <SortAsc size={16} />
                  )}
                  {sortBy === TradePoolFilterStates.APY_DESC && (
                    <SortDesc size={16} />
                  )}
                  Lending APY
                </button>
                <div className="text-right xl:text-center">Borrow APY</div>
                <div className="text-center">Created by</div>
                {connected && <div>Supplied</div>}
                <div />
              </div>
            )}
            <div>
              {filteredGroups &&
                filteredGroups.length > 0 &&
                filteredGroups.map((group) => (
                  <YieldRow key={group.groupId} group={group} />
                ))}
            </div>
          </Desktop>

          <Mobile>
            <div className="space-y-12">
              <div className="flex flex-col items-center">
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    setSortBy(value as TradePoolFilterStates);
                  }}
                >
                  <SelectTrigger className="w-[190px] justify-start gap-2">
                    {dir === 'desc' && <IconSortDescending size={16} />}
                    {dir === 'asc' && <IconSortAscending size={16} />}
                    <SelectValue placeholder="Sort pools" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option, i) => (
                      <SelectItem key={i} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {filteredGroups &&
                filteredGroups.length > 0 &&
                filteredGroups.map((group) => {
                  return <YieldCard key={group.groupId} group={group} />;
                })}
            </div>
          </Mobile>

          {filteredGroups.length === 0 && search.length > 0 && (
            <div className="flex w-full items-center justify-center">
              <p>No pools found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
