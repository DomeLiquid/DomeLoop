import React from 'react';

import { PublicKey } from '@solana/web3.js';
import { GroupData } from '@/app/stores/tradeStore';

import { TokenListCommand } from '../../SharedComponents';
import { ExtendedBankInfo } from '@/lib/mrgnlend';
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { ActionBoxItem } from '../../..';
import { cn } from '@/lib/utils';

type RepayCollatTokensListProps = {
  selectedRepayBank: ExtendedBankInfo | null;
  activeGroup: GroupData | null;
  onSetSelectedRepayBank: (selectedTokenBank: ExtendedBankInfo | null) => void;
  isOpen: boolean;
  onClose: () => void;
  tokensOverride?: ExtendedBankInfo[];
};

export const RepayCollatTokensList = ({
  selectedRepayBank,
  onSetSelectedRepayBank,
  activeGroup,
  isOpen,
  onClose,
  tokensOverride,
}: RepayCollatTokensListProps) => {
  // const [nativeSolBalance] = useMrgnlendStore((state) => [
  //   state.nativeSolBalance,
  // ]);

  //const [lendingMode] = useUiStore((state) => [state.lendingMode, state.setIsWalletOpen]);
  const [searchQuery, setSearchQuery] = React.useState('');

  const extendedBankInfos = React.useMemo(() => {
    return tokensOverride
      ? tokensOverride
      : activeGroup
        ? [...activeGroup.pool.quoteTokens, activeGroup.pool.token]
        : [];
  }, [activeGroup, tokensOverride]);

  /////// FILTERS
  // filter on search
  const searchFilter = React.useCallback(
    (bankInfo: ExtendedBankInfo) => {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      return bankInfo.token.symbol.toLowerCase().includes(lowerCaseSearchQuery);
    },
    [searchQuery],
  );

  // filter on positions
  const positionFilter = React.useCallback((bankInfo: ExtendedBankInfo) => {
    return (
      bankInfo.isActive &&
      bankInfo.balanceWithLendingPosition?.position?.isLending
    );
  }, []);

  /////// BANKS
  // active position banks
  const filteredBanksActive = React.useMemo(() => {
    return extendedBankInfos
      .filter(searchFilter)
      .filter((bankInfo) => positionFilter(bankInfo))
      .sort((a, b) => {
        const amountA =
          a.isActive && a.balanceWithLendingPosition?.position?.amount
            ? a.balanceWithLendingPosition.position.amount
            : 0;
        const amountB =
          b.isActive && b.balanceWithLendingPosition?.position?.amount
            ? b.balanceWithLendingPosition.position.amount
            : 0;
        return amountB - amountA;
      });
  }, [extendedBankInfos, searchFilter, positionFilter]);

  React.useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  return (
    <>
      <TokenListCommand
        selectedBank={selectedRepayBank}
        onClose={onClose}
        onSetSearchQuery={setSearchQuery}
      >
        <CommandEmpty>No tokens found.</CommandEmpty>
        {/* REPAYING */}
        {filteredBanksActive.length > 0 && onSetSelectedRepayBank && (
          <CommandGroup heading="Currently supplying">
            {filteredBanksActive.map((bank, index) => {
              return (
                <CommandItem
                  key={index}
                  value={bank.bankId}
                  onSelect={(currentValue) => {
                    onSetSelectedRepayBank(
                      extendedBankInfos.find(
                        (bankInfo) => bankInfo.bankId === currentValue,
                      ) ?? null,
                    );
                    onClose();
                  }}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-2 py-2 font-medium data-[selected=true]:bg-accent',
                  )}
                >
                  <ActionBoxItem
                    //lendingMode={lendingMode}
                    bank={bank}
                    showBalanceOverride={false}
                    // nativeSolBalance={nativeSolBalance}
                    isRepay={true}
                  />
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </TokenListCommand>
    </>
  );
};
