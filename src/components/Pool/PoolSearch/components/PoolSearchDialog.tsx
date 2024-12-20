import React from 'react';

import { FuseResult } from 'fuse.js';
import { GroupData } from '@/app/stores/tradeStore';
import { Search, X } from 'lucide-react';
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandEmpty,
} from '@/components/ui/command';
import { TokenSymbol } from '@/components/token-item';
import { cn } from '@/lib/utils';
import { numeralFormatter, percentFormatter, tokenPriceFormatter } from '@/lib';

type PoolSearchDialogProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resetSearch: () => void;
  searchResults: FuseResult<GroupData>[];
  additionalContent: React.ReactNode;
  additionalContentQueryMin: number;
  showNoResults: boolean;
  onBankSelect: (value: string) => void;
  maxResults: number;
};

export const PoolSearchDialog = ({
  searchQuery,
  setSearchQuery,
  resetSearch,
  searchResults,
  additionalContent,
  additionalContentQueryMin,
  showNoResults,
  onBankSelect,
  maxResults = 5,
}: PoolSearchDialogProps) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative w-full">
      <button
        onClick={() => setOpen(true)}
        className="relative w-full text-muted-foreground"
      >
        <div className="pointer-events-none h-auto rounded-full border border-border bg-transparent py-2 pl-8 text-left text-sm outline-none focus-visible:ring-0 disabled:opacity-100 md:py-3 md:text-lg">
          Search tokens...
        </div>
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2"
        />
      </button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        commandProps={{ shouldFilter: false }}
      >
        <div className="p-4">
          <div className="relative rounded-full border border-muted-foreground/25 px-2 transition-colors">
            <CommandInput
              placeholder={'Search tokens...'}
              className="h-auto bg-transparent py-2 outline-none focus-visible:ring-0"
              autoFocus
              value={searchQuery}
              onValueChange={(value) => {
                // setSearchQuery(value);
              }}
            />
            {searchQuery.length > 0 && (
              <X
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-primary"
                onClick={() => {
                  setOpen(false);
                }}
              />
            )}
          </div>
          {searchResults.length > 0 && (
            <CommandGroup>
              {searchResults.slice(0, maxResults).map((result) => {
                const group = result.item;
                const groupId = group.groupId;
                const tokenBank = group.pool.token;

                return (
                  <CommandItem
                    key={groupId}
                    value={groupId}
                    className="py-4"
                    onSelect={onBankSelect}
                  >
                    <div className="flex items-center gap-3">
                      {/* <Image
                        src={tokenBank.meta.tokenLogoUri}
                        width={32}
                        height={32}
                        alt={tokenBank.meta.tokenSymbol}
                        className="rounded-full"
                      /> */}
                      <TokenSymbol asset={tokenBank.token} />
                      <h3>
                        {tokenBank.token.name} ({tokenBank.token.symbol})
                      </h3>
                    </div>
                    {tokenBank.tokenData && (
                      <dl className="ml-auto flex items-center text-xs md:gap-8 md:text-sm">
                        <div>
                          <dt className="sr-only text-muted-foreground md:not-sr-only">
                            Price:
                          </dt>
                          <dd className="space-x-2">
                            <span>
                              {tokenPriceFormatter(tokenBank.tokenData.price)}
                            </span>

                            <span
                              className={cn(
                                'text-xs',
                                tokenBank.tokenData.volumeChange24hr > 0
                                  ? 'text-mrgn-success'
                                  : 'text-mrgn-error',
                              )}
                            >
                              {tokenBank.tokenData.priceChange24hr > 0 && '+'}
                              {percentFormatter.format(
                                tokenBank.tokenData.priceChange24hr / 100,
                              )}
                            </span>
                          </dd>
                        </div>
                        <div className="hidden w-[130px] md:block">
                          <dt className="text-muted-foreground">Vol 24hr:</dt>
                          <dd className="space-x-2">
                            <span>
                              $
                              {numeralFormatter(tokenBank.tokenData.volume24hr)}
                            </span>
                            <span
                              className={cn(
                                'text-xs',
                                tokenBank.tokenData.volumeChange24hr > 0
                                  ? 'text-mrgn-success'
                                  : 'text-mrgn-error',
                              )}
                            >
                              {tokenBank.tokenData.volumeChange24hr > 0 && '+'}
                              {percentFormatter.format(
                                tokenBank.tokenData.volumeChange24hr / 100,
                              )}
                            </span>
                          </dd>
                        </div>
                      </dl>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
          {searchQuery.length > 0 &&
            searchResults.length === 0 &&
            showNoResults && (
              <CommandEmpty className="mt-8 text-center text-muted-foreground">
                No results found
              </CommandEmpty>
            )}
          {additionalContent &&
            searchQuery.length >= additionalContentQueryMin && (
              <div className="mt-8 flex w-full justify-center">
                {additionalContent}
              </div>
            )}
        </div>
      </CommandDialog>
    </div>
  );
};
