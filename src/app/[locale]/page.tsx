'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { cn } from '@/lib/utils';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useTradeStore } from '../stores';
import { Loader } from '@/components/Loader';
import { motion } from 'framer-motion';
import { PoolSearch } from '@/components/Pool/PoolSearch/PoolSearch';
import { PageHeading } from '@/components/PageHeading';
import { TradePoolFilterStates } from '../stores/tradeStore';
import React from 'react';
import {
  LucideArrowUp,
  LucideArrowDown,
  LucideDotSquare,
  Sparkles,
  Grip,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
} from '@/components/ui/select';
import { PoolCard } from '@/components/Pool/PoolCard';

const sortOptions: {
  value: TradePoolFilterStates;
  label: string;
  dir?: 'asc' | 'desc';
}[] = [
  { value: TradePoolFilterStates.TIMESTAMP, label: 'Recently created' },
  {
    value: TradePoolFilterStates.PRICE_MOVEMENT_DESC,
    label: '24hr price movement',
  },
  {
    value: TradePoolFilterStates.LIQUIDITY_DESC,
    label: 'Lending pool liquidity',
  },
  { value: TradePoolFilterStates.MARKET_CAP_DESC, label: 'Market cap desc' },
  {
    value: TradePoolFilterStates.MARKET_CAP_ASC,
    label: 'Market cap asc',
    dir: 'asc',
  },
];

enum View {
  GRID = 'grid',
  LIST = 'list',
}

export default function Home() {
  const t = useTranslations('Header');

  const router = useRouter();
  const isMobile = useIsMobile();
  const [
    initialized,
    groupMap,
    currentPage,
    totalPages,
    setCurrentPage,
    sortBy,
    setSortBy,
  ] = useTradeStore((state) => [
    state.initialized,
    state.groupMap,
    state.currentPage,
    state.totalPages,
    state.setCurrentPage,
    state.sortBy,
    state.setSortBy,
  ]);

  const groups = React.useMemo(() => {
    return Array.from(groupMap.values());
  }, [groupMap]);

  const handleFeelingLucky = React.useCallback(() => {
    const randomIndex = Math.floor(Math.random() * groups.length);
    const randomGroup = groups[randomIndex];
    if (!randomGroup) return;
    // capture('feeling_lucky', {
    //   groupAddress: randomGroup.groupPk.toBase58(),
    //   tokenAddress: randomGroup.pool.token.info.state.mint.toString(),
    //   tokenSymbol: randomGroup.pool.token.meta.tokenSymbol,
    // });
    router.push(`/trade/${randomGroup.groupId}`);
  }, [groups, router]);

  React.useEffect(() => {
    setSortBy(TradePoolFilterStates.PRICE_MOVEMENT_DESC);
  }, [setSortBy]);

  const [view, setView] = React.useState<View>(View.GRID);

  const dir = React.useMemo(() => {
    const option = sortOptions.find((option) => option.value === sortBy);
    return option?.dir || 'desc';
  }, [sortBy]);

  return (
    <>
      <main className="mt-24 flex items-center justify-center">
        <div className="container flex max-w-[64rem] flex-col items-center gap-8 text-center">
          {!initialized && (
            <Loader label="Loading the dome..." className="mt-8" />
          )}

          {initialized && (
            <>
              <div className="mx-auto w-full max-w-4xl">
                <PageHeading
                  size="lg"
                  heading={
                    <div className="flex flex-col gap-2 md:inline">
                      Welcome to the dome
                    </div>
                  }
                  body={<p>Trading with leverage.</p>}
                  animate={true}
                />
                <motion.div
                  data-search
                  className="search flex flex-col items-center gap-4 md:gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  {/* <PoolSearch showNoResults={false} /> */}

                  <Button
                    variant="outline"
                    onClick={handleFeelingLucky}
                    size={isMobile ? 'sm' : 'default'}
                    className="bg-transparent"
                  >
                    <Sparkles size={isMobile ? 16 : 18} /> I&apos;m feeling
                    lucky
                  </Button>
                </motion.div>
              </div>

              <div className="w-full space-y-6 py-12 md:pt-16">
                <motion.div
                  data-filter
                  className="flex items-center justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  <ToggleGroup
                    type="single"
                    value={view}
                    onValueChange={(value) => {
                      if (!value) return;
                      setView(value as View);
                    }}
                    className="hidden gap-2 self-baseline lg:flex"
                  >
                    <ToggleGroupItem
                      value={View.GRID}
                      aria-label="Grid View"
                      className="gap-1.5 border"
                    >
                      <Grip size={16} /> Grid
                    </ToggleGroupItem>
                    {/* <ToggleGroupItem
                      value={View.LIST}
                      aria-label="List View"
                      className="gap-1.5 border"
                    >
                      <List size={16} /> List
                    </ToggleGroupItem> */}
                  </ToggleGroup>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => {
                      setSortBy(value as TradePoolFilterStates);
                    }}
                  >
                    <SelectTrigger className="w-[210px] justify-start gap-2 border border-border bg-background">
                      {dir === 'desc' && <ArrowDownWideNarrow size={16} />}
                      {dir === 'asc' && <ArrowUpWideNarrow size={16} />}
                      <SelectValue placeholder="Sort pools" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {sortOptions.map((option, i) => (
                        <SelectItem
                          key={i}
                          value={option.value}
                          className="focus:bg-accent"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
                {view === View.GRID && (
                  <motion.div
                    className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.15,
                          delayChildren: 1.5,
                        },
                      },
                    }}
                  >
                    {groups.length > 0 &&
                      groups.map((group, i) => (
                        <motion.div
                          key={i}
                          variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1 },
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <PoolCard groupData={group} />
                        </motion.div>
                      ))}
                  </motion.div>
                )}
                {view === View.LIST && (
                  <div className="w-full space-y-2">
                    <div className="grid w-full grid-cols-7 text-muted-foreground">
                      <div className="pl-5">Asset</div>
                      <div className="pl-2.5">Price</div>
                      <div className="pl-2">24hr Volume</div>
                      <div>Market cap</div>
                      <div>Lending pool liquidity</div>
                      <div className="pl-2">Created by</div>
                      <div />
                    </div>
                    <div className="rounded-xl border bg-background px-4 py-1">
                      {groups.length > 0 &&
                        groups.map((group, i) => (
                          // <PoolListItem
                          //   key={i}
                          //   groupData={group}
                          //   last={i === groups.length - 1}
                          // />
                          <></>
                        ))}
                    </div>
                  </div>
                )}
                {/* {currentPage < totalPages && (
                <div className="py-8 flex justify-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      if (currentPage >= totalPages) return;
                      setCurrentPage(currentPage + 1);
                    }}
                  >
                    Load more pools
                  </Button>
                </div>
              )} */}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
