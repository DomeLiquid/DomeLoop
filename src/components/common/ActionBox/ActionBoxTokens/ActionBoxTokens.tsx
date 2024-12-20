import React from 'react';
import { ActionType, ExtendedBankInfo } from '@/lib/mrgnlend';
import { GroupData } from '@/app/stores/tradeStore';
import { useActionBoxStore } from '@/hooks/useActionBoxStore';
import { LendingTokens } from './Components';

interface ActionBoxPreviewProps {
  activeGroup: GroupData | null;
  isDialog?: boolean;
  isTokenSelectable?: boolean;
  tokensOverride?: ExtendedBankInfo[];
  setTokenBank: (selectedTokenBank: ExtendedBankInfo | null) => void;
  setRepayTokenBank: (selectedTokenBank: ExtendedBankInfo | null) => void;
}

export const ActionBoxTokens = ({
  activeGroup,
  isDialog,
  isTokenSelectable,
  tokensOverride,
  setRepayTokenBank,
  setTokenBank,
}: ActionBoxPreviewProps) => {
  const [actionMode, selectedBank, selectedRepayBank, repayMode] =
    useActionBoxStore(isDialog)((state) => [
      state.actionMode,
      state.selectedBank,
      state.selectedRepayBank,
      state.repayMode,
    ]);

  const isInLendingMode = React.useMemo(
    () =>
      actionMode === ActionType.Borrow ||
      actionMode === ActionType.Deposit ||
      actionMode === ActionType.Repay ||
      actionMode === ActionType.Withdraw,
    [actionMode],
  );

  return (
    <>
      {isInLendingMode && (
        <LendingTokens
          activeGroup={activeGroup}
          selectedBank={selectedBank}
          selectedRepayBank={selectedRepayBank}
          setSelectedBank={setTokenBank}
          setSelectedRepayBank={setRepayTokenBank}
          repayType={repayMode}
          isDialog={isDialog}
          isTokenSelectable={false}
          actionType={actionMode}
          tokensOverride={tokensOverride}
        />
      )}
    </>
  );
};
