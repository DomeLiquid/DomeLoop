'use client';

import React from 'react';

import { PoolSearchDefault, PoolSearchDialog } from './components/';
import { useTradeStore } from '@/app/stores';
import { useAmountDebounce, useIsMobile } from '@/hooks';
import { Desktop, Mobile } from '@/lib/mediaQueryUtils';
import { useRouter } from '@/navigation';
import { useDebounce } from '@uidotdev/usehooks';

type PoolSearchProps = {
  size?: 'sm' | 'lg';
  maxResults?: number;
  additionalContent?: React.ReactNode;
  additionalContentQueryMin?: number;
  onBankSelect?: () => void;
  showNoResults?: boolean;
};

export const PoolSearch = ({
  size = 'lg',
  maxResults = 5,
  additionalContent,
  additionalContentQueryMin = 3,
  onBankSelect,
  showNoResults = true,
}: PoolSearchProps) => {
  const router = useRouter();
  const [groupMap, searchBanks, searchResults, resetSearchResults] =
    useTradeStore((state) => [
      state.groupMap,
      state.searchBanks,
      state.searchResults,
      state.resetSearchResults,
    ]);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const groups = React.useMemo(() => {
    if (!groupMap || !(groupMap instanceof Map)) {
      return [];
    }
    return Array.from(groupMap.values());
  }, [groupMap]);

  // React.useEffect(() => {
  //   if (!debouncedSearchQuery.length) {
  //     resetSearchResults();
  //     return;
  //   }
  //   if (groups.length > 0) {
  //     searchBanks(debouncedSearchQuery);
  //   }
  // }, [debouncedSearchQuery, searchBanks, resetSearchResults, groups]);

  const resetSearch = React.useCallback(() => {
    resetSearchResults();
    setSearchQuery('');
  }, [resetSearchResults]);

  return (
    <>
      <Desktop>
        <PoolSearchDefault
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          resetSearch={resetSearch}
          searchResults={searchResults || []}
          size={size}
          additionalContent={additionalContent}
          additionalContentQueryMin={additionalContentQueryMin}
          showNoResults={showNoResults}
          onBankSelect={(value) => {
            const foundGroup = groups.find(
              (g) => g.groupId.toLowerCase() === value,
            );
            if (!foundGroup) return;

            router.push(`/trade/${foundGroup.groupId.toLowerCase()}`);
            if (onBankSelect) onBankSelect();
          }}
          maxResults={maxResults}
        />
      </Desktop>
    </>
  );
};
