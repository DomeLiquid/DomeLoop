import React from 'react';

import { tokenPriceFormatter, numeralFormatter, percentFormatter } from '@/lib';

import type { FuseResult } from 'fuse.js';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandEmpty,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { CommandIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GroupData } from '@/app/stores/tradeStore';
import { TokenSymbol } from '@/components/token-item';

type PoolSearchDefaultProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resetSearch: () => void;
  searchResults: FuseResult<GroupData>[];
  size: 'sm' | 'lg';
  additionalContent: React.ReactNode;
  additionalContentQueryMin: number;
  showNoResults: boolean;
  onBankSelect: (value: string) => void;
  maxResults: number;
};

export const PoolSearchDefault = ({
  searchQuery,
  setSearchQuery,
  resetSearch,
  searchResults,
  size,
  additionalContent,
  additionalContentQueryMin,
  showNoResults,
  onBankSelect,
  maxResults = 5,
}: PoolSearchDefaultProps) => {
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (event.key === 'Escape') {
        searchInputRef.current?.blur();
        resetSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [resetSearch]);

  return (
    <div className="relative w-full px-4 md:px-0">
      <Command
        className="bg-transparent"
        shouldFilter={false}
        onKeyDown={(event) => event.key === 'Escape' && resetSearch()}
      >
        <div
          className={cn(
            'rounded-full border border-muted-foreground/25 px-2 transition-colors',
            isFocused && 'border-primary',
          )}
        >
          <CommandInput
            ref={searchInputRef}
            placeholder={'Search tokens by name, symbol, or mint address...'}
            className={cn(
              'h-auto bg-transparent py-2 outline-none focus-visible:ring-0 md:py-3 md:text-lg',
              size === 'sm' && 'text-base md:py-2.5 md:text-lg',
            )}
            value={searchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onValueChange={(value) => setSearchQuery(value)}
          />
          {searchQuery.length > 0 && (
            <X
              size={18}
              className="absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-primary md:right-4"
              onClick={() => {
                resetSearch();
              }}
            />
          )}

          <Button
            size="sm"
            variant="outline"
            className={cn(
              searchQuery.length > 0 ? 'hidden' : 'flex',
              'absolute right-6 top-1/2 h-auto -translate-y-1/2 gap-0.5 px-1.5 py-0.5 text-[10px] text-muted-foreground md:right-4 md:text-xs',
            )}
            onClick={() => {
              searchInputRef.current?.focus();
            }}
          >
            <CommandIcon size={14} />K
          </Button>
        </div>
        <div
          className={cn(
            size === 'lg' && 'absolute top-10 z-20 w-full md:top-14',
          )}
        >
          {Array.isArray(searchResults) && searchResults.length > 0 && (
            <CommandGroup
              className={cn(
                'bg-background',
                size === 'lg' && 'shadow-lg md:mx-auto md:w-4/5',
              )}
            >
              {searchResults.slice(0, maxResults).map((result) => {
                const group = result.item;
                const groupId = group.groupId;
                const tokenBank = group.pool.token;

                return (
                  <CommandItem
                    key={groupId}
                    value={groupId}
                    className={cn(size === 'sm' ? 'text-sm' : 'py-4')}
                    onSelect={onBankSelect}
                  >
                    <div className="flex items-center gap-3">
                      <TokenSymbol asset={tokenBank.token} />
                      <h3>
                        {tokenBank.token.name} ({tokenBank.token.symbol})
                      </h3>
                    </div>
                    {tokenBank.tokenData && (
                      <dl
                        className={cn(
                          'ml-auto flex items-center gap-2 text-xs md:text-sm',
                          size === 'sm' && 'md:text-xs',
                        )}
                      >
                        <div className="w-[110px] md:w-[150px]">
                          <dt className="text-muted-foreground">Price:</dt>
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
                        <div className="hidden w-[150px] md:block">
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
      </Command>
    </div>
  );
};
