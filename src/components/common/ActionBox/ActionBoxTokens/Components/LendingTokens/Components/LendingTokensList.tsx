import React from 'react';

import { WSOL_MINT } from '@mrgnlabs/mrgn-common';
import { ActionType } from '@/lib/mrgnlend';
import { ExtendedBankInfo } from '@/lib/mrgnlend';
import { GroupData } from '@/app/stores/tradeStore';
import { LendingModes } from '@/types/type';
import { useTradeStore } from '@/app/stores';
import { computeBankRate } from '@/components/action-box/actions/lend-box/utils/mrgnUtils';
import { TokenListCommand } from '../../SharedComponents';
import { cn } from '@/lib/utils';
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { ActionBoxItem } from '../../../ActionBoxItem';

type LendingTokensListProps = {
  selectedBank: ExtendedBankInfo | null;
  isOpen: boolean;
  actionMode: ActionType;
  activeGroup: GroupData | null;
  isDialog?: boolean;
  tokensOverride?: ExtendedBankInfo[];

  onSetSelectedBank: (selectedTokenBank: ExtendedBankInfo | null) => void;
  onClose: () => void;
};

export const LendingTokensList = ({
  selectedBank,
  actionMode,
  activeGroup,
  onSetSelectedBank,
  isOpen,
  onClose,
  tokensOverride,
}: LendingTokensListProps) => {
  // const [nativeSolBalance] = useMrgnlendStore((state) => [state.nativeSolBalance]);

  const lendingMode = React.useMemo(
    () =>
      actionMode === ActionType.Deposit || actionMode === ActionType.Withdraw
        ? LendingModes.LEND
        : LendingModes.BORROW,
    [actionMode],
  );

  const extendedBankInfos = React.useMemo(() => {
    return tokensOverride
      ? tokensOverride
      : activeGroup
        ? [...activeGroup.pool.quoteTokens, activeGroup.pool.token]
        : [];
  }, [activeGroup, tokensOverride]);

  const [searchQuery, setSearchQuery] = React.useState('');
  const { connected } = useTradeStore((state) => ({
    connected: state.connected,
  }));

  const calculateRate = React.useCallback(
    (bank: ExtendedBankInfo) => {
      return computeBankRate(bank, lendingMode);
    },
    [lendingMode],
  );

  const hasTokens = false;
  const balanceFilter = false;

  // const hasTokens = React.useMemo(() => {
  //   const hasBankTokens = !!extendedBankInfos.filter(
  //     (bank) => bank. !== 0,
  //   );

  //   return hasBankTokens;
  // }, [extendedBankInfos]);

  /////// FILTERS

  // filter on balance
  // const balanceFilter = React.useCallback((bankInfo: ExtendedBankInfo) => {
  //   const isWSOL = bankInfo.info.state.mint?.equals
  //     ? bankInfo.info.state.mint.equals(WSOL_MINT)
  //     : false;
  //   const balance = isWSOL
  //     ? bankInfo.userInfo.tokenAccount.balance + nativeSolBalance
  //     : bankInfo.userInfo.tokenAccount.balance;
  //   return balance > 0;
  // }, []);

  // filter on search
  const searchFilter = React.useCallback(
    (bankInfo: ExtendedBankInfo) => {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      return bankInfo.token.symbol.toLowerCase().includes(lowerCaseSearchQuery);
    },
    [searchQuery],
  );

  // filter on positions
  const positionFilter = React.useCallback(
    (bankInfo: ExtendedBankInfo, filterActive?: boolean) =>
      bankInfo.isActive
        ? lendingMode === LendingModes.LEND &&
          bankInfo.balanceWithLendingPosition?.position?.isLending
        : filterActive,
    [lendingMode],
  );

  /////// BANKS

  // wallet banks
  const filteredBanksUserOwns = React.useMemo(() => {
    return extendedBankInfos.filter(searchFilter).sort((a, b) => {
      return 0;
    });
  }, [extendedBankInfos, searchFilter]);

  // active position banks
  const filteredBanksActive = React.useMemo(() => {
    return extendedBankInfos
      .filter(searchFilter)
      .filter((bankInfo) => positionFilter(bankInfo, false))
      .sort((a, b) => {
        const aAmount =
          (a.isActive && a.balanceWithLendingPosition?.position?.amount) || 0;
        const bAmount =
          (b.isActive && b.balanceWithLendingPosition?.position?.amount) || 0;
        return bAmount - aAmount;
      });
  }, [extendedBankInfos, searchFilter, positionFilter]);

  // other banks without positions
  const filteredBanks = React.useMemo(() => {
    return extendedBankInfos.filter(searchFilter);
  }, [extendedBankInfos, searchFilter]);

  const globalBanks = React.useMemo(
    () => filteredBanks.filter((bank) => !bank.info.state.isIsolated),
    [filteredBanks],
  );
  const isolatedBanks = React.useMemo(
    () => filteredBanks.filter((bank) => bank.info.state.isIsolated),
    [filteredBanks],
  );

  React.useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  return (
    <>
      <TokenListCommand
        selectedBank={selectedBank}
        onClose={onClose}
        onSetSearchQuery={setSearchQuery}
      >
        <CommandEmpty>No tokens found.</CommandEmpty>

        {/* LENDING */}
        {lendingMode === LendingModes.LEND &&
          actionMode !== ActionType.Repay &&
          actionMode !== ActionType.Withdraw &&
          connected &&
          filteredBanksUserOwns.length > 0 &&
          onSetSelectedBank && (
            <CommandGroup heading="Available in your wallet">
              {filteredBanksUserOwns
                .slice(
                  0,
                  searchQuery.length === 0 ? filteredBanksUserOwns.length : 3,
                )
                .map((bank, index) => {
                  return (
                    <CommandItem
                      key={index}
                      value={bank.bankId}
                      onSelect={(currentValue) => {
                        onSetSelectedBank(
                          extendedBankInfos.find(
                            (bankInfo) => bankInfo.bankId === currentValue,
                          ) ?? null,
                        );
                        onClose();
                      }}
                      className="flex h-[55px] cursor-pointer items-center justify-between gap-2 px-3 font-medium data-[selected=true]:bg-accent"
                    >
                      <ActionBoxItem
                        rate={calculateRate(bank)}
                        lendingMode={lendingMode}
                        bank={bank}
                        showBalanceOverride={true}
                        // nativeSolBalance={nativeSolBalance}
                      />
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          )}
        {lendingMode === LendingModes.LEND &&
          actionMode === ActionType.Withdraw &&
          filteredBanksActive.length > 0 &&
          onSetSelectedBank && (
            <CommandGroup heading="Currently supplying">
              {filteredBanksActive.map((bank, index) => (
                <CommandItem
                  key={index}
                  value={bank.bankId}
                  // disabled={!ownedBanksPk.includes(bank.address)}
                  onSelect={(currentValue) => {
                    onSetSelectedBank(
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
                    rate={calculateRate(bank)}
                    lendingMode={lendingMode}
                    bank={bank}
                    showBalanceOverride={false}
                    // nativeSolBalance={nativeSolBalance}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

        {/* BORROWING */}
        {lendingMode === LendingModes.BORROW &&
          filteredBanksActive.length > 0 &&
          onSetSelectedBank && (
            <CommandGroup heading="Currently borrowing">
              {filteredBanksActive.map((bank, index) => (
                <CommandItem
                  key={index}
                  value={bank.bankId}
                  onSelect={(currentValue) => {
                    onSetSelectedBank(
                      extendedBankInfos.find(
                        (bankInfo) => bankInfo.bankId === currentValue,
                      ) ?? null,
                    );
                    onClose();
                  }}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-2 font-medium data-[selected=true]:bg-accent',
                  )}
                >
                  <ActionBoxItem
                    rate={calculateRate(bank)}
                    lendingMode={lendingMode}
                    bank={bank}
                    showBalanceOverride={false}
                    // nativeSolBalance={nativeSolBalance}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

        {/* GLOBAL & ISOLATED */}
        {/* {actionMode !== ActionType.Withdraw && globalBanks.length > 0 && onSetSelectedBank && (
          <CommandGroup heading="Global pools">
            {globalBanks.map((bank, index) => {
              return (
                <CommandItem
                  key={index}
                  value={bank.address?.toString().toLowerCase()}
                  onSelect={(currentValue) => {
                    onSetSelectedBank(
                      extendedBankInfos.find(
                        (bankInfo) => bankInfo.address.toString().toLowerCase() === currentValue
                      ) ?? null
                    );
                    onClose();
                  }}
                  className={cn(
                    "cursor-pointer font-medium flex items-center justify-between gap-2 data-[selected=true]:bg-accent",
                    lendingMode === LendingModes.LEND && "py-2",
                    lendingMode === LendingModes.BORROW && "h-[60px]"
                  )}
                >
                  <ActionBoxItem
                    rate={calculateRate(bank)}
                    lendingMode={lendingMode}
                    bank={bank}
                    showBalanceOverride={false}
                    nativeSolBalance={nativeSolBalance}
                  />
                </CommandItem>
              );
            })}
          </CommandGroup>
        )} */}
        {/* {actionMode !== ActionType.Repay && isolatedBanks.length > 0 && onSetSelectedBank && (
          <CommandGroup heading="Isolated pools">
            {isolatedBanks.map((bank, index) => {
              return (
                <CommandItem
                  key={index}
                  value={bank.address?.toString().toLowerCase()}
                  onSelect={(currentValue) => {
                    onSetSelectedBank(
                      extendedBankInfos.find(
                        (bankInfo) => bankInfo.address.toString().toLowerCase() === currentValue
                      ) ?? null
                    );
                    onClose();
                  }}
                  className={cn(
                    "cursor-pointer font-medium flex items-center justify-between gap-2 data-[selected=true]:bg-accent",
                    lendingMode === LendingModes.LEND && "py-2",
                    lendingMode === LendingModes.BORROW && "h-[60px]"
                  )}
                >
                  <ActionBoxItem
                    rate={calculateRate(bank)}
                    lendingMode={lendingMode}
                    bank={bank}
                    showBalanceOverride={false}
                    nativeSolBalance={nativeSolBalance}
                  />
                </CommandItem>
              );
            })}
          </CommandGroup>
        )} */}
      </TokenListCommand>
    </>
  );
};
