import React, { act } from 'react';

import { SelectedBankItem, TokenListWrapper } from '../SharedComponents';
import { ActionType, ExtendedBankInfo, RepayType } from '@/lib/mrgnlend';
import { GroupData } from '@/app/stores/tradeStore';
import { LendingModes } from '@/types/type';
import { computeBankRate } from '@/components/action-box/actions/lend-box/utils/mrgnUtils';
import { LendingTokensList, RepayCollatTokensList } from './Components';
import { LendingTokensTrigger } from './Components';

type LendingTokensProps = {
  selectedBank: ExtendedBankInfo | null;
  selectedRepayBank: ExtendedBankInfo | null;
  activeGroup: GroupData | null;
  actionType: ActionType;
  isDialog?: boolean;
  isTokenSelectable?: boolean;
  repayType?: RepayType;
  tokensOverride?: ExtendedBankInfo[];

  setSelectedRepayBank: (selectedBank: ExtendedBankInfo | null) => void;
  setSelectedBank: (selectedBank: ExtendedBankInfo | null) => void;
};

export const LendingTokens = ({
  selectedBank,
  selectedRepayBank,
  actionType,
  activeGroup,
  isDialog,
  isTokenSelectable,
  repayType,
  tokensOverride,

  setSelectedRepayBank,
  setSelectedBank,
}: LendingTokensProps) => {
  const isOtherBankActive = React.useMemo(() => {
    if (!selectedBank || !activeGroup) return false;
    const isToken = activeGroup.pool.token.bankId === selectedBank.bankId;
    const isTokenActive = activeGroup.pool.token.isActive;
    const isTokenLending =
      isTokenActive &&
      activeGroup.pool.token.balanceWithLendingPosition?.position?.isLending;

    const isQuoteActive = activeGroup.pool.quoteTokens.some(
      (quoteToken) => quoteToken.isActive,
    );
    const isQuoteLending = activeGroup.pool.quoteTokens.some(
      (quoteToken) =>
        quoteToken.isActive &&
        quoteToken.balanceWithLendingPosition?.position?.isLending,
    );

    if (actionType === ActionType.Withdraw) {
      if (isToken && isQuoteActive && isQuoteLending) {
        return true;
      } else if (!isToken && isTokenActive && isTokenLending) {
        return true;
      }
    } else if (actionType === ActionType.Repay) {
      if (isToken && isQuoteActive && !isQuoteLending) {
        return true;
      } else if (!isToken && isTokenActive && !isTokenLending) {
        return true;
      }
    }
    return false;
  }, [actionType, activeGroup, selectedBank]);

  const [isOpen, setIsOpen] = React.useState(false);

  const isSelectable = React.useMemo(
    () =>
      !isDialog ||
      // repayType === RepayType.RepayCollat ||
      // isOtherBankActive ||
      isTokenSelectable,
    [isDialog, isOtherBankActive, isTokenSelectable],
  );

  // const isSelectable = false;

  const lendingMode = React.useMemo(
    () =>
      actionType === ActionType.Deposit
        ? LendingModes.LEND
        : LendingModes.BORROW,
    [actionType],
  );

  const calculateRate = React.useCallback(
    (bank: ExtendedBankInfo) => {
      return computeBankRate(bank, lendingMode);
    },
    [lendingMode],
  );

  return (
    <>
      {!isSelectable && (
        <div className="flex w-full items-center gap-3">
          {selectedBank && (
            <SelectedBankItem
              bank={selectedBank}
              lendingMode={lendingMode}
              rate={calculateRate(selectedBank)}
            />
          )}
        </div>
      )}

      {isSelectable && (
        <TokenListWrapper
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          Trigger={
            <LendingTokensTrigger
              selectedBank={selectedBank}
              selectedRepayBank={selectedRepayBank}
              lendingMode={lendingMode}
              isOpen={isOpen}
              repayType={repayType}
            />
          }
          Content={
            // repayType === RepayType.RepayCollat ? (
            //   <RepayCollatTokensList
            //     isOpen={isOpen}
            //     onClose={() => setIsOpen(false)}
            //     onSetSelectedRepayBank={setSelectedRepayBank}
            //     selectedRepayBank={null}
            //     activeGroup={activeGroup}
            //     tokensOverride={tokensOverride}
            //   />
            // ) : (
            <LendingTokensList
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              selectedBank={selectedBank}
              activeGroup={activeGroup}
              onSetSelectedBank={setSelectedBank}
              isDialog={isDialog}
              actionMode={actionType}
              tokensOverride={tokensOverride}
            />
            // )
          }
        />
      )}
    </>
  );
};
