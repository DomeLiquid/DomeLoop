import React from 'react';

import Image from 'next/image';
import { GroupData } from '@/app/stores/tradeStore';
import { useTradeStore } from '@/app/stores';
import { Desktop, Mobile } from '@/lib/mediaQueryUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import {
  percentFormatter,
  tokenPriceFormatter,
  usdFormatter,
  usdFormatterDyn,
} from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { TokenSymbol } from '../token-item';
import { Drawer, DrawerContent, DrawerTrigger } from '../ui/drawer';
import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';
type TokenComboboxProps = {
  selected: GroupData | null;
  setSelected: (groupData: GroupData) => void;
  children?: React.ReactNode;
};

export const TokenCombobox = ({
  selected,
  setSelected,
  children,
}: TokenComboboxProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [groupMap] = useTradeStore((state) => [state.groupMap]);

  const groups = React.useMemo(() => {
    const allGroups = Array.from(groupMap.values()).sort((a, b) => {
      return a.pool.poolData && b.pool.poolData
        ? b.pool.poolData.totalLiquidity - a.pool.poolData.totalLiquidity
        : 0;
    });

    if (!search) return allGroups;

    return allGroups.filter((group) => {
      const searchLower = search.toLowerCase();
      return (
        group.pool.token.token.symbol.toLowerCase().includes(searchLower) ||
        group.pool.token.token.name.toLowerCase().includes(searchLower)
      );
    });
  }, [groupMap, search]);

  return (
    <>
      <Desktop>
        <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
          <DialogTrigger asChild>
            <div>
              {children ? children : <TokenTrigger selected={selected} />}
            </div>
          </DialogTrigger>
          <DialogContent
            className="m-0 bg-background p-4"
            hideClose={true}
            hidePadding={true}
            size="sm"
            position="top"
          >
            <DialogHeader className="sr-only">
              <DialogTitle>Select a token</DialogTitle>
              <DialogDescription>Select a token to trade</DialogDescription>
            </DialogHeader>
            <div className="relative h-[500px] overflow-auto">
              <Command>
                <CommandInput
                  placeholder="Select pool..."
                  autoFocus={true}
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {groups.map((group, index) => (
                      <CommandItem
                        key={index}
                        className="cursor-pointer gap-3 rounded-md py-2 aria-selected:text-primary"
                        value={`${group.pool.token.token.symbol} ${group.pool.token.token.name}`}
                        onSelect={(value: string) => {
                          const selBank = groups.find(
                            (group) =>
                              `${group.pool.token.token.symbol} ${group.pool.token.token.name}` ===
                              value,
                          );
                          if (!selBank) return;
                          setSelected(selBank);
                          setOpen(false);
                        }}
                      >
                        <TokenSymbol asset={group.pool.token.token} />
                        <span>{group.pool.token.token.symbol}</span>
                        {group.pool.token.tokenData && (
                          <div className="ml-auto flex w-[40%] items-center justify-between gap-1 text-xs text-muted-foreground">
                            <span>
                              {tokenPriceFormatter(
                                group.pool.token.tokenData?.price,
                              )}
                            </span>
                            <span
                              className={cn(
                                group.pool.token.tokenData?.priceChange24hr > 1
                                  ? 'text-mrgn-success'
                                  : 'text-mrgn-error',
                              )}
                            >
                              {group.pool.token.tokenData?.priceChange24hr > 1
                                ? '+'
                                : ''}
                              {usdFormatter.format(
                                group.pool.token.tokenData?.priceChange24hr,
                              )}
                            </span>
                          </div>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </DialogContent>
        </Dialog>
      </Desktop>
      <Mobile>
        <Drawer open={open} onOpenChange={(open) => setOpen(open)}>
          <DrawerTrigger asChild>
            <div>
              {children ? children : <TokenTrigger selected={selected} />}
            </div>
          </DrawerTrigger>
          <DrawerContent
            className="z-[55] mt-0 h-full p-2"
            hideTopTrigger={true}
          >
            <DialogHeader className="sr-only">
              <DialogTitle>Select a token</DialogTitle>
              <DialogDescription>Select a token to trade</DialogDescription>
            </DialogHeader>
            <Command>
              <CommandInput
                placeholder="Select pool..."
                autoFocus={true}
                value={search}
                onValueChange={setSearch}
              />
              <CommandList className="max-h-[390px]">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {groups.map((group, index) => (
                    <CommandItem
                      key={index}
                      className="cursor-pointer gap-3 rounded-md py-2 aria-selected:text-primary"
                      value={`${group.pool.token.token.symbol} ${group.pool.token.token.name}`}
                      onSelect={(value) => {
                        const selBank = groups.find(
                          (group) =>
                            `${group.pool.token.token.symbol} ${group.pool.token.token.name}` ===
                            value,
                        );
                        if (!selBank) return;
                        setSelected(selBank);
                        setOpen(false);
                      }}
                    >
                      <TokenSymbol asset={group.pool.token.token} />
                      <span>{group.pool.token.token.symbol}</span>
                      {group.pool.token.tokenData && (
                        <div className="ml-auto flex w-full max-w-[160px] items-center justify-between gap-1 text-sm text-muted-foreground">
                          <span>
                            {tokenPriceFormatter(
                              group.pool.token.tokenData?.price,
                            )}
                          </span>
                          <span
                            className={cn(
                              'text-xs',
                              group.pool.token.tokenData?.priceChange24hr > 1
                                ? 'text-mrgn-success'
                                : 'text-mrgn-error',
                            )}
                          >
                            {usdFormatter.format(
                              group.pool.token.tokenData?.priceChange24hr,
                            )}
                          </span>
                        </div>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </DrawerContent>
        </Drawer>
      </Mobile>
    </>
  );
};

const TokenTrigger = ({ selected }: { selected: GroupData | null }) => {
  return (
    <Button
      variant="secondary"
      size="lg"
      className="relative w-full justify-start py-3 pl-3 pr-8"
    >
      {selected !== null ? (
        <>
          <TokenSymbol asset={selected.pool.token.token} />
          {selected.pool.token.token.symbol}
        </>
      ) : (
        <>Select pool</>
      )}
      <div>
        <ChevronDown size={18} className="ml-auto" />
      </div>
    </Button>
  );
};
